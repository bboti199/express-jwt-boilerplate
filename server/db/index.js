const mongoose = require('mongoose');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    if (process.env.NODE_ENV === 'development') console.log('DB Connected!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
