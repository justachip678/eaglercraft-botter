const WebSocket = require('ws');

const SERVER_WS = 'wss://mc.archyverse.org';
const BOT_COUNT = 6;                    // Start with 5-8 max. Increase slowly!
const BOT_PREFIX = 'Boost';
const REGISTER_COMMAND = '/register 1234 1234';
const REGISTER_DELAY = 9000;            // milliseconds (9 seconds)

function createBot(id) {
  const username = `${BOT_PREFIX}${id}`;
  const ws = new WebSocket(SERVER_WS);

  let registered = false;

  ws.on('open', () => {
    console.log(`[${username}] ✅ WebSocket opened - sending handshake...`);

    try {
      // Common init packet for Eagler 1.8.8 proxies
      ws.send(Buffer.from([0x00, 0x02]));

      // Basic login packet with username
      const nameBuf = Buffer.from(username, 'utf8');
      const loginPacket = Buffer.concat([
        Buffer.from([0x00]),
        Buffer.from([nameBuf.length]),
        nameBuf
      ]);
      ws.send(loginPacket);

      console.log(`[${username}] Sent handshake + login`);
    } catch (e) {
      console.log(`[${username}] Failed to send packets`);
    }
  });

  ws.on('close', (code) => {
    console.log(`[${username}] Disconnected (code: ${code})`);
  });

  ws.on('error', (err) => {
    console.error(`[${username}] Error:`, err.message);
  });

  // Send /register command after delay
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN && !registered) {
      registered = true;
      try {
        const chatMsg = Buffer.from(REGISTER_COMMAND, 'utf8');
        const chatPacket = Buffer.concat([
          Buffer.from([0x01]),           // chat packet guess
          Buffer.from([chatMsg.length]),
          chatMsg
        ]);
        ws.send(chatPacket);
        console.log(`[${username}] 📨 Sent command: ${REGISTER_COMMAND}`);
      } catch (e) {
        console.log(`[${username}] Failed to send register`);
      }
    }
  }, REGISTER_DELAY);

  // Keep-alive
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 18000);
}

// Start bots with small delay between them
console.log(`🚀 Starting ${BOT_COUNT} bots on Archyverse (1.8.8)`);
for (let i = 1; i <= BOT_COUNT; i++) {
  setTimeout(() => createBot(i), i * 1000);   // 1 second delay between bots
}
