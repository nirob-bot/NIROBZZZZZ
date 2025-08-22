module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.1.0",
	credits: "Nayan modified by NIROB",
	description: "Notify leave with random Drive video",
};

module.exports.Onstart = async function({ api, event, Users, Threads }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	const { createReadStream, existsSync } = global.nodemodule["fs-extra"];
	const { join } = global.nodemodule["path"];
	const { threadID } = event;

	const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
	const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
	const type = (event.author == event.logMessageData.leftParticipantFbId) ? "লিভ নেউয়ার জন্য ধন্যবাদ 🤢" : "Kicked by Administrator";

	// Custom message
	let msg = (typeof data.customLeave === "undefined")
		? "তুই {name} গ্রুপে থাকার যোগ্য না যা ভাগ 😤 .\n\n{type}" 
		: data.customLeave;
	msg = msg.replace(/\{name}/g, name).replace(/\{type}/g, type);

	// JSON path
	const jsonPath = join(__dirname, "nirob", "leave.json");
	let formPush = { body: msg }; // default message

	// Load videos JSON
	if (existsSync(jsonPath)) {
		const videos = JSON.parse(require("fs").readFileSync(jsonPath, "utf-8"));
		if (Array.isArray(videos) && videos.length > 0) {
			const randomVideo = videos[Math.floor(Math.random() * videos.length)];
			formPush = { body: msg, attachment: await getVideoStream(randomVideo) };
		}
	}

	return api.sendMessage(formPush, threadID);
};

// Helper function to download video from URL and return ReadStream
async function getVideoStream(url) {
	const fs = require("fs-extra");
	const path = require("path");
	const axios = require("axios");
	const tmpPath = path.join(__dirname, "nirob", "tmpLeaveVideo.mp4");

	const writer = fs.createWriteStream(tmpPath);
	const response = await axios({ url, method: 'GET', responseType: 'stream' });
	response.data.pipe(writer);

	await new Promise((resolve, reject) => {
		writer.on("finish", resolve);
		writer.on("error", reject);
	});

	return fs.createReadStream(tmpPath);
			}
