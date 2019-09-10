const jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

module.exports = async function(user) {
  const accessToken = jwt.sign(
    { user: { id: user.id, admin: user.isAdmin } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '5s' }
  );

  const refreshToken = jwt.sign(
    {
      user: {
        id: user.id,
        admin: user.isAdmin,
        count: user.count
      }
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};
