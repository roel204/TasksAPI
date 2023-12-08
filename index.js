import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

// Create an Express application
const app = express();

// Connect to MongoDB database (assuming it's running locally on the default port)
mongoose.connect('mongodb://127.0.0.1:27017/taskmanager');

// Define a Mongoose Schema for tasks
const Schema = mongoose.Schema;
const taskSchema = new Schema({
    name: { type: String, required: true },         // Task name, must be provided
    description: { type: String, required: true },  // Task description, must be provided
    status: { type: String, required: true },       // Task status, must be provided
});

// Create a Mongoose Model for tasks based on the schema
const Task = mongoose.model('Task', taskSchema);

// Use Express middleware to parse JSON requests
app.use(express.json());

// Define a route for the root endpoint ("/")
app.get("/", (req, res) => {
    res.send("Task Manager API");
});

// Define a route to get all tasks
app.get("/tasks", async (req, res) => {
    try {
        // Retrieve all tasks from the MongoDB database
        const tasks = await Task.find();
        // Respond with the tasks in JSON format
        res.json(tasks);
    } catch (error) {
        // Handle errors and respond with a 500 Internal Server Error
        res.status(500).json({ error: error.message });
    }
});

// Define a route to create a new task
app.post("/tasks", async (req, res) => {
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

// Start the Express server and listen on the specified port
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Webserver started at port ${process.env.EXPRESS_PORT}`);
});
