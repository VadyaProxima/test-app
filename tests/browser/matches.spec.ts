import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fixture = JSON.parse(readFileSync(resolve('data/matches.json'), 'utf8'));
const storageKey = 'matches-task:favorites:v1';
const stars = (page: Page) =>
  page.getByRole('button', {
    name: /^(Добавить в избранное|Убрать из избранного)$/,
  });

test.beforeEach(async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ json: fixture }),
  );
  await page.goto('/');
  await expect(stars(page)).toHaveCount(8);
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 664 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
]) {
  test(`search keeps the page stable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const input = page.getByRole('textbox', {
      name: 'Поиск по названию клуба',
    });
    const list = page.getByTestId('matches-results');
    const footer = page.getByTestId('matches-footer');
    await expect(input).toBeVisible();
    const initialInput = (await input.boundingBox())!;
    const initialFooter = (await footer.boundingBox())!;
    const initialList = (await list.boundingBox())!;
    expect(initialList.height).toBeGreaterThan(80);

    const scrollTop = await list.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop;
    });
    expect(scrollTop).toBeGreaterThan(0);

    for (const [query, count] of [
      ['спартак', 1],
      ['несуществующий клуб', 0],
      ['', 8],
    ] as const) {
      await input.fill(query);
      await expect(stars(page)).toHaveCount(count);
      await expect(input).toBeFocused();
      const inputBox = (await input.boundingBox())!;
      const footerBox = (await footer.boundingBox())!;
      const listBox = (await list.boundingBox())!;
      expect(Math.abs(inputBox.y - initialInput.y)).toBeLessThan(1);
      expect(Math.abs(inputBox.x - initialInput.x)).toBeLessThan(1);
      expect(Math.abs(footerBox.y - initialFooter.y)).toBeLessThan(1);
      expect(Math.abs(listBox.height - initialList.height)).toBeLessThan(1);
      const document = await page.evaluate(() => ({
        height: window.document.documentElement.scrollHeight,
        width: window.document.documentElement.scrollWidth,
        scrollTop: window.scrollY,
      }));
      expect(document.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(document.width).toBeLessThanOrEqual(viewport.width);
      expect(document.scrollTop).toBe(0);
    }
  });
}

test('favorites persist and can be removed from their tab', async ({
  page,
}) => {
  await stars(page).first().click();
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey))
    .toBe('["m1"]');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Убрать из избранного' }),
  ).toHaveCount(1);
  await page.getByRole('button', { name: /^Избранное/ }).click();
  await expect(stars(page)).toHaveCount(1);
  await stars(page).first().click();
  await expect(
    page.getByText('Пока нет избранных матчей', { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey))
    .toBe('[]');
});

test('refresh failures preserve matches and retry restores loading', async ({
  page,
}) => {
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 503, body: '' }),
  );
  await page.getByRole('button', { name: 'Обновить матчи' }).click();
  await expect(page.getByText(/HTTP 503/)).toBeVisible();
  await expect(stars(page)).toHaveCount(8);
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ json: fixture }),
  );
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page.getByText(/HTTP 503/)).toHaveCount(0);
  await expect(stars(page)).toHaveCount(8);
});
