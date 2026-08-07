# Workflow: Company Research

Research a company and return a structured profile card when the user asks.

## Trigger

User types "research [company name]" or pastes a company name in the app.

## Process

1. Accept company name from user input
2. Web-search for the company across multiple sources:
   - Company website (about page, tech blog)
   - LinkedIn company page
   - Glassdoor / Indeed reviews
   - Crunchbase (funding, size)
   - Recent news articles
   - GitHub (if tech company, check open-source repos)
3. Structure findings into a profile:
   - **Name**: official company name
   - **Size**: employee count (range is fine: "50-200", "1000+")
   - **Industry**: primary industry/sector
   - **Tech stack**: languages, frameworks, tools (if discoverable)
   - **Recent news**: last 3-5 notable items with dates
   - **Sentiment**: overall employee/public sentiment (positive, mixed, negative)
   - **Glassdoor rating**: if available (e.g., "4.2/5 from 300 reviews")
   - **Location**: HQ + remote stance
   - **Source links**: URLs for each data point
4. Handle unknowns gracefully — if data isn't findable, say so rather than guessing.

## Checkpoint

None. This workflow runs autonomously — no human-in-the-loop point.

## Push Right

All research is completed and structured before presenting anything to the user. They see a single, complete profile card — not a stream of partial findings.

## Brief

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

The brief is a card the user can scan in 10 seconds. If they want more detail, they follow the source links.
