import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5992c6',
      contrastText: '#0a2a92',
    },
    secondary: {
      main: '#0a2a92',
    },
  },
});

const PRIORITY_COLORS = { high: 'error', medium: 'warning', low: 'success' };

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [editingItem, setEditingItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortItems = (items) => {
    const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
    return [...items].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed - b.completed;
      const pa = PRIORITY_ORDER[a.priority] ?? 1;
      const pb = PRIORITY_ORDER[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      if (!a.due_date && !b.due_date) return new Date(b.created_at) - new Date(a.created_at);
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(b.due_date) - new Date(a.due_date);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItem, due_date: newDueDate || null, priority: newPriority }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const result = await response.json();
      setData(sortItems([...data, result]));
      setNewItem('');
      setNewDueDate('');
      setNewPriority('medium');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const handleToggleComplete = async (item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/complete`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to update item');
      const updated = await response.json();
      setData(sortItems(data.map(i => i.id === updated.id ? updated : i)));
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
    }
  };

  const handleEditStart = (item) => {
    setEditingItem({ id: item.id, name: item.name, due_date: item.due_date || '', priority: item.priority || 'medium' });
  };

  const handleEditCancel = () => setEditingItem(null);

  const handleEditSave = async () => {
    if (!editingItem.name.trim()) return;
    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingItem.name, due_date: editingItem.due_date || null, priority: editingItem.priority }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      const updated = await response.json();
      setData(sortItems(data.map(item => item.id === updated.id ? updated : item)));
      setEditingItem(null);
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !item.completed) ||
      (filterStatus === 'completed' && item.completed);
    return matchesSearch && matchesFilter;
  });

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'white' }}>
            To Do App
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: 'rgba(255,255,255,0.8)' }}>
            Keep track of your tasks
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: '#0a2a92', mb: 2, fontWeight: 'bold' }}>
            Add New Task
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextField
              label="Task name"
              variant="outlined"
              size="small"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter item name"
              sx={{ flex: 2, minWidth: 180 }}
            />
            <TextField
              label="Due date"
              type="date"
              variant="outlined"
              size="small"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 'aria-label': 'Due date' }}
              sx={{ minWidth: 150 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              sx={{ backgroundColor: '#5992c6', color: '#0a2a92', fontWeight: 'bold', '&:hover': { backgroundColor: '#4a7fb0' } }}
            >
              Add Item
            </Button>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: '#0a2a92', mb: 2, fontWeight: 'bold' }}>
            Tasks
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Search tasks"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}
              inputProps={{ 'aria-label': 'Search tasks' }}
            />
            <ToggleButtonGroup
              value={filterStatus}
              exclusive
              onChange={(e, val) => { if (val !== null) setFilterStatus(val); }}
              size="small"
              aria-label="Filter tasks"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="completed">Completed</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading && <Typography>Loading data...</Typography>}

          {!loading && (
            <List disablePadding>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <ListItem
                    key={item.id}
                    divider
                    sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 1 }}
                  >
                    <Checkbox
                      checked={Boolean(item.completed)}
                      onChange={() => handleToggleComplete(item)}
                      sx={{ color: '#5992c6', '&.Mui-checked': { color: '#5992c6' }, mt: 0.5 }}
                      inputProps={{ 'aria-label': `Mark ${item.name} complete` }}
                    />

                    {editingItem && editingItem.id === item.id ? (
                      <Box sx={{ display: 'flex', gap: 1, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                          size="small"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          placeholder="Task name"
                          sx={{ flex: 2, minWidth: 140 }}
                        />
                        <TextField
                          type="date"
                          size="small"
                          value={editingItem.due_date}
                          onChange={(e) => setEditingItem({ ...editingItem, due_date: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ 'aria-label': 'Due date' }}
                          sx={{ minWidth: 140 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 110 }}>
                          <InputLabel>Priority</InputLabel>
                          <Select
                            label="Priority"
                            value={editingItem.priority}
                            onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value })}
                          >
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                          </Select>
                        </FormControl>
                        <IconButton onClick={handleEditSave} aria-label="Save" sx={{ color: '#5992c6' }}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleEditCancel} aria-label="Cancel" sx={{ color: '#9e9e9e' }}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#9e9e9e' : 'inherit' }}
                          >
                            {item.name}
                          </Typography>
                          {item.due_date && (
                            <Typography variant="caption" sx={{ color: '#555' }}>
                              Due: {item.due_date}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={item.priority || 'medium'}
                            color={PRIORITY_COLORS[item.priority] || 'warning'}
                            size="small"
                          />
                          <IconButton onClick={() => handleEditStart(item)} aria-label="Edit" sx={{ color: '#5992c6' }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(item.id)} aria-label="Delete" sx={{ color: '#d32f2f' }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ py: 2, textAlign: 'center', color: '#9e9e9e' }}>
                  No items found. Add some!
                </Typography>
              )}
            </List>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
