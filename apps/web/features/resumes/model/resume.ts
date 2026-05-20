export interface ResumeSummary {
  id: string;
  candidateName: string;
  fileName: string;
  status: "uploaded" | "processing" | "analyzed";
  uploadedAt: string;
  targetRole: string;
  score: number;
  missingKeywordCount: number;
  suggestionCount: number;
}

export const sampleResumes: ResumeSummary[] = [
  {
    id: "resume_1",
    candidateName: "Alex Morgan",
    fileName: "alex-morgan-resume.pdf",
    status: "analyzed",
    uploadedAt: "2026-04-02T09:00:00.000Z",
    targetRole: "Product Designer",
    score: 82,
    missingKeywordCount: 4,
    suggestionCount: 3,
  },
  {
    id: "resume_2",
    candidateName: "Jordan Lee",
    fileName: "jordan-lee-resume.pdf",
    status: "processing",
    uploadedAt: "2026-04-02T10:15:00.000Z",
    targetRole: "Frontend Engineer",
    score: 68,
    missingKeywordCount: 7,
    suggestionCount: 5,
  },
  {
    id: "resume_3",
    candidateName: "Sam Carter",
    fileName: "sam-carter-resume.pdf",
    status: "uploaded",
    uploadedAt: "2026-04-02T11:10:00.000Z",
    targetRole: "Data Analyst",
    score: 0,
    missingKeywordCount: 0,
    suggestionCount: 0,
  },
];
