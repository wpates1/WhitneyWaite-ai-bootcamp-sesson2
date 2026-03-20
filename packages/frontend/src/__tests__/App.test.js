import React, { act } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const mockItems = [
  { id: 1, name: 'High Priority Task', due_date: '2099-06-01', completed: 0, priority: 'high', created_at: '2023-01-01T00:00:00.000Z' },
  { id: 2, name: 'Low Priority Task', due_date: null, completed: 0, priority: 'low', created_at: '2023-01-02T00:00:00.000Z' },
];

const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockItems));
  }),

  rest.post('/api/items', (req, res, ctx) => {
    const { name, due_date, priority } = req.body;
    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }
    return res(ctx.status(201), ctx.json({
      id: 3,
      name,
      due_date: due_date || null,
      priority: priority || 'medium',
      completed: 0,
      created_at: new Date().toISOString(),
    }));
  }),

  rest.put('/api/items/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { name, due_date, priority } = req.body;
    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }
    return res(ctx.status(200), ctx.json({
      id: parseInt(id), name, due_date: due_date || null,
      priority: priority || 'medium', completed: 0, created_at: '2023-01-01T00:00:00.000Z',
    }));
  }),

  rest.patch('/api/items/:id/complete', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.status(200), ctx.json({
      id: parseInt(id), name: 'High Priority Task', due_date: '2099-06-01',
      priority: 'high', completed: 1, created_at: '2023-01-01T00:00:00.000Z',
    }));
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully', id: parseInt(req.params.id) }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => { render(<App />); });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => { render(<App />); });
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.getByText('Low Priority Task')).toBeInTheDocument();
    });
  });

  test('displays priority chip for each item', async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });
  });

  test('displays due date for items that have one', async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByText('Due: 2099-06-01')).toBeInTheDocument();
    });
  });

  test('adds a new item', async () => {
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.queryByText('Loading data...')).not.toBeInTheDocument());

    await act(async () => { await user.type(screen.getByPlaceholderText('Enter item name'), 'New Task'); });
    await act(async () => { await user.click(screen.getByText('Add Item')); });

    await waitFor(() => expect(screen.getByText('New Task')).toBeInTheDocument());
  });

  test('toggles task completion', async () => {
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.getByText('High Priority Task')).toBeInTheDocument());

    const checkboxes = screen.getAllByRole('checkbox');
    await act(async () => { await user.click(checkboxes[0]); });

    await waitFor(() => {
      const updatedItem = screen.getByText('High Priority Task');
      expect(updatedItem).toHaveStyle('text-decoration: line-through');
    });
  });

  test('edits an existing item', async () => {
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.getByText('High Priority Task')).toBeInTheDocument());

    const editButtons = screen.getAllByLabelText('Edit');
    await act(async () => { await user.click(editButtons[0]); });

    const nameInput = screen.getByDisplayValue('High Priority Task');
    await act(async () => {
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Task');
    });

    await act(async () => { await user.click(screen.getByLabelText('Save')); });

    await waitFor(() => expect(screen.getByText('Updated Task')).toBeInTheDocument());
  });

  test('cancels editing an item', async () => {
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.getByText('High Priority Task')).toBeInTheDocument());

    const editButtons = screen.getAllByLabelText('Edit');
    await act(async () => { await user.click(editButtons[0]); });
    await act(async () => { await user.click(screen.getByLabelText('Cancel')); });

    await waitFor(() => {
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.queryByLabelText('Save')).not.toBeInTheDocument();
    });
  });

  test('filters tasks by search query', async () => {
    const user = userEvent.setup();
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.getByText('High Priority Task')).toBeInTheDocument());

    await act(async () => { await user.type(screen.getByLabelText('Search tasks'), 'High'); });

    await waitFor(() => {
      expect(screen.getByText('High Priority Task')).toBeInTheDocument();
      expect(screen.queryByText('Low Priority Task')).not.toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    server.use(rest.get('/api/items', (req, res, ctx) => res(ctx.status(500))));
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument());
  });

  test('shows empty state when no items', async () => {
    server.use(rest.get('/api/items', (req, res, ctx) => res(ctx.status(200), ctx.json([]))));
    await act(async () => { render(<App />); });
    await waitFor(() => expect(screen.getByText('No items found. Add some!')).toBeInTheDocument());
  });
});
