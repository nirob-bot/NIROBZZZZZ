module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.1.0",
  credits: "Nayan modify by Nirob",
  description: "Notify when a user leaves or is kicked",
  category: "event"
};

module.exports.onStart = async function ({ api, event, Users }) {
  try {
    // যদি bot নিজে leave করে, কিছুই পাঠাবো না
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    // নাম বের করা
    let name;
    try {
      name =
        global.data?.userName?.get(event.logMessageData.leftParticipantFbId) ||
        (await Users.getNameUser(event.logMessageData.leftParticipantFbId));
    } catch (e) {
      name = "Unknown User"; // fallback
    }

    // নিজে থেকে leave নাকি admin kick করল
    const type =
      event.author == event.logMessageData.leftParticipantFbId
        ? "লিভ নেউয়ার জন্য ধন্যবাদ 🤢"
        : "Kicked by Administrator";

    // Message তৈরি
    const msg = `তুই ${name} গ্রুপে থাকার যোগ্য না আবাল .\n\n${type}`;

    // 🔥 Catbox video URL (mp4 direct link)
    const videoUrl = "https://files.catbox.moe/yourvideo.mp4"; // এখানে তোমার mp4 link বসাও

    // Send message with video
    return api.sendMessage(
      {
        body: msg,
        attachment: await global.utils.getStreamFromURL(videoUrl),
      },
      event.threadID
    );
  } catch (err) {
    console.error("Leave event error:", err);
  }
};
