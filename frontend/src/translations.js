// Bilingual translation dictionary (English + Hindi)
// Easily extensible with more languages

export const translations = {
  en: {
    // App-wide
    appName: "Smart Crop Advisor",
    appTagline: "AI-powered advice for every farmer",

    // Navigation
    nav_home: "Crop",
    nav_fertilizer: "Fertilizer",
    nav_dashboard: "History",
    nav_chat: "Advisor",

    // Crop Advisory Form
    crop_title: "Crop Recommendation",
    crop_sub: "Enter your soil & weather details to get crop suggestions",
    label_N: "Nitrogen (N)",
    label_P: "Phosphorus (P)",
    label_K: "Potassium (K)",
    label_temp: "Temperature (°C)",
    label_humidity: "Humidity (%)",
    label_ph: "Soil pH",
    label_rainfall: "Rainfall (mm)",
    btn_detect: "Detect My Location",
    btn_get_advice: "Get Crop Advice",
    btn_speak: "Speak",
    detecting: "Detecting location...",
    weather_fetched: "Weather auto-filled from your location!",
    weather_error: "Could not fetch weather. Please enter manually.",

    // Results
    result_title: "Top Crop Recommendations",
    result_sub: "Based on your soil & weather conditions",
    confidence: "Confidence",
    btn_listen: "Listen",
    btn_fertilizer: "Get Fertilizer Advice",
    btn_try_again: "Try Again",
    warnings_title: "Weather Advisory",

    // Fertilizer
    fert_title: "Fertilizer Advisory",
    fert_sub: "Get exact fertilizer recommendations for your crop",
    label_crop: "Select Crop",
    label_soil_type: "Soil Type",
    label_current_N: "Current Nitrogen (N)",
    label_current_P: "Current Phosphorus (P)",
    label_current_K: "Current Potassium (K)",
    btn_get_fert: "Get Fertilizer Advice",
    fert_result_title: "Fertilizer Recommendations",
    qty_per_acre: "kg per acre",
    soil_optimal: "Your soil is optimal for this crop!",
    soil_types: ["Sandy", "Loamy", "Clayey", "Red", "Black", "Alluvial"],
    crop_list: [
      "rice","maize","chickpea","kidneybeans","pigeonpeas","mothbeans",
      "mungbean","blackgram","lentil","pomegranate","banana","mango",
      "grapes","watermelon","muskmelon","apple","orange","papaya",
      "coconut","cotton","jute","coffee"
    ],

    // Dashboard
    dash_title: "Query History",
    dash_sub: "Your past soil entries and recommendations",
    dash_empty: "No history yet. Make your first crop query!",
    dash_chart_title: "Soil Nutrient Trends Over Time",
    col_date: "Date",
    col_crop: "Recommended Crop",
    col_npk: "N / P / K",
    col_fert: "Fertilizer",

    // Chatbot
    chat_title: "Farm Advisor Chat",
    chat_sub: "Ask any farming question",
    chat_placeholder: "Type your question here...",
    chat_send: "Send",
    chat_greeting: "Hello! I am your Smart Farm Advisor 🌾\nYou can ask me about crops, soil types, fertilizers, and more.\nTry: 'Which crop suits sandy soil?' or 'Tell me about Urea'",
    chat_speak: "Speak Question",

    // Common
    loading: "Loading...",
    error_required: "Please fill all fields",
    per_acre: "per acre",
  },

  hi: {
    appName: "स्मार्ट फसल सलाहकार",
    appTagline: "हर किसान के लिए AI सलाह",

    nav_home: "फसल",
    nav_fertilizer: "खाद",
    nav_dashboard: "इतिहास",
    nav_chat: "सलाहकार",

    crop_title: "फसल सिफारिश",
    crop_sub: "फसल सुझाव पाने के लिए अपनी मिट्टी और मौसम की जानकारी दर्ज करें",
    label_N: "नाइट्रोजन (N)",
    label_P: "फास्फोरस (P)",
    label_K: "पोटेशियम (K)",
    label_temp: "तापमान (°C)",
    label_humidity: "आर्द्रता (%)",
    label_ph: "मिट्टी का pH",
    label_rainfall: "वर्षा (मिमी)",
    btn_detect: "मेरा स्थान पहचानें",
    btn_get_advice: "फसल सलाह पाएं",
    btn_speak: "बोलें",
    detecting: "स्थान पहचाना जा रहा है...",
    weather_fetched: "आपके स्थान से मौसम भर दिया गया!",
    weather_error: "मौसम नहीं मिल सका। कृपया खुद भरें।",

    result_title: "शीर्ष फसल सुझाव",
    result_sub: "आपकी मिट्टी और मौसम के आधार पर",
    confidence: "विश्वास",
    btn_listen: "सुनें",
    btn_fertilizer: "खाद सलाह पाएं",
    btn_try_again: "फिर से प्रयास करें",
    warnings_title: "मौसम सलाह",

    fert_title: "उर्वरक सलाह",
    fert_sub: "अपनी फसल के लिए सटीक उर्वरक की सिफारिश पाएं",
    label_crop: "फसल चुनें",
    label_soil_type: "मिट्टी का प्रकार",
    label_current_N: "वर्तमान नाइट्रोजन (N)",
    label_current_P: "वर्तमान फास्फोरस (P)",
    label_current_K: "वर्तमान पोटेशियम (K)",
    btn_get_fert: "उर्वरक सलाह पाएं",
    fert_result_title: "उर्वरक सिफारिशें",
    qty_per_acre: "किग्रा प्रति एकड़",
    soil_optimal: "इस फसल के लिए आपकी मिट्टी एकदम सही है!",
    soil_types: ["रेतीली", "दोमट", "चिकनी", "लाल", "काली", "जलोढ़"],
    crop_list: [
      "rice","maize","chickpea","kidneybeans","pigeonpeas","mothbeans",
      "mungbean","blackgram","lentil","pomegranate","banana","mango",
      "grapes","watermelon","muskmelon","apple","orange","papaya",
      "coconut","cotton","jute","coffee"
    ],

    dash_title: "पिछली क्वेरी का इतिहास",
    dash_sub: "आपकी पिछली मिट्टी प्रविष्टियां और सिफारिशें",
    dash_empty: "अभी तक कोई इतिहास नहीं। पहली फसल क्वेरी करें!",
    dash_chart_title: "समय के साथ मिट्टी पोषक तत्व प्रवृत्ति",
    col_date: "दिनांक",
    col_crop: "अनुशंसित फसल",
    col_npk: "N / P / K",
    col_fert: "उर्वरक",

    chat_title: "कृषि सलाहकार चैट",
    chat_sub: "कोई भी खेती का प्रश्न पूछें",
    chat_placeholder: "यहाँ अपना प्रश्न लिखें...",
    chat_send: "भेजें",
    chat_greeting: "नमस्ते! मैं आपका स्मार्ट कृषि सलाहकार हूँ 🌾\nआप मुझसे फसलों, मिट्टी, खाद और अधिक के बारे में पूछ सकते हैं।\nकोशिश करें: 'रेतीली मिट्टी के लिए कौन सी फसल?' या 'यूरिया के बारे में बताएं'",
    chat_speak: "प्रश्न बोलें",

    loading: "लोड हो रहा है...",
    error_required: "कृपया सभी फील्ड भरें",
    per_acre: "प्रति एकड़",
  }
};

export const cropIcons = {
  rice: "🌾", maize: "🌽", chickpea: "🫘", kidneybeans: "🫘",
  pigeonpeas: "🌿", mothbeans: "🌱", mungbean: "🌱", blackgram: "⚫",
  lentil: "🟤", pomegranate: "🍎", banana: "🍌", mango: "🥭",
  grapes: "🍇", watermelon: "🍉", muskmelon: "🍈", apple: "🍏",
  orange: "🍊", papaya: "🍈", coconut: "🥥", cotton: "🤍",
  jute: "🌿", coffee: "☕"
};

export const API_BASE = "http://localhost:8000";
