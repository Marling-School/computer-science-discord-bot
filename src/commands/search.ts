import { linearSearch, binarySearch } from "comp-sci-maths-lib";
import { NO_MATCH } from 'comp-sci-maths-lib/dist/algorithms/search/common';
import { SearchFunction, SearchUtilities } from "comp-sci-maths-lib/dist/types";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { MessageHandler, SearchObservation } from "./types";
import {
    stringComparator,
} from "comp-sci-maths-lib/dist/common";

interface SearchHandlers {
    [s: string]: SearchFunction;
}

const searchHandlers: SearchHandlers = {
    'linear': linearSearch,
    'binary': binarySearch
}

const BACK_START = '⏪';
const BACK_STEP = '◀️';
const FORWARD_STEP = '▶️';
const FORWARD_END = '⏩';
const PLAY_CONTROLS = [BACK_START, BACK_STEP, FORWARD_STEP, FORWARD_END];

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

    let observationIndex = 0;
    const liveMessage = await msg.channel.send(createSearchObsMessage(items, itemToFind, stages[observationIndex]));

    // Setup the play controls
    PLAY_CONTROLS.forEach(async p => await liveMessage.react(p));

    // Listen for those controls
    const filter = (reaction: MessageReaction, user: User) => {
        return PLAY_CONTROLS.includes(reaction.emoji.name) && user.id === msg.author.id;
    };

    const collector = liveMessage.createReactionCollector(filter, { time: 150000 });

    collector.on('collect', (reaction: MessageReaction, user: User) => {
        reaction.users.remove(user.id);

        switch (reaction.emoji.name) {
            case BACK_START:
                observationIndex = 0;
                break;
            case BACK_STEP:
                if (observationIndex > 0) {
                    observationIndex -= 1;
                }
                break;
            case FORWARD_STEP:
                if (observationIndex < (stages.length - 1)) {
                    observationIndex += 1;
                }
                break;
            case FORWARD_END:
                observationIndex = stages.length - 1;
                break;
        }

        liveMessage.edit(createSearchObsMessage(items, itemToFind, stages[observationIndex]));
    });
}

export default search;