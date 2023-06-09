import express from "express";
import { auth } from "../controllers/userController.js";
import {
  addTask,
  deleteTask,
  getAllListsAndTasks,
  getTasks,
  updateTask,
} from "../controllers/taskController.js";

const router = express.Router({ mergeParams: true });

// router.route("/").post(auth, addTask).get(auth, getTasks);
router.route("/:listId").post(auth, addTask).get(auth, getTasks);

router.get("/usersListTasks", auth, getAllListsAndTasks);

router.route("/:taskId").put(auth, updateTask).delete(auth, deleteTask);

export default router;
