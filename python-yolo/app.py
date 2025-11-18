from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
import base64
from PIL import Image
import io
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
MODEL_PATH = 'models/best.pt'  # Your trained model
model = YOLO(MODEL_PATH)

# Define class names (should match your training data)
CLASS_NAMES = {
    0: 'healthy',
    1: 'leaf_spot',
    2: 'yellow_leaf',
}

# Create directories for saving results
os.makedirs('results', exist_ok=True)
os.makedirs('uploads', exist_ok=True)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'YOLOv8 Detection Service is running',
        'model_loaded': MODEL_PATH
    })

@app.route('/detect', methods=['POST'])
def detect_disease():
    """
    Detect plant diseases from image
    Expected input: { "image": "base64_encoded_image" }
    """
    try:
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No image provided'
            }), 400

        # Decode base64 image
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)

        # Convert RGB to BGR for OpenCV
        if len(image_np.shape) == 3:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Run YOLOv8 inference
        results = model.predict(
            source=image_np,
            conf=0.25,  # Confidence threshold
            iou=0.45,   # NMS IoU threshold
            verbose=False
        )

        # Process results
        detections = []
        result = results[0]

        if len(result.boxes) > 0:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = CLASS_NAMES.get(class_id, 'unknown')

                detections.append({
                    'class': class_name,
                    'confidence': round(confidence, 3),
                    'bbox': {
                        'x1': int(x1),
                        'y1': int(y1),
                        'x2': int(x2),
                        'y2': int(y2)
                    }
                })

        # Determine overall health status
        health_status = determine_health_status(detections)

        # Save annotated image (optional)
        annotated_image = result.plot()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = f'results/detection_{timestamp}.jpg'
        cv2.imwrite(save_path, annotated_image)

        # Encode annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        annotated_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            'status': 'success',
            'detections': detections,
            'health_status': health_status,
            'total_detections': len(detections),
            'annotated_image': f'data:image/jpeg;base64,{annotated_base64}',
            'saved_path': save_path
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/detect-from-file', methods=['POST'])
def detect_from_file():
    """
    Detect diseases from uploaded file
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file uploaded'
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'Empty filename'
            }), 400

        # Save uploaded file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'upload_{timestamp}_{file.filename}'
        filepath = os.path.join('uploads', filename)
        file.save(filepath)

        # Run detection
        results = model.predict(
            source=filepath,
            conf=0.25,
            verbose=False
        )

        # Process results (similar to above)
        detections = []
        result = results[0]

        if len(result.boxes) > 0:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = CLASS_NAMES.get(class_id, 'unknown')

                detections.append({
                    'class': class_name,
                    'confidence': round(confidence, 3),
                    'bbox': {
                        'x1': int(x1),
                        'y1': int(y1),
                        'x2': int(x2),
                        'y2': int(y2)
                    }
                })

        health_status = determine_health_status(detections)

        return jsonify({
            'status': 'success',
            'detections': detections,
            'health_status': health_status,
            'total_detections': len(detections)
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def determine_health_status(detections):
    """
    Determine overall plant health based on detections
    """
    if not detections:
        return {
            'status': 'unknown',
            'severity': 'none',
            'message': 'No leaf detected or unclear image'
        }

    # Check for diseases
    diseases = [d for d in detections if d['class'] != 'healthy']

    if not diseases:
        return {
            'status': 'healthy',
            'severity': 'none',
            'message': 'Plant appears healthy'
        }

    # Calculate average confidence
    avg_confidence = sum(d['confidence'] for d in diseases) / len(diseases)

    # Determine severity
    if avg_confidence > 0.7:
        severity = 'high'
        message = 'Immediate attention required'
    elif avg_confidence > 0.5:
        severity = 'medium'
        message = 'Monitor and treat if necessary'
    else:
        severity = 'low'
        message = 'Minor symptoms detected'

    return {
        'status': 'diseased',
        'severity': severity,
        'message': message,
        'diseases_detected': [d['class'] for d in diseases],
        'confidence': round(avg_confidence, 3)
    }

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_path': MODEL_PATH,
        'classes': CLASS_NAMES,
        'num_classes': len(CLASS_NAMES)
    })

if __name__ == '__main__':
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"⚠️  Model not found at {MODEL_PATH}")
        print("Please train your model first or place best.pt in the models folder")
    else:
        print(f"✅ Model loaded from {MODEL_PATH}")

    app.run(host='0.0.0.0', port=5000, debug=True)
