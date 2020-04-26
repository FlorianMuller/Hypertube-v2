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
import { validateEmail } from "../Authentication/SignUp.service";

interface User {
  username: string;
  firstName: string;
  email: string;
  lastName: string;
  picture: string;
}

const MyProfile = (): ReactElement => {
  const { resData: data } = useApi<User, void>(`/users`, { hotReload: true });
  const username = data?.username;
  const classes = useStyles({});

  const [changingPassword, setChangingPassword] = useState(false);
  const { callApi } = useApi<User, void>("/users", { method: "put" });
  const { formatMessage: _t } = useIntl();
  // emailStatus = 0 : email not typed, 1 = typed and wrong, 2 = typed and ok
  const [emailStatus, setEmailStatus] = useState(0);

  const updateInfo = (value: string, name: string): void => {
    if (value && name === "email") {
      if (!validateEmail(value)) setEmailStatus(1);
      else {
        setEmailStatus(2);
        callApi({ [name]: value });
      }
    } else if (value && name) {
      setEmailStatus(0);
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
          {emailStatus === 1 ? (
            <p className={classes.badMessage}>
              {_t({ id: "profile.myprofile.email.invalid" })}
            </p>
          ) : null}
          {emailStatus === 2 ? (
            <p className={classes.goodMessage}>
              {_t({ id: "profile.myprofile.email.sent" })}
            </p>
          ) : null}
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
