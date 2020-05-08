import express from "express";
import passport from "passport";

import profile from "./Controllers/profile";
import user from "./Controllers/myprofile";

import signUpController from "./Controllers/signUp";
import SignInControllers from "./Controllers/signIn";
import searchController from "./Controllers/search";
import movieController from "./Controllers/movie";
import editUserController from "./Controllers/editUser";
import changeUserPictureController from "./Controllers/changeUserPicture";
import ResetPassword from "./Controllers/ResetPassword";
import checkAuth from "./Helpers/auth";
import signOutController from "./Controllers/signOut";
import { setAccesTokenCookie } from "./Helpers/signIn";
// import omniauthGoogle from './Helpers/omniauth/google'

const router = express.Router();

/* Static files */
router.use("/avatar", checkAuth, express.static("./server/data/avatar"));

/* User */
router.get("/users", checkAuth, user.getUser);
router.put("/users", checkAuth, editUserController);
router.post("/users/picture", checkAuth, changeUserPictureController);
router.post("/users", signUpController.signUp);

router.get("/users/:username", profile.getUserByUsername);

router.put(
  "/users/:id/send-validation-email",
  signUpController.resendValidationEmail
);
router.put("/tokens/:value/verify-email", signUpController.verifyEmail);

/* Auth */
router.post("/users/login", SignInControllers);
router.get("/check-auth", checkAuth, (req, res) => {
  res.json({ validToken: true });
});
router.put("/users/logout", signOutController);

// Google omniauth
router.get(
  "/user/google",
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
    session: false
  })
);

router.get(
  "/user/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/error",
    session: false
  }),
  (req, res) => {
    if (req.error) {
      res.sendstatus(req.error.status);
    } else if (req.user.id) {
      setAccesTokenCookie(res, req.id);
      res.redirect("/");
    } else res.redirect("/?auth=google");
  }
);

// 42 omniauth
router.get(
  "/user/42",
  passport.authenticate("oauth2", {
    scope: ["public"],
    session: false
  })
);

router.get(
  "/user/42/callback",
  passport.authenticate("oauth2", {
    failureRedirect: "/error",
    session: false
  }),
  (req, res) => {
    if (req.error) {
      res.sendstatus(req.error.status);
    } else if (req.user.id) {
      setAccesTokenCookie(res, req.id);
      res.redirect("/");
    } else res.redirect("/?auth=school");
  }
);
/* Reset password */
router.get("/reset-password/:lang/:email", ResetPassword.SendMail);
// router.get("/resetPassword/:token", ResetPassword.checkToken);
router.put("/change-password", ResetPassword.ResetPassword);

/* Search */
router.get("/movies", checkAuth, searchController.searchMovies);

/* Movie */
router.use("/movie", checkAuth, express.static("./server/data/movie"));
router.get(
  "/movie/infos/:imdbId/:language",
  checkAuth,
  movieController.getInfos
);
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
router.get("/movie/review/:id", checkAuth, movieController.getReviews);
router.post("/movies/:id/reviews", checkAuth, movieController.receiveReviews);
router.get("/movies/recommended", checkAuth, movieController.getRecommendation);
router.get("/movies/:id", checkAuth, movieController.getInfos);

/* Comment */
router.get(
  "/comments/:username",
  checkAuth,
  profile.getMovieCommentsByUsername
);
// router.post("/movies/:id/reviews", checkAuth, movieController.receiveReviews);

export default router;
