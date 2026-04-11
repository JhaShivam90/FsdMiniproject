const User = require('../models/User');
const Complaint = require('../models/Complaint');

/**
 * GET /api/authorities/nearby
 * Returns authorities sorted by distance to the given lat/lng
 */
const getNearbyAuthorities = async (req, res) => {
  try {
    let { lat, lng, limit } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    lat = parseFloat(lat);
    lng = parseFloat(lng);
    limit = parseInt(limit) || 3;

    // Use MongoDB geospatial $near query
    const authorities = await User.find({
      role: 'admin',
      'authorityDetails.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
      },
    }).limit(limit).select('-password'); // Exclude password from the results

    res.json({ success: true, count: authorities.length, authorities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/authorities
 * Returns all authorities (for leaderboard)
 */
const getAllAuthorities = async (req, res) => {
  try {
    const authorities = await User.find({ role: 'admin' }).select('-password');
    res.json({ success: true, count: authorities.length, authorities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/authorities/:id/rate
 * Rate an authority for a resolved complaint.
 * We'll require a complaintId to ensure the user is an owner of a complaint assigned to this authority.
 */
const rateAuthority = async (req, res) => {
  try {
    const authorityId = req.params.id;
    const { complaintId, rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Find the resolved complaint that this rating is for
    const complaint = await Complaint.findOne({
      _id: complaintId,
      userId: userId,
      authorityId: authorityId,
      status: 'resolved'
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Resolved complaint not found or does not belong to you' });
    }

    if (complaint.rating) {
      return res.status(400).json({ success: false, message: 'You have already rated this resolution' });
    }

    // Save rating on complaint
    complaint.rating = rating;
    if (comment) complaint.ratingComment = comment;
    await complaint.save();

    // Update authority's aggregate rating
    const authority = await User.findById(authorityId);
    if (!authority || authority.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Authority not found' });
    }

    const currentScore = authority.authorityDetails.rating?.score || 0;
    const currentCount = authority.authorityDetails.rating?.count || 0;

    const newCount = currentCount + 1;
    // Calculate new average
    const newScore = ((currentScore * currentCount) + rating) / newCount;

    authority.authorityDetails.rating.score = newScore;
    authority.authorityDetails.rating.count = newCount;
    await authority.save();

    res.json({ success: true, message: 'Rating submitted successfully', authority });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNearbyAuthorities,
  getAllAuthorities,
  rateAuthority
};
