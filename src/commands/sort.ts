import { bubbleSort, quickSort, mergeSort, insertionSort } from "comp-sci-maths-lib";
import { CustomisableSortFunction } from "comp-sci-maths-lib/dist/algorithms/sort/types";
import { simpleSwap, stringComparator } from "comp-sci-maths-lib/dist/common";
import { PositionVars } from "comp-sci-maths-lib/dist/types";
import Discord from "discord.js";
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
    const messages: string[] = [];

    if (splitOnSpace.length > 2) {
        const [_, sortName, ...itemsToSort] = splitOnSpace;

        const sortHandler: CustomisableSortFunction<any> = sortHandlers[sortName]
        if (!!sortHandler) {
            const sorted = sortHandler(itemsToSort, {
                compare: (a, b) => {
                    const result = stringComparator(a, b);
                    messages.push(`Comparing ${a} with ${b} to give ${result}`)
                    return result;
                },
                swap: (arr, from, to) => {
                    messages.push(`Swapping item [${from}] with [${to}]`)
                    simpleSwap(arr, from, to);
                },
                observe: (stageName: string, data: string[], positionVars: PositionVars) => {
                    messages.push(`Observing ${stageName} with data:${data}, Position Variables are: ${JSON.stringify(positionVars)}`)
                }
            });

            messages.push(`Sorted ${sorted}`);
        } else {
            messages.push(`Unknown sorting algorithm ${sortName}, options are ${Object.keys(sortHandlers)}`)
        }
    } else {
        messages.push('Not enough parts to the command to sort')
    }

    msg.channel.send(messages.join('\n'))
}

export default sort;