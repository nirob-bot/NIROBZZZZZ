const fs = require("fs-extra");

module.exports = {
  config: {
    name: "out",
    aliases: ["l"],
    version: "2.7",
    author: "Sandy + Kakashi",
    countDown: 5,
    role: 2,
    shortDescription: "Bot will leave GC",
    longDescription: "Short attitude Banglish leave messages",
    category: "admin",
    guide: {
      en: "{pn} [tid,blank]"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      let id;
      if (!args[0]) {
        id = event.threadID;
      } else {
        id = parseInt(args[0]);
      }

      const botID = api.getCurrentUserID();

      // Short bold attitude Banglish lines
      const attitudeLines = [
        "🔥 𝗗𝗿𝗮𝗺𝗮 𝗯𝗲𝘀𝗵𝗶… 𝗮𝗺𝗶 𝗰𝗵𝗶𝗹𝗹 𝗸𝗼𝗿𝘁𝗲 𝗷𝗮𝗰𝗰𝗵𝗶",
        "😏 𝗦𝘄𝗮𝗴 𝗳𝘂𝗹𝗹, 𝗻𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝘇𝗲𝗿𝗼…  𝗼𝗸 𝗯𝘆𝗲!",
        " 😒 𝘁𝗼𝗱𝗲𝗿 𝘀𝘂𝗸𝗵 𝗱𝗶𝘁𝗲 𝗮𝘀𝗰𝗵𝗶𝗹𝗮𝗺....🐸\𝗻 𝗸𝗶𝗻𝘁𝗼 𝘁𝗼𝗿𝗮 𝘀𝘂𝗸𝗵 𝗽𝗮𝘄𝗮𝗿 𝗷𝗼𝗴𝗴𝗼 𝗻𝗮𝗶 🙂🙏🏻",
        "😓 𝗮𝗷𝗸𝗲 𝗮𝗺𝗮𝗿 𝗺𝗼𝗻 𝘃𝗮𝗹𝗼 𝗻𝗲𝗶 .. 𝘁𝗮𝗶 𝗷𝗮 𝗴𝗮 😔"
      ];

      const leaveMsg = attitudeLines[Math.floor(Math.random() * attitudeLines.length)];

      await api.sendMessage(leaveMsg, id);
      await api.removeUserFromGroup(botID, id);

    } catch (e) {
      console.log(e);
    }
  }
};
