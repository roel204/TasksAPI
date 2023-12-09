import express from 'express';
import Task from '../models/task.js';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        // Retrieve all tasks from the MongoDB database
        const tasks = await Task.find();
        // Respond with only name and status in JSON format
        const simplifiedTasks = tasks.map(task => ({ name: task.name, status: task.status, id: task.id }));
        res.json(simplifiedTasks);
    } catch (error) {
        // Handle errors and respond with a 500 Internal Server Error
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    // Extract task information from the request body
    const { name, description, status } = req.body;

    try {
        // Create a new Task instance with the provided information
        const newTask = new Task({ name, description, status });
        // Save the new task to the database
        const savedTask = await newTask.save();
        // Respond with the saved task in JSON format and a 201 Created status
        res.status(201).json(savedTask);
    } catch (error) {
        // Handle errors and respond with a 400 Bad Request status
        res.status(400).json({ error: error.message });
    }
});

router.options("/", (req, res) => {
    // Set the allowed methods for this URI
    res.header("Allow", "GET, POST, OPTIONS");
    // Provide additional information if needed
    res.status(200).send();
});

export default router;
