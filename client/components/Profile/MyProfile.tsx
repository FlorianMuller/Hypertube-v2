import React, { ReactElement, useState } from "react";

import Paper from "@material-ui/core/Paper";

import Button from "@material-ui/core/Button";

import { useIntl } from "react-intl";
import useApi from "../../hooks/useApi";
import useStyles from "./Profile.styles";
import ShowComments from "./ShowComments";
import OnClickInput from "./OnClickInput";
import Password from "./Password";
import EditableAvatar from "./EditableAvatar";

interface User {
  username: string;
  firstName: string;
  email: string;
  lastName: string;
  picture: string;
}

const MyProfile = (): ReactElement => {
  const { resData: data } = useApi<User, void>(`/user`, { hotReload: true });
  const username = data?.username;
  const classes = useStyles({});
  const [changingPassword, setChangingPassword] = useState(false);
  const { callApi } = useApi<User, void>("/edit-profile", { method: "put" });
  const { locale, formatMessage: _t } = useIntl();

  const updateInfo = (value: string, name: string): void => {
    if (value && name) {
      // API.put("/edit-profile", { [name]: value }).catch((e) => {
      //   console.error(e);
      // });
      callApi({ [name]: value });
    }
  };
  return (
    <div className={classes.containerProfile}>
      <Paper className={classes.containerUser}>
        <EditableAvatar picture={data?.picture} />
        <div className={classes.containerInfo}>
          <div className={classes.containerFullname}>
            <h1>
              <OnClickInput
                autocomplete="given-name"
                startValue={data?.firstName}
                label={_t({ id: "profile.myprofile.label.firstName" })}
                name="firstName"
                updateInfo={updateInfo}
              />
            </h1>
            <h1>
              <OnClickInput
                autocomplete="family-name"
                updateInfo={updateInfo}
                startValue={data?.lastName}
                label={_t({ id: "profile.myprofile.label.familyName" })}
                name="lastName"
              />
            </h1>
          </div>

          <OnClickInput
            autocomplete="email"
            updateInfo={updateInfo}
            startValue={data?.email}
            label={_t({ id: "profile.myprofile.label.email" })}
            name="email"
          />
          <p className={classes.username}>@{data?.username}</p>
          <Button
            onClick={(): void => {
              setChangingPassword((val) => {
                return !val;
              });
            }}
          >
            {_t({ id: "profile.myprofile.changePassword" })}
          </Button>
          {changingPassword && <Password />}
        </div>
      </Paper>
      <ShowComments username={username} />
    </div>
  );
};

export default MyProfile;