import express from "express";
import {
  addList,
  deletList,
  getAllList,
  updateList,
} from "../controllers/listController.js";
import { auth } from "../controllers/userController.js";
import taskRouter from "./taskRoutes.js";

const router = express.Router();

// router.use("/:listId/tasks", taskRouter);

router.post("/addList", auth, addList);

router.put("/updateList/:listId", auth, updateList);

router.get("/listsByUid/:userId", auth, getAllList);

router.delete("/deleteList/:listId", auth, deletList);
export default router;
