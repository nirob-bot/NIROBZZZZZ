module.exports = {
  config: {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.1.0",
    credits: "Nayan modified by NIROB",
    description: "Send Catbox video only when someone leaves by themselves with proper name",
    category: "event"
  },

  onStart: async function ({ api, event, Users }) {
    try {
      if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
      if (event.author != event.logMessageData.leftParticipantFbId) return; // Only self-leave

      const { leftParticipantFbId, threadID } = event.logMessageData;

      // ✅ Retry name fetch 2 times
      let name;
      for (let i = 0; i < 2; i++) {
        try {
          name = await Users.getNameUser(leftParticipantFbId);
          if (name) break;
        } catch {}
      }
      if (!name) name = `User (${leftParticipantFbId})`; // Fallback if still fails

      const msg = `${name} তুই গ্রুপে থাকার যোগ্য না যা ভাগ 😡';

      // Fixed Catbox video
      const videoURL = "https://files.catbox.moe/918f0h.mp4";

      let attachment = null;
      if (global.utils?.getStreamFromURL) {
        try {
          attachment = await global.utils.getStreamFromURL(videoURL);
        } catch (e) {
          console.error("❌ Video fetch failed, sending only message:", e.message);
        }
      }

      return api.sendMessage({ body: msg, attachment }, threadID);

    } catch (err) {
      console.error("❌ Leave event error:", err);
    }
  }
};
