const express = require('express');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../middleware/jwtGenerator');
const log = require('../middleware/logger');
const validInfo = require('../middleware/validInfo');
const authorization = require('../middleware/authorization');
const router = express.Router();

const pg = require('../database/connection');
const queries = require('../database/queries');

router.get('/', async (req, res) => {
  try {
    const users = await queries.selectAll('Users', 'user_id', 'desc');
    res.status(200).send({ users: users });
  } catch (err) {
    console.log(err);
    res.status('404').send({ message: 'Error fetching users' });
  }
});

router.get('/roles', async (req, res) => {
  try {
    const userRoles = await queries.selectAll('User_Roles', 'role', 'desc');
    res.status(200).send({ userRoles: userRoles });
  } catch (err) {
    console.log(err);
    res.status('404').send({ message: 'Error fetching userRoles' });
  }
});

router.get('/columnDefinitions', async (req, res) => {
  try {
    const columnDefinitions = await queries.selectAll(
      'User_Column_Definitions',
      'id'
    );
    res.status(200).send({ columnDefinitions: columnDefinitions });
  } catch (err) {
    res.status('404').send({ message: 'Error fetching column definitions' });
  }
});

router.get('/isExists', async (req, res) => {
  const user_email = req.body.user_email;
  if (!user_email) {
    res.status('400').send({ message: 'user email paramater missing' });
    return;
  }
  try {
    const users = await queries.select('Users', '*', 'user_email', user_email);
    res.status(200).send({ users: users });
  } catch (err) {
    console.log(err);
    res.status('404').send({ message: 'Error fetching users' });
  }
});

router.post('/', validInfo, async (req, res) => {
  console.log('data', req.body);
  let users = await queries.select(
    'Users',
    '*',
    'user_email',
    req.body.user_email
  );
  if (users.length > 0) {
    res
      .status('500')
      .send({ message: `User already exists for ${req.body.user_email}` });
    return;
  }

  try {
    // let data = req.body.data;
    let data = req.body;

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(data.user_password, salt);
    data.user_password = bcryptPassword;
    const rows = await queries.insertUsers('Users', data);
    res.status('200').send({ message: 'user created successfully', rows });
  } catch ({ code, field, message }) {
    res.status(code).send({ field, message });
  }
});

router.post('/login', validInfo, async (req, res) => {
  try {
    const existingUser = await queries.select(
      'Users',
      '*',
      'user_email',
      req.body.user_email
    );

    if (existingUser.length == 0) {
      res.status('401').send({
        message: `Unauthorized access, no user exists with ${req.body.user_email}`,
      });
      return;
    }
    const incomingPwd = req.body.user_password;

    const doesPwdMatch = await bcrypt.compare(
      incomingPwd,
      existingUser[0].user_password
    );

    if (doesPwdMatch) {
      const token = jwtGenerator(existingUser[0].user_id);

      res.status('200').send({
        user_id: existingUser[0].user_id,
        user_name: existingUser[0].user_name,
        user_email: existingUser[0].user_email,
        user_role: existingUser[0].user_role,
        force_reset: existingUser[0].force_reset,
        message: `User authentication successful`,
        token: token,
      });
      return;
    }

    if (!doesPwdMatch) {
      res.status('401').send({
        message: `Unauthorized access, incorrect password for ${req.body.user_email}`,
      });
      return;
    }
  } catch (err) {
    return res.status('500').send({ message: 'Error completing login' });
  }
});

router.get('/authorize', authorization, async (req, res) => {
  try {
    const existingUser = await queries.select(
      'Users',
      '*',
      'user_id',
      req.user_id
    );
    return res.status('200').send({ currentUser: existingUser[0] });
  } catch (err) {
    return res.status('500').send({ message: 'Invalid token' });
  }
});

router.put('/', async (req, res) => {
  try {
    let data = req.body.data;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(data.user_password, salt);
    data.user_password = bcryptPassword;
    const returnCode = await queries.updateSingle(
      'Users',
      req.body.matchBy,
      data
    );
    res.status('200').send({ message: 'update successful' });
  } catch ({ code, field, message }) {
    res.status(code).send({ field, message });
  }
});

module.exports = router;
