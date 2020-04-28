import express from "express";

import signUpController from "./Controllers/signUp";
import SignInControllers from "./Controllers/signIn";
import searchController from "./Controllers/search";
import movieController from "./Controllers/movie";
import checkAuth from "./Helpers/auth";
import signOutController from "./Controllers/signOut";

const router = express.Router();

/* Static files */
router.use("/avatar", checkAuth, express.static("./server/data/avatar"));

/* User */
// create a new user
router.post("/users", signUpController.signUp);
router.put(
  "/users/:id/send-validation-email",
  signUpController.resendValidationEmail
);
router.put("/tokens/:value/verify-email", signUpController.verifyEmail);

/* Auth */
router.post("/users/login", SignInControllers);
router.get("/check-auth", checkAuth, (req, res) => {
  res.status(200).json({ validToken: true });
});
router.put("/users/logout", signOutController);

/* Search */
router.get("/movies", checkAuth, searchController.searchMovies);

/* Movie */
router.use("/movie", checkAuth, express.static("./server/data/movie"));
router.get("/movie/infos/:imdbId", checkAuth, movieController.getInfos);
router.get("/movie/play/:imdbId", checkAuth, movieController.PlayMovie);
router.get("/movie/subtitles/:imdbId", checkAuth, movieController.getSubtitles);
router.use("/subtitles", checkAuth, express.static("./server/data/subtitles"));
router.get("/movie/streaming/:directory/:fileName", checkAuth, (req, res) => {
  const { fileName } = req.params;
  const { directory } = req.params;
  const dest = `./server/data/movie/${directory}/${fileName}`;

  console.log(dest);
  res.status(200).send(dest);
});
router.post("/movie/review", checkAuth, movieController.receiveReviews);

router.post("/movies/:id/reviews", checkAuth, movieController.receiveReviews);

export default router;
