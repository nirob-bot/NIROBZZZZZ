const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "Nayan modified by NIROB",
	description: "Notify leave with Catbox MP4 video",
};

module.exports.OnStart = async function({ api, event, Users, Threads }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	const { threadID } = event;

	// Thread data
	const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
	const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
	const type = (event.author == event.logMessageData.leftParticipantFbId) ? "লিভ নেউয়ার জন্য ধন্যবাদ 🤢" : "Kicked by Administrator";

	// Custom message
	let msg = (typeof data.customLeave === "undefined")
		? "তুই {name} গ্রুপে থাকার যোগ্য না আবাল .\n\n{type}" 
		: data.customLeave;
	msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

	// Load Catbox video from JSON
	const jsonPath = path.join(__dirname, "..", "nirob", "leave.json");
	let videoURL = null;

	if (fs.existsSync(jsonPath)) {
		const videos = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
		if (Array.isArray(videos) && videos.length > 0) {
			videoURL = videos[0]; // fixed video
		}
	}

	// Prepare message
	let formPush = { body: msg };
	if (videoURL) {
		formPush.attachment = await getVideoStream(videoURL);
	}

	return api.sendMessage(formPush, threadID);
};

// Helper: download video from URL
async function getVideoStream(url) {
	const fs = require("fs-extra");
	const path = require("path");
	const axios = require("axios");
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
