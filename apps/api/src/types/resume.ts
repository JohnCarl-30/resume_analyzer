export interface Resume {
  id: string;
  fileName: string;
  storageKey: string;
  candidateName: string;
  status: "uploaded" | "processing" | "analyzed";
  uploadedAt: string;
}
