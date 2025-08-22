module.exports = {
  config: {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.9",
    credits: "Nayan modified by NIROB",
    description: "Send Catbox video only when someone leaves by themselves",
    category: "event"
  },

  onStart: async function ({ api, event, Users }) {
    try {
      // Bot নিজে leave করলে কিছু পাঠাবে না
      if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

      // শুধু তখন trigger হবে যখন ইউজার নিজে leave করে
      if (event.author != event.logMessageData.leftParticipantFbId) return;

      // ইউজারের নাম fetch
      let name = "Unknown User";
      try {
        name = global.data?.userName?.get(event.logMessageData.leftParticipantFbId)
               || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
      } catch {}

      const msg = `${userName} তুই গ্রুপে থাকার যোগ্য না যা ভাগ 🤢`;

      // Fixed Catbox video URL
      const videoURL = "https://files.catbox.moe/918f0h.mp4";

      let attachment = null;
      // Video fetch fail হলেও bot crash হবে না
      if (global.utils?.getStreamFromURL) {
        try {
          attachment = await global.utils.getStreamFromURL(videoURL);
        } catch (e) {
          console.error("❌ Video fetch failed, sending only message:", e.message);
        }
      }

      return api.sendMessage(
        { body: msg, attachment },
        event.threadID
      );
    } catch (err) {
      console.error("❌ Leave event error:", err);
    }
  }
};
