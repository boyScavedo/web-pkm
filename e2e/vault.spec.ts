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

test("new note from the explorer opens the editor", async ({ page }) => {
  await signIn(page);
  await page.getByTestId("new-note").click();
  await expect(page).toHaveURL(/\/notes\/[0-9a-f-]{36}/);
  await expect(page.getByLabel("title")).toHaveValue("Untitled");
  // self-clean the note created here (soft delete)
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /delete/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
});

test("folder create, rename, and delete from the explorer", async ({ page }) => {
  await signIn(page);

  const initial = `e2e-folder-${Date.now()}`;
  const renamed = `${initial}-v2`;

  // create
  await page.getByTestId("new-folder").click();
  await page.getByTestId("folder-name-input").fill(initial);
  await page.getByTestId("folder-name-input").press("Enter");
  await expect(page.getByText(initial, { exact: true })).toBeVisible();

  // rename via context menu
  await page.getByText(initial, { exact: true }).click({ button: "right" });
  await page.getByRole("button", { name: /rename/i }).click();
  await page.getByTestId("folder-rename-input").fill(renamed);
  await page.getByTestId("folder-rename-input").press("Enter");
  await expect(page.getByText(renamed, { exact: true })).toBeVisible();

  // delete via context menu, confirm the dialog
  page.once("dialog", (d) => d.accept());
  await page.getByText(renamed, { exact: true }).click({ button: "right" });
  await page.getByRole("button", { name: /delete/i }).click();
  await expect(page.getByText(renamed, { exact: true })).toHaveCount(0);
});