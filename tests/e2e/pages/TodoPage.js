class TodoPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTask(name, dueDate = '', priority = '') {
    await this.page.getByPlaceholder('Enter item name').fill(name);
    if (dueDate) {
      await this.page.locator('input[type="date"]').first().fill(dueDate);
    }
    if (priority) {
      await this.page.getByLabel('Priority').first().click();
      await this.page.getByRole('option', { name: priority, exact: true }).click();
    }
    await this.page.getByRole('button', { name: 'Add Item' }).click();
  }

  async getTaskNames() {
    await this.page.waitForSelector('[aria-label*="Mark"][aria-label*="complete"]');
    const items = await this.page.locator('ul li').all();
    const names = [];
    for (const item of items) {
      const text = await item.locator('p').first().innerText().catch(() => '');
      if (text) names.push(text.trim());
    }
    return names;
  }

  async toggleComplete(name) {
    await this.page.getByLabel(`Mark ${name} complete`).click();
  }

  async editTask(currentName, newName, newDueDate = '', newPriority = '') {
    await this.page.getByLabel('Edit').filter({ has: this.page.locator(`xpath=ancestor::li[.//p[text()="${currentName}"]]`) }).first().click();
    const nameInput = this.page.getByDisplayValue(currentName);
    await nameInput.clear();
    await nameInput.fill(newName);
    if (newDueDate) {
      await this.page.locator('input[type="date"]').nth(1).fill(newDueDate);
    }
    if (newPriority) {
      await this.page.getByLabel('Priority').last().click();
      await this.page.getByRole('option', { name: newPriority, exact: true }).click();
    }
    await this.page.getByLabel('Save').click();
  }

  async deleteTask(name) {
    const listItem = this.page.locator('li').filter({ hasText: name });
    await listItem.getByLabel('Delete').click();
  }

  async search(query) {
    await this.page.getByLabel('Search tasks').fill(query);
  }

  async setFilter(filter) {
    await this.page.getByRole('button', { name: filter, exact: true }).click();
  }

  taskLocator(name) {
    return this.page.locator('li').filter({ hasText: name });
  }
}

module.exports = { TodoPage };
