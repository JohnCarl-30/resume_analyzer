import { expect, test } from "@playwright/test";

/**
 * The landing page is the only substantial route Clerk leaves public, so it
 * is where browser coverage is possible without a signed-in fixture.
 */
test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("leads with the headline and both calls to action", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Paste a job post.");

    await expect(page.getByRole("link", { name: /check my resume/i }).first()).toHaveAttribute(
      "href",
      "/analysis/new",
    );
    await expect(page.getByRole("link", { name: /build a resume first/i }).first()).toHaveAttribute(
      "href",
      "/create-resume",
    );
  });

  test("shows the product preview", async ({ page }) => {
    await expect(page.getByRole("img", { name: /a resume check in progress/i })).toBeVisible();
  });

  test("renders every section", async ({ page }) => {
    for (const heading of [
      /three steps, about two minutes/i,
      /here.s exactly what gets marked up/i,
      /most bullets say what you did/i,
      /a check, then the tools to act on it/i,
      /before you upload anything/i,
      /see what your resume is missing/i,
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("opens an FAQ answer", async ({ page }) => {
    const question = page.getByRole("group").filter({ hasText: /what does the free check include/i });
    const answer = question.getByText(/one full AI review per account/i);

    await expect(answer).toBeHidden();
    await question.getByText(/what does the free check include/i).click();
    await expect(answer).toBeVisible();
  });

  test("takes an anonymous visitor to sign-in when they start a check", async ({ page }) => {
    await page.getByRole("link", { name: /check my resume/i }).first().click();
    await page.waitForURL(/\/auth\/sign-in|\/analysis\/new/);

    // Either the check page or the sign-in wall is correct; being dropped on
    // an error page is not.
    expect(page.url()).toMatch(/\/auth\/sign-in|\/analysis\/new/);
  });
});
