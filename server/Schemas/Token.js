import crypto from "crypto";

import mongoose from "../mongo";

const tokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  value: {
    type: String,
    default: () => crypto.randomBytes(15).toString("hex"),
    unique: true
  },
  associatedData: mongoose.Mixed,
  createdAt: { type: Date, default: () => Date.now() }
});

const TokenModel = mongoose.model("Token", tokenSchema);

export default TokenModel;
