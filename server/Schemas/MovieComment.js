import mongoose from "../mongo";

const movieCommentSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  movieName: { type: String, required: true },
  date: { type: Date, default: () => Date.now() },
  authorUsername: { type: String, required: true },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  body: { type: String, required: true }
});

movieCommentSchema.virtual("author", {
  ref: "User",
  localField: "authorUsername",
  foreignField: "username",
  justOne: true
});

const MovieCommentModel = mongoose.model("movieComments", movieCommentSchema);

export default MovieCommentModel;
