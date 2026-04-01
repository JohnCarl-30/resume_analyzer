import type { ResumeRepository, CreateResumeRecord } from "./resume.repository.js";
import type { Resume } from "../types/resume.js";

class InMemoryResumeRepository implements ResumeRepository {
  private readonly resumes = new Map<string, Resume>();

  async list() {
    return Array.from(this.resumes.values()).sort((a, b) =>
      b.uploadedAt.localeCompare(a.uploadedAt),
    );
  }

  async findById(id: string) {
    return this.resumes.get(id) ?? null;
  }

  async create(input: CreateResumeRecord) {
    const resume: Resume = {
      id: crypto.randomUUID(),
      ...input,
    };

    this.resumes.set(resume.id, resume);

    return resume;
  }
}

export const inMemoryResumeRepository = new InMemoryResumeRepository();
