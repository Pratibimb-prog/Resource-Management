/**
 * ML Service Bridge — calls the Flask ML microservice (port 5001).
 * Falls back gracefully if the service is unavailable.
 */
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const predictDemand = async (resourceData) => {
    try {
        const payload = {
            quantity:        resourceData.quantity,
            allocationLimit: resourceData.allocationLimit,
            priorityLevel:   resourceData.priorityLevel,
            status:          resourceData.status,
        };

        const { data } = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            payload,
            { timeout: 5000 }
        );

        console.log(`[ML] Predicted demand for "${resourceData.name}": ${data.predictedDemand} (${data.confidence}% confidence)`);
        return data;
    } catch (err) {
        console.error(`[ML] Service error: ${err.message}`);
        // Graceful fallback so API still responds
        return {
            success: false,
            predictedDemand: 'Unavailable',
            confidence: 0,
            allocationRecommendation: resourceData.allocationLimit * 0.8,
            advice: 'ML service is not running. Start it with: python ml/app.py',
            error: 'ML service unavailable',
        };
    }
};

module.exports = { predictDemand };
