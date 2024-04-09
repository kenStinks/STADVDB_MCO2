const controller = require('../controllers/controller.js')
const express = require('express');

const app = express();
app.get('/', controller.getIndex);
app.post('/update', controller.updateID)
app.post('/delete', controller.deleteID)

module.exports = app