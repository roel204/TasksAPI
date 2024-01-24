import express from 'express';
import Task from '../models/task.js';
import {createPagination} from "../pagination.js";

const router = express.Router();

router.use(express.urlencoded({extended: true}));

// Middleware to check the Accept header for all GET requests
const checkAcceptHeader = (req, res, next) => {
    if (req.method === 'GET' && (!req.headers.accept || req.headers.accept !== 'application/json')) {
        // Respond with 406 Not Acceptable if the Accept header is missing or not application/json
        return res.status(406).json({error: "Only application/json is allowed in the Accept header for GET requests"});
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
        return res.status(415).json({error: "Only application/json and application/x-www-form-urlencoded are allowed in the Content-Type header for POST requests"});
    }
    // Continue processing the request if the Content-Type header is correct or for non-POST requests
    next();
};

router.use(checkContentTypeHeader);

router.get("/", async (req, res) => {
    console.log("Start /Get")
    try {
        const tasks = await Task.find();

        const start = parseInt(req.query.start) || 1;
        const limit = parseInt(req.query.limit) || tasks.length;
        const total = tasks.length;

        const host = req.get('host');

        // Use the createPagination function
        const halResponse = createPagination(total, start, limit, host);
        console.log("Pagination received")
        // Add the items to the halResponse
        halResponse.items = tasks.slice(start - 1, start - 1 + limit).map(task => ({
            id: task.id,
            name: task.name,
            status: task.status,
            bookmark: task.bookmark,
            _links: {
                self: {href: `http://${host}/tasks/${task.id}`},
                collection: {href: `http://${host}/tasks`},
            },
        }));
        console.log("halResponse done")

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

        res.json(halResponse);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
    console.log("Complete Get")
});

router.post("/", async (req, res) => {
    console.log("Start /Post")
    const {name, description, status} = req.body;

    try {
        const newTask = new Task({name, description, status});
        const savedTask = await newTask.save();

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.options("/", (req, res) => {
    console.log("Start /Options")
    res.header("Allow", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.status(200).send();
});

router.get("/:id", async (req, res) => {
    console.log("Start /id/Get");
    const id = req.params.id;
    const host = req.get('host');

    try {
        const task = await Task.findById(id).lean();

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");

        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        const links = {
            self: { href: `http://${host}/tasks/${id}` },
            collection: { href: `http://${host}/tasks` },
        };

        res.json({
            ...task,
            _links: links,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    console.log("Start /id/Put")
    const id = req.params.id;
    const {name, description, status} = req.body;

    try {
        const updatedTask = await Task.findOneAndUpdate(
            {_id: id},
            {name, description, status},
            {new: true, runValidators: true}
        );

        if (!updatedTask) {
            res.status(404).json({error: "Task not found"});
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.delete("/:id", async (req, res) => {
    console.log("Start /id/Delete");
    const id = req.params.id;

    try {
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");

        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.options("/:id", (req, res) => {
    console.log("Start /id/options")
    res.header("Allow", "GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).send();
});

router.patch("/:id/bookmark", async (req, res) => {
    console.log("Start /id/bookmark Patch");
    const id = req.params.id;

    try {
        // Find the task by ID
        const task = await Task.findById(id);

        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }

        // Toggle the bookmark state
        task.bookmark = !task.bookmark;

        // Save the updated task
        const updatedTask = await task.save();

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "PATCH, OPTIONS");

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.options("/:id/bookmark", (req, res) => {
    console.log("Start /id/bookmark/options");
    res.header("Allow", "PATCH, OPTIONS");
    res.header("Access-Control-Allow-Methods", "PATCH, OPTIONS");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(200).send();
});

export default router;