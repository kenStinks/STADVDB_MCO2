const dotenv = require('dotenv')
const express = require('express');
const session = require('express-session');
const routes = require('./routes/routes.js');
const recovery = require('./helpers/recovery.js');
const http = require('http-server');

dotenv.config();

http.createServer()

const hbs = require('hbs');

const app = express();

app.use(session({
    secret: 'sessionID'
}));


app.set('view engine', 'hbs');
hbs.registerPartials(`${__dirname}/views/partials`);

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));

app.use('/', routes);

app.use(express.static('logs'));

// binds the server to a specific port
app.listen(process.env.SERVER_PORT, function () {
    console.log(`app listening at ${process.env.SERVER_HOST}:` + process.env.SERVER_PORT);
});

recovery.perform_recovery();