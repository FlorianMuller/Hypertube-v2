import React, { ReactElement, useState, useEffect } from "react";
import useStyles from "./MoviePlayer.styles";
import API from "../../util/api";
import Loading from "../Routes/Loading";

interface Props {
  imdbId: string;
  srcVideo: string;
}

const MoviePlayer = ({ imdbId, srcVideo }: Props): ReactElement => {
  const [playerReader, setPlayerReader] = useState(false);
  const [pathSubEn, setPathSubEn] = useState(undefined);
  const [pathSubFr, setPathSubFr] = useState(undefined);
  const [pathSubEs, setPathSubEs] = useState(undefined);

  const classes = useStyles({});

  const getSubtitles = async (): Promise<void> => {
    let data;
    await API.get(`/movie/subtitles/${imdbId}`).then(async (res) => {
      data = res.data;
      if (data.subPathEn)
        setPathSubEn(`http://localhost:8080/api/subtitles/${data.subPathEn}`);
      if (data.subPathEs)
        setPathSubEs(`http://localhost:8080/api/subtitles/${data.subPathEs}`);
      if (data.subPathFr)
        setPathSubFr(`http://localhost:8080/api/subtitles/${data.subPathFr}`);
      setPlayerReader(true);
    });
  };

  useEffect(() => {
    getSubtitles();
  });

  return (
    <div className={classes.containerPlayer}>
      {playerReader ? (
        <video src={srcVideo} className={classes.player} controls autoPlay>
          <track kind="captions" />
          {pathSubEn && (
            <track
              kind="subtitles"
              label="English"
              srcLang="en"
              src={pathSubEn}
              default
            />
          )}
          {pathSubFr && (
            <track
              kind="subtitles"
              label="Français"
              srcLang="fr"
              src={pathSubFr}
            />
          )}
          {pathSubEs && (
            <track
              kind="subtitles"
              label="Espanol"
              srcLang="es"
              src={pathSubEs}
            />
          )}
        </video>
      ) : (
          <Loading />
        )}
    </div>
  );
};

export default MoviePlayer;
