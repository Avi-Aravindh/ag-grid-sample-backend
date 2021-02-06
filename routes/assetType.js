const express = require('express');
const router = express.Router();
const log = require('../middleware/logger');

const pg = require('../database/connection');
const queries = require('../database/queries');

router.get('/', async (req, res) => {
  try {
    const assetTypes = await queries.selectAll('AssetType', 'Asset_Name');
    res.status(200).send({ assetTypes: assetTypes });
  } catch (err) {
    res.status('404').send({ message: 'Error finding an asset' });
  }
});

router.post('/', async (req, res) => {
  try {
    const rows = await queries.insertSingle('AssetType', req.body.data);
    res.status(200).send({ message: 'insertion success', rows });
  } catch (err) {
    res
      .status('500')
      .send({ message: `Error inserting asset type - ${err.message}` });
  }
});

router.put('/', async (req, res) => {
  console.log('assettype update', req);
  try {
    const rows = await queries.updateSingle(
      'AssetType',
      req.body.matchBy,
      req.body.data
    );
    res.status(200).send({ message: 'update success', rows });
  } catch (err) {
    res
      .status('500')
      .send({ message: `Error updating asset type - ${err.message}` });
  }
});

router.delete('/', async (req, res) => {
  console.log('assetype delete', req);
  try {
    console.log(req.body.data.Asset_Id);
    // let value = req.body.data.asset_id;
    const returnCode = await queries.deleteRecord(
      'AssetType',
      'Asset_Id',
      req.body.data.Asset_Id
    );
    console.log('returncode', returnCode);
    if (returnCode == '200') {
      res.status('200').send({ message: 'delete success' });
    }
  } catch (err) {
    console.log('catching error', err);
    res
      .status('500')
      .send({ message: `Error deleting asset type - ${err.message}` });
  }
});

module.exports = router;
