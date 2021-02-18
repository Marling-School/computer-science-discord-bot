import { Message, MessageEmbed, MessageReaction, User } from "discord.js";

export const BACK_START = '⏪';
export const BACK_STEP = '◀️';
export const FORWARD_STEP = '▶️';
export const FORWARD_END = '⏩';
export const PLAY_CONTROLS = [BACK_START, BACK_STEP, FORWARD_STEP, FORWARD_END];

export interface PlayableConfig<T> {
    items: T[],
    originalMsg: Message;
    finished: () => void;
    createEmbedMessage: (item: T) => MessageEmbed;
}

export default async <T>({ originalMsg, items, createEmbedMessage, finished }: PlayableConfig<T>) => {
    let observationIndex = 0;

    const liveMessage = await originalMsg.channel.send(createEmbedMessage(items[observationIndex]));

    // Setup the play controls
    PLAY_CONTROLS.forEach(async p => await liveMessage.react(p));

    // Listen for those controls
    const filter = (reaction: MessageReaction, user: User) => {
        return PLAY_CONTROLS.includes(reaction.emoji.name) && user.id === originalMsg.author.id;
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

                if (observationIndex < (items.length - 1)) {
                    observationIndex += 1;
                }
                break;
            case FORWARD_END:
                observationIndex = items.length - 1;
                break;
        }

        liveMessage.edit(createEmbedMessage(items[observationIndex]));
    });

    collector.on('end', () => {
        finished();
        liveMessage.reactions.removeAll();
    });
}