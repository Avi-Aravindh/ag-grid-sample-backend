const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header('token');
    if (!jwtToken) {
      return res
        .status('403')
        .send({ message: 'Unauthorized. Invalid or missing session' });
    }

    const payload = jwt.verify(jwtToken, process.env.JWTSECRET);
    console.log('payload', payload);
    req.user_id = payload.user;
    next();
  } catch (err) {
    console.log(err.message);
    return res
      .status('403')
      .send({ message: 'Unauthorized. Invalid or missing session' });
  }
};
