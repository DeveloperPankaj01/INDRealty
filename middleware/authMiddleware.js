// middleware/authMiddleware.js
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  const { username } = req.body; // Assuming the username is passed in the request body

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Only admin users can perform this action' });
    }

    next(); // User is admin, proceed to the next middleware/controller
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { isAdmin };