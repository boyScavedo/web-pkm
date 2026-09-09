import { expect, test, type Page } from "@playwright/test";

const EMAIL = process.env.PKM_EMAIL ?? "pkm@local";
const PASSWORD = process.env.PKM_PASSWORD ?? "changeme";

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("email").fill(EMAIL);
  await page.getByLabel("password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/$/);
}

test("vault frame shell renders", async ({ page }) => {
  await signIn(page);
  await expect(page.getByTestId("ribbon-vault")).toBeVisible();
  await expect(page.getByTestId("tab-strip")).toBeVisible();
  await expect(page.getByTestId("status-bar")).toBeVisible();
});

test("new note still reaches the create flow from the explorer", async ({ page }) => {
  await signIn(page);
  await page.getByTestId("new-note").click();
  await expect(page).toHaveURL(/\/notes\/new/);
  await expect(page.getByLabel("title")).toBeVisible();
});