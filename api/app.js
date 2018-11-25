const express = require('express');
const bodyParser = require('body-parser');

// Imports routes
const routes = require('./routes');
const app = express();

const cors = require('cors');

// use it before all route definitions
app.use(cors({origin: 'http://localhost:8081'}));

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});


let port = 8080;

// server: start and listen
app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});