import searchMoviesOnAllSource from "../Helpers/search";

const searchMovies = async (req, res) => {
  try {
    const moviesList = await searchMoviesOnAllSource(req.query);
    res.send(moviesList);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
};

export default { searchMovies };
