import sys
import json
import numpy as np
from PIL import Image
import tensorflow as tf
import os

# Suppress TF logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
tf.config.set_visible_devices([], 'GPU')

PLANT_VILLAGE_CLASSES = [
  'Apple___Apple_scab',
  'Apple___Black_rot',
  'Apple___Cedar_apple_rust',
  'Apple___healthy',
  'Blueberry___healthy',
  'Cherry_(including_sour)___Powdery_mildew',
  'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
  'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight',
  'Corn_(maize)___healthy',
  'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
  'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot',
  'Peach___healthy',
  'Pepper,_bell___Bacterial_spot',
  'Pepper,_bell___healthy',
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch',
  'Strawberry___healthy',
  'Tomato___Bacterial_spot',
  'Tomato___Early_blight',
  'Tomato___Late_blight',
  'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites Two-spotted_spider_mite',
  'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
  'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy',
]

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    
    # Path to the .h5 model
    model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'modelFiles', 'plant_disease_model.h5')
    
    if not os.path.exists(model_path):
        print(json.dumps({"error": f"Model not found at {model_path}"}))
        sys.exit(1)

    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        
        arr = np.array(img, dtype=np.float32)
        arr = np.expand_dims(arr, axis=0)
        
        # The model architecture includes tf.keras.applications.efficientnet_v2.preprocess_input,
        # which expects inputs in the range [0, 255]. So we pass the raw array.
        
        preds = model.predict(arr, verbose=0)[0]
        max_index = int(np.argmax(preds))
        max_prob = float(preds[max_index])
        
        label = PLANT_VILLAGE_CLASSES[max_index] if max_index < len(PLANT_VILLAGE_CLASSES) else 'Unknown___Unknown'
        
        print(json.dumps({
            "success": True,
            "maxIndex": max_index,
            "maxProb": max_prob,
            "label": label
        }))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
