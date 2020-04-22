import express from "express";
import passport from "passport";

import signUpController from "./Controllers/signUp";
import SignInControllers from "./Controllers/signIn";
import movieController from "./Controllers/movie";
import searchController from "./Controllers/search";
import checkAuth from "./Helpers/auth";
import { setAccesTokenCookie } from "./Helpers/signIn";
// import omniauthGoogle from './Helpers/omniauth/google'

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
    }
    res.redirect("/");
  }
);

/* Search */
router.get("/movies", checkAuth, searchController.searchMovies);

/* Movie */
router.get("/movies/:id", checkAuth, movieController.getInfos);
router.post("/movies/:id/reviews", checkAuth, movieController.receiveReviews);

export default router;
