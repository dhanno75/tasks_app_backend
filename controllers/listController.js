import { ObjectId } from "mongodb";
import List from "../models/listModel.js";
import Task from "../models/taskModel.js";

export const addList = async (req, res, next) => {
  try {
    let user = req.user;

    const newList = await List.create({
      name: req.body.name,
      userId: user,
      color: "white",
    });

    res.status(201).json({
      status: "success",
      data: newList,
    });
  } catch (err) {
    res.status(500).json({
      status: "success",
      message: "Something went wrong. Please try again.",
    });
  }
};

export const updateList = async (req, res, next) => {
  const user = req.user;

  const list = await List.findById(req.params.listId);

  if (!user._id.equals(list.userId)) {
    res.status(401).json({
      status: "fail",
      message: "This list does not belong to this user.",
    });
  }

  const updatedList = await List.findByIdAndUpdate(
    req.params.listId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedList,
  });
};

export const getAllList = async (req, res, next) => {
  const id = req.params.userId;

  const getAllListByUserId = await List.find({ userId: id });

  const getAllListsTasksByUserId = await List.aggregate([
    {
      $match: {
        userId: ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "tasks",
        localField: "tasks",
        foreignField: "_id",
        as: "results",
      },
    },
  ]);
  console.log(getAllListsTasksByUserId);

  res.status(200).json({
    status: "success",
    result: getAllListsTasksByUserId,
    data: getAllListByUserId,
  });
};

export const deletList = async (req, res, next) => {
  await Task.deleteMany({ listId: req.params.listId });

  await List.findByIdAndDelete(req.params.listId);

  res.status(200).json({
    message: "successful",
  });
};
