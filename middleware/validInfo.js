module.exports = function (req, res, next) {
  const { user_email, user_name, user_password } = req.body;

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === '/') {
    if (![user_email, user_name, user_password].every(Boolean)) {
      return res.status('400').send({ message: 'Missing Credentials' });
    } else if (!validEmail(user_email)) {
      return res.status('400').send({ message: 'Invalid email' });
    }
  } else if (req.path === '/login') {
    if (![user_email, user_password].every(Boolean)) {
      return res.status('400').send({ message: 'Missing Credentials' });
    } else if (!validEmail(user_email)) {
      return res.status('400').send({ message: 'Invalid email' });
    }
  }

  next();
};
