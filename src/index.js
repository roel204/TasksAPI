import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import tasksRouter from './routes/tasks.js';
import detailsRouter from './routes/details.js';

const app = express();
mongoose.connect('mongodb://127.0.0.1:27017/taskmanager');

app.use(express.json());

app.use("/tasks", tasksRouter);
app.use("/details", detailsRouter);

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Webserver started at port ${process.env.EXPRESS_PORT}`);
});