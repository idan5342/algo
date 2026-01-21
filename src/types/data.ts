type dataItem = {
    Id: string;
    StartTime: string;
    StopTime: string;
    Num: number;
    level: number;
};

type TimesArrayItem = {
    time: string;
    type: 'start' | 'stop';
    item: dataItem;
};