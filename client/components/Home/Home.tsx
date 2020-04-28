import React, { ReactElement } from "react";
import MovieThumbnail from "../Search/MovieThumbnail";
import Loading from "../Routes/Loading";
import { useHomeStyles } from "./Home.styles";
import useApi from "../../hooks/useApi";
import { Movie } from "../../models/models";

const Home = (): ReactElement => {
  const classes = useHomeStyles({});
  const { resData, loading } = useApi<{ list: Movie[] }, void>(
    "/movies/recommended",
    {
      hotReload: true
    }
  );

  return (
    <div className={classes.mainPoster}>
      {resData && (
        <div className={classes.boxContent}>
          {resData.list.map((movie) => (
            <MovieThumbnail movie={movie} key={movie.id} />
          ))}
          {loading && <Loading />}
        </div>
      )}
    </div>
  );
};

export default Home;
