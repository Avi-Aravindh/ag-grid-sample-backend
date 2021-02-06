const appDebugger = require('debug')('appDebugging');
const dbDebugger = require('debug')('dbDebugging');

const log = (message) => {
  appDebugger(message);
  dbDebugger(message);
};

module.exports = log;
