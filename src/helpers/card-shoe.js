import Chance from "chance";
import { card } from "./card";

export const generateCardShoe = (numberOfPacks) => {
    let cards = [];
    for (let i = 0; i < numberOfPacks; i++) {
        for (let c of card) {
            cards.push(Object.assign({}, c));
        }
    }

    const chance = new Chance();

    cards = chance.shuffle(cards);
    cards = chance.shuffle(cards);
    cards = chance.shuffle(cards);

    return cards;
};
