import React, { ReactElement } from "react";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

import useStyles from "./LoadingButton.style";

export interface Props {
  text: string;
  loadingText?: string;
  loading: boolean;
  type?: "button" | "reset" | "submit";
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  color?: "inherit" | "primary" | "secondary" | "default";
  circularProgressColor?: "inherit" | "primary" | "secondary";
  buttonClass?: string;
  circularProgressClass?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const LoadingButton = ({
  text,
  loadingText,
  loading,
  type,
  variant,
  size,
  color,
  circularProgressColor,
  buttonClass,
  circularProgressClass,
  onClick
}: Props): ReactElement => {
  const classes = useStyles({});
  return (
    <div className={classes.circularProgressContainer}>
      {loading && (
        <CircularProgress
          color={circularProgressColor || "inherit"}
          className={`${classes.circularProgress} ${circularProgressClass ||
            ""}`}
        />
      )}
      <Button
        disabled={loading}
        type={type || "button"}
        variant={variant || "contained"}
        size={size || "medium"}
        color={color || "default"}
        className={buttonClass}
        onClick={onClick}
      >
        {loading && loadingText ? loadingText : text}
      </Button>
    </div>
  );
};

export default LoadingButton;
