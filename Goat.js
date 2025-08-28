/**
 * Goat Bot Main Entry (Fixed by NIROB)
 */

process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const fs = require('fs');
const path = require('path');
const log = require('./logger/log.js');
const { spawn } = require('child_process');

// Ensure Node version
const nodeVersion = process.versions.node.split('.')[0];
if (parseInt(nodeVersion) < 18) {
  console.error("Node.js v18+ required!");
  process.exit(1);
}

// ================= GLOBAL GOAT BOT INIT ================= //
if (!global.GoatBot) global.GoatBot = {};

global.GoatBot = {
  startTime: Date.now(),
  commands: new Map(),
  aliases: new Map(),
  onReply: new Map(),
  onReaction: new Map(),
  onEvent: [],
  onChat: [],
  config: {},
  configCommands: {},
  botID: null
};

// ================= UTILS INIT ================= //
if (!global.utils) {
  global.utils = require('./utils.js');
}

// ================= CONFIG LOAD ================= //
const NODE_ENV = process.env.NODE_ENV || 'production';
const dirConfig = path.join(__dirname, `config${NODE_ENV === 'development' ? '.dev.json' : '.json'}`);
const dirConfigCommands = path.join(__dirname, `configCommands${NODE_ENV === 'development' ? '.dev.json' : '.json'}`);

try {
  global.GoatBot.config = JSON.parse(fs.readFileSync(dirConfig, 'utf-8'));
  global.GoatBot.configCommands = JSON.parse(fs.readFileSync(dirConfigCommands, 'utf-8'));
} catch (err) {
  console.error("Error loading config files:", err.message);
  process.exit(1);
}

// ================= WATCH CONFIG ================= //
fs.watch(dirConfig, () => {
  try {
    global.GoatBot.config = JSON.parse(fs.readFileSync(dirConfig, 'utf-8'));
    log.success("CONFIG", "Reloaded main config");
  } catch (err) {
    log.warn("CONFIG", "Failed to reload main config");
  }
});

fs.watch(dirConfigCommands, () => {
  try {
    global.GoatBot.configCommands = JSON.parse(fs.readFileSync(dirConfigCommands, 'utf-8'));
    log.success("CONFIG COMMANDS", "Reloaded commands config");
  } catch (err) {
    log.warn("CONFIG COMMANDS", "Failed to reload commands config");
  }
});

// ================= LOAD LOGIN ================= //
try {
  require(`./bot/login/login${NODE_ENV === 'development' ? '.dev.js' : '.js'}`);
} catch (err) {
  console.error("Login file missing or failed:", err.message);
  process.exit(1);
}

// ================= AUTO RESTART ================= //
if (global.GoatBot.config?.autoRestart?.time) {
  const time = global.GoatBot.config.autoRestart.time;
  setTimeout(() => {
    log.info("AUTO RESTART", "Restarting bot...");
    process.exit(2);
  }, time);
}

// ================= START SERVER (OPTIONAL) ================= //
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Goat Bot Running ✅"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
