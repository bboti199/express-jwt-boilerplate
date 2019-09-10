const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');

const genTokens = require('../../utils/genTokens');

router.post(
  '/register',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email address').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ erorrs: [{ msg: 'User already exists' }] });
      }

      const hashedPass = await bcrypt.hash(password, 10);

      user = new User({
        name,
        email,
        password: hashedPass
      });

      await user.save();

      const { accessToken, refreshToken } = await genTokens(user);

      res.cookie('refresh-token', refreshToken, { httpOnly: true });
      res.cookie('access-token', accessToken);
      res.json({ msg: 'Ok' });
    } catch (error) {
      console.error(err.message);
      res.status(500).send('Internal Server error');
    }
  }
);

router.post(
  '/login',
  [
    check('email', 'Email is required')
      .not()
      .isEmpty(),
    check('password', 'Password is required')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials ' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const { refreshToken, accessToken } = await genTokens(user);

      res.cookie('refresh-token', refreshToken, { httpOnly: true });
      res.cookie('access-token', accessToken);
      res.json({ msg: 'Ok' });
    } catch (error) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }
);

router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.count += 1;

    await user.save();

    res.json({ msg: 'Ok' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/dummy', [auth], (req, res) => {
  res.json({ msg: 'ok' });
});

module.exports = router;
