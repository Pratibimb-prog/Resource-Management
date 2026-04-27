const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['available', 'in-use', 'depleted'],
        default: 'available',
    },
    allocationLimit: {
        type: Number,
        default: 100,
    },
    priorityLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
