import mongoose from "../mongo";

const MovieModel = new mongoose.Schema({
  movieId: { type: String, required: true },
  movieName: { type: String, required: true },
  path: { type: String },
  createdAt: { type: Date, default: () => Date.now() },
  lastViewed: { type: Date, default: () => Date.now() },
  magnet: { type: String }
});

export default MovieModel;
