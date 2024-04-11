const controller = require('../controllers/controller.js')
const express = require('express');

const app = express();
app.get('/', controller.getIndex);
app.get('/get_log', controller.getLog);

// app.get('/log')
app.post('/update', controller.updateID)
app.post('/delete', controller.deleteID)
app.post('/add', controller.addID)

app.post('/update_solo', controller.soloUpdateID)
app.post('/delete_solo', controller.soloDeleteID)
app.post('/add_solo', controller.soloAddID)


module.exports = app