import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  containerProfile: {
    maxWidth: "1000px",
    margin: "50 auto",

    display: "flex",
    justifyContent: "center",

    flexWrap: "wrap"
  },
  containerHistory: {
    flexGrow: 1,
    margin: theme.spacing(0, 1),
    overflow: "auto",
    maxWidth: "600px",
    maxHeight: "85vh",
    borderRadius: "8px",
    padding: "15px"
  },
  titleHistory: {
    textAlign: "center"
  },
  containerUser: {
    marginBottom: "10px",
    borderRadius: "8px",
    display: "inline-block",
    maxWidth: "400px",
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

    "&:hover": {
      filter: "brightness(80%)",
      cursor: "pointer"
    }
  },
  containerInfo: {
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
    width: "100%",
    maxWidth: "250px",
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
    height: theme.spacing(35)
  },
  changePhoto: {
    position: "absolute",
    top: "60px",
    left: "60px",
    fontSize: 150,
    cursor: "pointer"
  },
  textComment: {
    wordBreak: "break-all"
  },
  photoIcon: {},
  username: {
    fontStyle: "italic"
  }
}));
export default useStyles;
