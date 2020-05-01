import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
import { Button, Chip, Typography, Card } from "@material-ui/core";
import Image from "material-ui-image";
import StarIcon from "@material-ui/icons/Star";

import useSearchStyles from "./Search.styles";
import { Movie } from "../../models/models";

interface Props {
  movie: Movie;
}

// Our genre (mix of IMDb (yts) and TMDb (rarbg) genres)
const supportedGenre = [
  "action",
  "adventure",
  "animation",
  "biography",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "family",
  "fantasy",
  "filmNoir",
  "history",
  "horror",
  "music",
  "musical",
  "mystery",
  "news",
  "romance",
  "realityTV",
  "sciFi",
  "tvMovie",
  "shortFilm",
  "sport",
  "superhero",
  "thriller",
  "war",
  "western"
];

const MovieThumbnail = ({ movie }: Props): ReactElement => {
  const classes = useSearchStyles({});
  const { formatMessage: _t } = useIntl();

  return (
    <div className={classes.thumbnailContainer} key={movie.id}>
      <Image
        animationDuration={500}
        src={movie.cover || "no-image"}
        color="rgba(0,0,0,0)"
        imageStyle={{ width: 300, height: 450 }}
        style={{ width: 300, height: 450 }}
        disableSpinner
        errorIcon={
          <Card className={classes.altContainer}>
            <Typography variant="h4">{movie.title}</Typography>
          </Card>
        }
      />
      <div className={classes.thumbnailOverlay}>
        <Typography variant="h5">{movie.title}</Typography>
        <Typography variant="h6">{movie.year}</Typography>
        <Typography variant="caption" className={classes.summary}>
          {movie.summary}
        </Typography>
        <div className={classes.metaInfos}>
          {movie.genres && (
            <div>
              {movie.genres.map((genre: string) => {
                if (supportedGenre.includes(genre)) {
                  return (
                    <Link
                      to={`/search?collection=${genre}`}
                      className={classes.niceLink}
                      key={genre}
                    >
                      <Chip
                        className={classes.tag}
                        label={_t({
                          id: `layout.filters.select_category.${genre}`
                        })}
                        clickable
                        color="primary"
                      />
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          )}
          <Typography className={classes.rating}>
            {movie.rating !== null && (
              <>
                {movie.rating} <StarIcon className={classes.ratingIcon} />
              </>
            )}
            {movie.rating !== null && movie.runtime && <span> - </span>}
            {movie.runtime && <span>{movie.runtime} mins</span>}
          </Typography>
          <Link to={`/movie/${movie.id}`} className={classes.watchLink}>
            <Button color="primary" variant="contained">
              {_t({ id: "search.film.watch" })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieThumbnail;
