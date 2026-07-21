export function splitSkills(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSkill(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function skillDiff(before: string, after: string) {
  const beforeItems = splitSkills(before === "(empty)" ? "" : before);
  const afterItems = splitSkills(after);
  const beforeSet = new Set(beforeItems.map(normalizeSkill));
  const afterSet = new Set(afterItems.map(normalizeSkill));

  const added = afterItems.filter((item) => !beforeSet.has(normalizeSkill(item)));
  const removed = beforeItems.filter((item) => !afterSet.has(normalizeSkill(item)));
  const kept = afterItems.filter((item) => beforeSet.has(normalizeSkill(item)));

  return { added, removed, kept };
}
