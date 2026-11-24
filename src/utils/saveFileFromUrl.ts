/**
 * Fetches a file and hands it to the browser to save, the same way the
 * mosaic download does. The name comes from the response when it has one.
 */
export const saveFileFromUrl = async (fileUrl: string, fallbackName: string) => {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const blob = await response.blob();
  const filename = response.headers
    .get("content-disposition")
    ?.split("filename=")[1]
    ?.replace(/["']/g, "")
    .trim();

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename || fallbackName;
  link.style.display = "none";
  link.href = objectUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};
