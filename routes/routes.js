const controller = require('../controllers/controller.js')
const express = require('express');

const app = express();
app.get('/', controller.getIndex);
app.post('/update', controller.updateID)
app.post('/delete', controller.deleteID)
app.post('/add', controller.addID)

module.exports = app