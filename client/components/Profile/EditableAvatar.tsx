import React, { ReactElement, useState, ChangeEvent, useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import useStyles from "./Profile.styles";
import sendPictureData from "./EditableAvatar.service";

interface Props {
  picture?: string;
}

const EditableAvatar = ({ picture }: Props): ReactElement => {
  const classes = useStyles({});
  const [mouseIn, setMouseIn] = useState(false);
  const [picturePath, setPicturePath] = useState(picture);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.type === "file") {
      sendPictureData(e.target.files[0]).then((res) => {
        if (res.data?.newPath) {
          setPicturePath(res.data.newPath);
        }
      });
    }
  };

  useEffect(() => {
    if (picture) {
      setPicturePath(picture);
    }
  }, [picture]);

  return (
    <div
      onMouseEnter={(): void => setMouseIn(true)}
      onMouseLeave={(): void => setMouseIn(false)}
      className={classes.containerPictureProfile}
    >
      <label htmlFor="raised-button-file" className={classes.imageLabel}>
        <input
          accept="image/*"
          className={classes.imageInput}
          id="raised-button-file"
          type="file"
          name="picture"
          onChange={handleInputChange}
        />
        <Avatar alt="user-pic" src={picturePath} className={classes.large} />
        {mouseIn && <AddAPhotoIcon className={classes.changePhoto} />}
      </label>
    </div>
  );
};

export default EditableAvatar;
