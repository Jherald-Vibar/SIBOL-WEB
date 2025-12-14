from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import os
from datetime import datetime
import base64
import sys
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

app = Flask(__name__)

# ✅ ENHANCED CORS Configuration
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,X-Requested-With")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        return response, 200

@app.before_request
def log_request_info():
    print("\n" + "=" * 80, flush=True)
    print(f"🌐 INCOMING REQUEST", flush=True)
    print("=" * 80, flush=True)
    print(f"⏰ Time: {datetime.now().isoformat()}", flush=True)
    print(f"📍 Method: {request.method}", flush=True)
    print(f"🔗 URL: {request.url}", flush=True)
    print(f"🔗 Path: {request.path}", flush=True)
    print(f"🌍 Origin: {request.headers.get('Origin', 'No Origin Header')}", flush=True)
    print(f"📦 Content-Type: {request.content_type}", flush=True)
    print("=" * 80, flush=True)

@app.after_request
def log_response_info(response):
    print(f"✅ RESPONSE: {response.status_code} - {request.method} {request.path}", flush=True)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# Debug startup info
print("\n" + "=" * 80, flush=True)
print("🚀 YOLO DETECTION SERVICE INITIALIZING", flush=True)
print("=" * 80, flush=True)
print(f"Python version: {sys.version}", flush=True)
print(f"Working directory: {os.getcwd()}", flush=True)
print("=" * 80, flush=True)

# Load YOLO11s model
MODEL_PATH = os.environ.get('MODEL_PATH', 'models/my_models.pt')
model = None

def load_model():
    """Load model with error handling"""
    global model
    try:
        print(f"🔍 Looking for model at: {MODEL_PATH}", flush=True)

        if os.path.exists(MODEL_PATH):
            print(f"✅ Model file found at {MODEL_PATH}", flush=True)
            model = YOLO(MODEL_PATH)
            print(f"✅ YOLO11s Model loaded from: {MODEL_PATH}", flush=True)
            return True
        else:
            print(f"❌ Model not found at {MODEL_PATH}", flush=True)
            return False
    except Exception as e:
        print(f"❌ Error loading model: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return False

# Load model on startup
print("📦 Loading YOLO model...", flush=True)
model_loaded = load_model()
print(f"✅ Model loaded: {model_loaded}", flush=True)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    secure=True
)

# Check Cloudinary configuration
cloudinary_configured = all([
    os.environ.get('CLOUDINARY_CLOUD_NAME'),
    os.environ.get('CLOUDINARY_API_KEY'),
    os.environ.get('CLOUDINARY_API_SECRET')
])

if cloudinary_configured:
    print("✅ Cloudinary configured successfully", flush=True)
    print(f"📁 Cloud name: {os.environ.get('CLOUDINARY_CLOUD_NAME')}", flush=True)
else:
    print("⚠️  Cloudinary not fully configured - will use local storage only", flush=True)

# Create directories for saving results
# Use /tmp for Railway (ephemeral storage)
RESULTS_DIR = os.environ.get('RESULTS_DIR', '/tmp/results')
UPLOADS_DIR = os.environ.get('UPLOADS_DIR', '/tmp/uploads')

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

print(f"📁 Results directory: {RESULTS_DIR}", flush=True)
print(f"📁 Uploads directory: {UPLOADS_DIR}", flush=True)

# Set max content length (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Recommendations database (keeping your existing one)
RECOMMENDATIONS_DB = {
    'mustasa_healthy': {
        'crop_type': 'Mustasa (Mustard Greens)',
        'condition': 'Healthy',
        'severity': 'none',
        'severity_level': 0,
        'treatment': 'No treatment needed - Continue current care',
        'recommendations': [
            'Continue current care routine - your mustasa is thriving',
            'Monitor leaves regularly for any discoloration',
            'Maintain consistent soil moisture'
        ]
    },
    'mustasa_leaf_spot': {
        'crop_type': 'Mustasa (Mustard Greens)',
        'condition': 'Leaf Spot Disease',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Fungicide application and improved sanitation'
    },
    'mustasa_yellow_leaf': {
        'crop_type': 'Mustasa (Mustard Greens)',
        'condition': 'Yellow Leaf / Nutrient Deficiency',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Nutrient supplementation and care adjustment'
    },
    'pechay_healthy': {
        'crop_type': 'Pechay (Chinese Cabbage)',
        'condition': 'Healthy',
        'severity': 'none',
        'severity_level': 0,
        'treatment': 'No treatment needed - Continue current care'
    },
    'pechay_leaf_spot': {
        'crop_type': 'Pechay (Chinese Cabbage)',
        'condition': 'Leaf Spot Disease',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Fungicide treatment and sanitation'
    },
    'pechay_yellow_leaf': {
        'crop_type': 'Pechay (Chinese Cabbage)',
        'condition': 'Yellow Leaf / Nutrient Deficiency',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Nutrient correction and environmental adjustment'
    }
}

