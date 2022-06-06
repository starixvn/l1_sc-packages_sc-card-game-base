import Chance from "chance";
import { randomInt } from "crypto";
import Random from "random";
import { MersenneTwister19937, Random as RandomJS } from "random-js";

const chance = new Chance();

export const mathRandom = () => {
    return Math.random();
};

const random1 = (max) => {
    return Math.floor(mathRandom() * max);
};

const random2 = (max) => {
    return chance.integer({ min: 0, max });
};

const random3 = (max) => {
    return Random.int(0, max);
};

const random4 = (max) => {
    const randomJS = new RandomJS(MersenneTwister19937.autoSeed());

    return randomJS.integer(0, max);
};

const random5 = (max) => {
    return randomInt(max + 1);
};

const random6 = (max) => {
    const seed = Math.floor(mathRandom() * 100000);
    const randomJS = new RandomJS(MersenneTwister19937.seed(seed));
    return randomJS.integer(0, max);
};

const randomModes = {
    2: [random1, random2, random3],
    3: [random4, random5, random6],
};

const random = (mode, max) => {
    const randomFunctions = randomModes[mode];
    const selectedRandomMethodIndex = Math.floor(mathRandom() * randomFunctions.length);
    const randomFunction = randomFunctions[selectedRandomMethodIndex];

    return randomFunction(max);
};

const shuffle1 = (array) => {
    array = chance.shuffle(array);
    array = chance.shuffle(array);
    array = chance.shuffle(array);

    return array;
};

const shuffle2 = (array, mode) => {
    for (let i = 0; i < 3; i++) {
        let lastElementIndex = array.length - 1;

        while (lastElementIndex) {
            const randomIndex = random(mode, array.length - 1);
            lastElementIndex--;
            const lastElement = array[lastElementIndex];

            array[lastElementIndex] = array[randomIndex];
            array[randomIndex] = lastElement;
        }
    }
    return array;
};

export const shuffle = {
    1: (array) => shuffle1(array),
    2: (array) => shuffle2(array, 2),
    3: (array) => shuffle2(array, 3),
};
