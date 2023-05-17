import Task from "../models/taskModel.js";

export const getTasks = async (req, res, next) => {
  try {
    let allTasks = await Task.find({ listId: req.params.listId });

    if (allTasks.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "There are no tasks in this list",
      });
    }

    res.status(200).json({
      status: "success",
      results: allTasks.length,
      data: allTasks,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try again after sometime",
    });
  }
};

export const addTask = async (req, res, next) => {
  try {
    let user = req.user;
    const { taskName, text, date, priority } = req.body;
    let newTask = await Task.create({
      userId: user,
      listId: req.params.listId,
      taskName,
      text,
      date,
      priority,
      completed: false,
    });

    res.status(200).json({
      status: "success",
      message: "Task addedd",
      data: newTask,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try after sometime",
    });
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const id = req.params.taskId;
    const task = await Task.findById(id);

    if (!req.params.listId.equals(task.listId)) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized Access",
      });
    }
    const updateTask = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: updateTask,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try after sometime",
    });
  }
};

export const deleteTask = async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);

  if (!task) {
    return res.status(404).json({
      status: "fail",
      message: "No task found with that ID",
    });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
};

export const findTasksByUserID = async (req, res, next) => {
  const tasks = await Task.find({ userId: req.user._id });

  if (!tasks) {
    res.status(404).json({
      status: "fail",
      message: "There is no tasks with this userID",
    });
  }

  res.status(200).json({
    status: "success",
    data: tasks,
  });
};
