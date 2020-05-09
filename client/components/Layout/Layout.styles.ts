import { makeStyles } from "@material-ui/core/styles";

export const useLayoutStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%"
  },
  contentContainer: {
    position: "relative",
    width: "100%",
    flexGrow: 1,
    backgroundImage: `url('${window.location.origin}/public/wallpaper.png')`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom left",
    backgroundAttachment: "fixed",
    backgroundSize: "cover"
  },
  filtersContainer: {
    position: "absolute",
    zIndex: 1000,
    top: theme.spacing(-1.5),
    right: theme.spacing(23),
    width: "20rem",
    [theme.breakpoints.down("xs")]: {
      position: "relative",
      width: "100%",
      right: 0
    }
  }
}));

export const useHeaderStyles = makeStyles((theme) => ({
  appBar: {
    height: "64px",
    display: "flex",
    justifyContent: "center"
  },
  titleLink: {
    textDecoration: "none",
    color: theme.palette.text.primary
  },
  buttonsMenu: {
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexGrow: 1,
      justifyContent: "flex-end"
    }
  },
  linksContainer: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    [theme.breakpoints.down("xs")]: {
      marginRight: "20px"
    }
  },
  // title: {
  //   marginRight: theme.spacing(2)
  //   // [theme.breakpoints.down("xs")]: {
  //   //   display: "none"
  //   // }
  // },
  linkMedia: {
    margin: theme.spacing(0, 0.5)
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      width: "100%"
    }
  },
  searchInput: {
    background: theme.palette.grey[700],
    height: theme.spacing(5),
    width: "20rem",
    [theme.breakpoints.down("sm")]: {
      width: "15rem"
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%"
    }
  },
  flagIcon: {
    lineHeight: 0
  },
  inputLabel: {
    marginRight: theme.spacing(1),
    pointerEvents: "none"
  },
  headerButtons: {
    color: theme.palette.grey[700],
    marginLeft: theme.spacing(1),
    height: theme.spacing(6),
    width: theme.spacing(6),
    "&:hover": {
      backgroundColor: theme.palette.grey[800]
    }
  },
  thumb: {
    color: theme.palette.primary.main
  },
  localeItem: {
    fontSize: "24px"
  }
}));

export const useFiltersStyles = makeStyles((theme) => ({
  paper: {
    width: "100%",
    padding: theme.spacing(4, 3, 3),
    display: "flex",
    flexDirection: "column"
  },
  firstElement: {
    marginTop: theme.spacing(2)
  },
  filterElement: {
    marginBottom: theme.spacing(4)
  },
  select: {
    width: "100%"
  },
  centerItem: {
    display: "flex",
    justifyContent: "center",
    textAlign: "center"
  },
  ratingContainer: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      justifyContent: "space-evenly"
    }
  },
  resetFilterButtonWrapper: {
    height: "24px",
    marginBottom: theme.spacing(2)
  },
  resetFilterButton: {
    float: "right",
    color: "#a94b4b",
    borderColor: "#a94b4b",
    "&:hover": {
      backgroundColor: "rgba(169, 75, 75, 0.1) !important"
    }
  }
}));
