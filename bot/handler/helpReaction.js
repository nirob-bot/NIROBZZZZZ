/**
 * Placeholder for helpReaction.js
 * This allows Goat Bot to start without the "Cannot find module" error.
 * Replace this with the official file from https://github.com/ntkhang03/Goat-Bot-V2 later.
 */

module.exports = {
    // Example structure: store reaction functions here
    reactions: {},

    addReaction: function(name, callback) {
        this.reactions[name] = callback;
    },

    getReaction: function(name) {
        return this.reactions[name] || null;
    }
};