def get_recommendations(class_name):
    """Get detailed recommendations for detected class"""
    class_name_normalized = class_name.lower().strip()
    if class_name_normalized in RECOMMENDATIONS_DB:
        return RECOMMENDATIONS_DB[class_name_normalized]

    return {
        'crop_type': 'Unknown',
        'condition': class_name.replace('_', ' ').title(),
        'severity': 'unknown',
        'severity_level': 1,
        'treatment': 'Consult with agricultural expert'
    }

def draw_bounding_boxes(image, detections, result_names):
    """
    Draw bounding boxes on image with class labels and confidence

    Args:
        image: OpenCV image (numpy array)
        detections: List of detection dictionaries
        result_names: Dictionary mapping class IDs to class names

    Returns:
        Image with drawn bounding boxes
    """
    img_with_boxes = image.copy()

    # Define colors for different severity levels
    SEVERITY_COLORS = {
        0: (0, 255, 0),      # Green - Healthy
        1: (0, 255, 255),    # Yellow - Low severity
        2: (0, 165, 255),    # Orange - Medium severity
        3: (0, 0, 255)       # Red - High severity
    }

    for detection in detections:
        bbox = detection['bbox']
        class_name = detection['class']
        confidence = detection['confidence']

        # Get severity level for color
        recommendations = detection.get('recommendations', {})
        severity_level = recommendations.get('severity_level', 1)
        color = SEVERITY_COLORS.get(severity_level, (255, 0, 0))

        # Extract coordinates
        x1 = int(bbox['x1'])
        y1 = int(bbox['y1'])
        x2 = int(bbox['x2'])
        y2 = int(bbox['y2'])

        # Draw rectangle
        cv2.rectangle(img_with_boxes, (x1, y1), (x2, y2), color, 2)

        # Prepare label
        label = f"{class_name} {confidence:.2%}"

        # Get text size for background
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        thickness = 2
        (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, thickness)

        # Draw background rectangle for text
        cv2.rectangle(
            img_with_boxes,
            (x1, y1 - text_height - 10),
            (x1 + text_width, y1),
            color,
            -1
        )

        # Draw text
        cv2.putText(
            img_with_boxes,
            label,
            (x1, y1 - 5),
            font,
            font_scale,
            (255, 255, 255),  # White text
            thickness
        )

    return img_with_boxes

