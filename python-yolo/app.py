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

app = Flask(__name__)

# Configure CORS properly for production
CORS(app, resources={
    r"/*": {
        "origins": "*",  # In production, replace with your Laravel domain
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Load YOLO11s model
MODEL_PATH = os.environ.get('MODEL_PATH', 'models/my_models.pt')
model = None

def load_model():
    """Load model with error handling"""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = YOLO(MODEL_PATH)
            print(f"✅ YOLO11s Model loaded from: {MODEL_PATH}")
            return True
        else:
            print(f"⚠️  Model not found at {MODEL_PATH}")
            return False
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

# Load model on startup
model_loaded = load_model()

# Create directories for saving results (optional in production)
os.makedirs('results', exist_ok=True)
os.makedirs('uploads', exist_ok=True)

# Recommendations database for Mustasa and Pechay
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
            'Maintain consistent soil moisture',
            'Harvest outer leaves regularly to encourage new growth',
            'Ensure 4-6 hours of sunlight daily'
        ],
        'preventive_measures': [
            'Inspect plants daily for pest or disease signs',
            'Maintain spacing of 6-8 inches between plants',
            'Keep growing area clean and weed-free',
            'Practice crop rotation every season',
            'Water in the morning to allow foliage to dry'
        ],
        'fertilizer_recommendation': 'Apply balanced 10-10-10 fertilizer every 2 weeks, or use organic compost tea',
        'watering_schedule': 'Water consistently - 1 inch per week, keep soil moist but not waterlogged',
        'urgency': 'low',
        'estimated_recovery_days': 0,
        'optimal_conditions': {
            'temperature': '15-20°C (60-68°F)',
            'humidity': '50-70%',
            'soil_ph': '6.0-7.5',
            'sunlight': '4-6 hours daily'
        },
        'harvest_tips': [
            'Ready to harvest in 30-45 days',
            'Pick outer leaves first',
            'Harvest in the morning for best flavor',
            'Cut leaves 1 inch above soil level'
        ]
    },
    'mustasa_leaf_spot': {
        'crop_type': 'Mustasa (Mustard Greens)',
        'condition': 'Leaf Spot Disease',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Fungicide application and improved sanitation',
        'recommendations': [
            'Remove all infected leaves immediately and destroy (do not compost)',
            'Apply copper-based fungicide or neem oil spray',
            'Spray early morning, covering both sides of leaves',
            'Repeat treatment every 7-10 days',
            'Improve air circulation by thinning plants if crowded',
            'Avoid overhead watering - water at soil level only',
            'Disinfect tools with 10% bleach solution after use'
        ],
        'preventive_measures': [
            'Space plants 8-10 inches apart for better air flow',
            'Remove plant debris and weeds regularly',
            'Use drip irrigation or water at base only',
            'Avoid working with plants when leaves are wet',
            'Apply organic mulch to prevent soil splash',
            'Rotate crops - don\'t plant mustasa in same spot for 2 years',
            'Choose disease-resistant varieties when available'
        ],
        'fertilizer_recommendation': 'Reduce nitrogen temporarily, use balanced 5-10-10 with calcium',
        'watering_schedule': 'Water at base in early morning only, reduce frequency to let soil dry slightly between waterings',
        'urgency': 'medium',
        'estimated_recovery_days': 14,
        'optimal_conditions': {
            'temperature': '15-20°C',
            'humidity': 'Reduce to below 60%',
            'soil_ph': '6.0-7.5',
            'air_circulation': 'Increase significantly'
        },
        'product_suggestions': [
            'Copper hydroxide fungicide',
            'Neem oil organic spray',
            'Calcium-enriched fertilizer',
            'Organic mulch (straw or grass clippings)',
            'Drip irrigation tubing'
        ]
    },
    'mustasa_yellow_leaf': {
        'crop_type': 'Mustasa (Mustard Greens)',
        'condition': 'Yellow Leaf / Nutrient Deficiency',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Nutrient supplementation and care adjustment',
        'recommendations': [
            'Test soil pH and nutrient levels if possible',
            'Apply nitrogen-rich fertilizer immediately (higher N ratio)',
            'Spray foliar feed with liquid fertilizer for quick response',
            'Check for pest infestation (aphids can cause yellowing)',
            'Ensure proper drainage - yellowing can indicate overwatering',
            'Remove severely yellowed leaves to redirect plant energy',
            'Add compost or aged manure to soil'
        ],
        'preventive_measures': [
            'Maintain consistent fertilization schedule (every 2 weeks)',
            'Ensure soil pH is 6.0-7.5 for optimal nutrient uptake',
            'Improve drainage if soil stays soggy',
            'Add organic matter to improve soil quality',
            'Monitor for pests regularly (aphids, flea beetles)',
            'Avoid overwatering which leads to root problems',
            'Mulch to maintain consistent soil moisture'
        ],
        'fertilizer_recommendation': 'High nitrogen fertilizer 20-10-10 or fish emulsion (5-1-1), apply every week until green returns',
        'watering_schedule': 'Water deeply but less frequently, check soil moisture 2 inches deep before watering',
        'urgency': 'medium',
        'estimated_recovery_days': 10,
        'possible_causes': [
            'Nitrogen deficiency (most common)',
            'Overwatering / poor drainage',
            'Iron deficiency (if yellowing between veins)',
            'Natural aging of lower leaves',
            'Pest damage',
            'Root problems'
        ],
        'optimal_conditions': {
            'temperature': '15-20°C',
            'humidity': '50-70%',
            'soil_ph': '6.0-7.5',
            'drainage': 'Well-draining soil essential'
        },
        'product_suggestions': [
            'Fish emulsion fertilizer (5-1-1)',
            'Liquid nitrogen fertilizer (20-10-10)',
            'Chelated iron supplement',
            'Organic compost',
            'pH test kit',
            'Foliar spray fertilizer'
        ]
    },
    'pechay_healthy': {
        'crop_type': 'Pechay (Chinese Cabbage)',
        'condition': 'Healthy',
        'severity': 'none',
        'severity_level': 0,
        'treatment': 'No treatment needed - Continue current care',
        'recommendations': [
            'Continue current care routine - your pechay is in excellent condition',
            'Monitor for pests (cabbage worms, aphids) regularly',
            'Maintain consistent moisture for tender leaves',
            'Harvest when heads are firm but before bolting',
            'Ensure 4-6 hours of sunlight with afternoon shade'
        ],
        'preventive_measures': [
            'Inspect undersides of leaves for eggs and pests',
            'Space plants 8-12 inches apart',
            'Use row covers to protect from pests',
            'Keep area weed-free',
            'Harvest before hot weather to prevent bolting',
            'Water consistently at base of plants'
        ],
        'fertilizer_recommendation': 'Balanced 10-10-10 fertilizer every 2-3 weeks, or compost tea weekly',
        'watering_schedule': 'Keep soil consistently moist - 1-1.5 inches per week, water daily in hot weather',
        'urgency': 'low',
        'estimated_recovery_days': 0,
        'optimal_conditions': {
            'temperature': '15-20°C (60-68°F) - cool weather crop',
            'humidity': '60-70%',
            'soil_ph': '6.0-7.5',
            'sunlight': '4-6 hours, prefers cooler temperatures'
        },
        'harvest_tips': [
            'Ready to harvest in 40-50 days',
            'Harvest when heads are firm and compact',
            'Cut at base with sharp knife',
            'Best harvested in cool morning',
            'Can harvest baby leaves earlier for salads'
        ]
    },
    'pechay_leaf_spot': {
        'crop_type': 'Pechay (Chinese Cabbage)',
        'condition': 'Leaf Spot Disease',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Fungicide treatment and sanitation',
        'recommendations': [
            'Remove infected outer leaves immediately and destroy',
            'Apply copper fungicide or organic neem oil spray',
            'Spray in early morning, covering all leaf surfaces',
            'Repeat application every 7-10 days',
            'Increase spacing between plants for air circulation',
            'Water only at soil level - never wet the leaves',
            'Consider harvesting early if infection is spreading',
            'Sanitize all gardening tools between plants'
        ],
        'preventive_measures': [
            'Space plants 10-12 inches apart minimum',
            'Use drip irrigation or soaker hoses only',
            'Remove all plant debris after harvest',
            'Avoid overhead watering completely',
            'Apply thin layer of mulch to prevent soil splash',
            'Practice 2-3 year crop rotation',
            'Avoid working with wet plants',
            'Choose resistant varieties when replanting'
        ],
        'fertilizer_recommendation': 'Reduce nitrogen, use 5-10-10 with added calcium to strengthen cell walls',
        'watering_schedule': 'Water at base only in early morning, allow foliage to stay dry',
        'urgency': 'medium',
        'estimated_recovery_days': 14,
        'optimal_conditions': {
            'temperature': '15-20°C',
            'humidity': 'Keep below 60% around plants',
            'soil_ph': '6.0-7.5',
            'air_circulation': 'Critical - ensure good ventilation'
        },
        'product_suggestions': [
            'Copper fungicide spray',
            'Organic neem oil concentrate',
            'Calcium supplement spray',
            'Drip irrigation system',
            'Organic mulch',
            'Hand pruners for removing leaves'
        ]
    },
    'pechay_yellow_leaf': {
        'crop_type': 'Pechay (Chinese Cabbage)',
        'condition': 'Yellow Leaf / Nutrient Deficiency',
        'severity': 'medium',
        'severity_level': 2,
        'treatment': 'Nutrient correction and environmental adjustment',
        'recommendations': [
            'Apply nitrogen-rich fertilizer immediately',
            'Use foliar spray for rapid nutrient absorption',
            'Check and adjust soil pH to 6.0-7.5',
            'Improve drainage if soil is waterlogged',
            'Remove heavily yellowed outer leaves',
            'Check for root damage or pests',
            'Add aged compost to boost soil fertility',
            'Ensure adequate but not excessive watering'
        ],
        'preventive_measures': [
            'Fertilize regularly every 2 weeks during growth',
            'Test and maintain proper soil pH',
            'Ensure excellent soil drainage',
            'Add organic matter before planting',
            'Monitor for cabbage root maggots',
            'Check for aphids which can cause yellowing',
            'Mulch to maintain consistent moisture',
            'Avoid planting in compacted soil'
        ],
        'fertilizer_recommendation': 'High nitrogen fertilizer 21-0-0 or blood meal, followed by balanced 10-10-10 weekly',
        'watering_schedule': 'Water deeply 2-3 times per week, ensure soil drains well and isn\'t soggy',
        'urgency': 'medium',
        'estimated_recovery_days': 10,
        'possible_causes': [
            'Nitrogen deficiency (primary cause)',
            'Overwatering / waterlogged soil',
            'Poor drainage / root rot',
            'Soil pH too low or too high',
            'Cabbage root maggot damage',
            'Natural aging of outer leaves',
            'Heat stress / bolting'
        ],
        'optimal_conditions': {
            'temperature': '15-20°C - prefers cool weather',
            'humidity': '60-70%',
            'soil_ph': '6.0-7.5',
            'drainage': 'Well-draining, loose soil essential'
        },
        'product_suggestions': [
            'Blood meal (12-0-0) organic nitrogen',
            'Fish emulsion liquid fertilizer',
            'Liquid nitrogen fertilizer (21-0-0)',
            'Soil pH test kit',
            'Chelated iron supplement',
            'Compost or aged manure',
            'Foliar spray fertilizer'
        ]
    }
}

