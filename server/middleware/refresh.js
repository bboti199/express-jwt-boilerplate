const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genTokens = require('../utils/genTokens');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

module.exports = async (req, res, next) => {
  const refreshToken = req.cookies['refresh-token'];
  const accessToken = req.cookies['access-token'];

  if (!refreshToken && !accessToken) {
    return next();
  }

  try {
    const data = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = data.user;
    return next();
  } catch (err) {}

  if (!refreshToken) {
    return next();
  }

  let data;

  try {
    data = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next();
  }

  const user = await User.findById(data.user.id);

  if (!user || user.count !== data.user.count) {
    return next();
  }

  const tokens = await genTokens(user);

  req.cookies['refresh-token'] = tokens.refreshToken;
  req.cookies['access-token'] = tokens.accessToken;

  res.cookie('refresh-token', tokens.refreshToken, { httpOnly: true });
  res.cookie('access-token', tokens.accessToken);

  next();
};
