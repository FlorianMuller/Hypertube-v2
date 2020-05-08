import React, { useState, ReactElement, useEffect } from "react";
import { useIntl } from "react-intl";
import { Link, useHistory } from "react-router-dom";
import {
  AppBar,
  Typography,
  IconButton,
  Toolbar,
  Menu,
  MenuItem,
  OutlinedInput,
  Hidden
} from "@material-ui/core";
import { Search, AccountCircle } from "@material-ui/icons";
import Cookies from "universal-cookie";
import API from "../../util/api";
import { useHeaderStyles } from "./Layout.styles";

interface Props {
  locale: string;
  setLocale: (locale: string) => void;
  onExpandFilters: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const Header = ({
  locale,
  setLocale,
  onExpandFilters,
  onSearchChange,
  searchQuery
}: Props): ReactElement => {
  const classes = useHeaderStyles({});
  const { formatMessage: _t } = useIntl();
  const [localeAnchorEl, setLocaleAnchorEl] = useState(undefined);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(undefined);
  const history = useHistory();
  const cookies = new Cookies();
  const [logged, setLogged] = useState(false);

  const setNewLocale = (newLocale: string): void => {
    setLocale(newLocale);
    setLocaleAnchorEl(undefined);
  };

  const onMenuProfile = (): void => {
    setProfileMenuAnchor(undefined);
  };

  useEffect(() => {
    setLogged(!!cookies.get("loggedCookie"));
  });

  const logOut = async (): Promise<void> => {
    await API.put(`/users/logout`);
    history.push("/");
    onMenuProfile();
    setLogged(!!cookies.get("loggedCookie"));
  };

  return (
    <AppBar color="inherit" position="sticky" className={classes.appBar}>
      <Toolbar>
        <div className={classes.linksContainer}>
          <Typography className={classes.title} variant="h6">
            <Link className={classes.titleLink} to="/">
              <Hidden smDown>{_t({ id: "title" })}</Hidden>
              <Hidden mdUp>{_t({ id: "title_short" })}</Hidden>
            </Link>
          </Typography>
          {logged && (
            <Hidden smDown>
              <Typography className={classes.linkMedia} variant="subtitle2">
                <Link className={classes.titleLink} to="/search">
                  {_t({ id: "header.trending_movies" })}
                </Link>
              </Typography>
            </Hidden>
          )}
        </div>
        <div className={classes.headerContent}>
          {logged && (
            <OutlinedInput
              value={searchQuery}
              onChange={(e): void => onSearchChange(e.target.value)}
              onFocus={onExpandFilters}
              placeholder={_t({ id: "layout.filters.search" })}
              className={classes.searchInput}
              startAdornment={<Search className={classes.inputLabel} />}
              labelWidth={0}
              id="menuitem-search"
            />
          )}
          <div className={classes.buttonsMenu}>
            <IconButton
              className={classes.headerButtons}
              onClick={(e): void => setLocaleAnchorEl(e.currentTarget)}
            >
              <span className={classes.flagIcon}>
                {_t({ id: `header.language.${locale}` })}
              </span>
            </IconButton>
            <Menu
              keepMounted
              anchorEl={localeAnchorEl}
              open={!!localeAnchorEl}
              onClose={(): void => setLocaleAnchorEl(undefined)}
            >
              <MenuItem onClick={(): void => setNewLocale("fr")}>
                {_t({ id: "header.language.fr" })}
              </MenuItem>
              <MenuItem onClick={(): void => setNewLocale("en")}>
                {_t({ id: "header.language.en" })}
              </MenuItem>
            </Menu>
            {logged && (
              <IconButton
                className={classes.headerButtons}
                onClick={(e): void => setProfileMenuAnchor(e.currentTarget)}
              >
                <AccountCircle />
              </IconButton>
            )}

            <Menu
              keepMounted
              anchorEl={profileMenuAnchor}
              open={!!profileMenuAnchor}
              onClose={(): void => setProfileMenuAnchor(undefined)}
            >
              <Link className={classes.titleLink} to="/myprofile">
                <MenuItem onClick={onMenuProfile}>
                  {_t({ id: "header.profile" })}
                </MenuItem>
              </Link>

              <MenuItem onClick={logOut}>
                {_t({ id: "header.disconnect" })}
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
