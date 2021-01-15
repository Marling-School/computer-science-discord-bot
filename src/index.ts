import Discord from 'discord.js';
import * as logger from "winston";
import dotenv from 'dotenv'

// Load environment variables
dotenv.config();

// Configure the logger
logger.configure({
    level: "debug",
    transports: [new logger.transports.Console()],
});

// Create Discord client
const client = new Discord.Client();

client.on('ready', () => {

    logger.info('Connected to Discord')
});

client.on('message', (msg) => {
    if (!msg.content.startsWith("!")) return
    if (msg.author.bot) return;

    logger.info(`Saw a Message: ${msg.content}`);


})
logger.info('Attempting Login with ' + process.env.DISCORD_SECRET)

// Login and do ya thing
client.login(process.env.DISCORD_SECRET)