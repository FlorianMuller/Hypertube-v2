import React, { ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { hot } from "react-hot-loader/root";
import { Router, Switch, Route } from "react-router-dom";

import history from "../helpers/history";

import enTranslation from "../translations/en.json";
import frTranslation from "../translations/fr.json";

import CustomRoute from "./Routes/CustomRoute";
import Layout from "./Layout/Layout";
import Profile from "./Profile/Profile";
import MyProfile from "./Profile/MyProfile";
import ConfirmEmail from "./Authentication/ConfirmEmail";
import Home from "./Home/Home";
import Movie from "./Movie/Movie";
import Search from "./Search/Search";
import FourOhFour from "./FourOhFour/FourOhFour";
import SignIn from "./Authentication/SignIn";
import SignUp from "./Authentication/SignUp";
import Error from "./Error/Error";
import ResetPassword from "./Authentication/ResetPassword";
import NewPassword from "./Authentication/NewPassword";

import useLocaleStorage from "../hooks/useLocaleStorage";

const messages: Record<string, Record<string, string>> = {
  en: enTranslation,
  fr: frTranslation
};

const App = (): ReactElement => {
  const [localStorageData, setItem] = useLocaleStorage();
  if (!localStorageData.language) {
    setItem("language", "en");
  }

  return (
    <IntlProvider
      locale={localStorageData.language}
      messages={messages[localStorageData.language]}
    >
      <Router history={history}>
        <Layout
          locale={localStorageData.language}
          setLocale={(locale: string): void => setItem("language", locale)}
        >
          <Switch>
            <Route exact path="/confirm-email/:id" component={ConfirmEmail} />
            <CustomRoute exact path="/sign-up" notAuthComponent={SignUp} />
            <CustomRoute path="/search" authComponent={Search} />
            <CustomRoute path="/movie/:id" authComponent={Movie} />
            <CustomRoute
              exact
              path="/"
              notAuthComponent={SignIn}
              authComponent={Home}
            />
            <CustomRoute
              exact
              sensitive
              path="/profile/:username"
              authComponent={Profile}
            />
            <CustomRoute
              exact
              sensitive
              path="/myprofile"
              authComponent={MyProfile}
            />
            <Route exact path="/" component={Home} />
            <CustomRoute
              exact
              path="/reset-password"
              notAuthComponent={ResetPassword}
            />
            <CustomRoute
              path="/new-password/:token"
              notAuthComponent={NewPassword}
            />

            <Route exact path="/error" component={Error} />
            <Route component={FourOhFour} />
          </Switch>
        </Layout>
      </Router>
    </IntlProvider>
  );
};

export default hot(App);
