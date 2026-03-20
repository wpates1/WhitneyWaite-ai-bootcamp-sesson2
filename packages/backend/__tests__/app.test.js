const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

const createItem = async (name = 'Test Item', due_date = null, priority = 'medium') => {
  const response = await request(app)
    .post('/api/items')
    .send({ name, due_date, priority })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items with expected structure', async () => {
      const response = await request(app).get('/api/items');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('priority');
    });

    it('should return incomplete items before completed items', async () => {
      const active = await createItem('Active Task');
      const completed = await createItem('Completed Task');
      await request(app).patch(`/api/items/${completed.id}/complete`);

      const response = await request(app).get('/api/items');
      const items = response.body;
      const activeIdx = items.findIndex(i => i.id === active.id);
      const completedIdx = items.findIndex(i => i.id === completed.id);
      expect(activeIdx).toBeLessThan(completedIdx);
    });

    it('should sort high priority before medium before low', async () => {
      const low = await createItem('Low Task', null, 'low');
      const high = await createItem('High Task', null, 'high');
      const medium = await createItem('Medium Task', null, 'medium');

      const response = await request(app).get('/api/items');
      const items = response.body.filter(i => [low.id, high.id, medium.id].includes(i.id));
      expect(items[0].id).toBe(high.id);
      expect(items[1].id).toBe(medium.id);
      expect(items[2].id).toBe(low.id);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item with defaults', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Default Item' })
        .set('Accept', 'application/json');
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Default Item');
      expect(response.body.due_date).toBeNull();
      expect(response.body.completed).toBe(0);
      expect(response.body.priority).toBe('medium');
    });

    it('should create an item with due date and priority', async () => {
      const newItem = { name: 'Priority Task', due_date: '2099-06-15', priority: 'high' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');
      expect(response.status).toBe(201);
      expect(response.body.due_date).toBe('2099-06-15');
      expect(response.body.priority).toBe('high');
    });

    it('should default to medium priority for unknown priority value', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Unknown Priority', priority: 'critical' })
        .set('Accept', 'application/json');
      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('medium');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app).post('/api/items').send({}).set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app).post('/api/items').send({ name: '' }).set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update name, due date, and priority', async () => {
      const item = await createItem('Original');
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'Updated', due_date: '2099-08-20', priority: 'high' })
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated');
      expect(response.body.due_date).toBe('2099-08-20');
      expect(response.body.priority).toBe('high');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).put('/api/items/999999').send({ name: 'Ghost' }).set('Accept', 'application/json');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).put('/api/items/abc').send({ name: 'Bad' }).set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid item ID is required');
    });

    it('should return 400 if name is missing on update', async () => {
      const item = await createItem('Name Check');
      const response = await request(app).put(`/api/items/${item.id}`).send({ name: '' }).set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('PATCH /api/items/:id/complete', () => {
    it('should toggle completion from false to true', async () => {
      const item = await createItem('Toggle Me');
      expect(item.completed).toBe(0);

      const response = await request(app).patch(`/api/items/${item.id}/complete`);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    it('should toggle completion from true back to false', async () => {
      const item = await createItem('Toggle Back');
      await request(app).patch(`/api/items/${item.id}/complete`);
      const response = await request(app).patch(`/api/items/${item.id}/complete`);
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(0);
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).patch('/api/items/999999/complete');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).patch('/api/items/abc/complete');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid item ID is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('To Be Deleted');
      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const again = await request(app).delete(`/api/items/${item.id}`);
      expect(again.status).toBe(404);
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid item ID is required');
    });
  });
});
