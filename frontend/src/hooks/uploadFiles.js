import { FILES_UPLOAD } from "@/imports/api";
import BACKEND_URL from "@/imports/baseUrl";
import { getToken } from "@/imports/localStorage";
import { showToast } from "@/utils/toast";

const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("file", file);
  });
  const response = await fetch(`${BACKEND_URL}${FILES_UPLOAD}`, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) {
    showToast.warn("File upload failed try uploading a small size image");
    throw new Error("File upload failed");
  }
  return response.json();
};
export default uploadFiles;
