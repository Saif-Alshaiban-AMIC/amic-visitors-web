const router      = require('express').Router();
const Visitor     = require('../models/Visitor');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 }).limit(5000);
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json(visitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// bulk delete — must be before /:id
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await Visitor.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
