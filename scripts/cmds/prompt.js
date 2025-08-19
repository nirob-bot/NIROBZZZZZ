const { existsSync, mkdirSync } = require("fs");
const axios = require("axios");
const tinyurl = require('tinyurl');

module.exports = {
  config: {
    name: "prompt",
    aliases: [],
    version: "1.0",
    author: "Vex_Kshitiz",
    countDown: 5,
    role: 0,
    shortDescription: "Generate prompt for an image",
    longDescription: "generate prompt for an image",
    category: "image",
    guide: {
      en: "{p}prompt (reply to image)"
    }
  },

  onStart: async function ({ message, event, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    const { type, messageReply } = event;
    const { attachments, threadID } = messageReply || {};

    if (type === "message_reply" && attachments) {
      const [attachment] = attachments;
      const { url, type: attachmentType } = attachment || {};

      if (!attachment || attachmentType !== "photo") {
        return message.reply("Reply to an image.");
      }

      try {
        const tinyUrl = await tinyurl.shorten(url);
        const apiUrl = `https://mahabub-prompt-api.vercel.app/api/prompt?url=https://i.postimg.cc/90VDXf9t/b908c93ba950c37b67402f734ba589e3.jpg}`;
        const response = await axios.get(apiUrl);

        const { prompt } = response.data;

        message.reply(prompt, threadID);
      } catch (error) {
        console.error(error);
        message.reply("❌ An error occurred while generating the prompt.");
      }
    } else {
      message.reply("Please reply to an image.");
    }
  }
};
