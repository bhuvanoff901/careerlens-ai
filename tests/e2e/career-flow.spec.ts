import { expect, test } from "@playwright/test";

test("landing page opens and demo report tabs work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Your resume deserves more than a quick glance/i })).toBeVisible();
  await page.getByRole("link", { name: "Explore demo" }).click();
  await expect(page.getByText("FICTIONAL SAMPLE · NO ACCOUNT NEEDED")).toBeVisible();
  await page.getByRole("tab", { name: "Skills" }).click();
  await expect(page.getByRole("heading", { name: "Skills, with context" })).toBeVisible();
  await page.getByRole("tab", { name: "Skills" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Job match" })).toBeFocused();
});

test("resume analysis validates an empty form and handles synthetic text", async ({ page }) => {
  await page.goto("/analyze");
  await page.getByRole("button", { name: "Analyze my resume" }).click();
  await expect(page.locator("#form-error")).toContainText("at least 100 characters");

  await page.getByLabel("Paste resume text").fill(
    "Synthetic resume\nSkills\nReact TypeScript Python\nProjects\nBuilt a student planner with keyboard accessibility and automated tests.\nEducation\nCoursework in software development and research.",
  );
  await page.getByRole("button", { name: "Analyze my resume" }).click();
  await expect(page.getByRole("heading", { name: "Your review, at a glance." })).toBeVisible();
  await expect(page.getByText("LOCAL TEXT PREVIEW")).toBeVisible();
  await page.getByRole("tab", { name: "Improvements" }).click();
  await expect(page.getByRole("heading", { name: "Small edits, stronger evidence" })).toBeVisible();
});

test("login and signup routes render accessible forms", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await page.getByLabel("Email address").fill("learner@example.test");
  await page.getByLabel("Password").fill("synthetic-demo-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".auth-form .form-error")).toContainText("unavailable until Supabase is configured");
  await page.goto("/signup");
  await expect(page.getByLabel("Your name")).toBeVisible();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login$/);
});

test("public catalogs render without horizontal overflow on a narrow phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["/", "/jobs", "/learning", "/analyze"]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `${route} overflows at the mobile viewport`).toBeLessThanOrEqual(dimensions.viewport);
  }
});
