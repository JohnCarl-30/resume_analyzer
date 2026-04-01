import { sampleJobMatch } from "../model/job-match";

export function useJobMatch() {
  return {
    heading: "Target role alignment",
    snapshot: sampleJobMatch,
  };
}
