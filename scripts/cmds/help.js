const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

const helpImages = [
  "https://files.catbox.moe/wseew7.jpg",
  "https://files.catbox.moe/tywnfi.jpg",
  "https://files.catbox.moe/tse9uk.jpg",
  "https://files.catbox.moe/l8d5af.jpg"
];

// Get random image
function getRandomImage() {
  return helpImages[Math.floor(Math.random() * helpImages.length)];
}

// Build category string
function buildCategory(catName, commands, prefix) {
  const cmdList = commands.map(c => `${prefix}${c}`).join("   ");
  return `───────────────\nCategory: ${catName}\n${cmdList}\n───────────────\n`;
}

module.exports = {
  config: {
    name: "help",
    version: "16.3",
    author: "ＮＩＲＯＢ",
    role: 0,
    shortDescription: { en: "Help menu with 🖤 reaction and images" },
    longDescription: { en: "Shows commands grouped by category with catbox images & reaction pagination." },
    category: "info",
    guide: { en: "{pn} [1-10]" },
  },

  onStart: async function({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID) || global.GoatBot.config.prefix || "!";
    let page = 1;

    if (args.length > 0) {
      const p = parseInt(args[0]);
      if (!isNaN(p) && p >= 1 && p <= 10) page = p;
    }

    // Filter commands according to role
    const availableCommands = [];
    for (const [name, cmd] of commands) {
      if (cmd.config.role > role) continue;
      availableCommands.push(cmd);
    }

    // Group commands by category
    const categories = {};
    for (const cmd of availableCommands) {
      const cat = cmd.config.category || "Other";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    const allCategories = Object.keys(categories);
    const totalPages = 10;
    const perPage = Math.ceil(allCategories.length / totalPages);

    // Function to send a page
    async function sendPage(p) {
      const startIndex = (p - 1) * perPage;
      const endIndex = startIndex + perPage;
      const pageCategories = allCategories.slice(startIndex, endIndex);

      // Build message
      let msg = `🐾 Kakashi Help Menu 🐾\n         Page ${p}/${totalPages}\n────────────────────────────\n`;
      for (const cat of pageCategories) {
        msg += buildCategory(cat, categories[cat], prefix);
      }
      msg += `────────────────────────────\nDev: Nirob | Nick: Kakashi\nFB: https://facebook.com/hatake.kakashi.NN\n────────────────────────────\nReact 🖤 to see next page.\n────────────────────────────\n`;

      const sentMsg = await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(getRandomImage())
      });

      // Save reaction listener
      global.GoatBot.onReaction.set(sentMsg.messageID, {
        page: p,
        categories,
        threadID: event.threadID,
        prefix,
        messageObj: message,
        onReact: async (eventReact) => {
          if (eventReact.reaction !== '🖤') return;

          try {
            // Delete old message
            await global.GoatBot.api.unsendMessage(eventReact.messageID);
          } catch (e) {}

          // Next page
          let nextPage = p + 1;
          if (nextPage > totalPages) nextPage = 1;

          // Send next page
          await sendPage(nextPage);
        }
      });
    }

    await sendPage(page);
  }
};
