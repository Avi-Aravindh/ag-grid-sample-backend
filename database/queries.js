const knex = require('./connection');
const log = require('../middleware/logger');

function select(tableName, columnNames, whereColumnName, whereColumnValue) {
  log(`Select ${columnNames} from ${tableName}`);
  let promise = new Promise((resolve, reject) => {
    knex
      .select(columnNames)
      .table(tableName)
      .where(whereColumnName, whereColumnValue)
      .then((rows) => resolve(rows))
      .catch((err) => reject(new Error(err)));
  });

  return promise;
}

function selectAll(tableName, orderByColumn, order) {
  log(`Select All from ${tableName}`);
  let promise = new Promise((resolve, reject) => {
    knex
      .select()
      .table(tableName)
      .orderBy(orderByColumn, order)
      .then((rows) => resolve(rows))
      .catch((err) => {
        log(err);
        reject(new Error(err));
      });
  });

  return promise;
}

function selectAllWithDeleteFlag(tableName, orderByColumn, order) {
  log(`Select All from ${tableName}`);
  let promise = new Promise((resolve, reject) => {
    knex
      .select()
      .table(tableName)
      .orderBy(orderByColumn, order)
      .where('deleted', false)
      .then((rows) => resolve(rows))
      .catch((err) => {
        log(err);
        reject(new Error(err));
      });
  });

  return promise;
}

function selectMax(tableName, column) {
  log(`Select Max(${column}) from ${tableName}`);
  let promise = new Promise((resolve, reject) => {
    knex
      .select()
      .table(tableName)
      .max(column)
      .then((maxValue) => resolve(maxValue))
      .catch((err) => reject(new Error(err)));
  });

  return promise;
}

function insert(tableName, data) {
  console.log('data, table', data, tableName);
  let row;
  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .insert(data)
      .returning('order_id')
      .then((order_ids) => {
        console.log(order_ids);
        knex
          .select('*')
          .from(tableName)
          .whereIn('order_id', order_ids)
          .then((rows) => {
            console.log('row', rows);
            resolve(rows);
          })
          .catch((err) => {
            console.log('error', err);
            let code = '500';
            let message =
              'Error fetching inserted row, please refresh the page';
            reject({ code, message });
          });
      })
      .catch((err) => {
        console.log('error, ', err);
        let code = '500';
        let message = 'Internal error occured. Please reach support';
        if (err.code === '23502') {
          let columnName = ' ';
          knex
            .select('header_name')
            .table('Asset_Column_Definitions')
            .where('field', err.column)
            .then((res) => {
              columnName = res[0].header_name;
              code = '403';
              field = err.column;
              message = `${columnName} is mandatory`;
              reject({ code, field, message });
            })
            .catch((err) => {
              log('error fetching column name');
              reject({ code, message });
            });
        }
      });
  });

  return promise;
}

function insertUsers(tableName, data) {
  console.log('insert users data', data);
  let row;
  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .insert(data)
      .returning('user_id')
      .then((user_ids) => {
        console.log(user_ids);
        knex
          .select('*')
          .from(tableName)
          .whereIn('user_id', user_ids)
          .then((rows) => {
            console.log('row', rows);
            resolve(rows);
          })
          .catch((err) => {
            console.log('error', err);
            let code = '500';
            let message =
              'Error fetching inserted row, please refresh the page';
            reject({ code, message });
          });
      })
      .catch((err) => {
        console.log('error, ', err);
        let code = '500';
        let message = 'Internal error occured. Please reach support';
        if (err.code === '23502') {
          let columnName = ' ';
          knex
            .select('header_name')
            .table('Asset_Column_Definitions')
            .where('field', err.column)
            .then((res) => {
              columnName = res[0].header_name;
              code = '403';
              field = err.column;
              message = `${columnName} is mandatory`;
              reject({ code, field, message });
            })
            .catch((err) => {
              log('error fetching column name');
              reject({ code, message });
            });
        }
      });
  });

  return promise;
}

