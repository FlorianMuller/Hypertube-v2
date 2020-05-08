import React, { useState, useEffect, ReactElement } from "react";
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
import {
  Search,
  ExpandMore,
  ExpandLess,
  AccountCircle
} from "@material-ui/icons";
import Cookies from "universal-cookie";

import API from "../../util/api";
import { useHeaderStyles } from "./Layout.styles";

interface Props {
  locale: string;
  setLocale: (locale: string) => void;
  expandedFilters: boolean;
  setExpandedFilters: (
    value: boolean | ((oldValue: boolean) => boolean)
  ) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

const localeCompleteLst = ["en", "fr"];

const Header = ({
  locale,
  setLocale,
  expandedFilters,
  setExpandedFilters,
  onSearchChange,
  searchQuery
}: Props): ReactElement => {
  const classes = useHeaderStyles({});
  const { formatMessage: _t } = useIntl();
  const history = useHistory();
  const [localeAnchorEl, setLocaleAnchorEl] = useState(undefined);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(undefined);
  const cookies = new Cookies();
  const [logged, setLogged] = useState(false);
  const [localeLst, setLocaleLst] = useState(
    localeCompleteLst.filter((loc) => loc !== locale)
  );

  useEffect(() => {
    setLocaleLst(localeCompleteLst.filter((loc) => loc !== locale));
  }, [locale]);

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
                  {_t({ id: "header.last_add" })}
                </Link>
              </Typography>
            </Hidden>
          )}
        </div>
        <div className={classes.headerContent}>
          {logged && (
            <>
              {/* Searchbar */}
              <OutlinedInput
                value={searchQuery}
                onChange={(e): void => onSearchChange(e.target.value)}
                onFocus={(): void => setExpandedFilters(true)}
                placeholder={_t({ id: "layout.filters.search" })}
                className={classes.searchInput}
                startAdornment={<Search className={classes.inputLabel} />}
                labelWidth={0}
                id="menuitem-search"
                autoComplete="off"
              />
              {/* Filters button */}
              <IconButton
                id="expandFiltersButton"
                onClick={(): void =>
                  setExpandedFilters((oldIsExp) => !oldIsExp)
                }
                className={classes.localeItem}
              >
                {expandedFilters ? (
                  <ExpandLess id="expandFiltersIcon" />
                ) : (
                  <ExpandMore id="expandFiltersIcon" />
                )}
              </IconButton>
            </>
          )}

          {/* Language + profile button */}
          <div className={classes.buttonsMenu}>
            {/* Language */}
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
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              getContentAnchorEl={null}
              open={!!localeAnchorEl}
              onClose={(): void => setLocaleAnchorEl(undefined)}
            >
              {localeLst.map((loc) => (
                <MenuItem
                  key={loc}
                  onClick={(): void => setNewLocale(loc)}
                  className={classes.localeItem}
                >
                  {_t({ id: `header.language.${loc}` })}
                </MenuItem>
              ))}
            </Menu>
            {/* Profile */}
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
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              getContentAnchorEl={null}
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
