import mongoose from "../mongo";

const movieCommentSchema = new mongoose.Schema({
  _id: String,
  movieId: { type: String, required: true },
  movieName: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Number, required: true },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  body: { type: String, required: true }
});

const MovieCommentModel = mongoose.model("movieComments", movieCommentSchema);

export default MovieCommentModel;
