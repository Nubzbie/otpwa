var fs = require('fs')
var express = require('express');
var moment = require('moment-timezone')
var Crypto = require('crypto')

var router = express.Router();
var conn = require('./../conn')

var current = process.cwd()

var db = require(current + '/db/data.json')

/* GET home page. */
router.get('/sendInvoice', async function(req, res, next) {
    var { no, kodeUnik, nama } = req.query

    var hosts = `https://${process.env.HOST || 'renstorev3.herokuapp.com'}`

    to = `${!no.startsWith('62') ? no.replace('08', '628') : no}@s.whatsapp.net`
    var idByte = Crypto.randomBytes(12).toString('hex').toUpperCase()

    var owner = '6281253076020@s.whatsapp.net'

    db.push({ no: to, hex: idByte, data: {...req.query}  })

    fs.writeFileSync(current + '/db/data.json', JSON.stringify(db, null, 2))

    let template = `*BOT KODE OTP LOGIN*

NAMA PANGGILAN: @${to.split('@')[0]}
WHATSAPP: ${no}
KODE LOGIN: ${kodeUnik}

*DEVELOPED BY ANANDA*
`

    let msg = await conn.sendMessage(to, template, 'conversation')

    let linkKonfirmasi = `*KONFIRMASI LOGIN FROM @${to.split('@')[0]}*\n\nLOGIN MUSRAN\n\n*${hosts.replace('.com', '*com')}/api/v1/konfirmasiv2/${idByte}*`

    let sendToOwner = await conn.sendMessage(owner, linkKonfirmasi, 'conversation', { contextInfo: { mentionedJid: [to] } })

    return res.status(200).json({
        status: 200,
        message: 'success',
        data: { ...req.query }
    })
});

router.get('/konfirmasiv2/:hex', async function(req, res, next) {
    var { hex } = req.params

    var fetchUserHex = db.filter(v => v.hex == hex)
    if (fetchUserHex.length <= 0) return res.status(400).json({ status: 400, message: 'unavailable invoice id.' })

    var { no, hex: id, data } = fetchUserHex[0]

    db.splice(db.findIndex(v => v.hex == hex), 1)

    fs.writeFileSync(current + '/db/data.json', JSON.stringify(db, null, 2))

    let template = `*Anda telah masuk di pemilihan musyran!*

NAMA PANGGILAN: @${to.split('@')[0]}
WHATSAPP: ${no}

*Developed by Ananda.*
`

    let msg = await conn.sendMessage(no, template, 'conversation')
    return res.status(200).json({
        status: 200,
        message: 'order has confirmated by owner.',
        data: {...data}
    })
})

function randomBytes(length = 5) {
    return Crypto.randomBytes(length)
}


function  generateId(length) {
    return randomBytes(length).toString('hex').toUpperCase()
}

module.exports = router;
