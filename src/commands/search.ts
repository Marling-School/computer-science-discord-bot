import { linearSearch, binarySearch } from "comp-sci-maths-lib";
import { NO_MATCH } from 'comp-sci-maths-lib/dist/algorithms/search/common';
import { SearchFunction, SearchUtilities } from "comp-sci-maths-lib/dist/types";
import { Message, MessageEmbed } from "discord.js";
import { MessageHandler, SearchObservation } from "./types";
import {
    stringComparator,
} from "comp-sci-maths-lib/dist/common";
import playable from './playable';

interface SearchHandlers {
    [s: string]: SearchFunction;
}

const searchHandlers: SearchHandlers = {
    'linear': linearSearch,
    'binary': binarySearch
}


const createSearchObsMessage = (items: string[], itemToFind: string, observation: SearchObservation): MessageEmbed => {
    const msg: MessageEmbed = new MessageEmbed()
        .setColor(0x00ff00)
        .setTitle('Searching')
        .setDescription(observation.stageName)
        .addField('Items', items.join(', '))
        .addField('Item To Find', itemToFind)
    if (Object.keys(observation.positionVars).length > 0) {
        msg.addField('Position Variables', Object.entries(observation.positionVars).map(([name, value]) => `${name}=${value}`).join(' '));
    }
    return msg;
}

const search: MessageHandler = async (msg: Message, content: string, splitOnSpace: string[]) => {
    if (splitOnSpace.length <= 3) {
        msg.channel.send('Not enough parts to the command to sort')
        return;
    }

    const [_, searchName, itemToFind, ...items] = splitOnSpace;

    const searchHandler: SearchFunction = searchHandlers[searchName];
    if (!searchHandler) {
        msg.channel.send(`Unknown sorting algorithm ${searchName}, options are ${Object.keys(searchHandlers)}`)
        return;
    }

    const stages: SearchObservation[] = [];
    let lastObservation: SearchObservation;

    const searchUtilities: SearchUtilities<string> = {
        compare: (a, b) => stringComparator(a, b),
        observe: (stageName, positionVars) => {
            lastObservation = {
                stageName,
                positionVars: { ...positionVars },
            };
            stages.push(lastObservation);
        },
    };

    // Add explicit Start Observation
    stages.push({
        stageName: "Starting",
        positionVars: {},
    });

    // Run the algorithm
    let matchIndex: number = NO_MATCH;
    matchIndex = searchHandler(
        items,
        itemToFind,
        searchUtilities
    );

    // Add explicit End Observation
    stages.push({
        stageName: "Finished",
        positionVars: {
            matchIndex,
        },
    });

    playable({
        items: stages,
        originalMsg: msg,
        createEmbedMessage: (stage) => {
            return createSearchObsMessage(items, itemToFind, stage)
        },
        finished: () => {
            msg.channel.send(`Finished searching for ${itemToFind} in ${items.join(', ')}, matchIndex=${matchIndex}`)
        }
    })
}

export default search;