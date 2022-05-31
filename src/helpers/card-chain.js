import { randomString, createHashSHA256, encrypt, decrypt } from "./crypto-helper";
import Chance from "chance";
import { suit, deck, name } from "./card-data";

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

export const updateCards = (cards, presetCards) => {
    for (let card of presetCards) {
        const indexCardToRemove = cards.findIndex((c) => c.value === card.value && c.suit === card.suit);
        if (indexCardToRemove > -1) {
            cards.splice(indexCardToRemove, 1);
        }
    }

    for (let i = presetCards.length - 1; i >= 0; i--) {
        const card = deck.find((c) => c.value === presetCards[i].value && c.suit === presetCards[i].suit);
        if (card) {
            cards.unshift(Object.assign({}, card));
        }
    }

    return cards;
};

export const generateChain = (numOfDecks, presetCards) => {
    const cards = updateCards(generateCards(numOfDecks), presetCards);

    return {
        chain: hashAndEncryptCards(cards),
    };
};

export const hashAndEncryptCards = (cards) => {
    for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const previousHash = i == cards.length - 1 ? null : cards[i + 1].resultHash.hashValue;

        const rawValue = `${name[card.value]}${suit[card.suit]}_${new Date().toISOString()}_${previousHash}_${randomString()}`;
        card.resultHash = { rawValue: rawValue, hashValue: createHashSHA256(rawValue) };
        const result = {
            value: card.value,
            suit: card.suit,
        };
        card.encryptedResult = encrypt(JSON.stringify(result));
        card.encryptedResultHash = encrypt(JSON.stringify(card.resultHash));
        card.revealedRawValue = rawValue.substring(rawValue.length - 2);
    }

    for (let card of cards) {
        delete card.suit;
        delete card.value;
        delete card.resultHash;
    }

    return cards;
};

export const decryptCards = (chain) => {
    const cards = [];
    for (let item of chain) {
        const card = JSON.parse(decrypt(item.encryptedResult));
        cards.push(card);
    }

    return cards;
};
