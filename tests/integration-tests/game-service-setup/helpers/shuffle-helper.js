import Chance from "chance";

const chance = new Chance();

export const mathRandom = () => {
    return Math.random();
};

const shuffle1 = (array) => {
    array = chance.shuffle(array);
    array = chance.shuffle(array);
    array = chance.shuffle(array);

    return array;
};

export const shuffle = {
    1: (array) => shuffle1(array),
    2: (array) => shuffle1(array),
    3: (array) => shuffle1(array),
};
