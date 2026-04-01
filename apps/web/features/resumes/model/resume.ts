export interface ResumeSummary {
  id: string;
  candidateName: string;
  fileName: string;
  status: "uploaded" | "processing" | "analyzed";
  uploadedAt: string;
}

export const sampleResumes: ResumeSummary[] = [
  {
    id: "resume_1",
    candidateName: "Alex Morgan",
    fileName: "alex-morgan-resume.pdf",
    status: "analyzed",
    uploadedAt: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "resume_2",
    candidateName: "Jordan Lee",
    fileName: "jordan-lee-resume.pdf",
    status: "processing",
    uploadedAt: "2026-04-02T10:15:00.000Z",
  },
  {
    id: "resume_3",
    candidateName: "Sam Carter",
    fileName: "sam-carter-resume.pdf",
    status: "uploaded",
    uploadedAt: "2026-04-02T11:10:00.000Z",
  },
];
