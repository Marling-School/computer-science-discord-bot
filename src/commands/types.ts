import { PositionVars } from "comp-sci-maths-lib/dist/types";
import Discord from "discord.js";

export type MessageHandler = (msg: Discord.Message, content: string, splitOnSpace: string[]) => void;
export interface MessageHandlers {
    [s: string]: MessageHandler;
}

export interface SearchObservation {
    stageName: string;
    positionVars: PositionVars;
}

export const DEFAULT_SEARCH_OBS: SearchObservation = {
    stageName: "DEFAULT",
    positionVars: {},
};