const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

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

module.exports = {
  config: {
    name: "help",
    version: "4.0",
    author: "ＮＩＲＯＢ ᶻ 𝗓 𐰁 (Aesthetic update by Kakashi)",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Kakashi - BOT help menu, split into 10 pages!",
    },
    longDescription: {
      en: "Shows commands with aesthetic style (no pic) on 10 pages.",
    },
    category: "info",
    guide: {
      en: "{pn} [1-10]",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    let page = 1;
    if (args.length > 0) {
      const p = parseInt(args[0]);
      if (p >= 1 && p <= 10) page = p;
    }

    const availableCommands = [];
    for (const [name, cmd] of commands) {
      if (cmd.config.role > role) continue;
      availableCommands.push(name);
    }
    availableCommands.sort();

    const splitCommands = splitArray(availableCommands, 10);
    const commandsOnPage = splitCommands[page - 1] || [];

    let msg = `
╔═══════•°🌸°•═══════╗
     🐾 𝙺𝚊𝚔𝚊𝚜𝚑𝚒 𝙷𝚎𝚕𝚙 𝙼𝚎𝚗𝚞 🐾
         𝙿𝚊𝚐𝚎 ${page}/10
╚═══════•°🌸°•═══════╝\n\n`;

    const categories = {};
    for (const cmdName of commandsOnPage) {
      const cmd = commands.get(cmdName) || commands.get(aliases.get(cmdName));
      if (!cmd) continue;
      const cat = cmd.config.category || "Other";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmdName);
    }

    for (const catName of Object.keys(categories)) {
      msg += `🌷  ${stylize(catName)} 🌷\n`;
      msg += categories[catName]
        .map((cmd) => `➺ ${prefix}${cmd}`)
        .join("   ") + "\n\n";
    }

    msg += `╭──────────────────────────╮\n`;
    msg += `   ✨ Use "${prefix}help ${page === 10 ? 1 : page + 1}" to see more ✨\n`;
    msg += `   🌸 𝙳𝚎𝚟: 𝙽𝚒𝚛𝚘𝚋 ꨄ︎ | 𝙽𝚒𝚌𝚔: 𝙺𝚊𝚔𝚊𝚜𝚑𝚒 ꨄ︎\n`;
    msg += `   🔗 FB: https://www.facebook.com/hatake.kakashi.NN\n`;
    msg += `╰──────────────────────────╯\n`;

    await message.reply(msg);
  },
};

function stylize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
