import React, { ReactElement, useState, ChangeEvent } from "react";
import Avatar from "@material-ui/core/Avatar";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import { AxiosPromise } from "axios";
import useStyles from "./Profile.styles";
import API from "../../util/api";

interface Props {
  picture?: string;
  googleID?: string;
  schoolID?: string;
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

const EditableAvatar = ({
  picture,
  googleID,
  schoolID
}: Props): ReactElement => {
  const classes = useStyles({});
  const [mouseIn, setMouseIn] = useState(false);

  const url = !!(googleID || schoolID);

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
        <Avatar
          alt="user-pic"
          src={
            !url
              ? `${window.location.origin}/api/avatar/${picture}`
              : `${picture}`
          }
          className={classes.large}
        />
        {mouseIn && <AddAPhotoIcon className={classes.changePhoto} />}
      </label>
    </div>
  );
};

export default EditableAvatar;