def get_recommendations(class_name):
    """Get detailed recommendations for detected class"""
    # Normalize class name
    class_name_normalized = class_name.lower().strip()

    if class_name_normalized in RECOMMENDATIONS_DB:
        return RECOMMENDATIONS_DB[class_name_normalized]

    # Default recommendations if class not found
    return {
        'crop_type': 'Unknown',
        'condition': class_name.replace('_', ' ').title(),
        'severity': 'unknown',
        'severity_level': 1,
        'treatment': 'Consult with agricultural expert',
        'recommendations': ['Monitor plant closely', 'Document symptoms', 'Seek expert advice'],
        'preventive_measures': ['Maintain good plant hygiene'],
        'fertilizer_recommendation': 'Standard balanced fertilizer',
        'watering_schedule': 'Regular watering',
        'urgency': 'medium',
        'estimated_recovery_days': None,
        'product_suggestions': ['Consult expert']
    }

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
        'total_classes': len(RECOMMENDATIONS_DB)
    })

@app.route('/detect', methods=['POST'])
def detect():
    """
    Detect objects from uploaded image file or base64
    Expected: multipart/form-data with 'image' file OR JSON with base64 'image'
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 503

    try:
        img = None

        # Check if it's multipart/form-data (file upload)
        if 'image' in request.files:
            file = request.files['image']
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No image selected'
                }), 400

            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Check if it's JSON with base64 image
        elif request.is_json:
            data = request.get_json()
            if 'image' not in data:
                return jsonify({
                    'success': False,
                    'error': 'No image provided in JSON'
                }), 400

            image_data = data['image']

            # Handle base64 with data URI prefix
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]

            # Decode base64
            img_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        else:
            return jsonify({
                'success': False,
                'error': 'No image provided. Send either file upload or JSON with base64 image'
            }), 400

        if img is None:
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400

        # Get confidence threshold from request (default 0.25)
        confidence_threshold = float(request.form.get('confidence', 0.25)) if not request.is_json else 0.25

        # Run YOLO11s detection
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
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0].cpu().numpy())
                class_id = int(box.cls[0].cpu().numpy())
                class_name = result.names[class_id]

                # Get recommendations for this detection
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

        # Get highest confidence detection for primary recommendation
        primary_detection = None
        if detections:
            primary_detection = max(detections, key=lambda x: x['confidence'])

        # Get image dimensions
        height, width = img.shape[:2]

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

        return jsonify(response_data)

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect/batch', methods=['POST'])
def detect_batch():
    """Handle multiple images at once"""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 503

    try:
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No images provided'
            }), 400

        files = request.files.getlist('images')
        confidence_threshold = float(request.form.get('confidence', 0.25))
        all_results = []

        for file in files:
            img_bytes = file.read()
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                continue

            results = model.predict(
                source=img,
                conf=confidence_threshold,
                verbose=False
            )

            detections = []
            result = results[0]

            if len(result.boxes) > 0:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = result.names[class_id]

                    recommendations = get_recommendations(class_name)

                    detections.append({
                        'class': class_name,
                        'confidence': float(confidence),
                        'bbox': {
                            'x1': float(x1),
                            'y1': float(y1),
                            'x2': float(x2),
                            'y2': float(y2)
                        },
                        'recommendations': recommendations
                    })

            all_results.append({
                'filename': file.filename,
                'detections': detections,
                'total': len(detections)
            })

        return jsonify({
            'success': True,
            'results': all_results
        })

    except Exception as e:
        print(f"❌ Batch Error: {str(e)}")
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
    # Check if model exists
    if not model_loaded:
        print(f"⚠️  Warning: Model not found at {MODEL_PATH}")
        print("Service will start but detection endpoints will return 503")

    print(f"✅ YOLO11s Detection Service Starting")
    print(f"📂 Model path: {MODEL_PATH}")
    print(f"🌿 Crop classes: {list(RECOMMENDATIONS_DB.keys())}")
    print(f"🚀 Starting Flask server on http://0.0.0.0:5000")

    # Use environment PORT or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
