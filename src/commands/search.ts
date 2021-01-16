import { linearSearch, binarySearch } from "comp-sci-maths-lib";
import { stringComparator } from "comp-sci-maths-lib/dist/common";
import { PositionVars, SearchFunction } from "comp-sci-maths-lib/dist/types";
import Discord from "discord.js";
import { MessageHandler } from "./types";

interface SearchHandlers {
    [s: string]: SearchFunction;
}

const searchHandlers: SearchHandlers = {
    'linear': linearSearch,
    'binary': binarySearch
}

const search: MessageHandler = (msg: Discord.Message, content: string, splitOnSpace: string[]) => {
    const messages: string[] = [];

    if (splitOnSpace.length > 3) {
        const [_, searchName, itemToFind, ...itemsToSearchThrough] = splitOnSpace;

        const searchHandler: SearchFunction = searchHandlers[searchName]
        if (!!searchHandler) {
            const found = searchHandler(itemsToSearchThrough, itemToFind, {
                compare: (a, b) => {
                    const result = stringComparator(a, b);
                    messages.push(`Comparing ${a} with ${b}`)
                    return result
                },
                observe: (stageName: string, positionVars?: PositionVars) => {
                    messages.push(`Observing ${stageName} Position Variables are: ${JSON.stringify(positionVars)}`)
                }
            });

            messages.push(`Found ${found}`);
        } else {
            messages.push(`Unknown sorting algorithm ${searchName}, options are ${Object.keys(searchHandlers)}`)
        }
    } else {
        messages.push('Not enough parts to the command to sort')
    }

    msg.channel.send(messages.join('\n'))
}

export default search;