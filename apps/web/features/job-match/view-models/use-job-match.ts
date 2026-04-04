import { sampleJobMatch } from "../model/job-match";

export function useJobMatch() {
  return {
    heading: "Compare the active candidate against the target role",
    snapshot: sampleJobMatch,
  };
}
