import { PriorityQueue } from '@datastructures-js/priority-queue';
import fs from 'fs';

const data = JSON.parse(
  fs.readFileSync(new URL('./data.json', import.meta.url), 'utf8')
);


function createTimesArray(data) {
    return data.reduce((arr, item) => {
        const { StartTime, StopTime, ...rest } = item;
        arr.push({
            time: item.StartTime,
            type: "Start",
            OriginalStartTime: item.StartTime,
            OriginalStopTime: item.StopTime,
            ...rest
        })
        arr.push({
            time: item.StopTime,
            type: "Stop",
            OriginalStartTime: item.StartTime,
            OriginalStopTime: item.StopTime,
            ...rest
        })
        return arr;
    }, []).sort((a, b) => new Date(a.time) - new Date(b.time));
}

function addOwners(item, newOwners) {
    if (!item.Owners) {
        item.Owners = [];
    }
    return [...item.Owners, ...newOwners];

}

function main(data) {
    const timesArray = createTimesArray(data);
    const relevant = new PriorityQueue((a, b) => b.level - a.level);
    const result = [];
    let activeItem = null;

    for (const item of timesArray) {
        if (item.type === "Start") {
            if (!activeItem) {
                activeItem = item;
                activeItem.StartTime = item.time;
                continue;
            }
            if (item.level <= activeItem.level) {
                relevant.enqueue(item);
                continue
            } else {
                const activeItemToRelevant = activeItem
                activeItem.Owners = addOwners(activeItem, relevant.toArray())
                activeItem.StopTime = item.time;
                result.push(activeItem);
                activeItemToRelevant.StartTime = item.time // maybe unnecessary
                relevant.enqueue(activeItemToRelevant);
                activeItem = item;
                activeItem.StartTime = item.time;
                continue;
            }
        } else {
            if (activeItem.id === item.id) {
                activeItem.StopTime = item.time;
                activeItem.Owners = addOwners(activeItem, relevant.toArray());
                result.push(activeItem);
                activeItem = null;
                const next = relevant.dequeue();
                if (next) {
                    activeItem = next;
                    activeItem.StartTime = item.time;
                }
            } else {
                const matchingRelevantItem = relevant.toArray().find(r => r.id === item.id);
                relevant.remove(r => r.id === item.id);
                if (matchingRelevantItem) {
                    matchingRelevantItem.StopTime = item.time;
                    activeItem.Owners = addOwners(activeItem, [matchingRelevantItem]);
                }
            }
        }
    }

    return result;
}

const newData = main(data);
console.log(JSON.stringify(newData, null, 2));