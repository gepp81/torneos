var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var orm = require('orm');
var expressValidator = require('express-validator');

var settings = require('./config/settings.js');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.engine('.html', require('jade').renderFile);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(expressValidator({}));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Load Models DB
app.use(orm.express(settings.database, {
    define: function(db, models, next) {
        db.settings.set('instance.cache', false);
        var listModels = require('./models/');
        listModels(db, models);
        next();
    }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = {};
    err.status = "404";
    if (req.accepts('html')) {
        res.locals.errorDescription = 404;
        return res.redirect("/#/error?type=404");
    }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.error(err);
        return res.status(500).send(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.error(err);
    return res.status(500).send(err);

});

module.exports = app;