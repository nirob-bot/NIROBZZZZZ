/**
 * helpReaction.js
 * Works with Goat Bot commands that use reactions (like /help with 🖤)
 * Placeholder version for testing without official Messenger hooks.
 * Later you can replace with the official version for full API support.
 */

module.exports = {
    // Map to store reactions for messages
    onReactionMap: new Map(),

    /**
     * Add a reaction handler for a specific message
     * @param {string|number} messageID
     * @param {object} callbackObj - { page, categories, threadID, prefix, messageObj, onReact }
     */
    addReaction: function(messageID, callbackObj) {
        this.onReactionMap.set(messageID, callbackObj);
    },

    /**
     * Trigger a reaction manually (for testing)
     * @param {string|number} messageID
     * @param {object} reactionEvent - { reaction: '🖤', messageID, userID }
     */
    triggerReaction: async function(messageID, reactionEvent) {
        const callbackObj = this.onReactionMap.get(messageID);
        if (callbackObj && typeof callbackObj.onReact === "function") {
            await callbackObj.onReact(reactionEvent);
        }
    },

    /**
     * Remove a reaction handler (optional)
     * @param {string|number} messageID
     */
    removeReaction: function(messageID) {
        if (this.onReactionMap.has(messageID)) {
            this.onReactionMap.delete(messageID);
        }
    }
};
