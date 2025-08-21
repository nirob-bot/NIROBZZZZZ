// commands/automsg.js
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "automsg",
    version: "3.3",
    author: "NIROB",
    countDown: 5,
    role: 0,
    shortDescription: "Daily Auto SMS (Morning & Night in all groups, Bangla)",
    longDescription: "Bot will send Bangla Good Morning at 6:00 AM and Good Night at 11:00 PM (Asia/Dhaka timezone) in all groups with gif",
    category: "system",
  },

  onStart: async function () {},
  onChat: async function () {},

  onLoad: function ({ api }) {
    setInterval(async () => {
      // Time Bangladesh অনুযায়ী নেবে
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
      );
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const morningFolder = path.join(__dirname, "automsg", "morning");
      const nightFolder = path.join(__dirname, "automsg", "night");

      // === সকাল ৬:০০ (Asia/Dhaka) ===
      if (hours === 6 && minutes === 0) {
        if (fs.existsSync(morningFolder)) {
          const gifs = fs.readdirSync(morningFolder).filter(f => f.endsWith(".gif"));
          if (gifs.length > 0) {
            const gifPath = path.join(morningFolder, gifs[Math.floor(Math.random() * gifs.length)]);
            const msg = {
              body: "🌸 সুপ্রভাত প্রিয়জন ✨\nআলোর মতন তোমার দিনটাও হোক উজ্জ্বল 🌞💛\nসাফল্য, সুখ আর হাসিতে ভরে উঠুক প্রতিটি ক্ষণ 🌼🌿",
              attachment: fs.createReadStream(gifPath),
            };

            const threads = await api.getThreadList(100, null, ["INBOX"]);
            threads.forEach(thread => {
              if (thread.isGroup) {
                api.sendMessage(msg, thread.threadID);
              }
            });
          }
        }
      }

      // === রাত ১১:০০ (Asia/Dhaka) ===
      if (hours === 23 && minutes === 0) {
        if (fs.existsSync(nightFolder)) {
          const gifs = fs.readdirSync(nightFolder).filter(f => f.endsWith(".gif"));
          if (gifs.length > 0) {
            const gifPath = path.join(nightFolder, gifs[Math.floor(Math.random() * gifs.length)]);
            const msg = {
              body: "🌙 শুভ রাত্রি প্রিয়জন ✨\nতারার আলোয় স্বপ্নগুলো হোক রঙিন 🌌💫\nগভীর নিদ্রায় কাটুক রাত, আসুক নতুন ভোর নতুন আশায় 🌸🌿",
              attachment: fs.createReadStream(gifPath),
            };

            const threads = await api.getThreadList(100, null, ["INBOX"]);
            threads.forEach(thread => {
              if (thread.isGroup) {
                api.sendMessage(msg, thread.threadID);
              }
            });
          }
        }
      }
    }, 60 * 1000); // প্রতি মিনিটে check করবে
  },
};
