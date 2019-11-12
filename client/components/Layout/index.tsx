import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import styles from './layout.css';

// eslint-disable-next-line
const Layout = ({ children }) => (
  <div className={styles.test}>
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">
            Hypertube
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
    {children}

  </div>
);

export default Layout;
