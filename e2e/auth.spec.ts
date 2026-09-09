import { expect, test } from "@playwright/test";

// Credentials live in .env.local (PKM_EMAIL / PKM_PASSWORD). CI and local
// both go through the same dev server, which loads them.
const EMAIL = process.env.PKM_EMAIL ?? "pkm@local";
const PASSWORD = process.env.PKM_PASSWORD ?? "changeme";

test("unauthenticated /notes redirects to /sign-in", async ({ page }) => {
  await page.goto("/notes");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("sign in with credentials redirects to /notes", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("email").fill(EMAIL);
  await page.getByLabel("password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
});

test("notes empty state renders after sign-in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("email").fill(EMAIL);
  await page.getByLabel("password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText(/no notes|empty/i).first()).toBeVisible();
});