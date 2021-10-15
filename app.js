process.on('uncaughtException', console.error)

require('dotenv').config() // dot env loaded

var fs = require('fs')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var moment = require('moment-timezone')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var conn = require('./conn')

var app = express();

var PORT = process.env.PORT || 8090
var TIME = moment().tz('Asia/Jakarta').format('DD/MM/YYYY-HH:mm:ss')

var server = app.listen(PORT)
var io = require('socket.io')(server)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 2)

app.use(cors({ origin: '*' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    req.io = io
    next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/v1', apiRouter);

/*app.use(function(req, res, next) {
    req.io = io
    mext()
})*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.locals.conn = conn;


;(async function() {
    try {
        if (conn.state === 'open') return

        let authFile = `${process.env.SESSION || 'ananda'}.data.json` // session name
        if (fs.existsSync(authFile)) conn.loadAuthInfo(authFile)

        await conn.connect()
    } catch(e) {
        console.log(e)
    }
})()

io.on('connection', socket => {
    console.log(`[${TIME}] SocketIo Connected!`)

    if (conn.state === 'open') return

    let authFile = `${process.env.SESSION || 'ananda'}.data.json` // session name
    if (fs.existsSync(authFile)) conn.loadAuthInfo(authFile)

    conn.browserDescription = ['Mac OS', 'Safari', '10.0']
 
    if (conn.canLogin()) socket.emit('is:open', { open: true })

    conn.on('qr', qr => {
        conn._qr = qr
        console.log( '-------\n', qr)
        socket.emit('scan:qr', { qr: qr })
    })

    conn.on('open', () => {
        socket.emit('is:open', { open: true })

        fs.writeFileSync(authFile, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
    })

    conn.on('connecting', () => {
        socket.emit('is:open', { open: false })
    })

    conn.connect().then(() => {
        fs.writeFileSync(authFile, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))

        socket.emit('scan:success', { data: JSON.stringify(conn.base64EncodedAuthInfo()) })
    }).catch(e => {})

    conn.on('error', conn.logger.error)
    conn.on('close', () => {
        setTimeout(async () => {
            try {
                if (conn.state === 'close') {
                    if (fs.existsSync(authFile)) await conn.loadAuthInfo(authFile)
                    await conn.connect()
                    fs.writeFileSync(authFile, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
                    //global.timestamp.connect = new Date
                }
            } catch (e) {
                conn.logger.error(e)
            }
        }, 5000)
    })

    /*socket.on('auth:session', ({ auth }) => {
    })*/

    /*socket.on('name:session', ({ name }) => {
    })*/
})

module.exports = app;
