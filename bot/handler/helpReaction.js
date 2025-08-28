module.exports = async function({ event }) {
    const NEXT_PAGE_EMOJI = "🖤";
    const data = global.GoatBot.onReaction.get(event.messageID);
    if (!data) return;
    if (event.userID !== data.author) return;
    if (event.reaction !== NEXT_PAGE_EMOJI) return;

    // Remove old message
    await global.GoatBot.api.unsendMessage(event.messageID);

    // Next page
    let nextPage = data.page + 1;
    if (nextPage > data.totalPages) nextPage = 1;

    // Send next page
    await data.sendPage(nextPage, data);
};
