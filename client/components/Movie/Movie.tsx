import { useIntl } from "react-intl";
import React, { ReactElement, useEffect, useState } from "react";

import { Paper } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import useStyles from "./Movie.styles";

import MovieComments from "./MovieComments";
import { MovieInfos, Reviews, Review } from "../../models/models";
import Loading from "../Routes/Loading";
import MoviePlayer from "./MoviePlayer";
import useApi from "../../hooks/useApi";
import socket from "../../helpers/socket";
import Error from "../Error/Error";
import UseLocalStorage from "../../hooks/useLocaleStorage";

const Movie = (): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const [srcVideo, setSrcVideo] = useState("");
  const [refreshPage, setRefreshPage] = useState(true);
  const imdbId = window.location.pathname.split("/")[2];
  const [localStorageData] = UseLocalStorage();
  const classes = useStyles({});
  const [notRef, setNotRef] = useState(false);
  const style = {
    span: {
      fontSize: "2em",
      marginTop: "50px"
    }
  };

  const generateUrl = (): void => {
    setSrcVideo(`http://localhost:8080/api/movie/play/${imdbId}`);
  };

  if (refreshPage === true) {
    setRefreshPage(false);
    generateUrl();
  }

  const { resData, loading, error } = useApi<
    {
      infos: MovieInfos;
      reviews: Reviews;
    },
    void
  >(`/movie/infos/${imdbId}/${localStorageData}`, {
    hotReload: true
  });
  const { infos, reviews: reviewsData } = resData || {};

  const movieInfos = infos as MovieInfos;

  const [reviews, setReviews] = useState<Reviews>();

  const initComments = (reviewReceived: Review): void => {
    let totalStars = reviewReceived.stars;
    reviews.review.forEach((review) => {
      totalStars += review.stars;
    });
    reviews.movieRating = totalStars / (reviews.review.length + 1);
    reviews.review.push(reviewReceived);
  };

  useEffect(() => {
    if (reviewsData) setReviews(reviewsData);
  }, [reviewsData]);

  useEffect(() => {
    return (): void => {
      if (loading || error) {
        return;
      }

      socket.removeListener("New comments", initComments);
    };
  });

  if (loading) return <Loading />;
  if (error) return <Error />;

  socket.on("movie-not-ref", () => {
    setNotRef(true);
  });
  socket.on("New comments", initComments);

  socket.emit("join-movie-room", imdbId);

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
        {srcVideo && notRef === false && (
          <MoviePlayer imdbId={imdbId} srcVideo={srcVideo} />
        )}
        {notRef === true && (
          <span style={style.span}>{_t({ id: "movie.notRef" })}</span>
        )}
        {movieInfos && (
          <MovieComments
            movieId={movieInfos.imdbid}
            reviews={reviews}
            movieName={movieInfos.title}
            setReviews={setReviews}
          />
        )}
      </div>
    </div>
  );
};

export default Movie;
