import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

PRIORITY_MAP = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
STATUS_MAP   = {'available': 0, 'in-use': 1, 'depleted': 2}

def generate_data(n: int = 3000):
    """Synthetic but realistic resource usage dataset."""
    rng = np.random.default_rng(42)

    quantity        = rng.integers(0, 500, n).astype(float)
    alloc_limit     = rng.integers(50, 500, n).astype(float)
    priority        = rng.integers(0, 4, n).astype(float)   # 0-3
    status          = rng.integers(0, 3, n).astype(float)   # 0-2
    utilization     = np.clip(quantity / (alloc_limit + 1e-9), 0, 2)

    # Composite demand score (0-1 scale)
    noise = rng.normal(0, 0.04, n)
    score = (
        0.40 * utilization
        + 0.25 * (priority / 3.0)
        + 0.20 * (status / 2.0)
        + 0.15 * (1.0 - np.clip(quantity / 500.0, 0, 1))
        + noise
    )

    labels = np.select(
        [score < 0.25, score < 0.50, score < 0.75],
        ['Low',        'Medium',      'High'],
        default='Critical'
    )

    X = np.column_stack([quantity, alloc_limit, priority, status, utilization])
    return X, labels

def train():
    print("Generating synthetic training data (n=3000)...")
    X, y = generate_data(3000)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("\n Classification report (test set):")
    print(classification_report(y_test, y_pred))

    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(clf, model_path)
    print(f"Model saved -> {model_path}")

if __name__ == '__main__':
    train()
