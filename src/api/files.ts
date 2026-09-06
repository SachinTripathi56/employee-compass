import { apiRequest } from "./client";

/**
 * Files live in Cloudinary but are always brokered by the FastAPI backend.
 * No Cloudinary credentials ever exist in the frontend.
 */
export const uploadFile = (file: File, purpose: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);
  return apiRequest<{ file_id: string; url: string }>("/api/v1/files/upload", {
    method: "POST",
    formData,
  });
};

export const getFileUrl = (fileId: string) =>
  apiRequest<{ url: string; expires_at: string }>(`/api/v1/files/${fileId}/url`);
