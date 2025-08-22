const fs = require("fs-extra");

module.exports = {
  config: {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.8",
    credits: "Nayan modified by NIROB",
    description: "Send Catbox video only when someone leaves by themselves",
    category: "event"
  },

  onStart: async function ({ api, event, Users }) {
    try {
      // Bot নিজে leave করলে কিছু পাঠাবে না
      if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

      // শুধুমাত্র ইউজার নিজে leave করলে trigger হবে
      if (event.author != event.logMessageData.leftParticipantFbId) return;

      // ইউজারের নাম fetch
      let name;
      try {
        name = global.data?.userName?.get(event.logMessageData.leftParticipantFbId) 
            || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
      } catch (e) {
        name = "Unknown User";
      }

      const msg = `${name} গ্রুপ ছেড়ে চলে গেছে 🤢`;

      // Fixed Catbox video
      const videoURL = "https://files.catbox.moe/918f0h.mp4";

      let attachment = null;
      try {
        attachment = await global.utils.getStreamFromURL(videoURL);
      } catch (e) {
        console.error("❌ Video fetch failed, sending only message:", e.message);
      }

      return api.sendMessage(
        {
          body: msg,
          attachment
        },
        event.threadID
      );
    } catch (err) {
      console.error("❌ Leave event error:", err);
    }
  }
};
