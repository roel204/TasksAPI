import express from 'express';
import Task from '../models/task.js';

const router = express.Router();

// Middleware to check the Accept header for all GET requests
const checkAcceptHeader = (req, res, next) => {
    if (req.method === 'GET' && (!req.headers.accept || req.headers.accept !== 'application/json')) {
        // Respond with 406 Not Acceptable if the Accept header is missing or not application/json
        return res.status(406).json({ error: "Only application/json is allowed in the Accept header for GET requests" });
    }
    // Continue processing the request if the Accept header is correct or for non-GET requests
    next();
};

router.use(checkAcceptHeader);

// Middleware to check the Content-Type header for all POST requests
const checkContentTypeHeader = (req, res, next) => {
    if (req.method === 'POST' && (!req.headers['content-type'] ||
        !['application/json', 'application/x-www-form-urlencoded'].includes(req.headers['content-type']))) {
        // Respond with 415 Unsupported Media Type if the Content-Type header is missing or not allowed
        return res.status(415).json({ error: "Only application/json and application/x-www-form-urlencoded are allowed in the Content-Type header for POST requests" });
    }
    // Continue processing the request if the Content-Type header is correct or for non-POST requests
    next();
};

router.use(checkContentTypeHeader);

router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find();
        const simplifiedTasks = tasks.map(task => ({ name: task.name, status: task.status, id: task.id }));
        const halResponse = {
            items: simplifiedTasks,
            _links: {
                self: { href: "/tasks" },
            },
            pagination: {
                temp: "Pagination info goes here",
            },
        };
        res.json(halResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    const { name, description, status } = req.body;

    try {
        const newTask = new Task({ name, description, status });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.options("/", (req, res) => {
    res.header("Allow", "GET, POST, OPTIONS");
    res.status(200).send();
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const task = await Task.findById(id);

        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const { name, description, status } = req.body;

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id },
            { name, description, status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        res.json({ message: "Task deleted successfully", deletedTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.options("/:id", (req, res) => {
    res.header("Allow", "GET, PUT, DELETE, OPTIONS");
    res.status(200).send();
});

export default router;
