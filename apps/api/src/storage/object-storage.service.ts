export interface CreateUploadTargetInput {
  fileName: string;
  contentType: string;
}

export interface UploadTarget {
  storageKey: string;
  uploadUrl: string;
  publicUrl: string | null;
  method: "PUT";
  headers: {
    "Content-Type": string;
  };
}

export interface ObjectStorageService {
  createUploadTarget(input: CreateUploadTargetInput): Promise<UploadTarget>;
}
