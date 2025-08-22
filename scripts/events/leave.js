const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.2",
    credits: "Nayan modified by NIROB",
    description: "Send Catbox video when someone leaves",
    category: "event"
  },

  onStart: async function ({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

    const { threadID } = event;

    // ✅ Safe thread data fetch
    let threadData;
    try {
      const threadInfo = await Threads.getData(threadID);
      threadData = threadInfo?.data || {};
    } catch (e) {
      threadData = {};
    }

    // ✅ Safe username fetch
    let name;
    try {
      name = global.data?.userName?.get(event.logMessageData.leftParticipantFbId) 
          || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
    } catch (e) {
      name = "Unknown User";
    }

    const type = (event.author == event.logMessageData.leftParticipantFbId)
      ? "লিভ নেউয়ার জন্য ধন্যবাদ 🤢"
      : "Kicked by Administrator";

    // Custom leave message
    let msg = (typeof threadData.customLeave === "undefined")
      ? "তুই {name} গ্রুপে থাকার যোগ্য না আবাল .\n\n{type}"
      : threadData.customLeave;

    msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

    // Load video list from JSON
    const jsonPath = path.join(__dirname, "..", "nirob", "leave.json");
    let formPush = { body: msg };

    if (fs.existsSync(jsonPath)) {
      try {
        const videos = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        if (Array.isArray(videos) && videos.length > 0) {
          // Random video instead of fixed index
          const videoURL = videos[Math.floor(Math.random() * videos.length)];
          formPush.attachment = await getVideoStream(videoURL);
        }
      } catch (e) {
        console.error("❌ Error parsing leave.json:", e);
      }
    }

    return api.sendMessage(formPush, threadID);
  }
};

// Helper: download video to tmp file
async function getVideoStream(url) {
  const tmpPath = path.join(__dirname, "..", "nirob", "tmpLeaveVideo.mp4");
  const writer = fs.createWriteStream(tmpPath);

  const response = await axios({ url, method: "GET", responseType: "stream" });
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  return fs.createReadStream(tmpPath);
}
