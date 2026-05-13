import { createTheme } from '@mui/material/styles';

export const B = {
  blue:      '#293940',
  lightBlue: '#3E5159',
  brown:     '#8C8979',
  peach:     '#F2B29B',
  grey:      '#F2F2F2',
  danger:    '#e53935',
  dangerHov: '#c62828',
};

export const theme = createTheme({
  palette: {
    primary:    { main: B.blue },
    secondary:  { main: B.peach },
    error:      { main: B.danger },
    background: { default: B.grey, paper: '#fff' },
  },
  typography: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, minHeight: 40 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset':              { borderColor: B.brown },
    '&:hover fieldset':        { borderColor: B.lightBlue },
    '&.Mui-focused fieldset':  { borderColor: B.peach },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: B.peach },
};
