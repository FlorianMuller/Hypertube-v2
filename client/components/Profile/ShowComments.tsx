import React, { ReactElement, useEffect } from "react";
import Paper from "@material-ui/core/Paper";

import Rating from "@material-ui/lab/Rating";
import Typography from "@material-ui/core/Typography";
import { useIntl } from "react-intl";
import useApi from "../../hooks/useApi";
import useStyles from "./Profile.styles";
import { Comment } from "../../models/models";

interface Props {
  username: string;
}
const monthNames = [
  "profile.showcomment.month1",
  "profile.showcomment.month2",
  "profile.showcomment.month3",
  "profile.showcomment.month4",
  "profile.showcomment.month5",
  "profile.showcomment.month6",
  "profile.showcomment.month7",
  "profile.showcomment.month8",
  "profile.showcomment.month9",
  "profile.showcomment.month10",
  "profile.showcomment.month11",
  "profile.showcomment.month12"
];

const ShowComment = ({ username }: Props): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const classes = useStyles({});
  const { resData: data, setUrl } = useApi<Comment[], void>("", {
    hotReload: true
  });
  useEffect(() => {
    if (username !== undefined) {
      setUrl(`/comments/${username}`);
    }
  }, [username]);
  if (!data) {
    return null;
  }

  return (
    <div>
      <Paper className={classes.containerHistory}>
        <h2 className={classes.centerText}>
          {_t({ id: "profile.showcomment.lastComment" })}{" "}
        </h2>
        {data?.map((comment: Comment) => {
          const date = new Date(comment.date);

          return (
            <div key={comment._id} className={classes.containerComment}>
              <div className={classes.containerMovieInfos}>
                <Rating
                  className={classes.rating}
                  name="read-only"
                  value={comment.stars}
                  readOnly
                />
                <Typography variant="subtitle1">{comment.movieName}</Typography>
              </div>
              <Typography className={classes.commentDate} variant="caption">
                {date.getDate()} {_t({ id: monthNames[date.getMonth()] })}{" "}
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
