import { bubbleSort, quickSort, mergeSort, insertionSort } from "comp-sci-maths-lib";
import { CustomisableSortFunction } from "comp-sci-maths-lib/dist/algorithms/sort/types";
import Discord from "discord.js";
import { sortUtilitiesWithMsg } from "./common";
import { MessageHandler } from "./types";

interface SortHandlers {
    [s: string]: CustomisableSortFunction<any>;
}

const sortHandlers: SortHandlers = {
    'bubble': bubbleSort,
    'quick': quickSort,
    'merge': mergeSort,
    'insertion': insertionSort,
}

const sort: MessageHandler = (msg: Discord.Message, content: string, splitOnSpace: string[]) => {
    if (splitOnSpace.length > 2) {
        const [_, sortName, ...items] = splitOnSpace;

        msg.channel.send(new Discord.MessageEmbed()
            .setColor(0xff0000)
            .setTitle(`Sorting using ${sortName}`)
            .setDescription(`Sorting ${items}`));

        const sortHandler: CustomisableSortFunction<any> = sortHandlers[sortName]
        if (!!sortHandler) {
            const sorted = sortHandler(items, sortUtilitiesWithMsg(msg));

            msg.channel.send(new Discord.MessageEmbed()
                .setColor(0x00ff00)
                .setTitle("Sort Complete")
                .setDescription(`Items are now ${sorted}`));
        } else {
            msg.channel.send(`Unknown sorting algorithm ${sortName}, options are ${Object.keys(sortHandlers)}`)
        }
    } else {
        msg.channel.send('Not enough parts to the command to sort')
    }
}

export default sort;