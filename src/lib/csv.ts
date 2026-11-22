const escapeCsvCell = (value: string | number) => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Builds a UTF-8 (with BOM, so Excel reads it right) CSV in the browser and
// downloads it. Generated client-side, so no download manager intercepts it.
export const downloadCsv = (
  filename: string,
  header: string[],
  rows: (string | number)[][],
) => {
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
  const blob = new Blob([String.fromCharCode(0xfeff), csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
