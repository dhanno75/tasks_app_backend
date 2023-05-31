import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please list name"],
    default: "My List",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A task must belong to a user"],
  },
  color: {
    type: String,
    default: "white",
  },
  tasks: [mongoose.Schema.Types.ObjectId],
});

const List = mongoose.model("List", listSchema);

export default List;
