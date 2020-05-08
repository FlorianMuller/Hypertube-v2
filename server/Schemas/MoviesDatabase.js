import mongoose from "../mongo";

const MovieSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  path: { type: String },
  createdAt: { type: Date, default: () => Date.now() },
  lastViewed: { type: Date, default: () => Date.now() },
  magnet: { type: String }
});

const MovieModel = mongoose.model("Movie", MovieSchema);

export default MovieModel;
