import { expect, test } from "@playwright/test";

test("navbar search opens, finds a guide, and opens the result", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/");

  await page.locator('button[aria-label="Search"]').first().click();
  const dialog = page.getByRole("dialog", { name: "Search" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Search universities, guides, programs, and scholarships.")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("visa");
  const guide = dialog.getByRole("link", { name: /Turkey student visa/ });
  await expect(guide).toBeVisible();
  await guide.click();
  await expect(page).toHaveURL(/\/guides\/turkey-student-visa-guide/);
  await expect(dialog).toBeHidden();
});

test("navbar search follows a university result", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/guides");
  await page.locator('button[aria-label="Search"]').last().click();
  const dialog = page.getByRole("dialog", { name: "Search" });
  await dialog.getByRole("textbox").fill("Istanbul Technical");
  await dialog.getByRole("link", { name: /Istanbul Technical University/ }).click();
  await expect(page).toHaveURL(/\/universities\/istanbul-technical-university/);
});
