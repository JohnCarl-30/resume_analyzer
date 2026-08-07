---
name: company-research
description: Research a company and return a structured profile card. Use when the user says "research [company]", "tell me about [company]", or wants info about a company they're applying to.
---

# Company Research

Research a company and return a structured profile card. This is an autonomous workflow — no checkpoint, all research done before presenting anything.

## Workflow

Read `workflows/company-research.md` for the full spec. This skill is the implementation of that workflow.

## What you produce

Given a company name, produce a single profile card with:

```
Company: <name>

<size> · <industry> · <location>
Tech: <tech stack>
Glassdoor: <rating> (<review_count> reviews)
Sentiment: <positive/mixed/negative>

Recent news:
- <headline 1> (<date>) — <source>
- <headline 2> (<date>) — <source>
- <headline 3> (<date>) — <source>

Sources: <list of URLs>
```

## How to research

### Step 1: Identify the company

- Extract the company name from user input
- If ambiguous (e.g., "Apple"), ask which one or default to the most prominent

### Step 2: Web search

Run multiple searches to gather data:

1. `"<company name>" company size employees` — find employee count
2. `"<company name>" tech stack` — find technologies used
3. `"<company name>" glassdoor reviews` — find ratings and sentiment
4. `"<company name>" news 2026` — find recent news
5. `"<company name>" headquarters location` — find HQ and remote stance

Use `websearch` tool for each query. Use `webfetch` to read specific pages if needed (e.g., Glassdoor page, company about page).

### Step 3: Structure findings

For each data point, record:
- The value (e.g., "500-1000 employees")
- The source URL
- Confidence level (high if from official source, low if from random blog)

If a data point isn't findable, write "Not publicly available" — never guess.

### Step 4: Present the brief

Output the profile card in the exact format above. Keep it scannable — the user should get the key facts in 10 seconds.

## Rules

- Never fabricate data — if you can't find it, say so
- Always include source links so the user can verify
- Prefer recent data (2025-2026) over older info
- Handle name ambiguity by asking or choosing the most prominent company
- Keep the card concise — details go in source links, not the card
- Run all searches before presenting anything (push right)
