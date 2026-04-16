const WebSocket = require('ws');

const SERVER_WS = 'wss://play.monacoeducation.info/';
const BOT_COUNT = 10;                    // Change this later if you want more (start low!)
const BOT_PREFIX = 'Boost';
const REGISTER_COMMAND = '/register 1234 1234';

function createBot(id) {
  const username = `${BOT_PREFIX}${id}`;
  const ws = new WebSocket(SERVER_WS);

  let registered = false;

  ws.on('open', () => {
    console.log(`[${username}] ✅ Connected - sending 1.8.8 handshake...`);

    try {
      // Basic handshake for Eagler 1.8.8
      ws.send(Buffer.from([0x00, 0x02]));

      const nameBuf = Buffer.from(username, 'utf8');
      const loginPacket = Buffer.concat([
        Buffer.from([0x00]),
        Buffer.from([nameBuf.length]),
        nameBuf
      ]);
      ws.send(loginPacket);

      console.log(`[${username}] Sent login`);
    } catch (e) {
      console.log(`[${username}] Packet error`);
    }
  });

  ws.on('close', (code) => {
    console.log(`[${username}] Disconnected (code: ${code})`);
  });

  ws.on('error', (err) => {
    console.error(`[${username}] Error:`, err.message);
  });

  // Auto register after 9 seconds
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN && !registered) {
      registered = true;
      try {
        const chatMsg = Buffer.from(REGISTER_COMMAND, 'utf8');
        const chatPacket = Buffer.concat([
          Buffer.from([0x01]),
          Buffer.from([chatMsg.length]),
          chatMsg
        ]);
        ws.send(chatPacket);
        console.log(`[${username}] 📨 Sent: ${REGISTER_COMMAND}`);
      } catch (e) {
        console.log(`[${username}] Register send failed`);
      }
    }
  }, 9000);

  // Keep alive
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 18000);
}

// Start the bots
console.log(`🚀 Starting ${BOT_COUNT} bots on DylanMC...`);
for (let i = 1; i <= BOT_COUNT; i++) {
  setTimeout(() => createBot(i), i * 1000);   // 1 second delay between bots
}
