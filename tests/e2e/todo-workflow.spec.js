const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO App — critical user journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await page.waitForSelector('text=To Do App');
  });

  // Journey 1: Add a task without a due date
  test('adds a task without a due date', async ({ page }) => {
    const taskName = `Task-${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(todoPage.taskLocator(taskName)).toBeVisible();
  });

  // Journey 2: Add a task with a due date and priority
  test('adds a task with due date and high priority', async ({ page }) => {
    const taskName = `Priority-${Date.now()}`;
    await todoPage.addTask(taskName, '2099-12-31', 'High');
    await expect(todoPage.taskLocator(taskName)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: taskName }).getByText('high')).toBeVisible();
    await expect(page.locator('li').filter({ hasText: taskName }).getByText('Due: 2099-12-31')).toBeVisible();
  });

  // Journey 3: Edit a task name and due date
  test('edits a task', async ({ page }) => {
    const original = `Edit-${Date.now()}`;
    await todoPage.addTask(original);
    await expect(todoPage.taskLocator(original)).toBeVisible();

    const editButtons = page.locator('li').filter({ hasText: original }).getByLabel('Edit');
    await editButtons.click();
    const nameInput = page.getByDisplayValue(original);
    await nameInput.clear();
    await nameInput.fill('Updated Task Name');
    await page.getByLabel('Save').click();

    await expect(page.getByText('Updated Task Name')).toBeVisible();
  });

  // Journey 4: Mark a task complete — it moves toward the bottom
  test('marks a task complete and applies strikethrough', async ({ page }) => {
    const taskName = `Complete-${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(todoPage.taskLocator(taskName)).toBeVisible();

    await page.getByLabel(`Mark ${taskName} complete`).click();

    await expect(
      page.locator('li').filter({ hasText: taskName }).locator('p').first()
    ).toHaveCSS('text-decoration', /line-through/);
  });

  // Journey 5: Delete a task
  test('deletes a task', async ({ page }) => {
    const taskName = `Delete-${Date.now()}`;
    await todoPage.addTask(taskName);
    await expect(todoPage.taskLocator(taskName)).toBeVisible();

    await page.locator('li').filter({ hasText: taskName }).getByLabel('Delete').click();

    await expect(page.getByText(taskName)).not.toBeVisible();
  });

  // Journey 6: Search filters visible tasks
  test('filters tasks by search query', async ({ page }) => {
    const unique = `Searchable-${Date.now()}`;
    await todoPage.addTask(unique);
    await expect(todoPage.taskLocator(unique)).toBeVisible();

    await todoPage.search(unique);

    await expect(todoPage.taskLocator(unique)).toBeVisible();
    // Seeded items should be hidden
    await expect(page.getByText('Item 1')).not.toBeVisible();
  });

  // Journey 7: Filter toggle shows only active or completed tasks
  test('filter toggle shows only active tasks', async ({ page }) => {
    const active = `Active-${Date.now()}`;
    const done = `Done-${Date.now()}`;
    await todoPage.addTask(active);
    await todoPage.addTask(done);
    await page.getByLabel(`Mark ${done} complete`).click();

    await todoPage.setFilter('Active');

    await expect(todoPage.taskLocator(active)).toBeVisible();
    await expect(page.getByText(done)).not.toBeVisible();
  });

  // Journey 8: Completed filter shows only completed tasks
  test('filter toggle shows only completed tasks', async ({ page }) => {
    const active = `StillActive-${Date.now()}`;
    const done = `AlreadyDone-${Date.now()}`;
    await todoPage.addTask(active);
    await todoPage.addTask(done);
    await page.getByLabel(`Mark ${done} complete`).click();

    await todoPage.setFilter('Completed');

    await expect(todoPage.taskLocator(done)).toBeVisible();
    await expect(page.getByText(active)).not.toBeVisible();
  });
});
