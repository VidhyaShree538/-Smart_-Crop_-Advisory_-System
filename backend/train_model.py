import os
import pickle
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Paths
DATA_PATH = os.path.join("..", "Crop_recommendation.csv")
MODEL_PATH = "crop_model.pkl"
NORMS_PATH = "crop_norms.json"

def train_crop_model():
    print(f"Loading dataset from: {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        # Fallback to local search if path differs
        DATA_PATH_ALT = "Crop_recommendation.csv"
        if os.path.exists(DATA_PATH_ALT):
            df = pd.read_csv(DATA_PATH_ALT)
        else:
            raise FileNotFoundError(f"Could not find Crop_recommendation.csv in '{DATA_PATH}' or '{DATA_PATH_ALT}'")
    else:
        df = pd.read_csv(DATA_PATH)
    
    # 1. Print dataset info
    print("\nDataset Info:")
    print(df.info())
    print("\nCrop categories:")
    crop_counts = df['label'].value_counts()
    print(f"Total categories: {len(crop_counts)}")
    print(crop_counts)
    
    # 2. Extract features and target
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    # 3. Compute crop norms (dynamic target soil/weather profile for each crop)
    # This will be used in our fertilizer recommendation engine to compare current farmer values with crop-specific ideals.
    print("\nComputing dynamic crop-wise nutrient norms...")
    crop_norms = {}
    for crop in df['label'].unique():
        crop_data = df[df['label'] == crop]
        crop_norms[crop] = {
            'N': float(crop_data['N'].mean()),
            'P': float(crop_data['P'].mean()),
            'K': float(crop_data['K'].mean()),
            'temperature': float(crop_data['temperature'].mean()),
            'humidity': float(crop_data['humidity'].mean()),
            'ph': float(crop_data['ph'].mean()),
            'rainfall': float(crop_data['rainfall'].mean())
        }
        
    with open(NORMS_PATH, 'w') as f:
        json.dump(crop_norms, f, indent=4)
    print(f"Saved crop-wise target norms to: {NORMS_PATH}")
    
    # 4. Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 5. Train classifier
    print("\nTraining RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 6. Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Evaluation Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # 7. Save model
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"Saved trained ML model to: {MODEL_PATH}")

if __name__ == '__main__':
    # Ensure current directory is backend
    if not os.path.exists("backend"):
        os.makedirs("backend", exist_ok=True)
    os.chdir("backend")
    train_crop_model()
