import sys
import numpy as np
from PIL import Image
import os
import tensorflow as tf

def predict_top(model, img_array, name):
    preds = model.predict(img_array, verbose=0)[0]
    idx = np.argmax(preds)
    prob = preds[idx]
    print(f"{name.ljust(25)} | Class: {str(idx).ljust(3)} | Confidence: {prob:.4f}")

def main():
    image_path = sys.argv[1]
    model_path = '../plant_health_model.h5'

    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
    tf.config.set_visible_devices([], 'GPU')
    model = tf.keras.models.load_model(model_path, compile=False)

    print("--- Preprocessing Search ---")
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    arr_rgb = np.array(img, dtype=np.float32)
    
    # BGR format (OpenCV standard)
    arr_bgr = arr_rgb[:, :, ::-1]

    for arr, fmt in [(arr_rgb, "RGB"), (arr_bgr, "BGR")]:
        # 1. Raw [0, 255]
        x1 = np.expand_dims(arr, axis=0)
        predict_top(model, x1, f"{fmt} Raw [0, 255]")

        # 2. Rescale [0, 1]
        x2 = x1 / 255.0
        predict_top(model, x2, f"{fmt} Rescale [0, 1]")

        # 3. MobileNetV2 [-1, 1]
        x3 = (x1 / 127.5) - 1.0
        predict_top(model, x3, f"{fmt} MobileNetV2 [-1, 1]")
        
        # 4. ImageNet Zero-center
        x4 = x1.copy()
        x4[0, :, :, 0] -= 103.939
        x4[0, :, :, 1] -= 116.779
        x4[0, :, :, 2] -= 123.68
        predict_top(model, x4, f"{fmt} ImageNet Center")

if __name__ == "__main__":
    main()
