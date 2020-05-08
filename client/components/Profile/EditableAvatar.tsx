import React, { ReactElement, useState, ChangeEvent } from "react";
import Avatar from "@material-ui/core/Avatar";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import { AxiosPromise } from "axios";
import useStyles from "./Profile.styles";
import API from "../../util/api";

interface Props {
  picture?: string;
}

const sendPictureData = (picture: File): AxiosPromise<{}> => {
  const data = new FormData();
  data.append("image", picture);
  return API({
    method: "post",
    url: "/users/picture",
    headers: { "Content-Type": "multipart/form-data" },
    data
  });
};

const EditableAvatar = ({ picture }: Props): ReactElement => {
  const classes = useStyles({});
  const [mouseIn, setMouseIn] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.type === "file") {
      sendPictureData(e.target.files[0]);
    }
  };

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
        <Avatar alt="user-pic" src={picture} className={classes.large} />
        {mouseIn && <AddAPhotoIcon className={classes.changePhoto} />}
      </label>
    </div>
  );
};

export default EditableAvatar;
