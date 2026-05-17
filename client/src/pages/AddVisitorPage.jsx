import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Grid, Paper, CircularProgress, Divider,
} from '@mui/material';
import { ClearAll, CheckCircleOutline } from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import dayjs from 'dayjs';
import { B, fieldSx } from '../theme';
import { createVisitor } from '../api/visitors';

export default function AddVisitorPage() {
  const sigRef          = useRef(null);
  const sigContainerRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(defaultForm());

  function defaultForm() {
    return {
      title:        '',
      visitDate:    dayjs().format('YYYY-MM-DD'),
      timeIn:       dayjs().format('HH:mm'),
      companyName:  '',
      personOrDept: '',
      phoneNumber:  '',
      timeLeaving:  '',
      remarks:      '',
    };
  }

  useEffect(() => {
    if (sigContainerRef.current) {
      setCanvasWidth(sigContainerRef.current.clientWidth);
    }
  }, []);

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const visitorSignature = sigRef.current?.isEmpty() ? '' : sigRef.current?.toDataURL();
      await createVisitor({ ...form, visitorSignature });
      setSuccess(true);
    } catch (err) {
      console.error('Failed to save visitor:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAnother = () => {
    setForm(defaultForm());
    sigRef.current?.clear();
    setSuccess(false);
  };

  // ── Thank You screen ──
  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', background: B.grey,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        p: 3, textAlign: 'center',
      }}>
        <CheckCircleOutline sx={{ fontSize: 72, color: B.peach, mb: 2 }} />
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: B.blue, mb: 1 }}>
          Thank You!
        </Typography>
        <Typography sx={{ fontSize: 15, color: B.brown, mb: 4 }}>
          Your visit has been registered successfully.
        </Typography>
        <Button
          variant="contained"
          onClick={handleAnother}
          sx={{ background: B.blue, '&:hover': { background: B.lightBlue }, px: 4, py: 1.2 }}
        >
          Register Another Visitor
        </Button>
      </Box>
    );
  }

  // ── Form ──
  return (
    <Box sx={{ minHeight: '100vh', background: B.grey, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${B.blue} 0%, ${B.lightBlue} 100%)`,
        p: { xs: '16px', md: '20px 24px' },
        textAlign: 'center',
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: 18, md: 20 }, mb: '2px' }}>
          Visitor Registration
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
          Alkhorayef Industries – Military Sector
        </Typography>
      </Box>

      {/* Form body */}
      <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: '12px', md: '24px 20px' } }}>
        <Paper elevation={0} sx={{ border: '1px solid #e5e5e5', overflow: 'hidden' }}>

          <Box sx={{ p: '12px 16px', background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
            <Typography sx={{ fontWeight: 700, color: B.blue, fontSize: 13 }}>
              Visitor Information
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2}>

              <Grid item xs={12} md={6}>
                <TextField fullWidth required label="Visitor Name"
                  value={form.title} onChange={set('title')} sx={fieldSx} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth required type="date" label="Visit Date"
                  value={form.visitDate} onChange={set('visitDate')}
                  InputLabelProps={{ shrink: true }} sx={fieldSx} />
              </Grid>

              <Grid item xs={6} md={6}>
                <TextField fullWidth type="time" label="Time In"
                  value={form.timeIn} onChange={set('timeIn')}
                  InputLabelProps={{ shrink: true }} sx={fieldSx} />
              </Grid>

              <Grid item xs={6} md={6}>
                <TextField fullWidth type="time" label="Time Out"
                  value={form.timeLeaving} onChange={set('timeLeaving')}
                  InputLabelProps={{ shrink: true }} sx={fieldSx} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Company Name"
                  value={form.companyName} onChange={set('companyName')} sx={fieldSx} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Person / Department Visiting"
                  value={form.personOrDept} onChange={set('personOrDept')} sx={fieldSx} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone Number"
                  value={form.phoneNumber} onChange={set('phoneNumber')}
                  inputProps={{ inputMode: 'tel' }} sx={fieldSx} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth multiline rows={2} label="Remarks"
                  value={form.remarks} onChange={set('remarks')} sx={fieldSx} />
              </Grid>

              {/* Signature */}
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: B.brown, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                  Visitor Signature
                </Typography>
                <Box ref={sigContainerRef} sx={{
                  border: `2px solid ${B.brown}`,
                  background: '#fff', cursor: 'crosshair', overflow: 'hidden',
                  '&:focus-within': { borderColor: B.peach },
                  touchAction: 'none',
                }}>
                  <SignatureCanvas
                    ref={sigRef}
                    penColor={B.blue}
                    canvasProps={{
                      width: canvasWidth,
                      height: 160,
                      style: { display: 'block' },
                    }}
                  />
                </Box>
                <Button size="small" startIcon={<ClearAll />}
                  onClick={() => sigRef.current?.clear()}
                  sx={{ mt: 0.5, color: B.brown, fontSize: 12 }}>
                  Clear Signature
                </Button>
              </Grid>
            </Grid>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ mt: 3, background: B.blue, '&:hover': { background: B.lightBlue }, py: 1.4, fontSize: 15 }}
            >
              {saving ? 'Saving…' : 'Submit'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
