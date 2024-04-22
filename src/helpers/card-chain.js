import { deck, name, suit } from "./card-data";
import { createHashSHA256, encrypt, randomString } from "./crypto-helper";
import { shuffle } from "./shuffle-helper";

export const generateCards = (numOfDecks, randomMode) => {
    const selectedMode = randomMode >= 1 && randomMode <= 3 ? randomMode : 1;
    let cards = [];
    for (let i = 0; i < numOfDecks; i++) {
        for (const card of deck) {
            cards.push(Object.assign({}, card));
        }
    }
    cards = shuffle[selectedMode](cards);

    return cards;
};

export const updateCards = (cards, presetCards) => {
    const validPresetCards = [];
    for (const card of presetCards) {
        const indexCardToRemove = cards.findIndex((c) => c.rank === card.rank && c.suit === card.suit);
        if (indexCardToRemove > -1) {
            validPresetCards.push(card);
            cards.splice(indexCardToRemove, 1);
        }
    }

    for (let i = validPresetCards.length - 1; i >= 0; i--) {
        const card = deck.find((c) => c.rank === validPresetCards[i].rank && c.suit === validPresetCards[i].suit);
        if (card) {
            cards.unshift(Object.assign({}, card));
        }
    }

    return cards;
};

export const generateChain = (numOfDecks, presetCards, randomMode) => {
    const cards = updateCards(generateCards(numOfDecks, randomMode), presetCards);

    return {
        chain: hashAndEncryptCards(cards),
    };
};

export const hashAndEncryptCards = (cards) => {
    for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const previousHash = i === cards.length - 1 ? "N/A" : cards[i + 1].resultHash.hashValue;

        const rawValue = `${name[card.rank]}${suit[card.suit]}_${new Date().toISOString()}_${previousHash}_${randomString()}`;
        card.resultHash = { rawValue: rawValue, hashValue: createHashSHA256(rawValue) };
        const result = {
            rank: card.rank,
            suit: card.suit,
        };
        card.encryptedResult = encrypt(JSON.stringify(result));
        card.encryptedResultHash = encrypt(JSON.stringify(card.resultHash));
        card.revealedRawValue = rawValue.substring(rawValue.length - 2);
    }

    for (const card of cards) {
        delete card.suit;
        delete card.rank;
        delete card.resultHash;
    }

    return cards;
};
