import MovieCommentModel from "../Schemas/MovieComment";

const timestampToDate = (month, day, year) => {
  return `${month}, ${day}, ${year}`;
};

const sortReviews = (reviews, ourReviews) => {
  const copyReviews = reviews;
  copyReviews.push(...ourReviews);
  if (copyReviews.length > 1) {
    copyReviews.sort((reviewA, reviewB) => reviewA.date - reviewB.date);
  }
  copyReviews.forEach(({ date }, index) => {
    const fullDate = String(new Date(date)).split(" ");
    copyReviews[index].date = timestampToDate(
      fullDate[1],
      fullDate[2],
      fullDate[3]
    );
  });
  return copyReviews;
};

const findReviews = async (movieId) => {
  try {
    const reviews = await MovieCommentModel.find({ movieId });
    const ourReviews = [];
    if (reviews.length > 0) {
      reviews.forEach(({ _id, authorUsername, date, stars, body }) => {
        ourReviews.push({ id: _id, authorUsername, date, stars, body });
      });
    }
    return ourReviews;
  } catch (e) {
    console.error(e.message);
    return e.message;
  }
};

const saveReview = async (comment) => {
  try {
    return await MovieCommentModel.create({
      _id: comment._id || undefined,
      movieId: comment.movieId,
      movieName: comment.movieName,
      authorUsername: comment.authorUsername,
      date: comment.date,
      stars: comment.stars,
      body: comment.body
    });
  } catch (e) {
    console.error(e.message);
    return e.message;
  }
};

export default {
  timestampToDate,
  saveReview,
  sortReviews,
  findReviews
};
