const { WAConnection } = require('@adiwajshing/baileys')


exports.WAConnection = _WAConnection => {
    class WAConnection extends _WAConnection {
        constructor(...args) {
            super(...args)
        }

        async sendText(jid, text, options = {}) {
            await this.Typing(jid)
            await this.sendMessage(jid, text, 'conversation', { ...options })
        }

        async replyText(jid, text, m, options = {}) {
            await this.Typing(jid)
            await this.sendMessage(jid, text, 'conversation', { quoted: m, ...options })
        }

        async Typing(jid) {
            await this.chatRead(jid).catch(() => {})
            await this.updatePresence(jid, 'composing')
        }

        serializeM(m) {
            return exports.smsg(this, m)
        }
    }
    return WAConnection
}


exports.smsg = async (conn, m) => {
    if (!m) return // safe

    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('3EB0') && m.id.length === 12
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        //if (m.isGroup) {
        //    let m.isGroup = {}
        //    m.isGroup.owner = await conn.groupMetadata(m.chat).owner === m.sender.replace('@s.whatsapp.net', '@c.us') ?? false
        //}
        m.sender = m.fromMe ? conn.user.jid : m.participant ? m.participant : m.key.participant ? m.key.participant : m.chat
    }

    if (m.message) {
        m.mtype = Object.keys(m.message)[0]
        m.msg = m.message[m.mtype]
        if (m.mtype === 'ephemeralMessage') {
            exports.smsg(conn, m.msg)
            m.mtype = m.msg.mtype
            m.msg = m.msg.msg
        }
        m.text = m.msg.text || m.msg.caption || m.msg || ''
    }

    return m
}
