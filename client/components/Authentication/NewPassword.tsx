import React, { ReactElement, useState } from "react";
import { Paper, TextField, Button } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useIntl } from "react-intl";
import { Link, RouteComponentProps } from "react-router-dom";
import useStyles from "./NewPassword.style";
import useApi from "../../hooks/useApi";
import { validatePassword } from "./SignUp.service";

interface UrlParam {
  id: string;
}

const NewPassword = ({
  match: {
    params: { id: token }
  }
}: RouteComponentProps<UrlParam>): ReactElement => {
  const classes = useStyles({});
  const { formatMessage: _t } = useIntl();
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmedPasswordError, setConfirmedPasswordError] = useState("");
  const [validPassword, setValidPassword] = useState(null);
  const { callApi, res } = useApi<{}, void>("/route", { method: "put" });

  const checkPassword = (): void => {
    // checking if fields are completed
    console.log("test");
    let localNewPasswordError = newPassword ? "" : "newpassword.error.required";
    let localConfirmedPasswordError = confirmedPassword
      ? ""
      : "newpassword.error.requried";
    // checking if newPassword match regex
    if (newPassword) {
      localNewPasswordError = validatePassword(newPassword)
        ? ""
        : "authentication.signUp.error.password.invalid";
    }
    // checking if both passwords match
    localConfirmedPasswordError =
      newPassword === confirmedPassword ? "" : "newpassword.error.different";
    setNewPasswordError(localNewPasswordError);
    setConfirmedPasswordError(localConfirmedPasswordError);

    if (localConfirmedPasswordError === "" && localNewPasswordError === "") {
      callApi({ newPassword, confirmedPassword, token })
        .then(() => {
          if (res.status === 200) {
            setValidPassword(1);
          } else {
            setValidPassword(0);
          }
        })
        .catch(() => {
          setValidPassword(0);
        });
    }
  };
  return (
    <div className={classes.containerPassword}>
      <Paper className={classes.paper}>
        <h1>Nouveau mot de passe</h1>
        <TextField
          inputProps={{ maxLength: 1028 }}
          autoComplete="new-password"
          className={classes.input}
          onChange={(e): void => setNewPassword(e.target.value)}
          placeholder={_t({ id: "newpassword.newpassword.placeholder" })}
          error={!!newPasswordError}
          helperText={
            newPasswordError ? _t({ id: newPasswordError }) : undefined
          }
          type="password"
        />
        <br />
        <TextField
          inputProps={{ maxLength: 1028 }}
          autoComplete="new-password"
          className={classes.input}
          onChange={(e): void => setConfirmedPassword(e.target.value)}
          placeholder={_t({ id: "newpassword.confirmedpassword.placeholder" })}
          error={!!confirmedPasswordError}
          helperText={
            confirmedPasswordError
              ? _t({ id: confirmedPasswordError })
              : undefined
          }
          type="password"
        />
        {validPassword === 0 && (
          <p className={classes.badMessage}>
            {_t({ id: "newpassword.wrong" })}
          </p>
        )}
        {validPassword === 1 && (
          <p className={classes.goodMessage}>
            {_t({ id: "newpassword.valid" })}
          </p>
        )}
        <Button onClick={(): void => checkPassword()}>Ok</Button>
      </Paper>
    </div>
  );
};

export default NewPassword;
