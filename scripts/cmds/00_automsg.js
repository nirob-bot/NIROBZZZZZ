// commands/automsg.js
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "automsg",
    version: "3.1",
    author: "NIROB",
    countDown: 5,
    role: 0,
    shortDescription: "Daily Auto SMS (Morning & Night in all groups, Bangla)",
    longDescription: "Bot will send Bangla Good Morning at 5:30 AM and Good Night at 10:30 PM in all groups with gif",
    category: "system",
  },

  onStart: async function () {},

  onChat: async function () {},

  onLoad: function ({ api }) {
    setInterval(async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      const morningFolder = path.join(__dirname, "automsg", "morning");
      const nightFolder = path.join(__dirname, "automsg", "night");

      // === সকাল ৫:৩০ ===
      if (hours === 5 && minutes === 30) {
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

      // === রাত ১০:৩০ ===
      if (hours === 22 && minutes === 30) {
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
