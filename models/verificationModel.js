import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  uniqueString: String,
  createdAt: Date,
  expiresAt: Date,
});

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
