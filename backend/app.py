import os
import pickle
import json
import requests
from fastapi import FastAPI, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI-Powered Smart Crop Advisory API",
    description="Crop recommendations, fertilizer advisory, weather warnings and chatbot for farmers.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")
NORMS_PATH = os.path.join(BASE_DIR, "crop_norms.json")

model      = None
crop_norms = {}

# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    global model, crop_norms
    from database import init_db
    init_db()
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print("✅ Model loaded.")
    else:
        print("⚠️  Model not found – run train_model.py first.")
    if os.path.exists(NORMS_PATH):
        with open(NORMS_PATH, "r") as f:
            crop_norms = json.load(f)
        print("✅ Crop norms loaded.")

# ── Auth helpers ───────────────────────────────────────────────────────────────
def _get_current_user(authorization: str = ""):
    """Extract bearer token and return user dict, or None."""
    from database import get_user_by_token
    if authorization.startswith("Bearer "):
        token = authorization[7:]
        return get_user_by_token(token)
    return None

# ══════════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

class RegisterRequest(BaseModel):
    name:     str = Field(..., description="Farmer's full name")
    phone:    str = Field(..., description="Mobile number (used as login ID)")
    village:  str = Field("", description="Village / district name")
    password: str = Field(..., description="Password (min 4 chars)")

class LoginRequest(BaseModel):
    phone:    str
    password: str

