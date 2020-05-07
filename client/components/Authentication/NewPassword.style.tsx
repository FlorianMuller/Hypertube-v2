import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    containerPassword: {
      maxWidth: "1000px",
      margin: "50 auto",
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap"
    },
    paper: {
      flexGrow: 1,
      margin: theme.spacing(0, 1),
      overflow: "auto",
      maxWidth: "600px",
      maxHeight: "85 vh",
      borderRadius: "8px",
      padding: "15px"
    },
    input: {
      width: "255px"
    },
    badMessage: {
      color: "red"
    },
    goodMessage: {
      color: "green"
    }
  })
);

export default useStyles;
