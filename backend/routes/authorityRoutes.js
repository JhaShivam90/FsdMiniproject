const express = require('express');
const router = express.Router();
const { getNearbyAuthorities, getAllAuthorities, rateAuthority } = require('../controllers/authorityController');
const { protect } = require('../middleware/auth');

router.get('/nearby', getNearbyAuthorities);
router.get('/', getAllAuthorities);
router.post('/:id/rate', protect, rateAuthority);

module.exports = router;
