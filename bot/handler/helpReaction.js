module.exports = async function({ event }) {
    // Check if this message has a reaction listener
    if (!global.GoatBot.onReaction.has(event.messageID)) return;

    const data = global.GoatBot.onReaction.get(event.messageID);

    // Remove author check so all users can trigger
    if (data.onReact) await data.onReact(event);
};
