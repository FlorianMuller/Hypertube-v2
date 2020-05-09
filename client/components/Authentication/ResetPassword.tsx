import React, { ReactElement, useState, ChangeEvent } from "react";
import { Paper, TextField, Button } from "@material-ui/core";
import { useIntl } from "react-intl";
import useStyles from "./ResetPassword.style";
// import useApi from "../../hooks/useApi";
import API from "../../util/api";
import useLocaleStorage from "../../hooks/useLocaleStorage";
import { validateEmail } from "./SignUp.service";

const ResetPassword = (): ReactElement => {
  const classes = useStyles({});
  const { formatMessage: _t } = useIntl();
  const [localStorageData] = useLocaleStorage();
  // validmail is used to display error/ok message to user
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(null);
  // const { callApi, res } = useApi<string, void>("/reset-password");

  const send = async (): Promise<void> => {
    // change the callApi function according to back-end
    if (validateEmail(email)) {
      API.get(
        `/users/reset-password/${localStorageData.language}/${email}`
      ).then(({ data }) => {
        if (data.status === 401) setValidEmail(0);
        if (data.status === 200) setValidEmail(1);
        return undefined;
      });
    } else {
      return setValidEmail(0);
    }
    return undefined;
  };

  const handleChangeEmail = (event: ChangeEvent<HTMLInputElement>): void => {
    setValidEmail(null);
    setEmail(event.target.value);
  };

  return (
    <div className={classes.containerPassword}>
      <Paper className={classes.paper}>
        <h1>Mot de passe oublié</h1>
        <TextField
          inputProps={{ maxLength: 1028 }}
          className={classes.input}
          placeholder={_t({ id: "resetpassword.input.placeholder.email" })}
          onChange={handleChangeEmail}
        />
        <Button onClick={send}>Ok</Button>
        {validEmail === 0 && (
          <p className={classes.badMessage}>
            {_t({ id: "resetpassword.error.badmail" })}
          </p>
        )}
        {validEmail === 1 && (
          <p className={classes.goodMessage}>
            {_t({ id: "resetpassword.error.validmail" })}
          </p>
        )}
      </Paper>
    </div>
  );
};

export default ResetPassword;
