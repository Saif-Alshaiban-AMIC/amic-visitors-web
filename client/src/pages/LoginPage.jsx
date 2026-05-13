import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { B, fieldSx } from '../theme';
import { login } from '../api/auth';

export default function LoginPage({ onLogin }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      onLogin();
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: B.grey,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, borderRadius: 3, overflow: 'hidden' }}>

        {/* Header */}
        <Box sx={{
          background: `linear-gradient(135deg, ${B.blue} 0%, ${B.lightBlue} 100%)`,
          p: '28px 32px',
          textAlign: 'center',
        }}>
          <Typography sx={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
            AMIC Visitors
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, mt: 0.5 }}>
            Sign in to continue
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: '28px 32px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <TextField
            label="Username"
            value={form.username}
            onChange={set('username')}
            required
            autoFocus
            autoComplete="username"
            sx={fieldSx}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            autoComplete="current-password"
            sx={fieldSx}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
            sx={{ mt: 1, background: B.blue, '&:hover': { background: B.lightBlue }, height: 44 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
