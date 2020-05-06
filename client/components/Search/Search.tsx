import React, { ReactElement, useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";
import _ from "lodash";
import InfiniteScroll from "react-infinite-scroller";

import Skeleton from "@material-ui/lab/Skeleton";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

import useApi from "../../hooks/useApi";
import { formatQueryUrl } from "./Search.service";
import { Movie, ApiSearchReponse } from "../../models/models";
import useSearchStyles from "./Search.styles";

import MovieThumbnail from "./MovieThumbnail";

const Search = (): ReactElement => {
  const classes = useSearchStyles({});
  const { formatMessage: _t } = useIntl();
  const [printedMovieList, setPrintedMovieList] = useState<Movie[]>([]);
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const history = useHistory();
  const location = useLocation();

  const { resData: data, loading, error, setUrl } = useApi<
    ApiSearchReponse,
    void
  >(formatQueryUrl(location.search, 1), {
    hotReload: true
  });

  /**
   * Starting a new search
   */
  useEffect(() => {
    setPage(1);
    setMovieList([]);
    setPrintedMovieList([]);
    setUrl(formatQueryUrl(location.search, 1));
  }, [location.search, location.pathname]);

  /**
   * New Data receive
   */
  useEffect(() => {
    if (data && data.movies?.length) {
      if (page === 1) {
        setPrintedMovieList(data.movies.slice(0, 12));
        setMovieList(data.movies.slice(12));
      } else {
        setMovieList((oldMovieList) => [...oldMovieList, ...data.movies]);
      }
    }
  }, [data]);

  /**
   * Getting next 12 movies (and next page if needed)
   */
  const loadMore = (): void => {
    // Getting next page if we don't have enough moovie in stock
    if (!loading && movieList.length < 24) {
      setPage(page + 1);
      setUrl(formatQueryUrl(location.search, page + 1));
    }

    // Printing next 12 movies
    if (movieList.length) {
      setPrintedMovieList((old) => [...old, ...movieList.slice(0, 12)]);
      setMovieList((old) => old.slice(12));
    }
  };

  if (error) {
    history.push("/error");
  }

  return (
    <Container maxWidth="xl">
      <InfiniteScroll
        className={classes.container}
        initialLoad={false}
        loadMore={loadMore}
        hasMore={!!movieList.length}
        threshold={100}
      >
        {/* No media found */}
        {!printedMovieList.length && !loading && (
          <div className={classes.noMediaContainer}>
            <img
              src={`${window.location.origin}/public/no-media.png`}
              alt="no-media"
              className={classes.noMedia}
            />
            <Typography variant="h5">
              {_t({ id: "search.no_media" })}
            </Typography>
          </div>
        )}

        {/* Medias list */}
        {printedMovieList.map((movie) => (
          <MovieThumbnail key={movie.id} movie={movie} />
        ))}

        {/* Fake movies Loading */}
        {loading &&
          movieList.length === 0 &&
          _.times(12, (i) => (
            <div className={classes.thumbnailContainer} key={i}>
              <Skeleton
                variant="rect"
                width={300}
                height={450}
                className={classes.skeletonThumbnail}
              />
              <div className={classes.skeletonProgress}>
                <CircularProgress />
              </div>
            </div>
          ))}
      </InfiniteScroll>
    </Container>
  );
};

export default Search;
