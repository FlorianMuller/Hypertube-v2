import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  containerProfile: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    margin: theme.spacing(0, 2)
  },
  containerHistory: {
    flexGrow: 1,
    margin: theme.spacing(3, 1, 1),
    overflow: "auto",
    maxWidth: "600px",
    width: "100%",
    minHeight: "408px",
    maxHeight: "85vh",
    borderRadius: "8px",
    padding: "15px"
  },
  centerText: {
    textAlign: "center"
  },
  containerUser: {
    margin: theme.spacing(3, 1, 1),
    borderRadius: "8px",
    maxWidth: "420px",
    padding: theme.spacing(3)
  },
  containerPicture: {
    display: "flex",
    justifyContent: "center"
  },
  containerPictureProfile: {
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    borderRadius: "50%",

    "&:hover": {
      filter: "brightness(80%)",
      cursor: "pointer"
    }
  },
  imageLabel: {
    borderRadius: "50%"
  },
  imageInput: {
    borderRadius: "50%",
    display: "none"
  },
  containerInfo: {
    marginTop: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    flexDirection: "column"
  },
  containerComment: {
    display: "flex",
    flexDirection: "column",
    marginTop: "20px"
  },
  containerRating: {
    float: "left",
    display: "flex"
  },
  containerMovieInfos: {
    flexWrap: "wrap",
    maxHeight: "45px",
    display: "flex",
    alignItems: "center"
  },
  containerFullname: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
    overflow: "hidden"
  },
  commentDate: {
    marginTop: theme.spacing(0.5),
    color: "grey"
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  large: {
    width: theme.spacing(35),
    height: theme.spacing(35),
    border: "white solid 5px",
    cursor: "pointer"
  },
  changePhoto: {
    position: "absolute",
    top: "60px",
    left: "60px",
    fontSize: 150,
    cursor: "pointer"
  },
  textComment: {
    wordBreak: "break-word"
  },
  photoIcon: {},
  username: {
    fontStyle: "italic"
  },
  rating: {
    marginRight: "8px"
  },
  badMessage: {
    color: "red"
  },
  goodMessage: {
    color: "green"
  },
  emailChange: {
    margin: theme.spacing(4, 0),
    textAlign: "center"
  },
  usernameWrapper: {
    cursor: "not-allowed"
  },
  passwordButton: {
    width: "230px"
  }
}));

export default useStyles;
