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
              {movie.genres.map((genre: string) => (
                <Chip
                  className={classes.tag}
                  label={genre}
                  clickable
                  color="primary"
                  key={genre}
                />
              ))}
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
