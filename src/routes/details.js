import express from 'express';
import Task from '../models/task.js';

const router = express.Router();

router.get("/:taskId", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        // Retrieve a single task by ID from the MongoDB database
        const task = await Task.findById(taskId);

        if (!task) {
            // If the task with the specified ID is not found, respond with a 404 Not Found status
            res.status(404).json({ error: "Task not found" });
            return;
        }

        // Respond with all task details in JSON format
        res.json(task);
    } catch (error) {
        // Handle errors and respond with a 500 Internal Server Error
        res.status(500).json({ error: error.message });
    }
});

router.options("/:taskId", (req, res) => {
    // Set the allowed methods for this URI
    res.header("Allow", "GET, OPTIONS");
    // Provide additional information if needed
    res.status(200).send();
});

export default router;