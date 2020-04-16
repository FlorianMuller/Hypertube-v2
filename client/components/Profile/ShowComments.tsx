import React, { ReactElement, useEffect } from "react";
import Paper from "@material-ui/core/Paper";

import Rating from "@material-ui/lab/Rating";
import Typography from "@material-ui/core/Typography";
import { useIntl } from "react-intl";
import useApi from "../../hooks/useApi";
import Loading from "../Routes/Loading";
import useStyles from "./Profile.styles";
import { Comment } from "../../models/models";

interface Props {
  username: string;
}

const ShowComment = ({ username }: Props): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const classes = useStyles({});
  const monthNames = [
    _t({ id: "profile.showcomment.month1" }),
    _t({ id: "profile.showcomment.month2" }),
    _t({ id: "profile.showcomment.month3" }),
    _t({ id: "profile.showcomment.month4" }),
    _t({ id: "profile.showcomment.month5" }),
    _t({ id: "profile.showcomment.month6" }),
    _t({ id: "profile.showcomment.month7" }),
    _t({ id: "profile.showcomment.month8" }),
    _t({ id: "profile.showcomment.month9" }),
    _t({ id: "profile.showcomment.month10" }),
    _t({ id: "profile.showcomment.month11" }),
    _t({ id: "profile.showcomment.month12" })
  ];
  const { resData: data, setUrl } = useApi<Comment, void>("", {
    hotReload: true
  });
  useEffect(() => {
    if (username !== undefined) {
      setUrl(`/user-comments/${username}`);
    }
  }, [username]);
  if (!data) {
    return null;
  }

  return (
    <div>
      <Paper className={classes.containerHistory}>
        <h2 className={classes.titleHistory}>
          {_t({ id: "profile.showcomment.lastComment" })}{" "}
        </h2>
        {data?.map((comment: Comment) => {
          const date = new Date(comment.date);

          return (
            <div key={comment._id} className={classes.containerComment}>
              <div className={classes.containerMovieInfos}>
                <Rating
                  // style={{ marginRight: "8px" }}
                  className={classes.rating}
                  name="read-only"
                  value={comment.stars}
                  readOnly
                />
                <Typography variant="subtitle1">{comment.movieName}</Typography>
              </div>
              <Typography className={classes.commentDate} variant="caption">
                {date.getDate()} {monthNames[date.getMonth()]}{" "}
                {date.getFullYear()}
              </Typography>
              <Typography variant="body1" className={classes.textComment}>
                {comment.body}
              </Typography>
            </div>
          );
        })}
      </Paper>
    </div>
  );
};

export default ShowComment;
