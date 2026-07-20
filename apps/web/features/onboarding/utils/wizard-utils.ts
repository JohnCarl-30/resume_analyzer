export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const maxFileSize = 10 * 1024 * 1024; // 10MB

function hasSupportedExtension(fileName: string): boolean {
  if (!fileName) {
    return false;
  }

  const extension = fileName.toLowerCase().split(".").pop();
  return extension === "pdf" || extension === "docx";
}

export function isSupportedFile(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    (file.type === "" && hasSupportedExtension(file.name))
  );
}
