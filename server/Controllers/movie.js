import Axios from "axios";

import movieHelpers from "../Helpers/movie";
import mongoose from "../mongo";
import ioConnection from "..";

const getInfos = (req, res) => {
  Axios.get(`https://archive.org/metadata/${req.params.id}`)
    .then(async ({ data }) => {
      let totalStars = 0;
      let reviews = [];
      if (data.reviews) {
        data.reviews.map((review) => {
          totalStars += parseInt(review.stars, 10);
          reviews.push({
            id: Date.parse(review.createdate),
            name: review.reviewer,
            date: Date.parse(review.reviewdate),
            stars: parseInt(review.stars, 10),
            body: review.reviewbody
          });
          return 1;
        });
      }
      const infos = {
        title: data.metadata.title,
        description: data.metadata.description,
        creator: data.metadata.creator,
        prodDate: data.metadata.date,
        runTime: data.metadata.runtime,
        stars:
          data.reviews && data.reviews.length > 0
            ? Math.floor(totalStars / data.reviews.length)
            : null
      };
      const ourReviews = await movieHelpers.findReviews(req.params.id);
      //verif ourReviews

      reviews = movieHelpers.sortReviews(reviews, ourReviews);
      res.status(200).send({ infos, reviews });
    })
    .catch((e) => {
      console.error(e.message);
      res.sendStatus(500);
    });
};

const receiveReviews = (req, res) => {
  Axios.get(`https://archive.org/metadata/${req.body.movieId}`)
    .then(async ({ data }) => {
      if (data.metadata && req.body.body && req.body.body.length < 1001) {
        const ret = await movieHelpers.saveReview({
          id: new mongoose.Types.ObjectId(),
          movieId: req.body.movieId,
          name: req.body.name,
          date: req.body.date,
          stars: req.body.stars,
          body: req.body.body
        });
        if (ret === true) {
          const fullDate = String(new Date(req.body.date)).split(" ");
          ioConnection.ioConnection.to(req.body.movieId).emit("New comments", {
            id: Date.now(),
            name: req.body.name,
            date: movieHelpers.timestampToDate(
              fullDate[1],
              fullDate[2],
              fullDate[3]
            ),
            stars: req.body.stars,
            body: req.body.body
          });
          res.sendStatus(200);
        } else {
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(409);
      }
    })
    .catch((e) => {
      console.error(e.message);
      res.sendStatus(500);
    });
};

export default { receiveReviews, getInfos };
