const express = require('express');
const router = express.Router();
const log = require('../middleware/logger');

const pg = require('../database/connection');
const queries = require('../database/queries');

router.get('/', async (req, res) => {
  try {
    const ItemTypes = await queries.selectAll('ItemType', 'id');
    res.status(200).send({ ItemTypes: ItemTypes });
  } catch (err) {
    res.status('404').send({ message: 'Error finding ItemTypes' });
  }
});

router.post('/', async (req, res) => {
  try {
    const rows = await queries.insertSingle('ItemType', req.body.data, 'id');
    res.status(200).send({ message: 'insertion success', rows });
  } catch (err) {
    res
      .status('500')
      .send({ message: `Error inserting Item Types - ${err.message}` });
  }
});

router.put('/', async (req, res) => {
  try {
    const rows = await queries.updateSingle(
      'ItemType',
      req.body.matchBy,
      req.body.data
    );
    res.status(200).send({ message: 'update success', rows });
  } catch (err) {
    res
      .status('500')
      .send({ message: `Error updating ItemTypes - ${err.message}` });
  }
});

router.delete('/', async (req, res) => {
  try {
    const returnCode = await queries.deleteRecord(
      'ItemType',
      'id',
      req.body.data.id
    );
    console.log('returncode', returnCode);
    if (returnCode == '200') {
      res.status('200').send({ message: 'delete success' });
    }
  } catch (err) {
    console.log('catching error', err);
    res
      .status('500')
      .send({ message: `Error deleting ItemTypes - ${err.message}` });
  }
});

module.exports = router;
