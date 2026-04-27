const Resource = require('../models/Resource');
const mlService = require('../services/mlService');

// Get all resources
const getResources = async (req, res, next) => {
    try {
        const resources = await Resource.find();
        res.status(200).json(resources);
    } catch (error) {
        next(error);
    }
};

// Create a new resource
const createResource = async (req, res, next) => {
    try {
        const { name, type, quantity, status, allocationLimit, priorityLevel } = req.body;

        if (!name || !type) {
            res.status(400);
            throw new Error('Please add all required fields (name, type)');
        }

        const resource = await Resource.create({
            name,
            type,
            quantity,
            status,
            allocationLimit,
            priorityLevel
        });

        res.status(201).json(resource);
    } catch (error) {
        next(error);
    }
};

// Update a resource
const updateResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            res.status(404);
            throw new Error('Resource not found');
        }

        const updatedResource = await Resource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedResource);
    } catch (error) {
        next(error);
    }
};

// Delete a resource
const deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            res.status(404);
            throw new Error('Resource not found');
        }

        await resource.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

// Call ML Service to predict demand
const predictResourceDemand = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            res.status(404);
            throw new Error('Resource not found');
        }

        // Delegate to ML service layer
        const prediction = await mlService.predictDemand(resource);

        res.status(200).json({
            resourceId: resource._id,
            name: resource.name,
            prediction
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    predictResourceDemand
};
