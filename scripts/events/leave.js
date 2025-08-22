module.exports = {
  config: {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.6",
    credits: "Nayan modified by NIROB",
    description: "Send 1 Catbox video only when someone leaves by themselves",
    category: "event"
  },

  onStart: async function ({ api, event, Users }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const { threadID } = event;

    // ✅ শুধু তখন কাজ করবে যখন ইউজার নিজে থেকে leave করবে
    if (event.author != event.logMessageData.leftParticipantFbId) return;

    // ইউজারের নাম বের করা
    let name;
    try {
      name = global.data?.userName?.get(event.logMessageData.leftParticipantFbId) 
          || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
    } catch (e) {
      name = "Unknown User";
    }

    // ✅ Catbox direct video URL
    const videoURL = "https://files.catbox.moe/abc123.mp4"; // এখানে ভিডিওর লিঙ্ক বসাও

    return api.sendMessage(
      {
        body: `${name} গ্রুপ ছেড়ে চলে গেছে 🤢`,
        attachment: await global.utils.getStreamFromURL(videoURL)
      },
      threadID
    );
  }
};
