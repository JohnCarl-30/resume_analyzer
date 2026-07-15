import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

import { app } from "../app.js";

async function run() {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const listResponse = await fetch(`${baseUrl}/api/analysis/examples`);
    assert.equal(
      listResponse.status,
      200,
      "GET /api/analysis/examples should reach the few-shot examples handler",
    );

    const listPayload = (await listResponse.json()) as { data?: unknown };
    assert.ok(Array.isArray(listPayload.data), "Few-shot examples response should include a data array");

    const createResponse = await fetch(`${baseUrl}/api/analysis/examples`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText: "Software Engineer with React and Node.js experience.",
        targetRole: "Full Stack Engineer",
        extractedProfile: {
          fullName: "Taylor Kim",
          email: "taylor@example.com",
          phone: "",
          summary: "Full-stack engineer",
          skills: ["React", "Node.js"],
          education: [],
          experience: [],
          leadership: [],
          projects: [],
          awards: [],
        },
        quality: 88,
      }),
    });

    assert.equal(
      createResponse.status,
      201,
      "POST /api/analysis/examples should reach the few-shot create handler",
    );

    const createdPayload = (await createResponse.json()) as {
      data?: {
        id?: string;
        targetRole?: string;
      };
    };

    assert.equal(
      createdPayload.data?.targetRole,
      "Full Stack Engineer",
      "Created few-shot example should return the stored target role",
    );
    assert.ok(createdPayload.data?.id, "Created few-shot example should return an id");

    const refreshedListResponse = await fetch(`${baseUrl}/api/analysis/examples`);
    const refreshedPayload = (await refreshedListResponse.json()) as {
      data?: Array<{ id?: string }>;
    };

    assert.ok(
      refreshedPayload.data?.some((example) => example.id === createdPayload.data?.id),
      "Created few-shot example should appear in the examples list",
    );

    const shadowedResponse = await fetch(`${baseUrl}/api/analysis/examples`);
    const shadowedPayload = (await shadowedResponse.json()) as { error?: string };

    assert.notEqual(
      shadowedPayload.error,
      "Saved analysis not found.",
      "GET /api/analysis/examples must not be handled by /:analysisId",
    );

    console.log("Analysis route ordering checks passed.");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

void run().catch((error) => {
  console.error("Analysis route ordering checks failed.", error);
  process.exitCode = 1;
});
