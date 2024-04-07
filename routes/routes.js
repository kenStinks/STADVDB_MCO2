const controller = require('../controllers/controller.js')
const express = require('express');

const app = express();
app.get('/', controller.getIndex);

module.exports = app