import express from "express";

import signUpController from "./Controllers/signUp";
import SignInControllers from "./Controllers/signIn";
import movieController from "./Controllers/movie";
import searchController from "./Controllers/search";
import ResetPassword from "./Controllers/ResetPassword";
import checkAuth from "./Helpers/auth";

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

/* Reset password */
router.get("/reset-password/:lang/:email", ResetPassword.SendMail);
// router.get("/resetPassword/:token", ResetPassword.checkToken);
router.put("/change-password", ResetPassword.ResetPassword);

/* Search */
router.get("/movies", checkAuth, searchController.searchMovies);

/* Movie */
router.get("/movies/:id", checkAuth, movieController.getInfos);
router.post("/movies/:id/reviews", checkAuth, movieController.receiveReviews);

export default router;
