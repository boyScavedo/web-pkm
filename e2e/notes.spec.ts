import { expect, test, type Page } from "@playwright/test";

// Credentials live in .env.local (PKM_EMAIL / PKM_PASSWORD). Tests write to the
// same development Neon branch as the app; every test uses a unique
// timestamped title so runs are idempotent and never collide.

const EMAIL = process.env.PKM_EMAIL ?? "pkm@local";
const PASSWORD = process.env.PKM_PASSWORD ?? "changeme";
const TAG = Date.now();

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("email").fill(EMAIL);
  await page.getByLabel("password").fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/notes$/);
}

test("create a note, edit it, and delete it", async ({ page }) => {
  await signIn(page);

  const title = `e2e-${TAG}-alpha`;

  // create
  await page.getByRole("link", { name: /new note/i }).click();
  await expect(page).toHaveURL(/\/notes\/new/);
  await page.getByLabel("title").fill(title);
  await page.getByLabel("content").fill("hello from playwright");
  await page.getByLabel("para").selectOption("inbox");
  await page.getByRole("button", { name: /create note/i }).click();

  // redirected to the note view
  await expect(page).toHaveURL(/\/notes\/[0-9a-f-]{36}/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  // edit
  await page.getByLabel("title").fill(`${title}-v2`);
  await page.getByLabel("content").fill("edited body");
  await page.getByRole("button", { name: /save changes/i }).click();
  await expect(page.getByText(/saved/i)).toBeVisible();

  // list shows the edited title
  await page.goto("/notes");
  await expect(page.getByText(`${title}-v2`)).toBeVisible();

  // para filter surfaces it under inbox
  await page.goto("/notes?para=inbox");
  await expect(page.getByText(`${title}-v2`)).toBeVisible();

  // delete
  await page.goto(`/notes`, { waitUntil: "networkidle" });
  await page.getByText(`${title}-v2`).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /delete/i }).click();
  await expect(page).toHaveURL(/\/notes$/);

  // gone from the list
  await expect(page.getByText(`${title}-v2`)).toHaveCount(0);
});