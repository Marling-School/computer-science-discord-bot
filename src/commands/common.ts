import { SortObserver, SortUtility, SwapFunction } from 'comp-sci-maths-lib/dist/algorithms/sort/types';
import { simpleSwap, stringComparator } from 'comp-sci-maths-lib/dist/common';
import { Comparator, PositionVars, SearchObserver, SearchUtilities } from 'comp-sci-maths-lib/dist/types';
import Discord from 'discord.js'

export function getObjectAsKeyValueString(obj: object) {
    return Object.entries(obj).map(k => `${k[0]}=${k[1]}`).join(', ')
}

export const comparatorWithMsg = (msg: Discord.Message): Comparator<string> => (a: string, b: string): number => {
    const result = stringComparator(a, b);
    let operator = '='
    if (result < 0) {
        operator = '<'
    } else if (result > 0) {
        operator = '>'
    }
    msg.channel.send(`Comparing ${a} ${operator} ${b}`)
    return result;
}

export const swapWithMsg = (msg: Discord.Message): SwapFunction<string> => (arr: string[], from: number, to: number) => {
    msg.channel.send(`Swap items[${from}]=${arr[from]} <-> items[${to}]=${arr[to]}`)
    simpleSwap(arr, from, to);
}

export const sortObserveWithMsg = (msg: Discord.Message): SortObserver<string> => (stageName: string, data: string[], positionVars: PositionVars) => {
    msg.channel.send(`${stageName} - ${data} - ${getObjectAsKeyValueString(positionVars)}`)
}

export const searchObserverWithMsg = (msg: Discord.Message): SearchObserver => (stageName: string, positionVars: PositionVars = {}) => {
    msg.channel.send(`${stageName} - ${getObjectAsKeyValueString(positionVars)}`)
}

export const sortUtilitiesWithMsg = (msg: Discord.Message): SortUtility<string> => ({
    compare: comparatorWithMsg(msg),
    swap: swapWithMsg(msg),
    observe: sortObserveWithMsg(msg)
});

export const searchUtilitiesWithMsg = (msg: Discord.Message): SearchUtilities<string> => ({
    compare: comparatorWithMsg(msg),
    observe: searchObserverWithMsg(msg)
})