def save_detection_image(image_with_boxes, prefix="detection"):
    """
    Save image with bounding boxes to Cloudinary (and optionally local disk)

    Args:
        image_with_boxes: OpenCV image with drawn boxes
        prefix: Filename prefix

    Returns:
        Tuple of (success, cloudinary_url, local_path, error_message)
    """
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{prefix}_{timestamp}"

        cloudinary_url = None
        local_path = None

        # Upload to Cloudinary if configured
        if cloudinary_configured:
            try:
                print("☁️  Uploading to Cloudinary...", flush=True)

                # Encode image to JPEG in memory
                success, buffer = cv2.imencode('.jpg', image_with_boxes, [cv2.IMWRITE_JPEG_QUALITY, 90])
                if not success:
                    raise Exception("Failed to encode image")

                # Convert to bytes
                img_bytes = buffer.tobytes()

                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload(
                    img_bytes,
                    folder="yolo_detections",  # Organize in folder
                    public_id=filename,
                    resource_type="image",
                    overwrite=False,
                    format="jpg"
                )

                cloudinary_url = upload_result.get('secure_url')
                print(f"✅ Uploaded to Cloudinary: {cloudinary_url}", flush=True)

            except Exception as cloudinary_error:
                print(f"⚠️  Cloudinary upload failed: {cloudinary_error}", flush=True)
                # Continue to save locally as fallback

        # Save locally as fallback or backup
        local_filename = f"{filename}.jpg"
        local_path = os.path.join(RESULTS_DIR, local_filename)

        success = cv2.imwrite(local_path, image_with_boxes)

        if success:
            file_size = os.path.getsize(local_path)
            print(f"✅ Saved locally: {local_path} ({file_size} bytes)", flush=True)
        else:
            print(f"⚠️  Failed to save locally", flush=True)

        # Return success if either Cloudinary or local save worked
        if cloudinary_url or success:
            return True, cloudinary_url, local_path, None
        else:
            error_msg = "Failed to save image to Cloudinary and local storage"
            return False, None, None, error_msg

    except Exception as e:
        error_msg = f"Error saving image: {str(e)}"
        print(f"❌ {error_msg}", flush=True)
        import traceback
        traceback.print_exc()
        return False, None, None, error_msg

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    try:
        # Encode image to JPEG
        success, buffer = cv2.imencode('.jpg', image)
        if not success:
            return None

        # Convert to base64
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        return jpg_as_text
    except Exception as e:
        print(f"❌ Error converting image to base64: {e}", flush=True)
        return None

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        'service': 'YOLO11s Detection Service',
        'status': 'online',
        'model_loaded': model is not None,
        'endpoints': {
            'health': '/health',
            'detect': '/detect (POST)',
            'model_info': '/model-info',
            'recommendations': '/recommendations/<class_name>'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model is not None else 'degraded',
        'message': 'YOLO11s Detection Service is running',
        'model': MODEL_PATH,
        'model_loaded': model is not None,
        'available_classes': list(RECOMMENDATIONS_DB.keys()),
        'total_classes': len(RECOMMENDATIONS_DB),
        'results_dir': RESULTS_DIR,
        'cloudinary_configured': cloudinary_configured,
        'storage': 'cloudinary' if cloudinary_configured else 'local'
    })

