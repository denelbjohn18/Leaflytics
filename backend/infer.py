import sys
import json
import numpy as np
from PIL import Image
import os
import tensorflow as tf

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python infer.py <model_path> <image_path>"}))
        sys.exit(1)

    model_path = sys.argv[1]
    image_path = sys.argv[2]

    try:
        # Load model quietly and disable Metal GPU which can deadlock
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
        tf.config.set_visible_devices([], 'GPU')

        model = tf.keras.models.load_model(model_path, compile=False)

        # Process image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        
        x = tf.keras.preprocessing.image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        
        # Dynamic Preprocessing based on user training methodology
        fmt = sys.argv[3] if len(sys.argv) > 3 else "rescale"
        if fmt == "mobilenetv2":
            img_array = tf.keras.applications.mobilenet_v2.preprocess_input(x)
        elif fmt == "efficientnetv2":
            img_array = tf.keras.applications.efficientnet_v2.preprocess_input(x)
        elif fmt == "raw":
            img_array = x
        else: # rescale 0-1 (default keras ImageDataGenerator)
            img_array = x / 255.0

        # Inference
        predictions = model.predict(img_array, verbose=0)
        
        # Get highest confidence class
        probs = predictions[0].tolist()
        max_prob = max(probs)
        max_idx = probs.index(max_prob)

        print(json.dumps({
            "success": True,
            "maxIndex": max_idx,
            "maxProb": max_prob
        }))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
