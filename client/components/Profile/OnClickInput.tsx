import React, { ReactElement, useState, useRef, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import SaveAlt from "@material-ui/icons/SaveAlt";
import { Typography } from "@material-ui/core";
import useStyles from "./OnClickInput.style";

interface Props {
  autocomplete?: string;
  startValue: string;
  label: string;
  name: string;
  variant:
    | "inherit"
    | "button"
    | "overline"
    | "caption"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "srOnly";
  maxLength?: number;
  updateInfo: (newInfo: string, label: string) => void;
}

const OnClickInput = ({
  startValue,
  label,
  name,
  updateInfo,
  variant,
  maxLength,
  autocomplete
}: Props): ReactElement => {
  const [value, setValue] = useState(startValue);
  const [editMode, setEditMode] = useState(false);
  const inputEl = useRef(null);
  const styles = useStyles({});

  const changeEditMode = (): void => {
    setEditMode((oldEditMode) => !oldEditMode);
  };

  useEffect(() => {
    if (editMode) {
      inputEl.current.focus();
    }
  }, [editMode]);

  useEffect(() => {
    setValue(startValue);
  }, [startValue]);

  const renderEditView = (): ReactElement => {
    return (
      <div>
        <TextField
          autoComplete={autocomplete}
          inputRef={inputEl}
          label={label}
          name={name}
          defaultValue={value}
          onChange={(e): void => setValue(e.target.value)}
          onBlur={(): void => {
            changeEditMode();
            updateInfo(value, name);
          }}
          inputProps={{ maxLength }}
        />
        <IconButton color="primary" aria-label="edit" component="span">
          <SaveAlt />
        </IconButton>
      </div>
    );
  };

  const renderDefaultView = (): ReactElement => {
    return (
      <div
        role="button"
        onKeyDown={changeEditMode}
        tabIndex={0}
        onClick={changeEditMode}
        className={styles.button}
      >
        <Typography variant={variant}>{value}&nbsp;</Typography>
      </div>
    );
  };

  return editMode ? renderEditView() : renderDefaultView();
};

export default OnClickInput;
