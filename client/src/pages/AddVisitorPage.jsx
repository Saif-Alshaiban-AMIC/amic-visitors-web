import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Grid, Paper, CircularProgress, Divider,
} from '@mui/material';
import { ArrowBack, Save, ClearAll } from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import dayjs from 'dayjs';
import { B, fieldSx } from '../theme';
import { createVisitor } from '../api/visitors';

export default function AddVisitorPage() {
  const navigate = useNavigate();
  const sigRef        = useRef(null);
  const sigContainerRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(700);

  useEffect(() => {
    if (sigContainerRef.current) {
      setCanvasWidth(sigContainerRef.current.clientWidth);
    }
  }, []);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:        '',
    visitDate:    dayjs().format('YYYY-MM-DD'),
    timeIn:       dayjs().format('HH:mm'),
    companyName:  '',
    personOrDept: '',
    phoneNumber:  '',
    timeLeaving:  '',
    remarks:      '',
  });

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const visitorSignature = sigRef.current?.isEmpty() ? '' : sigRef.current?.toDataURL();
      await createVisitor({ ...form, visitorSignature });
      navigate('/');
    } catch (err) {
      console.error('Failed to save visitor:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: B.grey, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${B.blue} 0%, ${B.lightBlue} 100%)`,
        p: '20px 24px', borderRadius: '12px 12px 0 0',
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18, mb: '2px' }}>
            ➕ Add Visitor
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Alkhorayef Industries – Military Sector &nbsp;|&nbsp; HR View
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' } }}
        >
          Back to Records
        </Button>
      </Box>

      {/* ── Form ── */}
      <Box component="form" onSubmit={handleSubmit} sx={{ p: '24px 20px' }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e5e5e5', overflow: 'hidden' }}>

          {/* Form header */}
          <Box sx={{ p: '14px 20px', background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
            <Typography sx={{ fontWeight: 700, color: B.blue, fontSize: 14 }}>
              Visitor Information
            </Typography>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={2.5}>

              {/* Visitor Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth required
                  label="Visitor Name"
                  value={form.title}
                  onChange={set('title')}
                  sx={fieldSx}
                />
              </Grid>

              {/* Visit Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth required
                  type="date"
                  label="Visit Date"
                  value={form.visitDate}
                  onChange={set('visitDate')}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Time In */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time In"
                  value={form.timeIn}
                  onChange={set('timeIn')}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Time Out */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time Out"
                  value={form.timeLeaving}
                  onChange={set('timeLeaving')}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Company */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={form.companyName}
                  onChange={set('companyName')}
                  sx={fieldSx}
                />
              </Grid>

              {/* Person / Dept */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Person / Department Visiting"
                  value={form.personOrDept}
                  onChange={set('personOrDept')}
                  sx={fieldSx}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                  sx={fieldSx}
                />
              </Grid>

              {/* Remarks */}
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={3}
                  label="Remarks"
                  value={form.remarks}
                  onChange={set('remarks')}
                  sx={fieldSx}
                />
              </Grid>

              {/* Signature pad */}
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: B.brown, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                  Visitor Signature
                </Typography>
                <Box ref={sigContainerRef} sx={{
                  border: `2px solid ${B.brown}`, borderRadius: 2,
                  background: '#fff', cursor: 'crosshair', overflow: 'hidden',
                  '&:focus-within': { borderColor: B.peach },
                }}>
                  <SignatureCanvas
                    ref={sigRef}
                    penColor={B.blue}
                    canvasProps={{
                      width: canvasWidth,
                      height: 140,
                      style: { display: 'block' },
                    }}
                  />
                </Box>
                <Button
                  size="small"
                  startIcon={<ClearAll />}
                  onClick={() => sigRef.current?.clear()}
                  sx={{ mt: 1, color: B.brown, fontSize: 12 }}
                >
                  Clear Signature
                </Button>
              </Grid>
            </Grid>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3.5, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ borderColor: '#ddd', color: B.blue, background: B.grey, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                sx={{ background: B.peach, '&:hover': { background: '#e09e85' }, px: 4 }}
              >
                {saving ? 'Saving…' : 'Save Visitor'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
