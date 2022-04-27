import { randomString, createHashSHA256, encrypt } from "./crypto-helper";
import Chance from "chance";
import { type, deck } from "./card-data";

export const generateCards = (numOfDecks) => {
    let cards = [];
    for (let i = 0; i < numOfDecks; i++) {
        for (let card of deck) {
            cards.push(Object.assign({}, card));
        }
    }

    const chance = new Chance();

    cards = chance.shuffle(cards);
    cards = chance.shuffle(cards);
    cards = chance.shuffle(cards);

    return cards;
};

export const generateChain = (numOfDecks) => {
    const cards = generateCards(numOfDecks);

    for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const previousHash = i == cards.length - 1 ? null : cards[i + 1].resultHash.hashValue;

        const rawValue = `${card.value}${type[card.type]}_${new Date().toISOString()}_${previousHash}_${randomString()}`;
        card.resultHash = { rawValue: rawValue, hashValue: createHashSHA256(rawValue) };
        const result = {
            value: card.value,
            type: card.type,
        };
        card.encryptedResult = encrypt(JSON.stringify(result));
        card.encryptedResultHash = encrypt(JSON.stringify(card.resultHash));
        delete card.type;
        delete card.value;
    }

    return {
        chain: cards,
    };
};
