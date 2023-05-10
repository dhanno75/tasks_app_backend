import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  taskName: String,
  text: String,
  date: Date,
  priority: {
    type: String,
    enum: {
      values: ["low", "high", "critical"],
      message: "Priority is either: low, high, critical",
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A task must belong to a user"],
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A task must belong to a user"],
  },
  completed: Boolean,
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
