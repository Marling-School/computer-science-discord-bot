import { bubbleSort, quickSort, mergeSort, insertionSort } from "comp-sci-maths-lib";
import { NO_MATCH } from "comp-sci-maths-lib/dist/algorithms/search/common";
import { CustomisableSortFunction, SortUtility } from "comp-sci-maths-lib/dist/algorithms/sort/types";
import { simpleSwap, stringComparator } from "comp-sci-maths-lib/dist/common";
import { MessageEmbed, Message } from "discord.js";
import playable from "./playable";
import { MessageHandler, SortObservation, SortStage, SortStageType } from "./types";

interface SortHandlers {
    [s: string]: CustomisableSortFunction<any>;
}

const sortHandlers: SortHandlers = {
    'bubble': bubbleSort,
    'quick': quickSort,
    'merge': mergeSort,
    'insertion': insertionSort,
}

const createSortObsMessage = (items: string[], observation: SortStage<string>): MessageEmbed => {
    switch (observation.type) {
        case SortStageType.observation: {
            const msg: MessageEmbed = new MessageEmbed()
                .setColor(0x00ff00)
                .setTitle('Sorting')
                .setDescription(observation.stageName)
                .addField('Items', items.join(', '))
            if (Object.keys(observation.positionVars).length > 0) {
                msg.addField('Position Variables', Object.entries(observation.positionVars).map(([name, value]) => `${name}=${value}`).join(' '));
            }
            return msg;
        }
        case SortStageType.compare: {
            const msg: MessageEmbed = new MessageEmbed()
                .setColor(0x00ff00)
                .setTitle('Sorting')
                .setDescription('Comparing')
                .addField('Items', items.join(', '))
                .addFields([
                    {
                        name: 'a',
                        value: observation.aIndex,
                        inline: true,
                    },
                    {
                        name: 'b',
                        value: observation.aIndex,
                        inline: true,
                    }
                ])
            return msg;
        }
        case SortStageType.swap: {
            const msg: MessageEmbed = new MessageEmbed()
                .setColor(0x00ff00)
                .setTitle('Sorting')
                .setDescription('Swapping')
                .addField('Items', items.join(', '))
                .addFields([
                    {
                        name: 'From',
                        value: observation.from,
                        inline: true,
                    },
                    {
                        name: 'To',
                        value: observation.to,
                        inline: true,
                    }
                ])
            return msg;
        }
    }
}

const sort: MessageHandler = (msg: Message, content: string, splitOnSpace: string[]) => {
    if (splitOnSpace.length < 3) {
        msg.channel.send('Not enough parts to the command to sort')
        return;
    }

    const [_, sortName, ...items] = splitOnSpace;

    const sortHandler: CustomisableSortFunction<any> = sortHandlers[sortName]
    if (!sortHandler) {
        msg.channel.send(`Unknown sorting algorithm ${sortName}, options are ${Object.keys(sortHandlers)}`)
        return;
    }

    let sortedData = items;
    const stages: SortStage<string>[] = [];
    let lastObservation: SortObservation<string>;

    const sortUtilities: SortUtility<string> = {
        swap: (data, from, to) => {
            stages.push({
                type: SortStageType.swap,
                from,
                to,
                lastObservation,
            });
            simpleSwap(data, from, to);
        },
        compare: (a, b, meta) => {
            const result = stringComparator(a, b, meta);
            stages.push({
                type: SortStageType.compare,
                a,
                b,
                aIndex: !!meta ? meta.aIndex : NO_MATCH,
                bIndex: !!meta ? meta.bIndex : NO_MATCH,
                result,
                lastObservation,
            });
            return result;
        },
        observe: (stageName, data, positionVars) => {
            lastObservation = {
                type: SortStageType.observation,
                stageName,
                data: [...data],
                positionVars: { ...positionVars },
            };
            stages.push(lastObservation);
        },
    };

    // Add explicit Start Observation
    stages.push({
        type: SortStageType.observation,
        stageName: "Starting",
        data: [...items],
        positionVars: {},
    });

    // Run the algorithm
    sortedData = sortHandler(items, sortUtilities);

    // Add explicit End Observation
    stages.push({
        type: SortStageType.observation,
        stageName: "Finished",
        data: [...sortedData],
        positionVars: {},
    });

    playable({
        originalMsg: msg,
        items: stages,
        createEmbedMessage: (stage) => createSortObsMessage(items, stage),
        finished: () => {
            msg.channel.send(`Finished Sorting ${items.join(', ')}`)
        }
    })
}

export default sort;