import React, { ReactElement } from "react";
import { RouteComponentProps } from "react-router";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import useApi from "../../hooks/useApi";
import Loading from "../Routes/Loading";
import Error from "../Error/Error";
import ShowComments from "./ShowComments";
import useStyles from "./Profile.styles";
import { UserProfile } from "../../models/models";

interface UrlParam {
  username: string;
}

const Profile = ({
  match: {
    params: { username }
  }
}: RouteComponentProps<UrlParam>): ReactElement => {
  const { resData: data, loading, error } = useApi<UserProfile, void>(
    `/users/${username}`,
    {
      hotReload: true
    }
  );
  const classes = useStyles({});

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <div className={classes.containerProfile}>
      <div>
        <Paper className={classes.containerUser}>
          <div className={classes.containerPicture}>
            {data.googleID || data.schoolID ? (
              <Avatar
                alt="Profile picture"
                src={`${data?.picture}`}
                className={classes.large}
              />
            ) : (
              <Avatar
                alt="Profile picture"
                src={`${window.location.origin}/api/avatar/${data?.picture}`}
                className={classes.large}
              />
            )}
          </div>
          <div className={classes.containerInfo}>
            <Typography variant="h5" className={classes.centerText}>
              {data.firstName} {data.lastName}
            </Typography>
            <Typography variant="body1">
              @<span className={classes.username}>{data.username}</span>
            </Typography>
          </div>
        </Paper>
      </div>
      <ShowComments username={username} />
    </div>
  );
};

export default Profile;
