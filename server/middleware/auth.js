const jwt = require('jsonwebtoken');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

module.exports = function(req, res, next) {
  const token = req.cookies['access-token'];

  if (!token) {
    return res.status(401).json({ msg: 'No token, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
