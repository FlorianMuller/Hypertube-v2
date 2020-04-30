import searchMoviesOnAllSource from "../Helpers/search";

const searchMovies = async (req, res) => {
  try {
    // Converting param to real number
    if (req.query.page) req.query.page = parseInt(req.query.page, 10);
    if (req.query.minRating)
      req.query.minRating = parseFloat(req.query.minRating, 10);
    if (req.query.year) req.query.year = parseInt(req.query.year, 10);

    const moviesList = await searchMoviesOnAllSource(req.query);
    res.send(moviesList);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

export default { searchMovies };
