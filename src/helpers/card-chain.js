import { generateCardShoe } from "./card-shoe";
import { randomString, createHashSHA256, encrypt } from "./crypto-helper";
import { type } from "./card";

export const generateCardChain = (numberOfPacks) => {
    const cards = generateCardShoe(numberOfPacks);

    for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];
        const previousHash = i == cards.length - 1 ? null : cards[i + 1].resultHash.hashValue;

        const rawValue = `${card.card}${type[card.type]}_${new Date().toISOString()}_${previousHash}_${randomString()}`;
        card.resultHash = { rawValue: rawValue, hashValue: createHashSHA256(rawValue) };
        const result = {
            card: card.card,
            type: card.type,
        };
        card.encryptedResult = encrypt(JSON.stringify(result));
        card.encryptedResultHash = encrypt(JSON.stringify(card.resultHash));
        delete card.type;
        delete card.card;
    }

    return {
        chain: cards,
    };
};
