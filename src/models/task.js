import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const taskSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    bookmark: { type: Boolean, default: false },
});

console.log("Export Task")
const Task = mongoose.model('Task', taskSchema);

export default Task;