@app.post("/auth/register", tags=["Auth"])
def register(req: RegisterRequest):
    if len(req.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")
    from database import register_user
    user, err = register_user(req.name, req.phone, req.village, req.password)
    if err:
        raise HTTPException(status_code=409, detail=err)
    return {"success": True, "user": user}

@app.post("/auth/login", tags=["Auth"])
def login(req: LoginRequest):
    from database import login_user
    user, err = login_user(req.phone, req.password)
    if err:
        raise HTTPException(status_code=401, detail=err)
    return {"success": True, "user": user}

@app.get("/auth/me", tags=["Auth"])
def me(authorization: str = Header(default="")):
    user = _get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return {"success": True, "user": user}

# ══════════════════════════════════════════════════════════════════════════════
# CROP PREDICTION
# ══════════════════════════════════════════════════════════════════════════════

class CropPredictRequest(BaseModel):
    N:           float
    P:           float
    K:           float
    temperature: float
    humidity:    float
    ph:          float
    rainfall:    float
    lat:         Optional[float] = None
    lon:         Optional[float] = None

@app.post("/predict-crop", tags=["Advisory"])
def predict_crop(req: CropPredictRequest, authorization: str = Header(default="")):
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded. Run train_model.py first.")
    user = _get_current_user(authorization)
    user_id = user["id"] if user else None

    features = [[req.N, req.P, req.K, req.temperature, req.humidity, req.ph, req.rainfall]]
    probs    = model.predict_proba(features)[0]
    classes  = model.classes_
    top3_idx = probs.argsort()[::-1][:3]

    recommendations = [
        {"crop": str(classes[i]), "confidence": round(float(probs[i]) * 100, 1)}
        for i in top3_idx
    ]

    from database import save_query
    try:
        save_query(
            N=req.N, P=req.P, K=req.K,
            temp=req.temperature, hum=req.humidity, ph=req.ph, rain=req.rainfall,
            crop1=recommendations[0]["crop"], crop1_prob=recommendations[0]["confidence"],
            crop2=recommendations[1]["crop"], crop3=recommendations[2]["crop"],
            lat=req.lat, lon=req.lon, user_id=user_id
        )
    except Exception as e:
        print(f"DB log error: {e}")

    return {"success": True, "recommendations": recommendations}

# ══════════════════════════════════════════════════════════════════════════════
# FERTILIZER
# ══════════════════════════════════════════════════════════════════════════════

class FertilizerRequest(BaseModel):
    crop:      str
    soil_type: str
    N:         float
    P:         float
    K:         float

@app.post("/predict-fertilizer", tags=["Advisory"])
def predict_fertilizer(req: FertilizerRequest):
    matched = next((k for k in crop_norms if k.lower() == req.crop.lower()), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Crop '{req.crop}' not found.")

    norms = crop_norms[matched]
    def_N = max(0.0, norms["N"] - req.N)
    def_P = max(0.0, norms["P"] - req.P)
    def_K = max(0.0, norms["K"] - req.K)

    recs = []
    if def_N > 0:
        qty = round(def_N / 0.46, 1)
        recs.append({"nutrient":"Nitrogen (N)","deficit":round(def_N,1),"fertilizer":"Urea (यूरिया)",
                     "quantity_kg_per_acre":qty,
                     "description_en":f"Apply {qty} kg Urea per acre in 2–3 split doses.",
                     "description_hi":f"प्रति एकड़ {qty} किग्रा यूरिया 2–3 खुराकों में दें।"})
    if def_P > 0:
        qty = round(def_P / 0.16, 1)
        recs.append({"nutrient":"Phosphorus (P)","deficit":round(def_P,1),"fertilizer":"SSP / सुपर फॉस्फेट",
                     "quantity_kg_per_acre":qty,
                     "description_en":f"Apply {qty} kg SSP per acre as basal dose before sowing.",
                     "description_hi":f"बुवाई से पहले आधार खुराक के रूप में प्रति एकड़ {qty} किग्रा एसएसपी दें।"})
    if def_K > 0:
        qty = round(def_K / 0.60, 1)
        recs.append({"nutrient":"Potassium (K)","deficit":round(def_K,1),"fertilizer":"MOP / म्यूरेट ऑफ पोटाश",
                     "quantity_kg_per_acre":qty,
                     "description_en":f"Apply {qty} kg MOP per acre at sowing time.",
                     "description_hi":f"बुवाई के समय प्रति एकड़ {qty} किग्रा एमओपी दें।"})

    gen_en = "Apply 5–10 tons of well-decomposed compost/FYM per acre to improve soil structure."
    gen_hi = "मिट्टी की संरचना सुधारने के लिए प्रति एकड़ 5–10 टन जैविक खाद / गोबर खाद डालें।"

    if not recs:
        return {"crop":req.crop,"soil_type":req.soil_type,"status":"optimal",
                "message_en":"Soil nutrients are optimal – no chemical fertilizer needed!",
                "message_hi":"मिट्टी के पोषक तत्व आदर्श हैं – किसी रासायनिक खाद की जरूरत नहीं!",
                "recommendations":[{"nutrient":"Organic","deficit":0,"fertilizer":"Compost / FYM",
                                    "quantity_kg_per_acre":0,"description_en":gen_en,"description_hi":gen_hi}]}

    return {"crop":req.crop,"soil_type":req.soil_type,"status":"deficient",
            "recommendations":recs,"general_en":gen_en,"general_hi":gen_hi}

# ══════════════════════════════════════════════════════════════════════════════
# WEATHER
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/weather", tags=["Weather"])
def get_weather(lat: float = Query(...), lon: float = Query(...)):
    try:
        url = (f"https://api.open-meteo.com/v1/forecast"
               f"?latitude={lat}&longitude={lon}"
               f"&current_weather=true"
               f"&daily=rain_sum,temperature_2m_max,temperature_2m_min"
               f"&timezone=auto")
        res = requests.get(url, timeout=10); res.raise_for_status()
        data = res.json()
        current = data.get("current_weather", {})
        daily   = data.get("daily", {})

        rain_list    = daily.get("rain_sum", [])
        tmax_list    = daily.get("temperature_2m_max", [])
        tmin_list    = daily.get("temperature_2m_min", [])
        total_rain   = round(sum(rain_list), 1) if rain_list else 0.0
        avg_max_temp = round(sum(tmax_list)/len(tmax_list), 1) if tmax_list else 25.0
        avg_min_temp = round(sum(tmin_list)/len(tmin_list), 1) if tmin_list else 15.0

        warn_en, warn_hi = [], []
        if total_rain > 50:
            warn_en.append(f"⚠️ Heavy rain forecast: {total_rain} mm in 7 days. Delay sowing & top-dressing.")
            warn_hi.append(f"⚠️ भारी बारिश: अगले 7 दिनों में {total_rain} मिमी। बुवाई व खाद में देरी करें।")
        elif total_rain < 5:
            warn_en.append("💧 Very low rainfall expected. Arrange irrigation before sowing.")
            warn_hi.append("💧 बहुत कम बारिश की संभावना। बुवाई से पहले सिंचाई की व्यवस्था करें।")
        if avg_min_temp < 10:
            warn_en.append("🌨️ Low temperature – frost risk. Delay sowing of sensitive crops.")
            warn_hi.append("🌨️ कम तापमान – पाले का खतरा। संवेदनशील फसलों की बुवाई टालें।")
        if avg_max_temp > 40:
            warn_en.append("🌡️ Extreme heat. Increase irrigation & apply mulching.")
            warn_hi.append("🌡️ अत्यधिक गर्मी। सिंचाई बढ़ाएं व मल्चिंग करें।")

        return {"success":True,
                "current":{"temperature":current.get("temperature"),
                            "windspeed":current.get("windspeed"),
                            "time":current.get("time")},
                "forecast":{"total_rain_7d":total_rain,"avg_max_temp":avg_max_temp,"avg_min_temp":avg_min_temp},
                "warnings_en": warn_en or ["✅ Weather is normal for sowing and cultivation."],
                "warnings_hi": warn_hi or ["✅ बुवाई और खेती के लिए मौसम सामान्य है।"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ══════════════════════════════════════════════════════════════════════════════
# HISTORY & TRENDS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/history", tags=["History"])
def get_history(authorization: str = Header(default="")):
    from database import get_history as fetch
    user = _get_current_user(authorization)
    uid  = user["id"] if user else None
    return {"success": True, "data": fetch(50, uid)}

@app.get("/trends", tags=["History"])
def get_trends(authorization: str = Header(default="")):
    from database import get_soil_trends
    user = _get_current_user(authorization)
    uid  = user["id"] if user else None
    return {"success": True, "data": get_soil_trends(uid)}

# ══════════════════════════════════════════════════════════════════════════════
# CHATBOT
# ══════════════════════════════════════════════════════════════════════════════

CHAT = {
    "en": {
        "hello":      "Hello! I'm your Smart Farm Advisor 🌾. Ask me about crops, soils, or fertilizers.",
        "soil":       "Different soils suit different crops:\n• Clayey → Rice, Wheat, Sugarcane\n• Sandy → Moth beans, Groundnut, Melon\n• Loamy → Maize, Vegetables, Pulses",
        "sandy":      "Sandy soil drains fast and holds few nutrients. Best crops: Moth beans, Chickpea, Groundnut. Add compost generously.",
        "clayey":     "Clayey soil retains water – great for Rice & Sugarcane. Ensure good drainage for pulse crops.",
        "urea":       "Urea provides Nitrogen (N). It promotes leafy green growth. Apply in split doses and irrigate immediately after.",
        "rice":       "Rice needs: N=80–100, high humidity (80%+), temperature 20–35°C, rainfall >200 mm. Best in clayey/loamy soil.",
        "chickpea":   "Chickpea is a cool-season rabi crop. Needs low N (fixes its own), low rainfall. Grows well in sandy loam or black soil.",
        "fertilizer": "Go to the Fertilizer tab, select your crop & soil type, enter N/P/K values → get exact Urea/SSP/MOP doses.",
        "default":    "Try asking: 'Which crop for sandy soil?', 'What is Urea?', 'Tell me about Rice', or 'How to get fertilizer advice?'"
    },
    "hi": {
        "hello":      "नमस्ते! मैं आपका स्मार्ट कृषि सलाहकार हूँ 🌾। फसल, मिट्टी या खाद के बारे में पूछें।",
        "soil":       "अलग-अलग मिट्टी अलग-अलग फसलों के लिए उपयुक्त है:\n• चिकनी मिट्टी → धान, गेहूं, गन्ना\n• रेतीली मिट्टी → मोठ, मूंगफली, तरबूज\n• दोमट मिट्टी → मक्का, सब्जियां, दालें",
        "sandy":      "रेतीली मिट्टी जल्दी सूखती है और कम पोषक तत्व रखती है। उपयुक्त फसलें: मोठ, चना, मूंगफली। जैविक खाद खूब डालें।",
        "clayey":     "चिकनी मिट्टी पानी रोकती है – धान और गन्ने के लिए बेहतरीन। दलहनी फसलों में जल निकासी सुनिश्चित करें।",
        "urea":       "यूरिया नाइट्रोजन (N) देता है। यह हरी पत्तियों की वृद्धि बढ़ाता है। टुकड़ों में दें और तुरंत सिंचाई करें।",
        "rice":       "धान के लिए: N=80–100, आर्द्रता 80%+, तापमान 20–35°C, वर्षा >200 मिमी। चिकनी/दोमट मिट्टी सबसे अच्छी।",
        "chickpea":   "चना एक ठंडे मौसम की रबी फसल है। कम N और कम बारिश में बढ़िया। रेतीली दोमट या काली मिट्टी उपयुक्त।",
        "fertilizer": "उर्वरक टैब पर जाएं, फसल और मिट्टी चुनें, N/P/K दर्ज करें → सटीक यूरिया/SSP/MOP मात्रा पाएं।",
        "default":    "पूछें: 'रेतीली मिट्टी के लिए कौन सी फसल?', 'यूरिया क्या है?', 'धान के बारे में बताएं', या 'खाद सलाह कैसे लें?'"
    }
}

class ChatRequest(BaseModel):
    question: str
    lang: str = "en"

@app.post("/chat", tags=["Chatbot"])
def chat(req: ChatRequest):
    q    = req.question.lower()
    lang = req.lang if req.lang in CHAT else "en"
    R    = CHAT[lang]
    ans  = None
    kw   = {"hello":["hello","hi","namaste","नमस्ते","helo"],
            "sandy":["sandy","रेतीली","बालू","sand"],
            "clayey":["clay","चिकनी","clayey"],
            "soil":["soil","मिट्टी","loam","दोमट"],
            "urea":["urea","यूरिया","nitrogen","नाइट्रोजन"],
            "rice":["rice","धान","चावल","paddy"],
            "chickpea":["chickpea","चना","gram","चने"],
            "fertilizer":["fertilizer","खाद","उर्वरक","ssp","mop","dap"]}
    for key, words in kw.items():
        if any(w in q for w in words):
            ans = R[key]; break
    return {"success": True, "answer": ans or R["default"]}
