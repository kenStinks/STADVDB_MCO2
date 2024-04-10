const dotenv = require('dotenv')
const express = require('express');
const session = require('express-session');
const routes = require('./routes/routes.js');


dotenv.config();

const hbs = require('hbs');

const app = express();
const port = 3000;

app.use(session({
    secret: 'sessionID'
}));

app.set('view engine', 'hbs');
hbs.registerPartials(`${__dirname}/views/partials`);

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(express.static('public'));

app.use('/', routes);

// binds the server to a specific port
app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, function () {
    console.log('app listening at http://localhost:' + port);
});