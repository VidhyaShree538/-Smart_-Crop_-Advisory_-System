# 🌾 AI-Powered Smart Crop Advisory System

An end-to-end web application that helps **small and marginal farmers** get simple, actionable crop and fertilizer recommendations based on their soil and weather conditions — in **English and Hindi**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌱 **Crop Recommendation** | Enter N, P, K, temperature, humidity, pH, rainfall → get top 3 crop recommendations with confidence scores |
| 🧑‍🌾 **Fertilizer Advisory** | Select crop + soil type + current N/P/K → get exact fertilizer type and kg/acre dosage |
| 🌦️ **Weather-Aware Advisory** | Auto-detects your GPS location, fetches real-time weather from Open-Meteo API, pre-fills fields, issues warnings |
| 🗣️ **Voice Input / Text-to-Speech** | Every field supports voice dictation (mic button). Results are read aloud automatically |
| 🌐 **Bilingual (EN/HI)** | Full English + Hindi UI, extensible for more languages |
| 📊 **History Dashboard** | View past queries; visualize N, P, K, pH soil trends with a line chart |
| 💬 **Chatbot Assistant** | Rule-based Q&A chatbot with voice input and TTS response readout |

---

## 📁 Project Structure

```
Crop recommendation/
├── Crop_recommendation.csv     # Training dataset (22 crop classes)
├── backend/
│   ├── train_model.py          # ML training script
│   ├── app.py                  # FastAPI backend
│   ├── database.py             # SQLite helper
│   ├── crop_model.pkl          # Trained model (generated)
│   ├── crop_norms.json         # Crop nutrient norms (generated)
│   └── venv/                   # Python virtual environment
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app + navigation
    │   ├── translations.js     # EN/HI dictionary
    │   └── components/
    │       ├── CropAdvisory.jsx
    │       ├── FertilizerAdvisory.jsx
    │       ├── Dashboard.jsx
    │       ├── Chatbot.jsx
    │       └── VoiceButton.jsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 How to Run Locally

### Step 1 — Train the ML Model (only once)

```bash
# From the project root
cd backend
.\\venv\\Scripts\\python.exe train_model.py
```

This will:
- Print model accuracy (~99.5%)
- Save `crop_model.pkl`
- Save `crop_norms.json` (crop-wise average nutrient profiles)

### Step 2 — Start the Backend API

```bash
cd backend
.\\venv\\Scripts\\python.exe -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be live at **http://localhost:8000**  
Swagger docs: **http://localhost:8000/docs**

### Step 3 — Start the Frontend

```bash
cd frontend
npm run dev
```

The app will be live at **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict-crop` | Takes N,P,K,temp,humidity,pH,rainfall → returns top 3 crops |
| `POST` | `/predict-fertilizer` | Takes crop+soil_type+N+P+K → returns fertilizer recommendations |
| `GET` | `/weather?lat=&lon=` | Returns live weather + farm advisories via Open-Meteo |
| `GET` | `/history` | Returns last 50 farmer queries |
| `GET` | `/trends` | Returns soil data over time for charting |
| `POST` | `/chat` | Accepts farmer question, returns rule-based answer |

---

## 🧪 ML Model Details

- **Algorithm**: `RandomForestClassifier` (scikit-learn)
- **Dataset**: `Crop_recommendation.csv` — 2200 samples, 22 crop classes
- **Features**: N, P, K, temperature, humidity, pH, rainfall
- **Test Accuracy**: **99.55%**
- **Train/Test Split**: 80/20 with stratification

---

## 📱 Design Philosophy

- **Mobile-first**: Optimized for 375px screens (most common in rural India)
- **Low-literacy**: Large buttons, icons + text labels, emoji crop icons
- **Low-bandwidth**: No heavy libraries; Vite-optimized bundle
- **Voice-first**: All inputs support voice (Web Speech API); results read aloud
- **Bilingual**: Toggle between English ↔ हिन्दी with a single tap

---

## 🔧 Tech Stack

- **Frontend**: React 18 + Vite 5 + Tailwind CSS + Recharts + Lucide Icons
- **Backend**: Python FastAPI + uvicorn
- **ML**: scikit-learn RandomForestClassifier
- **Database**: SQLite (via Python standard library)
- **Weather**: [Open-Meteo API](https://open-meteo.com/) (free, no API key needed)
