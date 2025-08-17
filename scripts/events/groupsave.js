module.exports = {
  config: {
    name: "groupSave",
    eventType: ["log:subscribe"], // when bot added to group
  },

  onStart: async function ({ event, threadsData, api }) {
    try {
      const { threadID, logMessageData } = event;
      const addedIDs = logMessageData.addedParticipants.map(u => u.userFbId);

      // Check if bot was added
      if (addedIDs.includes(api.getCurrentUserID())) {
        await threadsData.set(threadID, { isGroup: true });
        console.log(`✅ Bot added to group ${threadID}, saved in DB.`);
      }
    } catch (err) {
      console.error("Group save error:", err);
    }
  }
};
