const data = require('./data.json');

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

function main(data) {
    const timesArray = createTimesArray(data);
    const relevant = []
    const result = [];
    const activeItem = null;

    for (const item of timesArray) {
        if (item.type === "Start") {
            if (!activeItem) {
                activeItem = item;
                activeItem.StartTime = item.time;
                continue;
            }
            if (item.level <= activeItem.level) {
                relevant.push(item);
                continue
            } else {
                const activeItemToRelevant = activeItem
                activeItem.Owners = [...activeItem.Owners, ...relevant];
                activeItem.StopTime = item.time;
                result.push(activeItem);
                activeItemToRelevant.StartTime = item.time // maybe unnecessary
                relevant.push(activeItemToRelevant);
                activeItem = item;
                activeItem.StartTime = item.time;
                continue;
            }
        } else {
            if (activeItem.id === item.id) {
                activeItem.StopTime = item.time;
                activeItem.Owners = [...activeItem.Owners, ...relevant];
                result.push(activeItem);
                activeItem = null;
                const next = findHighestLevelRelevant(relevant);
                if (next) {
                    activeItem = next;
                    activeItem.StartTime = item.time;
                    removeNextFromRelevant(relevant, next);
                }
            } else {
                const matchingRelevantItem = relevant.find(r => r.id === item.id);
                relevant.remove(matchingRelevantItem)
                matchingRelevantItem.StopTime = item.time;
                activeItem.Owners = [...activeItem.Owners, matchingRelevantItem];
            }
        }
    }
}