@app.route('/detect', methods=['POST', 'OPTIONS'])
def detect():
    """
    Detect objects from uploaded image file or base64
    Now includes option to save image with bounding boxes

    Query params:
        - save_image: true/false (default: false) - Save image with bounding boxes
        - return_image: true/false (default: false) - Return base64 image with boxes
    """
    print("🎯 /detect endpoint called", flush=True)

    if model is None:
        print("❌ Model is None - returning 503", flush=True)
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 503

    try:
        img = None

        # Check if it's multipart/form-data (file upload)
        if 'image' in request.files:
            print("📁 Processing file upload from request.files", flush=True)
            file = request.files['image']
            if file.filename == '':
                print("❌ Empty filename", flush=True)
                return jsonify({
                    'success': False,
                    'error': 'No image selected'
                }), 400

            img_bytes = file.read()
            print(f"📊 File size: {len(img_bytes)} bytes", flush=True)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Check if it's JSON with base64 image
        elif request.is_json:
            print("📄 Processing JSON request", flush=True)
            data = request.get_json()

            if 'image' not in data:
                print("❌ No 'image' key in JSON", flush=True)
                return jsonify({
                    'success': False,
                    'error': 'No image provided in JSON'
                }), 400

            image_data = data['image']

            # Handle base64 with data URI prefix
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]

            # Decode base64
            try:
                img_bytes = base64.b64decode(image_data)
                print(f"✅ Base64 decoded: {len(img_bytes)} bytes", flush=True)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as decode_error:
                print(f"❌ Base64 decode error: {decode_error}", flush=True)
                return jsonify({
                    'success': False,
                    'error': f'Base64 decode failed: {str(decode_error)}'
                }), 400

        else:
            print("❌ No valid image source found", flush=True)
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400

        if img is None:
            print("❌ cv2.imdecode returned None - invalid image format", flush=True)
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400

        print(f"✅ Image loaded successfully: {img.shape}", flush=True)

        # Get options from request
        save_image = request.args.get('save_image', 'false').lower() == 'true'
        return_image = request.args.get('return_image', 'false').lower() == 'true'
        confidence_threshold = float(request.form.get('confidence', 0.25)) if not request.is_json else 0.25

        print(f"🎯 Confidence threshold: {confidence_threshold}", flush=True)
        print(f"💾 Save image: {save_image}", flush=True)
        print(f"📤 Return image: {return_image}", flush=True)

        # Run YOLO11s detection
        print("🔍 Running YOLO detection...", flush=True)
        results = model.predict(
            source=img,
            conf=confidence_threshold,
            iou=0.45,
            verbose=False
        )

        # Process results
        detections = []
        result = results[0]

        if len(result.boxes) > 0:
            print(f"✅ Found {len(result.boxes)} detections", flush=True)
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = result.names[class_id]

                print(f"   Detection: {class_name} ({confidence:.2%})", flush=True)

                recommendations = get_recommendations(class_name)

                detections.append({
                    'class': class_name,
                    'class_id': int(class_id),
                    'confidence': float(confidence),
                    'bbox': {
                        'x1': float(x1),
                        'y1': float(y1),
                        'x2': float(x2),
                        'y2': float(y2),
                        'width': float(x2 - x1),
                        'height': float(y2 - y1)
                    },
                    'recommendations': recommendations
                })
        else:
            print("ℹ️  No detections found", flush=True)

        # Get highest confidence detection
        primary_detection = None
        if detections:
            primary_detection = max(detections, key=lambda x: x['confidence'])

        # Get image dimensions
        height, width = img.shape[:2]

        # Prepare response
        response_data = {
            'success': True,
            'detections': detections,
            'total_detections': len(detections),
            'primary_detection': primary_detection,
            'image_dimensions': {
                'width': int(width),
                'height': int(height)
            },
            'model_classes': result.names,
            'timestamp': datetime.now().isoformat()
        }

        # Draw bounding boxes and save/return if requested
        if detections and (save_image or return_image):
            print("🎨 Drawing bounding boxes...", flush=True)
            img_with_boxes = draw_bounding_boxes(img, detections, result.names)

            # Save image to Cloudinary and/or disk
            if save_image:
                success, cloudinary_url, local_path, error_msg = save_detection_image(img_with_boxes)
                response_data['image_saved'] = success

                if success:
                    # Prefer Cloudinary URL, fallback to local path info
                    if cloudinary_url:
                        response_data['image_url'] = cloudinary_url
                        response_data['storage'] = 'cloudinary'
                        print(f"✅ Image available at: {cloudinary_url}", flush=True)
                    if local_path:
                        response_data['local_path'] = local_path
                        response_data['local_filename'] = os.path.basename(local_path)
                        if not cloudinary_url:
                            response_data['storage'] = 'local'
                else:
                    response_data['save_error'] = error_msg

            # Return base64 image
            if return_image:
                base64_image = image_to_base64(img_with_boxes)
                if base64_image:
                    response_data['image_with_boxes'] = f"data:image/jpeg;base64,{base64_image}"
                    print("✅ Added base64 image to response", flush=True)

        print(f"✅ Returning success response with {len(detections)} detections", flush=True)
        return jsonify(response_data)

    except Exception as e:
        print(f"❌ ERROR in /detect: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 503

    try:
        class_names = model.names

        return jsonify({
            'success': True,
            'model_path': MODEL_PATH,
            'model_type': 'YOLO11s',
            'classes': class_names,
            'num_classes': len(class_names),
            'recommendations_available': list(RECOMMENDATIONS_DB.keys())
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/recommendations/<class_name>', methods=['GET'])
def get_class_recommendations(class_name):
    """Get recommendations for a specific class"""
    try:
        recommendations = get_recommendations(class_name)
        return jsonify({
            'success': True,
            'class': class_name,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    if not model_loaded:
        print(f"⚠️  Warning: Model not found at {MODEL_PATH}", flush=True)
        print("Service will start but detection endpoints will return 503", flush=True)

    print(f"\n✅ YOLO11s Detection Service Starting", flush=True)
    print(f"📂 Model path: {MODEL_PATH}", flush=True)
    print(f"📁 Results directory: {RESULTS_DIR}", flush=True)
    print(f"🌿 Crop classes: {list(RECOMMENDATIONS_DB.keys())}", flush=True)
    print(f"🚀 Starting Flask server on http://0.0.0.0:5000\n", flush=True)

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
