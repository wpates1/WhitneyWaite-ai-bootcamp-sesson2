# UI Guidelines

## Overview

This document defines the UI standards for this project. All frontend components should use **Material UI (MUI)** and adhere to the color palette and component styles defined here.

## Color Palette

| Role            | Hex       | Usage                                      |
|-----------------|-----------|--------------------------------------------|
| Primary Blue    | `#5992c6` | Button backgrounds, highlights, borders    |
| Deep Navy       | `#0a2a92` | Button text, headings, active states       |

## Technology

- **Component Library**: [Material UI (MUI)](https://mui.com/) v5+
- Install: `npm install @mui/material @emotion/react @emotion/styled`

## Buttons

Use MUI `<Button>` with a custom `sx` prop (or theme override) to apply brand colors.

```jsx
import Button from '@mui/material/Button';

<Button
  variant="contained"
  sx={{
    backgroundColor: '#5992c6',
    color: '#0a2a92',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#4a7fb0',
    },
  }}
>
  Add Item
</Button>
```

| Property           | Value     |
|--------------------|-----------|
| Background color   | `#5992c6` |
| Text color         | `#0a2a92` |
| Hover background   | `#4a7fb0` (10% darker) |
| Variant            | `contained` |

## Typography

Use MUI `<Typography>` for all headings and body text.

```jsx
import Typography from '@mui/material/Typography';

// Page heading
<Typography variant="h4" sx={{ color: '#0a2a92', fontWeight: 'bold' }}>
  To Do App
</Typography>

// Sub-heading
<Typography variant="h6" sx={{ color: '#0a2a92' }}>
  Add New Item
</Typography>
```

## Form Inputs

Use MUI `<TextField>` with the `outlined` variant. Apply the primary color to focused outlines via `sx`.

```jsx
import TextField from '@mui/material/TextField';

<TextField
  label="Task name"
  variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#5992c6',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#0a2a92',
    },
  }}
/>
```

## Cards / Sections

Wrap content sections in MUI `<Card>` or `<Paper>` components.

```jsx
import Paper from '@mui/material/Paper';

<Paper elevation={2} sx={{ padding: 2, borderRadius: 2 }}>
  {/* section content */}
</Paper>
```

## MUI Theme Configuration

Centralize the color palette in an MUI theme so all components inherit brand colors automatically.

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

// Wrap your app:
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

With this theme in place, MUI `<Button variant="contained" color="primary">` will automatically use `#5992c6` as the background and `#0a2a92` as the text color.

## Icon Buttons (Delete / Edit)

For destructive or secondary actions, use MUI `<IconButton>` with explicit color overrides.

```jsx
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Edit
<IconButton aria-label="edit" sx={{ color: '#5992c6' }}>
  <EditIcon />
</IconButton>

// Delete
<IconButton aria-label="delete" sx={{ color: '#d32f2f' }}>
  <DeleteIcon />
</IconButton>
```

## General Principles

- Always use MUI components; do not create custom HTML elements where an MUI equivalent exists.
- Use `sx` props for one-off style overrides; use the MUI theme for global, repeated styles.
- Maintain sufficient contrast between background and text colors (WCAG AA minimum).
- Use `#0a2a92` (deep navy) for primary text to ensure readability against light backgrounds and the `#5992c6` button background.
