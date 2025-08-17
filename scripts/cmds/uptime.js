const os = require("os");
const axios = require("axios");

const startTime = new Date();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"],
    author: "NIROB",
    category: "system",
    longDescription: { en: "Get System Information with group count" },
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      // uptime
      const uptimeSec = (new Date() - startTime) / 1000;
      const d = Math.floor(uptimeSec / 86400);
      const h = Math.floor((uptimeSec % 86400) / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = Math.floor(uptimeSec % 60);

      // memory & CPU
      const totalMemGB = os.totalmem() / 1024 ** 3;
      const freeMemGB = os.freemem() / 1024 ** 3;
      const usedMemGB = totalMemGB - freeMemGB;
      const cpuUsage = (os.cpus().reduce((acc, cpu) => acc + cpu.times.user, 0) / os.cpus().length).toFixed(1);

      // users count
      let userCount = 0;
      if (usersData?.getAllIds) userCount = (await usersData.getAllIds()).length;

      // groups count (from DB)
      let groupCount = 0;
      try {
        const allThreads = await threadsData.getAll();
        groupCount = allThreads.filter(t => t.isGroup).length;
      } catch (e) {
        console.error("Group count error:", e);
      }

      // date & time
      const now = new Date();
      const date = now.toLocaleDateString("en-US");
      const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: true });

      // ping
      const pingStart = Date.now();
      await api.sendMessage("🔎 Checking system info...", event.threadID);
      const ping = Date.now() - pingStart;
      const status = ping < 1000 ? "✅ Smooth System" : "⛔ Bad System";

      // message
      const msg = `
╭─⟡ 𝗨𝗣𝗧𝗜𝗠𝗘 ⟡─╮
│ ⏰ ${d}d ${h}h ${m}m ${s}s
│ OS: ${os.type()} ${os.arch()}
│ CPU: ${os.cpus()[0].model} (${cpuUsage}%)
│ RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB
│ Storage: ${usedMemGB.toFixed(2)} / ${totalMemGB.toFixed(2)} GB
├───────────────⟡
│ 📆 ${date} ⏱️ ${time}
│ 👥 Users: ${userCount}
│ 🧵 Groups: ${groupCount}
│ 📡 Ping: ${ping}ms
│ Status: ${status}
╰───────────────⟡
`;

      api.sendMessage(msg, event.threadID);
    } catch (err) {
      console.error("Uptime error:", err);
      api.sendMessage("⚠️ Could not retrieve system info.", event.threadID);
    }
  }
};
