import Discord from "discord.js";
import { MessageHandler } from "./types";

const traverse: MessageHandler = (msg: Discord.Message, content: string, splitOnSpace: string[]) => {
    const embed = new Discord.MessageEmbed()
        // Set the title of the field
        .setTitle('A slick little embed')
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription('Hello, this is a slick embed!');
    // Send the embed to the same channel as the message
    msg.channel.send(embed);
}

export default traverse;