function update(tableName, matchBy, data) {
  console.log('Data', tableName, matchBy, data);

  let matchByString = matchBy + '';

  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .where(matchByString, '=', data[matchByString])
      .update(data)
      .then((rows) => {
        log(rows);
        resolve(rows);
      })
      .catch((err) => {
        console.log('error, ', err);
        let code = '500';
        let message = 'Internal error occured. Please reach support';
        if (err.code === '23502') {
          let columnName = ' ';
          knex
            .select('header_name')
            .table('Asset_Column_Definitions')
            .where('field', err.column)
            .then((res) => {
              columnName = res[0].header_name;
              code = '403';
              field = err.column;
              message = `${columnName} is mandatory`;
              reject({ code, field, message });
            })
            .catch((err) => {
              log('error fetching column name');
              reject({ code, message });
            });
        }
      });
  });

  return promise;
}

function updateAll(tableName, data) {
  console.log('update all query', data.data);
  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .update(data.data)
      .then((rows) => {
        log(rows);
        resolve(rows);
      })
      .catch((err) => {
        console.log('error, ', err);
        let code = '500';
        let message = 'Internal error occured. Please reach support';
        log('error fetching column name');
        reject({ code, message });
      });
  });

  return promise;
}

function insertMultiple(tableName, data) {
  console.log('insert multiple query', data);
  return knex.transaction((trx) => {
    const queries = data.map((tuple) =>
      knex(tableName).insert(tuple).transacting(trx)
    );
    return Promise.all(queries).then(trx.commit).catch(trx.rollback);
  });
}

function updateMultiple(tableName, data) {
  console.log('update multiple query');
  return knex.transaction((trx) => {
    const queries = data.map((tuple) =>
      knex(tableName)
        .where('order_id', tuple.order_id)
        .update(tuple)
        .transacting(trx)
    );
    return Promise.all(queries)
      .then(trx.commit)
      .catch((err) => {
        trx.rollback;
        console.log('error updating multiple assets', err);
      });
  });
}

function deleteMultiple(tableName, data) {
  console.log('delete multiple query');
  return knex.transaction((trx) => {
    const queries = data.map((tuple) =>
      knex(tableName).where('order_id', tuple.order_id).del().transacting(trx)
    );
    return Promise.all(queries)
      .then(trx.commit)
      .catch((err) => {
        trx.rollback;
        console.log('error deleting multiple assets', err);
      });
  });
}

function insertSingle(tableName, data, idColumn) {
  console.log('inserting single', data);
  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .insert(data)
      .returning(idColumn ? idColumn : 'order_id')
      .then((ids) => {
        console.log(ids);
        knex
          .select('*')
          .from(tableName)
          .whereIn(idColumn ? idColumn : 'order_id', ids)
          .then((rows) => {
            console.log('row', rows);
            resolve(rows);
          })
          .catch((err) => {
            console.log('error', err);
            let code = '500';
            let message =
              'Error fetching inserted row, please refresh the page';
            reject({ code, message });
          });
      })
      .catch((err) => {
        console.log('error, ', err);
        let code = '500';
        let message = 'Internal error occured. Please reach support';
        if (err.code === '23502') {
          let columnName = ' ';
          message = 'Mandatory column missing';
          reject({ code, field, message });
        }
      });
  });

  return promise;
}

function updateSingle(tableName, matchBy, data) {
  console.log('Data updateSingle', tableName, matchBy, data);

  let matchByString = matchBy + '';

  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .where(matchByString, '=', data[matchByString])
      .update(data)
      .then((rows) => {
        log(rows);
        resolve(rows);
      })
      .catch((err) => {
        console.log('error, ', err);
        let code = '500';
        let message = 'Internal error occured. Please reach support';
        if (err.code === '23502') {
          let columnName = ' ';
          let message = 'Mandatory column missing';
          reject({ code, field, message });
        }
      });
  });

  return promise;
}

function deleteRecord(tableName, columnName, value) {
  let promise = new Promise((resolve, reject) => {
    knex(tableName)
      .where(columnName, value)
      .del()
      .then((rows) => {
        log(rows);
        resolve('200');
      })
      .catch((err) => {
        console.log('error, ', err);
        reject(err);
      });
  });

  return promise;
}

module.exports = {
  select,
  selectAll,
  selectAllWithDeleteFlag,
  selectMax,
  insertSingle,
  insert,
  insertMultiple,
  deleteRecord,
  update,
  updateAll,
  updateSingle,
  updateMultiple,
  deleteMultiple,
  insertUsers,
};
