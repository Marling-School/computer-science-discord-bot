import Discord from 'discord.js';
import * as logger from "winston";
import dotenv from 'dotenv'

dotenv.config();

logger.configure({
    level: "debug",
    transports: [new logger.transports.Console()],
});

const client = new Discord.Client();

client.on('ready', () => {
    logger.info('Connected to Discord')
});

client.on('message', (m) => {
    logger.info(m.content);
})
logger.info('Attempting Login with ' + process.env.DISCORD_SECRET)

client.login(process.env.DISCORD_SECRET)