import { AxiosPromise } from "axios";
import API from "../../util/api";

const sendPictureData = (picture: File): AxiosPromise<{ newPath: string }> => {
  const data = new FormData();
  data.append("image", picture);
  return API({
    method: "post",
    url: "/users/picture",
    headers: { "Content-Type": "multipart/form-data" },
    data
  });
};

export default sendPictureData;
