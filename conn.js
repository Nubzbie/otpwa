process.on('uncaughtException', console.error) // safe log error

let fs = require('fs')
let { WAConnection: _WAConnection } = require('@adiwajshing/baileys')
let qrcode = require('qrcode-terminal')
let simple = require('./lib/simple')
//let handler = require('./handler')

let WAConnection = simple.WAConnection(_WAConnection)
let conn = new WAConnection()

//let authFile = `${process.argv[2] || 'session'}.data.json`
//if (fs.existsSync(authFile)) conn.loadAuthInfo(authFile)

conn.logger.level = 'debug'

/*conn.on('qr', data => {
    qrcode.generate(data, { small: true })
    this.logger.info('silahkan scan dulu...')
})*/

/*conn.connect().then(async() => {
    fs.writeFileSync(authFile, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
})
*/
//conn.chatUpdate = handler.chatUpdate

//conn.on('chat-update', conn.chatUpdate)


module.exports = conn
