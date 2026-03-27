Leaflytics: AI-Powered Plant Disease Diagnostic System


A professional, full-stack machine learning application built to bridge the gap between advanced Data Science and modern Web Development. 

### Overview
This project automates crop disease identification using deep learning image classification. By combining a fluid React frontend with a robust local backend running a custom-trained EfficientNetV2 model, it provides a seamless diagnostic experience. The architecture is designed to run locally, bypassing strict cloud-serverless size limits to fully utilize the heavy TensorFlow environment.

### Tech Stack
* **Frontend:** React.js, Tailwind CSS, Framer Motion, Recharts
* **Backend:** Node.js/Local API Gateway & Python (ML Inference Layer)
* **ML/AI:** TensorFlow/Keras, EfficientNetV2 (`.h5` model)
* **Deployment:** GitHub (Local Execution)

### Key Features
* **Full-Stack ML Pipeline:** A React frontend that seamlessly communicates with a local backend API (`localhost:3000`) executing heavy neural network inference.
* **State-of-the-Art Accuracy:** Powered by a custom EfficientNetV2 model boasting a **99.13%** validation accuracy with a microscopic **0.67%** overfitting gap.
* **Stratified Data Engineering:** Trained on a rigorously balanced dataset capped at 500 images per class using aggressive geometric and photometric augmentation.
* **Confidence Guardrails:** Built-in threshold logic to gracefully reject blurry images or random noise.
* **Interactive Analytics:** Live frontend dashboards using Recharts to visualize the 10-epoch training curves and dataset distribution.
* **Fluid UI:** Elegant transitions, dark-mode analytics, and responsive "scanning" layouts using Framer Motion.

### Getting Started

**Prerequisites:** You will need Node.js and a Python environment with TensorFlow installed to run both ends of this application.

**Installation Steps:**
1. Clone the repository.
2. **Frontend Setup:** * Navigate to the frontend directory.
   * Run `npm install` to install React dependencies.
   * Start the UI with `npm run dev`.
3. **Backend Setup:**
   * Navigate to the backend directory.
   * Install the required Python/Node packages.
   * Ensure the `plant_disease_model.h5` file is placed in the correct backend model directory.
   * Start the local server (running on `localhost:3000`).

### How It Works
* **The Vision Layer:** The React webcam or file dropzone captures an image and wraps it in a `FormData` payload.
* **The API Layer:** The image is sent via HTTP POST to the local backend (`localhost:3000`).
* **The Logic Layer:** The backend resizes the image to 224x224 and feeds the tensor into the EfficientNetV2 `.h5` model. The model extracts features via Fused-MBConv blocks and a Global Average Pooling layer to predict one of 38 crop-disease classes.
* **The Presentation Layer:** The backend returns a JSON payload with the disease name, confidence score, and treatment plan, triggering the Framer Motion result drawer on the frontend.
