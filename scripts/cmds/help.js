const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// Catbox images array
const helpImages = [
  "https://files.catbox.moe/wseew7.jpg",
  "https://files.catbox.moe/tywnfi.jpg",
  "https://files.catbox.moe/tse9uk.jpg",
  "https://files.catbox.moe/l8d5af.jpg"
];

// Split array into n parts evenly
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

// Small caps font function
function toSmallCaps(text) {
  return text.split("").map(c => {
    if (c >= 'A' && c <= 'Z') return String.fromCharCode(c.charCodeAt(0) + 0x1D00);
    if (c >= 'a' && c <= 'z') return String.fromCharCode(c.charCodeAt(0) + 0x1D00);
    return c;
  }).join("");
}

// Get random image
function getRandomImage() {
  return helpImages[Math.floor(Math.random() * helpImages.length)];
}

module.exports = {
  config: {
    name: "help",
    version: "12.0",
    author: "ＮＩＲＯＢ (Kakashi aesthetic + random image)",
    role: 0,
    shortDescription: {
      en: "Kakashi - BOT help menu with 10 pages & random catbox image",
    },
    longDescription: {
      en: "Displays commands in 10 pages with small caps categories, emoji, correct prefix, and a random catbox image.",
    },
    category: "info",
    guide: {
      en: "{pn} [1-10]",
    },
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID) || global.GoatBot.config.prefix || "!";
    let page = 1;
    if (args.length > 0) {
      const p = parseInt(args[0]);
      if (p >= 1 && p <= 10) page = p;
    }

    // Collect commands available for the role
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
    let msg = `
╔════════════════════════╗
│ 🐾 Kakashi Help Menu 🐾
│         Page ${page}/${totalPages}
╚════════════════════════╝\n`;

    for (const cat of pageCategories) {
      const emoji = getCategoryEmoji(cat);
      msg += `Category: ${emoji} ${toSmallCaps(cat)}\n`;
      msg += categories[cat]
        .map(cmdName => `${prefix}${cmdName}`)
        .join("   ") + "\n\n";
    }

    msg += `────────────────────────────\n`;
    msg += `Dev: Nirob | Nick: Kakashi\n`;
    msg += `FB: https://facebook.com/hatake.kakashi.NN\n`;
    msg += `────────────────────────────\n`;
    msg += `Type "${prefix}help ${page === totalPages ? 1 : page + 1}" for next page.\n`;
    msg += `────────────────────────────\n`;

    // Send message with random catbox image
    await message.reply({
      body: msg,
      attachment: await global.utils.getStreamFromURL(getRandomImage()),
    });
  },
};

// Emoji mapping for categories
function getCategoryEmoji(cat) {
  const mapping = {
    "Image": "🐱",
    "Utility": "⚙",
    "Account": "👤",
    "Chat Box": "💬",
    "Owner": "🔒",
    "ChatGPT": "🤖",
    "Media": "🖼",
    "Fun": "🎮",
    "User": "👥",
    "Games": "🧩",
  };
  return mapping[cat] || "🌸";
}
