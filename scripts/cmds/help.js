const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const catboxImages = [
  "https://files.catbox.moe/wseew7.jpg",
  "https://files.catbox.moe/tywnfi.jpg",
  "https://files.catbox.moe/tse9uk.jpg",
  "https://files.catbox.moe/l8d5af.jpg"
];

function splitArray(arr, parts = 10) {
  const len = arr.length;
  const out = [];
  let i = 0;
  while (i < len) {
    out.push(arr.slice(i, i + Math.ceil(len / parts)));
    i += Math.ceil(len / parts);
  }
  return out;
}

module.exports = {
  config: {
    name: "help",
    version: "7.1",
    author: "ＮＩＲＯＢ (Kakashi update)",
    role: 0,
    shortDescription: { en: "Kakashi - BOT help menu with 🖤 next page" },
    longDescription: { en: "Interactive help menu 10 pages with random catbox image" },
    category: "info",
    guide: { en: "{pn} [1-10]" },
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID) || global.GoatBot.config.prefix || "!";
    let page = 1;
    if (args.length > 0) {
      const p = parseInt(args[0]);
      if (p >= 1 && p <= 10) page = p;
    }

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
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const pageCategories = allCategories.slice(startIndex, endIndex);

    // Build message
    const imgUrl = catboxImages[Math.floor(Math.random() * catboxImages.length)];
    let msg = `───────────────\n`;
    msg += `Help Menu - Page ${page}/${totalPages}\n───────────────\n\n`;

    for (const cat of pageCategories) {
      msg += `Category: ${cat}\n`;
      msg += categories[cat].map(cmdName => `${prefix}${cmdName}`).join("   ") + "\n\n";
    }

    msg += `───────────────\n`;
    msg += `Dev: Nirob | Nick: Kakashi\n`;
    msg += `FB: https://facebook.com/hatake.kakashi.NN\n`;
    msg += `Type "/help ${page === totalPages ? 1 : page + 1}" to see next page\n`;
    msg += `───────────────\n`;

    const sentMsg = await message.reply({ body: msg, attachment: await global.utils.getStreamFromURL(imgUrl) });

    // Reaction for next page
    global.GoatBot.onReaction.set(sentMsg.messageID, {
      author: event.senderID,
      page,
      totalPages,
      sendPage: async (nextPage, data) => {
        const nextMsg = await module.exports.onStart({ message, args: [nextPage.toString()], event, role });
        global.GoatBot.onReaction.set(nextMsg.messageID, data);
      },
      threadID: event.threadID,
      prefix
    });
  }
};
