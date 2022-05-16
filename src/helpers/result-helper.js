import { decrypt } from "./crypto-helper";

export const decryptChain = (blockchain) => {
    const chain = [];
    for (let i = 0; i < blockchain.chain.length; i++) {
        const item = blockchain.chain[i];
        const card = JSON.parse(decrypt(item.encryptedResultHash));
        if (i >= blockchain.currentIndex) {
            delete card.rawValue;
        }

        card.revealedRawValue = item.revealedRawValue;
        chain.push(card);
    }

    return {
        currentIndex: blockchain.currentIndex,
        cutCardIndex: blockchain.cutCardIndex,
        burnedCards: blockchain.burnedCards,
        chain: chain,
    };
};

export const getCards = (blockchain, numberOfCards) => {
    const cards = [];
    let maxIndex = blockchain.currentIndex + numberOfCards - 1;
    maxIndex = maxIndex < blockchain.chain.length ? maxIndex : blockchain.chain.length - 1;
    for (let i = blockchain.currentIndex; i <= maxIndex; i++) {
        const item = blockchain.chain[i];
        const card = JSON.parse(decrypt(item.encryptedResult));
        cards.push(card);
    }

    return cards;
};
