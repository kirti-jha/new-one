import { apiFetch } from "@/services/api";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export async function uploadFileToBackend(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const binary = new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < binary.length; i += 1) {
    str += String.fromCharCode(binary[i]);
  }
  const contentBase64 = btoa(str);

  return apiFetch("/files/upload", {
    method: "POST",
    body: JSON.stringify({
      folder,
      filename: file.name,
      mimeType: file.type,
      contentBase64,
    }),
  });
}

export function toFileUrl(filePath?: string | null) {
  if (!filePath) return null;
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalized = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${BACKEND_URL}/${normalized}`;
}
