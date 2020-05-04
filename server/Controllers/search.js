import qs from "qs";

import { searchMoviesOnYts, checkIfViewed } from "../Helpers/search";
// import { searchMoviesOnYts, checkIfViewed } from "../Helpers/search";

const searchMovies = async (req, res) => {
  const parsedQuery = qs.parse(req.query);

  try {
    let data = await searchMoviesOnYts(parsedQuery);
    data = await checkIfViewed(data, req.userId);
    res.status(200).send(data);
  } catch (error) {
    res.sendStatus(500);
  }
};

export default { searchMovies };
