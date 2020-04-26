import React, { ReactElement, useState, ChangeEvent } from "react";
import Avatar from "@material-ui/core/Avatar";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import { AxiosPromise } from "axios";
import useStyles from "./Profile.styles";
import API from "../../util/api";

interface Props {
  picture?: string;
}

interface ApiResponse {
  id: string;
}

export const sendPictureData = (picture: File): AxiosPromise<ApiResponse> => {
  const data = new FormData();
  data.append("image", picture);
  return API({
    method: "post",
    url: "/users/picture",
    headers: { "Content-Type": "multipart/form-data" },
    data
  });
};

const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
  if (e.target.type === "file") {
    sendPictureData(e.target.files[0]);
  }
};

const EditableAvatar = ({ picture }: Props): ReactElement => {
  const classes = useStyles({});
  const [mouseIn, setMouseIn] = useState(false);

  return (
    <div
      onMouseEnter={(): void => setMouseIn(true)}
      onMouseLeave={(): void => setMouseIn(false)}
      className={classes.containerPictureProfile}
    >
      <label htmlFor="raised-button-file">
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="raised-button-file"
          type="file"
          name="picture"
          onChange={handleInputChange}
        />
        <Avatar
          alt="user-pic"
          src={`${window.location.origin}/api/data/avatar/${picture}`}
          className={classes.large}
        />
        {mouseIn && <AddAPhotoIcon className={classes.changePhoto} />}
      </label>
    </div>
  );
};

export default EditableAvatar;
