import express from "express";
import path from "path";

import profile from "./Controllers/profile";
import user from "./Controllers/myprofile";

import signUpController from "./Controllers/signUp";
import SignInControllers from "./Controllers/signIn";
import movieController from "./Controllers/movie";
import searchController from "./Controllers/search";
import editUserController from "./Controllers/editUser";
// import changeUserPictureController from "./Controllers/changeUserPicture";
import changeUserPictureController from "./Controllers/changeUserPicture";
import checkAuth from "./Helpers/auth";

const router = express.Router();

/* Static files */
router.get("/data/avatar/:id", (req, res) => {
  const pictureName = req.params.id;
  const absolutePath = path.resolve(`./server/data/avatar/${pictureName}`);
  res.status(200).sendFile(absolutePath);
});

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

/* Search */
router.get("/search", checkAuth, searchController.search);

/* Movie */
router.get("/movies/:id", checkAuth, movieController.getInfos);
router.post("/movies/:id/reviews", checkAuth, movieController.receiveReviews);
router.get("/users/:username", profile.getUserByUsername);
router.get("/users", checkAuth, user.getUser);
router.get(
  "/comments/:username",
  checkAuth,
  profile.getMovieCommentsByUsername
);
router.put("/users", checkAuth, editUserController);
router.post("/users/picture", checkAuth, changeUserPictureController);

export default router;
