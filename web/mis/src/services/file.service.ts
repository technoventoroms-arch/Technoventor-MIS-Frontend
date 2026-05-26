import { ResponseDataType } from "@mono/shared_ui/interfaces/utils";
import http from "./base";
import { UploadImageRes } from "@/interfaces/file";

export const uploadImage = async (file: FormData) => {
  const res = await http.post<ResponseDataType<UploadImageRes, null>>(
    `/files/upload`,
    file
  );
  return res.data;
};
