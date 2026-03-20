const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) db.close();
});

const createItem = async (fields = {}) => {
  const response = await request(app)
    .post('/api/items')
    .send({ name: 'Integration Test Item', priority: 'medium', ...fields })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

describe('TODO API — Integration Tests', () => {
  describe('Full CRUD lifecycle', () => {
    it('creates, reads, updates, and deletes a task', async () => {
      // Create
      const created = await createItem({ name: 'Lifecycle Task', due_date: '2099-01-01', priority: 'low' });
      expect(created.name).toBe('Lifecycle Task');
      expect(created.due_date).toBe('2099-01-01');
      expect(created.priority).toBe('low');
      expect(created.completed).toBe(0);

      // Read — item appears in list
      const list = await request(app).get('/api/items');
      expect(list.status).toBe(200);
      const found = list.body.find(i => i.id === created.id);
      expect(found).toBeDefined();

      // Update
      const updated = await request(app)
        .put(`/api/items/${created.id}`)
        .send({ name: 'Updated Lifecycle Task', due_date: '2099-06-15', priority: 'high' });
      expect(updated.status).toBe(200);
      expect(updated.body.name).toBe('Updated Lifecycle Task');
      expect(updated.body.priority).toBe('high');

      // Toggle complete
      const toggled = await request(app).patch(`/api/items/${created.id}/complete`);
      expect(toggled.status).toBe(200);
      expect(toggled.body.completed).toBe(1);

      // Toggle back
      const toggledBack = await request(app).patch(`/api/items/${created.id}/complete`);
      expect(toggledBack.status).toBe(200);
      expect(toggledBack.body.completed).toBe(0);

      // Delete
      const deleted = await request(app).delete(`/api/items/${created.id}`);
      expect(deleted.status).toBe(200);
      expect(deleted.body.message).toBe('Item deleted successfully');

      // Confirm gone from list
      const afterDelete = await request(app).get('/api/items');
      expect(afterDelete.body.find(i => i.id === created.id)).toBeUndefined();
    });
  });

  describe('Sort order', () => {
    it('returns tasks sorted: incomplete before complete, high before low priority, no due date at bottom', async () => {
      const high = await createItem({ name: 'High Task', priority: 'high', due_date: null });
      const low = await createItem({ name: 'Low Task', priority: 'low', due_date: null });
      const withDate = await createItem({ name: 'Dated Task', priority: 'high', due_date: '2099-12-31' });
      const done = await createItem({ name: 'Done Task', priority: 'high' });
      await request(app).patch(`/api/items/${done.id}/complete`);

      const response = await request(app).get('/api/items');
      const items = response.body;

      const doneIdx = items.findIndex(i => i.id === done.id);
      const activeIdxes = [high.id, low.id, withDate.id].map(id => items.findIndex(i => i.id === id));
      activeIdxes.forEach(idx => expect(idx).toBeLessThan(doneIdx));

      const highIdx = items.findIndex(i => i.id === high.id);
      const lowIdx = items.findIndex(i => i.id === low.id);
      expect(highIdx).toBeLessThan(lowIdx);

      const datedIdx = items.findIndex(i => i.id === withDate.id);
      const noDueDateHighIdx = items.findIndex(i => i.id === high.id);
      expect(datedIdx).toBeLessThan(noDueDateHighIdx);
    });
  });

  describe('Validation', () => {
    it('rejects creating an item without a name', async () => {
      const response = await request(app).post('/api/items').send({ priority: 'high' });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });

    it('rejects updating an item with an empty name', async () => {
      const item = await createItem({ name: 'To Validate' });
      const response = await request(app).put(`/api/items/${item.id}`).send({ name: '  ' });
      expect(response.status).toBe(400);
    });

    it('returns 404 for operations on non-existent items', async () => {
      const get = await request(app).put('/api/items/999999').send({ name: 'Ghost' });
      expect(get.status).toBe(404);

      const patch = await request(app).patch('/api/items/999999/complete');
      expect(patch.status).toBe(404);

      const del = await request(app).delete('/api/items/999999');
      expect(del.status).toBe(404);
    });
  });
});
