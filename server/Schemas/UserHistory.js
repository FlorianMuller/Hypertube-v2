import mongoose from "../mongo";

const userHistory = new mongoose.Schema({
  _id: String,
  userId: { type: String, required: true },
  movieId: { type: String, required: true },
  movieName: { type: String, required: true },
  date: { type: Number, required: true }
});

const UserHistoryModel = mongoose.model("userHistory", userHistory);

export default UserHistoryModel;
