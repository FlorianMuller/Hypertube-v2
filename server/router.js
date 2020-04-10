import express from "express";
import path from "path";

import signUpController from "./Controllers/signUp";
import searchController from "./Controllers/search";
import movieControllers from "./Controllers/movie";

const router = express.Router();

router.get("/search", searchController.search);

router.get("/check-token", (req, res) => {
  res.status(200).send({ validToken: true });
});

/* Sign Up */
router.post("/inscription", signUpController.signUp);

/* Movie */
router.use("/movie", express.static("./server/data/movie"));
router.get("/movie/infos/:imdbId", movieControllers.getInfos);
router.get("/movie/play/:imdbId", movieControllers.PlayMovie);
router.get("/movie/subtitles/:imdbId", movieControllers.getSubtitles);
router.use("/subtitles", express.static("./server/data/subtitles"));
router.get("/movie/streaming/:directory/:fileName", (req, res) => {
  const { fileName } = req.params;
  const { directory } = req.params;
  const dest = `./server/data/movie/${directory}/${fileName}`;

  // console.log(req.params.path)
  console.log(dest);
  res.status(200).send(dest);
});
router.post("/movie/review", movieControllers.receiveReviews);

router.get("/data/avatar/:id", (req, res) => {
  const pictureName = req.params.id;
  const absolutePath = path.resolve(`./server/data/avatar/${pictureName}`);
  res.status(200).sendFile(absolutePath);
});

export default router;
