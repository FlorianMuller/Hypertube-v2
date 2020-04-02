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
import { formatQueryUrl } from "./service";
import { Movie, ApiSearchReponse } from "../../models/models";
import useSearchStyles from "./styles";

import MovieThumbnail from "./MovieThumbnail";

const Search = (): ReactElement => {
  const classes = useSearchStyles({});
  const { formatMessage: _t } = useIntl();
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
    setUrl(formatQueryUrl(location.search, 1));
  }, [location.search, location.pathname]);

  /**
   * New Data receive
   */
  useEffect(() => {
    if (data && data.movies?.length) {
      if (page === 1) {
        setMovieList(data.movies);
      } else {
        setMovieList((oldFilmList) => [...oldFilmList, ...data.movies]);
      }
    }
  }, [data]);

  /**
   * Getting next page
   */
  const loadMore = (): void => {
    if (loading || !data?.nextPage) {
      return;
    }
    setPage(page + 1);
    setUrl(formatQueryUrl(location.search, page + 1));
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
        hasMore={data?.nextPage}
        threshold={100}
      >
        {/* No media found */}
        {!movieList.length && !loading && (
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
        {movieList.map((movie) => (
          <MovieThumbnail key={movie.id} movie={movie} />
        ))}

        {/* Fake movies Loading */}
        {loading &&
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
