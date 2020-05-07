import express from "express";

import profile from "./Controllers/profile";
import user from "./Controllers/myprofile";

import signUpController from "./Controllers/signUp";
import SignInControllers from "./Controllers/signIn";
import movieController from "./Controllers/movie";
import searchController from "./Controllers/search";
import editUserController from "./Controllers/editUser";
import changeUserPictureController from "./Controllers/changeUserPicture";
import checkAuth from "./Helpers/auth";
import signOutController from "./Controllers/signOut";

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

/* Movie */
router.get("/movies", searchController.searchMovies);
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
