import { makeStyles } from "@material-ui/core/styles";

export const useHomeStyles = makeStyles((theme) => ({
  mainPoster: {
    background:
      "linear-gradient(to bottom, transparent 40%, black 80%), url('/public/backgroundImage.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "50% 0%",
    width: "100%",
    height: "100%",
    marginTop: "0",
    display: "flex"
  },
  boxContent: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginTop: theme.spacing(10)
  }
}));

export const useRecentMoviesStyle = makeStyles(() => ({}));
