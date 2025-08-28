/**
 * Goat Bot Main File with Help Reaction 🖤 Support
 */

process.on('unhandledRejection', error => console.log(error));
process.on('uncaughtException', error => console.log(error));

const axios = require("axios");
const fs = require("fs-extra");
const google = require("googleapis").google;
const nodemailer = require("nodemailer");
const { execSync } = require('child_process');
const path = require("path");
const log = require('./logger/log.js');

process.env.BLUEBIRD_W_FORGOTTEN_RETURN = 0;

const { NODE_ENV } = process.env;

const dirConfig = path.normalize(`${__dirname}/config${['production','development'].includes(NODE_ENV)?'.dev.json':'.json'}`);
const dirConfigCommands = path.normalize(`${__dirname}/configCommands${['production','development'].includes(NODE_ENV)?'.dev.json':'.json'}`);
const dirAccount = path.normalize(`${__dirname}/account${['production','development'].includes(NODE_ENV)?'.dev.txt':'.txt'}`);

// Validate JSON
function validJSON(pathDir){
    try{
        if(!fs.existsSync(pathDir)) throw new Error(`File "${pathDir}" not found`);
        execSync(`npx jsonlint "${pathDir}"`, { stdio: 'pipe' });
        return true;
    }catch(err){
        let msgError = err.message;
        msgError = msgError.split("\n").slice(1).join("\n");
        const indexPos = msgError.indexOf("    at");
        msgError = msgError.slice(0, indexPos != -1 ? indexPos-1 : msgError.length);
        throw new Error(msgError);
    }
}

for(const pathDir of [dirConfig, dirConfigCommands]){
    try{ validJSON(pathDir); }
    catch(err){
        log.error("CONFIG", `Invalid JSON file "${pathDir.replace(__dirname,"")}":\n${err.message.split("\n").map(line=>`  ${line}`).join("\n")}\nPlease fix it and restart bot`);
        process.exit(0);
    }
}

const config = require(dirConfig);
const configCommands = require(dirConfigCommands);

global.GoatBot = {
    startTime: Date.now() - process.uptime()*1000,
    commands: new Map(),
    eventCommands: new Map(),
    commandFilesPath: [],
    eventCommandsFilesPath: [],
    aliases: new Map(),
    onFirstChat: [],
    onChat: [],
    onEvent: [],
    onReply: new Map(),
    onReaction: new Map(), // 🖤 reaction store
    onAnyEvent: [],
    config,
    configCommands,
    envCommands: {},
    envEvents: {},
    envGlobal: {},
    reLoginBot: function(){},
    Listening: null,
    oldListening: [],
    callbackListenTime: {},
    storage5Message: [],
    fcaApi: null,
    botID: null
};

global.db = {
    allThreadData: [],
    allUserData: [],
    allDashBoardData: [],
    allGlobalData: [],
    threadModel: null,
    userModel: null,
    dashboardModel: null,
    globalModel: null,
    threadsData: null,
    usersData: null,
    dashBoardData: null,
    globalData: null,
    receivedTheFirstMessage: {}
};

global.client = {
    dirConfig,
    dirConfigCommands,
    dirAccount,
    countDown: {},
    cache: {},
    database: {
        creatingThreadData: [],
        creatingUserData: [],
        creatingDashBoardData: [],
        creatingGlobalData: []
    },
    commandBanned: configCommands.commandBanned
};

const utils = require("./utils.js");
global.utils = utils;
const { colors } = utils;

global.temp = {
    createThreadData: [],
    createUserData: [],
    createThreadDataError: [],
    filesOfGoogleDrive: { arraybuffer:{}, stream:{}, fileNames:{} },
    contentScripts: { cmds:{}, events:{} }
};

// watch config changes
const watchAndReloadConfig = (dir, type, prop, logName)=>{
    let lastModified = fs.statSync(dir).mtimeMs;
    let isFirstModified = true;

    fs.watch(dir, (eventType)=>{
        if(eventType === type){
            const oldConfig = global.GoatBot[prop];
            setTimeout(()=>{
                if(isFirstModified){ isFirstModified=false; return; }
                if(lastModified === fs.statSync(dir).mtimeMs) return;
                try{ global.GoatBot[prop] = JSON.parse(fs.readFileSync(dir,'utf-8')); log.success(logName, `Reloaded ${dir.replace(process.cwd(),"")}`); }
                catch(err){ log.warn(logName, `Can't reload ${dir.replace(process.cwd(),"")}`); global.GoatBot[prop] = oldConfig; }
                finally{ lastModified = fs.statSync(dir).mtimeMs; }
            },200);
        }
    });
};

watchAndReloadConfig(dirConfigCommands,'change','configCommands','CONFIG COMMANDS');
watchAndReloadConfig(dirConfig,'change','config','CONFIG');

global.GoatBot.envGlobal = global.GoatBot.configCommands.envGlobal;
global.GoatBot.envCommands = global.GoatBot.configCommands.envCommands;
global.GoatBot.envEvents = global.GoatBot.configCommands.envEvents;

// === AUTO RESTART ===
if(config.autoRestart){
    const time = config.autoRestart.time;
    if(!isNaN(time) && time>0){
        utils.log.info("AUTO RESTART", utils.convertTime(time,true));
        setTimeout(()=>{ utils.log.info("AUTO RESTART", "Restarting..."); process.exit(2); }, time);
    }else{
        const cron = require("node-cron");
        cron.schedule(time, ()=>{ utils.log.info("AUTO RESTART", "Restarting..."); process.exit(2); });
    }
}

// === Mail setup ===
(async()=>{
    const { gmailAccount } = config.credentials;
    const { email, clientId, clientSecret, refreshToken } = gmailAccount;
    const OAuth2 = google.auth.OAuth2;
    const OAuth2_client = new OAuth2(clientId, clientSecret);
    OAuth2_client.setCredentials({ refresh_token: refreshToken });
    let accessToken;
    try{ accessToken = await OAuth2_client.getAccessToken(); }
    catch(err){ throw new Error("Google API token expired"); }
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com', service:'Gmail', auth:{
            type:'OAuth2', user:email, clientId, clientSecret, refreshToken, accessToken
        }
    });
    global.utils.sendMail = async({to,subject,text,html,attachments})=>{
        const info = await transporter.sendMail({from:email,to,subject,text,html,attachments});
        return info;
    };
})();

// === Version Check ===
(async()=>{
    const { data:{ version } } = await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json");
    const currentVersion = require("./package.json").version;
    if(compareVersion(version,currentVersion)===1) utils.log.master("NEW VERSION", `Current: ${currentVersion} → Latest: ${version}`);
})();

// === Bind Help Reaction Listener ===
const helpReaction = require("./handlers/helpReaction");
global.GoatBot.api.listenReaction(async(event)=>{
    await helpReaction({ event });
});

// === Login ===
require(`./bot/login/login${NODE_ENV==='development'?'.dev.js':'.js'}`);

// === Version Compare Function ===
function compareVersion(v1,v2){
    v1=v1.split("."); v2=v2.split(".");
    for(let i=0;i<3;i++){
        if(parseInt(v1[i])>parseInt(v2[i])) return 1;
        if(parseInt(v1[i])<parseInt(v2[i])) return -1;
    }
    return 0;
	}
