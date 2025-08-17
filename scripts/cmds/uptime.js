const osu = require("node-os-utils");

// Bot start time
if (!global.botStartTime) global.botStartTime = Date.now();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.9",
    author: "VEX_ADNAN",
    role: 0,
    category: "System",
  },

  onStart: async function ({ api, event, args }) {
    try {
      const start = Date.now();

      // ⏱ Uptime calculation safe
      const uptimeMs = Date.now() - global.botStartTime;
      const totalSeconds = Math.floor(uptimeMs / 1000);
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const hours = Math.floor(totalSeconds / 3600) % 24;
      const days = Math.floor(totalSeconds / 86400);

      const uptimeStr = `𝙳ays: ${days} | 𝙷ours: ${hours} | 𝙼inutes: ${minutes} | 𝚂econds: ${seconds}`;

      // CPU/RAM
      const cpuUsage = await osu.cpu.usage();
      const memInfo = await osu.mem.info();
      const ramUsage = memInfo.usedMemMb;
      const ramTotal = memInfo.totalMemMb;

      // Groups
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupCount = threads.filter(t => t.isGroup).length;

      // Ping
      const ping = Date.now() - start;

      // Cute image
      const imageUrl = "https://files.catbox.moe/7jqv64.jpg";

      // Bold & kawaii box style message
      const msgBody = `
╔══════• ❀ •══════╗
     🐾 𝙺𝙰𝙺𝙰𝚂𝙷𝙸 𝙱𝙾𝚃 🐾
╚══════• ❀ •══════╝

🌸 𝚄ptime : ⏳ ${uptimeStr}
🌸 𝙶roups : 💞 ${groupCount}
🌸 𝙿ing : ⚡ ${ping}ms
🌸 𝙲PU : 💻 ${cpuUsage.toFixed(1)}%
🌸 𝚁AM : 🧠 ${ramUsage}/${ramTotal}MB

╔═══════• 💖 •═══════╗
   🐰 𝚂tay cute & sparkly! 🐰
╚═══════• 💖 •═══════╝
`;

      const msg = {
        body: msgBody,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      };

      api.sendMessage(msg, event.threadID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Oops! Something went wrong while fetching kawaii system info.", event.threadID);
    }
  }
};
