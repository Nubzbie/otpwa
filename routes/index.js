var express = require('express');
var router = express.Router();
var conn = require('./../conn')

/* GET home page. */

/*router.all('/*', function(req, res, next) {
    res.status(200).json({
         status: 200,
         restBy: '@isywl_',
         message: 'Rest Api For Ren Store, enjoy!'
    })
})*/

 router.get('/', function(req, res, next) {
     let _qr = ''
     conn.on('qr', qr => {
         _qr = qr
        console.log('-------\n', _qr)
        req.io.emit('scan:qr', { qr: _qr, isLogin: conn.canLogin()  })
     })
// 
//     console.log(conn)
     res.render('index', { title: 'Express', login: conn.canLogin() });
 });

module.exports = router;
