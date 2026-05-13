import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Checkbox, IconButton, Tooltip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Modal, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Chip, CircularProgress,
} from '@mui/material';
import {
  Refresh, FileDownload, Delete, Add,
  ArrowUpward, ArrowDownward, UnfoldMore, DeleteOutline, Logout,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { B } from '../theme';
import { getVisitors, deleteOne, deleteMany } from '../api/visitors';

const PAGE_SIZE = 20;

const getDateStr = v => {
  const raw = v.visitDate || v.createdAt || '';
  return raw ? dayjs(raw).format('YYYY-MM-DD') : '';
};
const fmtDate = raw =>
  raw ? dayjs(raw).format('DD MMM YYYY') : '—';

const COLS = [
  { id: 'visitDate',    label: 'Date',         sortable: true },
  { id: 'timeIn',       label: 'Time In',       sortable: true },
  { id: 'title',        label: 'Visitor Name',  sortable: true },
  { id: 'companyName',  label: 'Company',       sortable: true },
  { id: 'personOrDept', label: 'Visiting',      sortable: true },
  { id: 'phoneNumber',  label: 'Phone',         sortable: false },
  { id: 'timeLeaving',  label: 'Time Out',      sortable: true },
  { id: 'remarks',      label: 'Remarks',       sortable: false },
  { id: '_sig',         label: 'Signature',     sortable: false },
  { id: '_del',         label: '',              sortable: false },
];

function getPageNums(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, current - 2);
  let end   = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function VisitorsPage({ onLogout }) {
  const navigate = useNavigate();

  const [all,       setAll]       = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [sortCol,   setSortCol]   = useState('visitDate');
  const [sortDir,   setSortDir]   = useState('desc');
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState(new Set());
  const [sigSrc,    setSigSrc]    = useState('');
  const [delModal,  setDelModal]  = useState({ open: false, ids: [], msg: '' });
  const [deleting,  setDeleting]  = useState(false);

  // ── Load ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVisitors();
      setAll(data);
      setSelected(new Set());
    } catch (err) {
      console.error('Failed to load visitors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Stats ──
  const stats = useMemo(() => {
    const today    = dayjs().format('YYYY-MM-DD');
    const weekAgo  = dayjs().subtract(7,  'day').format('YYYY-MM-DD');
    const monthAgo = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    return {
      total: all.length,
      today: all.filter(v => getDateStr(v) === today).length,
      week:  all.filter(v => getDateStr(v) >= weekAgo).length,
      month: all.filter(v => getDateStr(v) >= monthAgo).length,
    };
  }, [all]);

  // ── Filter + Sort ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = all.filter(v => {
      const d = getDateStr(v);
      const matchQ    = !q || [v.title, v.companyName, v.personOrDept, v.phoneNumber, v.remarks]
        .some(f => (f || '').toLowerCase().includes(q));
      const matchFrom = !dateFrom || d >= dateFrom;
      const matchTo   = !dateTo   || d <= dateTo;
      return matchQ && matchFrom && matchTo;
    });

    result.sort((a, b) => {
      let av = '', bv = '';
      if (sortCol === 'visitDate') {
        av = getDateStr(a); bv = getDateStr(b);
      } else {
        av = (a[sortCol] || ''); bv = (b[sortCol] || '');
      }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return result;
  }, [all, search, dateFrom, dateTo, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Sort handler ──
  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
    setPage(1);
  };

  // ── Selection ──
  const toggleRow = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pageIds  = slice.map(v => v._id);
    const allSel   = pageIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      allSel ? pageIds.forEach(id => next.delete(id))
             : pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const pageIds   = slice.map(v => v._id);
  const allPageSel  = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const somePageSel = pageIds.some(id => selected.has(id));

  // ── Delete ──
  const openDelModal  = (ids, msg) => setDelModal({ open: true, ids, msg });
  const closeDelModal = ()          => setDelModal({ open: false, ids: [], msg: '' });

  const handleDelete = async () => {
    const ids = [...delModal.ids];
    closeDelModal();
    setDeleting(true);
    try {
      if (ids.length === 1) await deleteOne(ids[0]);
      else                  await deleteMany(ids);
      setAll(prev => prev.filter(v => !ids.includes(v._id)));
      setSelected(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed. Check console for details.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Export CSV ──
  const exportCsv = () => {
    if (!filtered.length) return;
    const today   = dayjs().format('YYYY-MM-DD');
    const headers = ['#', 'Date', 'Time In', 'Visitor Name', 'Company', 'Person/Dept', 'Phone', 'Time Out', 'Remarks'];
    const rows    = filtered.map((v, i) => [
      i + 1, getDateStr(v), v.timeIn, v.title, v.companyName,
      v.personOrDept, v.phoneNumber, v.timeLeaving, v.remarks,
    ].map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(','));
    const csv  = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `AMIC_Visitors_${today}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Sort icon helper ──
  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <UnfoldMore sx={{ fontSize: 14, opacity: 0.5, ml: 0.5, verticalAlign: 'middle' }} />;
    return sortDir === 'asc'
      ? <ArrowUpward   sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
      : <ArrowDownward sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />;
  };

  // ── Shared header cell styles ──
  const thSx = (sortable) => ({
    color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    background: 'transparent',
    cursor: sortable ? 'pointer' : 'default',
    userSelect: 'none',
    '&:hover': sortable ? { background: B.lightBlue } : {},
  });

  return (
    <Box sx={{ minHeight: '100vh', background: B.grey, fontFamily: "'Segoe UI', sans-serif", p: 0 }}>

      {/* ── Header ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${B.blue} 0%, ${B.lightBlue} 100%)`,
        p: '20px 24px', borderRadius: '12px 12px 0 0',
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18, mb: '2px' }}>
            📋 Visitor Records
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Alkhorayef Industries – Military Sector &nbsp;|&nbsp; HR View
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selected.size > 0 && (
            <Button
              variant="contained"
              startIcon={<Delete />}
              onClick={() => openDelModal(
                Array.from(selected),
                `Are you sure you want to delete ${selected.size} visitor record${selected.size > 1 ? 's' : ''}?`
              )}
              sx={{ background: B.danger, '&:hover': { background: B.dangerHov } }}
            >
              Delete Selected ({selected.size})
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => navigate('/add')}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' } }}
          >
            Add Visitor
          </Button>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Refresh />}
            onClick={load}
            disabled={loading}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' } }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={exportCsv}
            sx={{ background: B.peach, '&:hover': { background: '#e09e85' } }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={onLogout}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' } }}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* ── Stats bar ── */}
      <Box sx={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        p: '10px 20px', display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {[
          { num: stats.total, label: 'Total',      accent: false },
          { num: stats.today, label: 'Today',      accent: true  },
          { num: stats.week,  label: 'This Week',  accent: false },
          { num: stats.month, label: 'This Month', accent: false },
        ].map((s, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {i > 0 && <Box sx={{ width: 1, height: 28, background: '#e5e5e5' }} />}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.accent ? B.peach : B.blue, lineHeight: 1 }}>
                {loading ? '—' : s.num}
              </Typography>
              <Typography sx={{ fontSize: 11, color: B.brown, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {s.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Toolbar ── */}
      <Box sx={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        p: '14px 20px', display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <TextField
          size="small"
          placeholder="🔍 Search name, company, department…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          sx={{
            flex: 1, minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset':             { borderColor: B.brown },
              '&:focus-within fieldset':{ borderColor: B.peach },
            },
          }}
        />
        <TextField
          type="date" size="small" value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          title="From date"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: B.brown }, '&:focus-within fieldset': { borderColor: B.peach } } }}
        />
        <TextField
          type="date" size="small" value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(1); }}
          title="To date"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: B.brown }, '&:focus-within fieldset': { borderColor: B.peach } } }}
        />
        <Button
          variant="outlined"
          onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPage(1); }}
          sx={{ color: B.blue, borderColor: '#ddd', background: B.grey, '&:hover': { background: '#e5e5e5' } }}
        >
          ✕ Clear
        </Button>
      </Box>

      {/* ── Table ── */}
      <Box sx={{ background: '#fff', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 920, fontSize: 13 }}>

            {/* Head */}
            <TableHead>
              <TableRow sx={{ background: `linear-gradient(135deg, ${B.blue} 0%, ${B.lightBlue} 100%)` }}>

                {/* Select-all checkbox */}
                <TableCell padding="checkbox" sx={{ background: 'transparent', borderBottom: 'none' }}>
                  <Checkbox
                    size="small"
                    checked={allPageSel}
                    indeterminate={!allPageSel && somePageSel}
                    onChange={toggleAll}
                    sx={{ color: 'rgba(255,255,255,0.6)', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: B.peach } }}
                  />
                </TableCell>

                {/* Row # */}
                <TableCell sx={{ ...thSx(false), width: 40, borderBottom: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                  #
                </TableCell>

                {/* Data columns */}
                {COLS.map(col => (
                  <TableCell
                    key={col.id}
                    onClick={() => col.sortable && handleSort(col.id)}
                    sx={{ ...thSx(col.sortable), borderBottom: 'none' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {col.label}
                      {col.sortable && <SortIcon col={col.id} />}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* Body */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} sx={{ textAlign: 'center', py: 8, border: 'none' }}>
                    <CircularProgress sx={{ color: B.peach, mb: 1.5 }} />
                    <Typography sx={{ color: B.brown, fontSize: 13 }}>Loading…</Typography>
                  </TableCell>
                </TableRow>
              ) : !filtered.length ? (
                <TableRow>
                  <TableCell colSpan={12} sx={{ textAlign: 'center', py: 8, border: 'none' }}>
                    <Typography sx={{ fontSize: 36, mb: 1 }}>📋</Typography>
                    <Typography sx={{ fontWeight: 600, color: B.blue, mb: 0.5 }}>No visitors found</Typography>
                    <Typography sx={{ fontSize: 13, color: B.brown }}>Try adjusting your search or date filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : slice.map((v, i) => {
                const isSel   = selected.has(v._id);
                const isToday = getDateStr(v) === dayjs().format('YYYY-MM-DD');
                return (
                  <TableRow
                    key={v._id}
                    sx={{
                      borderBottom: '1px solid #f5f5f5',
                      background: isSel ? 'rgba(229,57,53,0.05)' : 'transparent',
                      '&:hover': { background: isSel ? 'rgba(229,57,53,0.08)' : 'rgba(242,178,155,0.07)' },
                      transition: 'background .12s',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isSel}
                        onChange={() => toggleRow(v._id)}
                        sx={{ '&.Mui-checked': { color: B.danger } }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: '#ccc', fontSize: 12, textAlign: 'center', userSelect: 'none' }}>
                      {(safePage - 1) * PAGE_SIZE + i + 1}
                    </TableCell>

                    {/* Date badge */}
                    <TableCell>
                      <Chip
                        label={fmtDate(v.visitDate || v.createdAt)}
                        size="small"
                        sx={isToday
                          ? { background: 'rgba(242,178,155,0.2)', color: '#c47d5b', fontWeight: 600, fontSize: 11 }
                          : { background: B.grey, color: B.brown, fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: B.brown, fontSize: 12 }}>{v.timeIn       || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: B.blue }}>  {v.title        || '—'}</TableCell>
                    <TableCell sx={{ color: B.blue }}>                   {v.companyName  || '—'}</TableCell>
                    <TableCell sx={{ color: B.blue }}>                   {v.personOrDept || '—'}</TableCell>
                    <TableCell sx={{ color: B.brown, fontSize: 12 }}>{v.phoneNumber  || '—'}</TableCell>
                    <TableCell sx={{ color: B.brown, fontSize: 12 }}>{v.timeLeaving  || '—'}</TableCell>

                    {/* Remarks (truncated) */}
                    <TableCell
                      title={v.remarks}
                      sx={{ color: B.brown, fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {v.remarks || '—'}
                    </TableCell>

                    {/* Signature thumbnail */}
                    <TableCell>
                      {v.visitorSignature ? (
                        <Box
                          component="img"
                          src={v.visitorSignature}
                          alt="sig"
                          onClick={() => setSigSrc(v.visitorSignature)}
                          sx={{
                            height: 32, border: '1px solid #e5e5e5', borderRadius: 1,
                            background: '#fafafa', cursor: 'pointer', display: 'block',
                            '&:hover': { borderColor: B.peach },
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: B.brown, fontSize: 12 }}>—</Typography>
                      )}
                    </TableCell>

                    {/* Delete row button */}
                    <TableCell sx={{ width: 48, pr: 1 }}>
                      <Tooltip title="Delete record">
                        <IconButton
                          size="small"
                          onClick={() => openDelModal(
                            [v._id],
                            `Are you sure you want to delete the record for "${v.title}"?`
                          )}
                          sx={{
                            color: B.danger, border: '1px solid #ffcdd2', borderRadius: 1.5,
                            width: 30, height: 30, fontSize: 15,
                            '&:hover': { background: B.danger, color: '#fff', borderColor: B.danger },
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Pagination ── */}
        {filtered.length > 0 && (
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            px: 2.5, py: 1.5, borderTop: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 1,
          }}>
            <Typography sx={{ fontSize: 13, color: B.brown }}>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} visitors
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <PgBtn onClick={() => setPage(p => p - 1)} disabled={safePage === 1}>‹</PgBtn>
              {getPageNums(safePage, totalPages).map(p => (
                <PgBtn key={p} active={p === safePage} onClick={() => setPage(p)}>{p}</PgBtn>
              ))}
              <PgBtn onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages}>›</PgBtn>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Signature Modal ── */}
      <Modal open={!!sigSrc} onClose={() => setSigSrc('')}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: '#fff', borderRadius: 3, p: 2.5, maxWidth: 420, width: '90%',
          boxShadow: '0 16px 48px rgba(0,0,0,.25)', outline: 'none',
        }}>
          <Typography sx={{ fontWeight: 700, color: B.blue, mb: 1.5 }}>Visitor Signature</Typography>
          <Box component="img" src={sigSrc} alt="Signature"
            sx={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 1.5 }} />
          <Button fullWidth variant="outlined" onClick={() => setSigSrc('')}
            sx={{ mt: 1.5, borderColor: '#ddd', color: B.blue, background: B.grey }}>
            Close
          </Button>
        </Box>
      </Modal>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={delModal.open} onClose={closeDelModal} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ color: B.blue, fontWeight: 700, pb: 1 }}>🗑 Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: B.blue }}>{delModal.msg}</DialogContentText>
          <DialogContentText sx={{ color: B.brown, fontSize: 13, mt: 0.5 }}>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={closeDelModal}
            sx={{ flex: 1, borderColor: '#ddd', color: B.blue, background: B.grey }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ flex: 1, background: B.danger, '&:hover': { background: B.dangerHov } }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Small pagination button component
function PgBtn({ children, active, disabled, onClick }) {
  return (
    <Button
      size="small"
      variant={active ? 'contained' : 'outlined'}
      disabled={disabled}
      onClick={onClick}
      sx={{
        minWidth: 36, px: 1, borderRadius: 1.5,
        borderColor: '#ddd',
        color:      active ? '#fff' : B.blue,
        background: active ? B.blue  : '#fff',
        '&:hover':  { background: active ? B.lightBlue : B.grey },
        '&.Mui-disabled': { opacity: 0.4 },
      }}
    >
      {children}
    </Button>
  );
}
