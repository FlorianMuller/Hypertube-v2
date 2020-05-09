import {
  accestTokenName,
  loggedCookieName,
  accesTokenOption,
  loggedCookieOption
} from "./signIn";

export const deleteAccessTokenCookie = (res) => {
  res.clearCookie(accestTokenName, accesTokenOption);
};

export const deleteLoggedCookie = (res) => {
  res.clearCookie(loggedCookieName, loggedCookieOption);
};
