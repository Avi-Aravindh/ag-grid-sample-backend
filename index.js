const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');

const pg = require('./database/connection');
const log = require('./middleware/logger');
const authorization = require('./middleware/authorization');

// Routers
const home = require('./routes/home');
const ItemTypes = require('./routes/itemType');
const orders = require('./routes/orders');
const users = require('./routes/users');
const statusCodes = require('./routes/statusCodes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.options('*', cors());
// app.use(express.json());
app.use(
  bodyParser.json({ limit: '500mb', extended: true, parameterLimit: 52428800 })
);
app.use(
  bodyParser.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 52428800,
  })
);
// app.use(log);
app.use('/', home);
app.use('/api/itemtypes', authorization, ItemTypes);
app.use('/api/orders', authorization, orders);
app.use('/api/statuscodes', authorization, statusCodes);
app.use('/api/users', users);
// app.use(helmet());
if (app.get('env') == 'development') {
  console.log('morgan enabled');
  app.use(morgan('tiny'));
}

app.listen(port, () => console.log('listening on port ', port));
