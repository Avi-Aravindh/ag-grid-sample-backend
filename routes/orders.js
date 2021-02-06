const express = require('express');
const router = express.Router();
const log = require('../middleware/logger');
const pg = require('../database/connection');
const queries = require('../database/queries');

router.get('/', async (req, res) => {
  try {
    const Orders = await queries.selectAll('Orders', 'order_id', 'desc');
    res.status(200).send({ Orders: Orders });
  } catch (err) {
    console.log(err);
    res.status('404').send({ message: 'Error fetching Orders' });
  }
});

router.get('/columnDefinitions', async (req, res) => {
  try {
    const columnDefinitions = await queries.selectAll(
      'Orders_Column_Definition',
      'id'
    );
    res.status(200).send({ columnDefinitions: columnDefinitions });
  } catch (err) {
    res.status('404').send({ message: 'Error fetching column definitions' });
  }
});

router.post('/', async (req, res) => {
  try {
    let data = req.body.data;
    const rows = await queries.insert('Orders', data);
    res.status('200').send({ message: 'insertion success', rows });
  } catch ({ code, field, message }) {
    res.status('500').send({ field, message });
  }
});

router.put('/', async (req, res) => {
  // console.log('data in put', req);
  try {
    let data = req.body.data;
    const returnCode = await queries.update('Orders', req.body.matchBy, data);
    res.status('200').send({ message: 'update successful' });
  } catch ({ code, field, message }) {
    res.status('500').send({ field, message });
  }
});

router.put('/all', async (req, res) => {
  try {
    let data = req.body.data;
    const returnCode = await queries.updateAll('Orders', req.body);
    res.status('200').send({ message: 'update successful' });
  } catch ({ code, field, message }) {
    res.status('500').send({ field, message });
  }
});

router.post('/multiple', async (req, res) => {
  // console.log('insert multiple', req.body);
  try {
    let data = req.body.data;
    const returnCode = await queries.insertMultiple('Orders', req.body);
    res.status('200').send({ message: 'insert successful' });
  } catch ({ code, field, message }) {
    res.status('500').send({ field, message });
  }
});

router.put('/multiple', async (req, res) => {
  try {
    let data = req.body.data;
    const returnCode = await queries.updateMultiple('Orders', req.body);
    res.status('200').send({ message: 'update successful' });
  } catch ({ code, field, message }) {
    res.status('500').send({ field, message });
  }
});

router.delete('/multiple', async (req, res) => {
  // console.log('update multiple', req.body);
  try {
    let data = req.body.data;
    const returnCode = await queries.deleteMultiple('Orders', req.body);
    res.status('200').send({ message: 'delete successful' });
  } catch ({ code, field, message }) {
    res.status('500').send({ field, message });
  }
});

router.delete('/', async (req, res) => {
  try {
    console.log(req.body.data.order_id);
    // let value = req.body.data.asset_id;
    const returnCode = await queries.deleteRecord(
      'Orders',
      'order_id',
      req.body.data.order_id
    );
    console.log('returncode', returnCode);
    if (returnCode == '200') {
      res.status('200').send({ message: 'deletion success' });
    }
  } catch (err) {
    console.log('catching error', err);
    res
      .status('500')
      .send({ message: `Error deleting asset - ${err.message}` });
  }
});

module.exports = router;
