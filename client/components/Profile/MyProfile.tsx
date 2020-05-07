import React, { ReactElement, useState } from "react";

import Paper from "@material-ui/core/Paper";

import Button from "@material-ui/core/Button";

import { useIntl } from "react-intl";
import { Typography } from "@material-ui/core";
import useApi from "../../hooks/useApi";
import useStyles from "./Profile.styles";
import ShowComments from "./ShowComments";
import OnClickInput from "./OnClickInput";
import Password from "./Password";
import EditableAvatar from "./EditableAvatar";
import { validateEmail } from "../Authentication/SignUp.service";
import { UserProfile } from "../../models/models";

const MyProfile = (): ReactElement => {
  const { locale, formatMessage: _t } = useIntl();
  const { resData: data } = useApi<UserProfile, void>("/users", {
    hotReload: true
  });
  const classes = useStyles({});

  const [changingPassword, setChangingPassword] = useState(false);
  const { callApi } = useApi<UserProfile, void>("/users", { method: "put" });
  // emailStatus = 0 : email not typed, 1 = typed and wrong, 2 = typed and ok
  const [emailStatus, setEmailStatus] = useState(0);
  const updateInfo = (value: string, name: string): void => {
    if (value && name === "email") {
      if (!validateEmail(value)) setEmailStatus(1);
      else {
        setEmailStatus(2);
        callApi({ [name]: value, locale });
      }
    } else if (value && name) {
      setEmailStatus(0);
      callApi({ [name]: value, locale });
    }
  };

  return (
    <div className={classes.containerProfile}>
      <div>
        <Paper className={classes.containerUser}>
          <EditableAvatar
            picture={data?.picture}
            googleID={data?.googleID}
            schoolID={data?.schoolID}
          />
          <div className={classes.containerInfo}>
            {/* FirstName and lastName */}
            <div className={classes.containerFullname}>
              <OnClickInput
                variant="h5"
                autocomplete="given-name"
                updateInfo={updateInfo}
                startValue={data?.firstName}
                maxLength={30}
                label={_t({ id: "profile.myprofile.label.firstName" })}
                name="firstName"
              />
              <OnClickInput
                variant="h5"
                autocomplete="family-name"
                updateInfo={updateInfo}
                startValue={data?.lastName}
                maxLength={30}
                label={_t({ id: "profile.myprofile.label.familyName" })}
                name="lastName"
              />
            </div>

            {/* Username */}
            <Typography variant="body1" className={classes.usernameWrapper}>
              @<span className={classes.username}>{data?.username}</span>
            </Typography>

            {/* Email */}
            <div className={classes.emailChange}>
              <OnClickInput
                variant="body1"
                autocomplete="email"
                updateInfo={updateInfo}
                startValue={data?.email}
                maxLength={100}
                label={_t({ id: "profile.myprofile.label.email" })}
                name="email"
              />
              {emailStatus === 1 ? (
                <Typography className={classes.badMessage} variant="body1">
                  {_t({ id: "profile.myprofile.email.invalid" })}
                </Typography>
              ) : null}
              {emailStatus === 2 ? (
                <Typography className={classes.goodMessage} variant="body1">
                  {_t({ id: "profile.myprofile.email.sent" })}
                </Typography>
              ) : null}
            </div>

            {/* Password */}
            <Button
              variant="outlined"
              color="primary"
              className={classes.passwordButton}
              onClick={(): void => {
                setChangingPassword((val) => {
                  return !val;
                });
              }}
            >
              {changingPassword
                ? _t({ id: "profile.myprofile.cancelChangePassword" })
                : _t({ id: "profile.myprofile.changePassword" })}
            </Button>
            {changingPassword && (
              <Password
                onValidation={(isPasswordChanged): void => {
                  if (isPasswordChanged) {
                    setTimeout(() => {
                      setChangingPassword(false);
                    }, 1500);
                  }
                }}
              />
            )}
          </div>
        </Paper>
      </div>
      <ShowComments username={data?.username} />
    </div>
  );
};

export default MyProfile;
