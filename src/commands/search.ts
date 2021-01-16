import { linearSearch, binarySearch } from "comp-sci-maths-lib";
import { NO_MATCH } from 'comp-sci-maths-lib/dist/algorithms/search/common';
import { SearchFunction } from "comp-sci-maths-lib/dist/types";
import Discord from "discord.js";
import { searchUtilitiesWithMsg } from "./common";
import { MessageHandler } from "./types";

interface SearchHandlers {
    [s: string]: SearchFunction;
}

const searchHandlers: SearchHandlers = {
    'linear': linearSearch,
    'binary': binarySearch
}

const search: MessageHandler = (msg: Discord.Message, content: string, splitOnSpace: string[]) => {
    if (splitOnSpace.length > 3) {
        const [_, searchName, itemToFind, ...items] = splitOnSpace;

        msg.channel.send(new Discord.MessageEmbed()
            .setColor(0xff0000)
            .setTitle(`Sorting using ${searchName}`)
            .setDescription(`Searching for ${itemToFind} in ${items}`));

        const searchHandler: SearchFunction = searchHandlers[searchName]
        if (!!searchHandler) {
            const found = searchHandler(items, itemToFind, searchUtilitiesWithMsg(msg));

            if (found === NO_MATCH) {
                msg.channel.send(new Discord.MessageEmbed()
                    .setColor(0xff0000)
                    .setTitle('Search Complete')
                    .setDescription(`Could not find ${itemToFind} in ${items}`));
            } else {
                msg.channel.send(new Discord.MessageEmbed()
                    .setColor(0x00ff00)
                    .setTitle("Search Complete")
                    .setDescription(`Found ${itemToFind} at ${found} in ${items}`));
            }
        } else {
            msg.channel.send(`Unknown sorting algorithm ${searchName}, options are ${Object.keys(searchHandlers)}`)
        }
    } else {
        msg.channel.send('Not enough parts to the command to sort')
    }
}

export default search;