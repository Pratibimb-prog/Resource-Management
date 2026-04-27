# Smart Resource Management (SRM)

A full-stack, AI-powered dashboard for managing resources and predicting demand using Machine Learning.

![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/Node.js-v14%2B-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![ML](https://img.shields.io/badge/Machine%20Learning-RandomForest-orange)

## Overview

Smart Resource Management (SRM) is a professional-grade application designed to optimize resource allocation. It combines a robust **Node.js/Express** backend with a **Python Flask** microservice that uses a **RandomForestClassifier** to predict resource demand based on current utilization, priority, and status.

### Key Features
- **Real-time Dashboard**: Monitor total, available, and depleted resources at a glance.
- **AI Demand Prediction**: High-precision ML model predicts demand levels (Low, Medium, High, Critical).
- **Secure Authentication**: JWT-based authentication with role-based access control (Admin/Viewer).
- **Premium UI**: A modern, minimal design using a White, Green, and Red color palette for maximum clarity.

---

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: Vanilla JS (ES6+), Modern CSS (Flexbox/Grid), Glassmorphism components
- **Machine Learning**: Python, Scikit-Learn, Flask, NumPy, Joblib
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [Python 3.8+](https://www.python.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally (port 27017)

### 1. Setup Backend (Node.js)
```bash
# Install dependencies
npm install

# Configure environment variables (Check .env)
# Start the server
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Setup ML Microservice (Python)
```bash
cd ml

# Install dependencies
pip install -r requirements.txt

# Train or Start the API
python app.py
```
*ML Service runs on `http://localhost:5001`*

---

## How the AI Works

The ML model predicts demand by analyzing 5 features:
1. **Utilization**: Ratio of Quantity vs Allocation Limit (Highest weight).
2. **Priority Level**: Numerical encoding of resource priority.
3. **Status**: Current usage state.
4. **Buffer Quantity**: Remaining stock.

When you click **Predict**, the AI calculates a demand score and provides actionable advice (e.g., *"Immediate action required - resource is at safe capacity"*).

---

## Project Structure
- `src/`: Express backend (Models, Controllers, Routes).
- `public/`: Frontend static files (Dashboard, Auth, Styles).
- `ml/`: Python microservice and trained model (`model.pkl`).
- `server.js`: Main entry point.

---

## License
This project is licensed under the ISC License.
