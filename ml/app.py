"""
Flask ML Microservice - Resource Demand Prediction
Listens on port 5001.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ── Model ──────────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
model = None

PRIORITY_MAP = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
STATUS_MAP   = {'available': 0, 'in-use': 1, 'depleted': 2}

# Allocation multiplier per demand level
ALLOC_FACTOR = {'Low': 0.50, 'Medium': 0.70, 'High': 0.88, 'Critical': 1.00}

# Demand level -> textual advice
ADVICE = {
    'Low':      'Resource is under-utilised. Consider reducing allocation or redeploying.',
    'Medium':   'Resource usage is balanced. Maintain current allocation levels.',
    'High':     'Demand is elevated. Consider scaling allocation before shortage occurs.',
    'Critical': 'Immediate action required - resource is at or beyond safe capacity.',
}


def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"[ML] Model loaded <- {MODEL_PATH}")
    else:
        print(f"[ML] WARNING: model.pkl not found at {MODEL_PATH}")
        print("[ML]    Run:  python ml/train.py")


# ── Routes ─────────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run python ml/train.py first.'}), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No JSON body received.'}), 400

    try:
        quantity    = float(data.get('quantity', 0))
        alloc_limit = float(data.get('allocationLimit', 100))
        prio_str    = str(data.get('priorityLevel', 'low')).lower()
        status_str  = str(data.get('status', 'available')).lower()

        prio_enc   = PRIORITY_MAP.get(prio_str, 0)
        status_enc = STATUS_MAP.get(status_str, 0)
        utilization = quantity / (alloc_limit + 1e-9)

        X = np.array([[quantity, alloc_limit, prio_enc, status_enc, utilization]])

        prediction   = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        confidence    = float(np.max(probabilities))

        alloc_rec  = round(alloc_limit * ALLOC_FACTOR.get(prediction, 0.80), 2)
        prob_dict  = {
            cls: round(float(p), 4)
            for cls, p in zip(model.classes_, probabilities)
        }

        return jsonify({
            'success':                True,
            'predictedDemand':        prediction,
            'confidence':             round(confidence * 100, 1),
            'allocationRecommendation': alloc_rec,
            'advice':                 ADVICE.get(prediction, ''),
            'probabilities':          prob_dict,
            'features': {
                'quantity':       quantity,
                'allocationLimit': alloc_limit,
                'priorityLevel':  prio_str,
                'status':         status_str,
                'utilization':    round(utilization * 100, 1),
            },
        })

    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


# ── Entry ──────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    load_model()
    app.run(port=5001, debug=False)
