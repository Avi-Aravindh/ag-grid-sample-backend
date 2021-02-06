const express = require('express');
const router = express.Router();
const log = require('../middleware/logger');
const pg = require('../database/connection');
const queries = require('../database/queries');

router.get('/', async (req, res) => {
  try {
    const status_codes = await queries.selectAll(
      'Status_Codes',
      'status_id',
      'desc'
    );
    res.status(200).send({ status_codes: status_codes });
  } catch (err) {
    res.status('404').send({ message: 'Error finding status_codes' });
  }
});

module.exports = router;
