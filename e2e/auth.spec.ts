import { expect, test } from "@playwright/test";

// Credentials live in .env.local (PKM_EMAIL / PKM_PASSWORD). CI and local
// both go through the same dev server, which loads them.
const EMAIL = process.env.PKM_EMAIL ?? "pkm@local";
const PASSWORD = process.env.PKM_PASSWORD ?? "changeme";

test("unauthenticated / redirects to /sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("sign in with credentials lands on the vault", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("email").fill(EMAIL);
  await page.getByLabel("password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("vault frame renders after sign-in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("email").fill(EMAIL);
  await page.getByLabel("password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("ribbon-vault")).toBeVisible();
  await expect(page.getByTestId("status-bar")).toBeVisible();
  await expect(page.getByText(/select a note to open it/i)).toBeVisible();
});