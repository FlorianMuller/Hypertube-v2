import React, { ReactElement, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { useIntl } from "react-intl";
import useApi from "../../hooks/useApi";
import useProfileStyles from "./Profile.styles";
import useStyles from "./Password.styles";
import { validatePassword } from "../Authentication/SignUp.service";

interface User {
  username: string;
  firstName: string;
  email: string;
  lastName: string;
  picture: string;
}

const Password = (): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const profileClasses = useProfileStyles({});
  const classes = useStyles({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmedPasswordError, setConfirmedPasswordError] = useState("");
  const [status, setStatus] = useState<number>();
  const { callApi, res } = useApi<User, void>("/users", {
    method: "put"
  });

  const checkPassword = (): void => {
    // Checking required field
    const newOldPasswordError = oldPassword
      ? ""
      : "profile.myprofile.password.error.required";
    let newNewPasswordError = newPassword
      ? ""
      : "profile.myprofile.password.error.required";
    let newConfirmedPasswordError = confirmedPassword
      ? ""
      : "profile.myprofile.password.error.required";

    // Checking if new password is valid and if it's the identical
    if (!newNewPasswordError && !newConfirmedPasswordError) {
      newConfirmedPasswordError =
        newPassword !== confirmedPassword
          ? "profile.myprofile.password.error.different"
          : "";
      newNewPasswordError = validatePassword(newPassword)
        ? ""
        : "authentication.signUp.error.password.invalid";
    }

    setOldPasswordError(newOldPasswordError);
    setNewPasswordError(newNewPasswordError);
    setConfirmedPasswordError(newConfirmedPasswordError);

    if (
      newOldPasswordError === "" &&
      newNewPasswordError === "" &&
      newConfirmedPasswordError === ""
    ) {
      // API.put("/change-password/", { newPassword, oldPassword })
      //   .then(() => {
      //     setStatus(200);
      //   })
      //   .catch((e) => {
      //     console.error(e);
      //     setStatus(e.response.status);
      //   });
      callApi({ newPassword, oldPassword })
        .then(() => {
          if (res.status) {
            setStatus(res.status);
          } else {
            setStatus(401);
          }
        })
        .catch(() => {
          setStatus(401);
        });
    }
  };

  return (
    <div className={profileClasses.containerInfo}>
      {/* <form onSubmit={checkPassword}> */}
      <TextField
        inputProps={{ maxLength: 1028 }}
        autoComplete="current-password"
        className={classes.input}
        onChange={(e): void => setOldPassword(e.target.value)}
        placeholder={_t({
          id: "profile.myprofile.password.placeholder.currentpass"
        })}
        error={!!oldPasswordError}
        helperText={oldPasswordError ? _t({ id: oldPasswordError }) : undefined}
        type="password"
      />
      <TextField
        inputProps={{ maxLength: 1028 }}
        autoComplete="new-password"
        className={classes.input}
        onChange={(e): void => setNewPassword(e.target.value)}
        placeholder={_t({
          id: "profile.myprofile.password.placeholder.newpass"
        })}
        error={!!newPasswordError}
        helperText={newPasswordError ? _t({ id: newPasswordError }) : undefined}
        type="password"
      />
      <TextField
        inputProps={{ maxLength: 1028 }}
        autoComplete="new-password"
        className={classes.input}
        onChange={(e): void => setConfirmedPassword(e.target.value)}
        placeholder={_t({
          id: "profile.myprofile.password.placeholder.confirmedpass"
        })}
        error={!!confirmedPasswordError}
        helperText={
          confirmedPasswordError
            ? _t({ id: confirmedPasswordError })
            : undefined
        }
        type="password"
      />
      {status === 401 && (
        <p className={classes.badMessage}>
          {_t({ id: "profile.myprofile.password.error.wrong" })}
        </p>
      )}
      {status === 200 && (
        <p className={classes.goodMessage}>
          {_t({ id: "profile.myprofile.password.changed" })}
        </p>
      )}
      {console.log("status", status)}
      <Button onClick={checkPassword}>
        {_t({
          id: "profile.myprofile.password.validate"
        })}
      </Button>
      {/* </form> */}
    </div>
  );
};

export default Password;
