import React, { ReactElement, useState } from "react";
import { Paper, TextField, Button } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useIntl } from "react-intl";
import useStyles from "./ResetPassword.style";
import useApi from "../../hooks/useApi";

const ResetPassword = (): ReactElement => {
  const classes = useStyles({});
  const { formatMessage: _t } = useIntl();
  // validmail = 1 when all ok,
  // 0 when wrong,
  // "" when no mail sent
  // validmail is used to display error/ok message to user
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(null);
  // Change the url according to router url
  const { callApi, res } = useApi<string, void>("/urlback");
  const send = (): void => {
    console.log(email);
    // change the callApi function according to back-end
    if (email) {
      callApi({ email })
        .then(() => {
          if (res.status === 200) {
            setValidEmail(1);
          } else {
            setValidEmail(0);
          }
        })
        .catch(() => {
          setValidEmail(0);
        });
    }
  };
  return (
    <div className={classes.containerPassword}>
      <Paper className={classes.paper}>
        <h1>Mot de passe oublié</h1>
        <TextField
          inputProps={{ maxLength: 1028 }}
          className={classes.input}
          placeholder={_t({ id: "resetpassword.input.placeholder.email" })}
          onChange={(e): void => setEmail(e.target.value)}
        />
        <Button onClick={(): void => send()}>Ok</Button>
        {validEmail === 0 ? (
          <p className={classes.badMessage}>
            {_t({ id: "resetpassword.error.badmail" })}
          </p>
        ) : null}
        {validEmail === 1 ? (
          <p className={classes.goodMessage}>
            {_t({ id: "resetpassword.error.validmail" })}
          </p>
        ) : null}
      </Paper>
    </div>
  );
};

export default ResetPassword;
