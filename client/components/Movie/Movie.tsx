import { useIntl } from "react-intl";
import React, { ReactElement, useEffect, useState } from "react";

import { Paper } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import useStyles from "./Movie.styles";

import RecommendedMovies from "./MovieRecommended";
import MovieComments from "./MovieComments";
import { MovieInfos, Reviews, Review } from "../../models/models";
import Loading from "../Routes/Loading";
import MoviePlayer from "./MoviePlayer";
import useApi from "../../hooks/useApi";
import socket from "../../helpers/socket";
import Error from "../Error/Error";

const Movie = (): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const [srcVideo, setSrcVideo] = useState("");
  const [refreshPage, setRefreshPage] = useState(true);
  const imdbId = window.location.pathname.split("/")[2];
  const classes = useStyles({});

  const generateUrl = (): void => {
    setSrcVideo(`http://localhost:8080/api/movie/play/${imdbId}`);
  };

  if (refreshPage === true) {
    setRefreshPage(false);
    generateUrl();
  }

  const { resData, loading, error } = useApi(`/movie/infos/${imdbId}`, {
    hotReload: true
  });
  const { infos, reviews: reviewsData } = resData || {};

  const movieInfos = infos as MovieInfos;

  const reviews = reviewsData as Reviews;

  const initComments = (reviewReceived: Review): void => {
    let totalStars = reviewReceived.stars;
    reviews.review.forEach((review) => {
      totalStars += review.stars;
    });
    reviews.movieRating = totalStars / (reviews.review.length + 1);
    reviews.review.push(reviewReceived);
  };

  useEffect(() => {
    // const initComments = (reviewReceived: Review): void => {
    //   let totalStars = reviewReceived.stars;
    //   let reviewsLength: number;
    //   setReviews((reviewsHook) => {
    //     totalStars = reviewsHook.reduce(
    //       (acc, review) => acc + review.stars,
    //       reviewReceived.stars
    //     );
    //     reviewsLength = reviewsHook.length + 1;
    //     return [...reviewsHook, reviewReceived];
    //   });
    //   setMovieInfos((movieInfosHook) => {
    //     return {
    //       ...movieInfosHook,
    //       stars: Math.floor(totalStars / reviewsLength)
    //     };
    //   });
    // };
    // if (loading) {
    //   API.get(`/movies/${movieId}`)
    //     .then(({ data: { infos, reviews: allReviews } }) => {
    //       setMovieInfos(infos);
    //       setReviews(allReviews);
    //       setDataDone(true);
    //       socket.socket.emit("join-movie-room", movieId);
    //       socket.socket.on("New comments", initComments);
    //     })
    //     .catch((e) => {
    //       console.error(e);
    //       setDataDone(true);
    //     });
    //   setLoading(false);
    // }
    return (): void => {
      if (loading || error) {
        return;
      }

      socket.socket.removeListener("New comments", initComments);
    };
  });

  if (loading) return <Loading />;
  if (error) return <Error />;

  socket.socket.on("New comments", initComments);

  return (
    <div className={classes.root}>
      <div className={classes.movieContainer}>
        <Paper className={classes.containerPresentation}>
          <div className={classes.containerMovie}>
            <img
              className={classes.moviePoster}
              src={movieInfos?.poster}
              alt="Movie thumb"
            />
            <div className={classes.generalInfos}>
              <div className={classes.movieTitle}>{movieInfos?.title}</div>
              {movieInfos?.description && (
                <div className={classes.descriptionMovie}>
                  {movieInfos?.description}
                </div>
              )}
              <span className={classes.dateAndTime}>
                {movieInfos?.prodDate && (
                  <div>
                    {_t({ id: "movie.prodDate" })} {movieInfos?.prodDate}
                  </div>
                )}
                {movieInfos?.runTime && (
                  <div>
                    {_t({ id: "movie.runTime" })} {movieInfos?.runTime} minutes
                  </div>
                )}
              </span>
              {movieInfos?.imdbRating && (
                <>
                  {_t({ id: "movie.imdb.rating" })}
                  <Rating
                    value={movieInfos?.imdbRating}
                    readOnly
                    emptyIcon={<StarBorderIcon color="primary" />}
                  />
                </>
              )}
            </div>
          </div>
        </Paper>
        {srcVideo && <MoviePlayer imdbId={imdbId} srcVideo={srcVideo} />}

        {movieInfos && (
          <MovieComments movieId={movieInfos.imdbid} reviews={reviews} />
        )}
      </div>
      <RecommendedMovies />
    </div>
  );
};

export default Movie;
