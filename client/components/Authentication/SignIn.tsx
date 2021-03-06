import React, {
  ReactElement,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect
} from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Location } from "history";
import { useIntl } from "react-intl";

import GradientButton from "../Buttons/GradientButton";
import useStyle from "./SignIn.styles";
import { checkErrors } from "./SignIn.service";
import {
  requiredErrorKey,
  badCredentialsErrorKey,
  emailNotVerifiedErrorKey,
  errorWithoutTextErrorKey,
  unknownErrroKey
} from "./errorKey";
import { AuthInfo } from "../../models/models";
import useApi from "../../hooks/useApi";

const errorsToRemoveOnChange = [
  requiredErrorKey,
  badCredentialsErrorKey,
  errorWithoutTextErrorKey,
  unknownErrroKey
];

const SignIn = (): ReactElement => {
  const { formatMessage: _t } = useIntl();
  const classes = useStyle({});
  const history = useHistory();
  const [errorOmni, setErroOmni] = useState("");
  const location = useLocation<{ from?: Location<{}> }>();
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    username: "",
    password: ""
  });
  const [authError, setAuthError] = useState<AuthInfo>({
    username: "",
    password: ""
  });
  const style = {
    omniError: {
      marginTop: "20px",
      color: "red"
    }
  };

  const { callApi, loading, res, error } = useApi<{}, { error?: string }>(
    "/users/login",
    {
      method: "post",
      data: authInfo
    }
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newAuthInfo = {
      ...authInfo,
      [e.target.name]: e.target.value
    };
    setAuthInfo(newAuthInfo);

    // If error is not relevant after a change, delete it
    if (errorsToRemoveOnChange.includes(authError[e.target.name])) {
      // To also reset `errorWithoutTextErrorKey`
      if (
        authError.password === badCredentialsErrorKey ||
        authError.password === unknownErrroKey
      ) {
        setAuthError({
          username: "",
          password: ""
        });
      } else {
        setAuthError({
          ...authError,
          [e.target.name]: ""
        });
      }
    }
  };

  /**
   * Send a login request if username and password input are filled
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newError = checkErrors(authInfo);
    setAuthError(newError);
    if (newError.username === "" && newError.password === "") {
      callApi(authInfo);
    }
  };

  /**
   * Login is succesful
   */
  useEffect(() => {
    if (res) {
      history.replace(location.state?.from || { pathname: "/" });
    }
  }, [res]);

  useEffect(() => {
    const cleanParams = history.location.search.replace("?", "");
    const tabParams = cleanParams.split("&");
    tabParams.forEach((el) => {
      const [param, value] = el.split("=");
      if (param === "auth") {
        setErroOmni(value);
      }
    });
  }, [errorOmni]);

  /**
   * Login failed
   */
  useEffect(() => {
    if (error?.response?.data?.error === "BAD_CREDENTIALS") {
      setAuthError({
        username: errorWithoutTextErrorKey,
        password: badCredentialsErrorKey
      });
    } else if (error?.response?.data?.error === "EMAIL_NOT_VERIFIED") {
      setAuthError({
        username: errorWithoutTextErrorKey,
        password: emailNotVerifiedErrorKey
      });
    } else if (error) {
      setAuthError({
        username: errorWithoutTextErrorKey,
        password: unknownErrroKey
      });
    }
  }, [error]);

  return (
    <Grid container className={classes.center}>
      <Paper className={classes.signUpPage}>
        <Grid container alignItems="center" className={classes.height}>
          <Typography variant="subtitle1">
            {_t({ id: "authentication.SignIn.signUpMessage" })}
            <span role="img" aria-label="baby">
              👶🏻
            </span>
          </Typography>
          <Link
            to={{ pathname: "/sign-up", state: location.state }}
            className={classes.niceLink}
          >
            <Button
              // color="secondary"
              className={classes.signUpButton}
            >
              {_t({ id: "authentication.SignIn.signUpButton" })}
            </Button>
          </Link>
        </Grid>
      </Paper>

      <Paper className={classes.signInPage}>
        <Grid container direction="column" alignItems="center">
          <Typography variant="h5">
            {_t({ id: "authentication.SignIn.title" })}
            <span role="img" aria-label="pop-corn">
              🍿
            </span>
          </Typography>

          <Button href="/api/user/42" className={classes.omniauthBtn}>
            {_t({ id: "authentication.SignIn.school" })}
          </Button>
          <Button href="/api/user/google" className={classes.omniauthBtn}>
            {_t({ id: "authentication.SignIn.google" })}
          </Button>
          {errorOmni !== "" && (
            <span style={style.omniError}>
              {_t({ id: "authentication.SignIn.omniError" })}
            </span>
          )}

          <form onSubmit={handleSubmit} className={classes.form}>
            <Grid container direction="column" alignItems="center">
              <Grid item className={classes.item}>
                <TextField
                  value={authInfo.username}
                  helperText={
                    authError.username !== "" &&
                    authError.username !== errorWithoutTextErrorKey
                      ? _t({ id: authError.username })
                      : ""
                  }
                  error={authError.username !== ""}
                  name="username"
                  id="username"
                  autoComplete="username"
                  onChange={handleInputChange}
                  label={_t({ id: "authentication.SignIn.username" })}
                  variant="filled"
                  className={classes.textInput}
                  inputProps={{ maxLength: 30 }}
                  autoFocus
                />
              </Grid>
              <Grid item className={classes.item}>
                <TextField
                  value={authInfo.password}
                  helperText={
                    authError.password !== ""
                      ? _t({ id: authError.password })
                      : ""
                  }
                  error={authError.password !== ""}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={handleInputChange}
                  label={_t({ id: "authentication.SignIn.password" })}
                  variant="filled"
                  className={classes.textInput}
                  inputProps={{ maxLength: 1028 }}
                  type="password"
                />
              </Grid>
              <Grid item className={classes.forgotPasswordItem}>
                <Link to="/reset-password" className={classes.niceLink}>
                  <Button
                    // color="secondary"
                    className={classes.forgotPasswordButton}
                  >
                    {_t({ id: "authentication.SignIn.forgotPassword" })}
                  </Button>
                </Link>
              </Grid>
              <Grid item className={classes.item}>
                <GradientButton
                  text={_t({ id: "authentication.SignIn.login" })}
                  loadingText={_t({
                    id: "authentication.SignIn.login.loading"
                  })}
                  loading={loading}
                  type="submit"
                  size="large"
                />
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Paper>
      {/* Invisible Item to center on Sign In Paper */}
      <Grid item className={classes.fakeItem} />
    </Grid>
  );
};

export default SignIn;
