import { decrypt } from "./crypto-helper";

export const decryptChain = (blockchain) => {
    const chain = [];
    for (let i = 0; i < blockchain.chain.length; i++) {
        const item = blockchain.chain[i];
        const card = JSON.parse(decrypt(item.encryptedResultHash));
        if (i >= blockchain.currentIndex || (i > 0 && i < blockchain.burnedCards)) {
            delete card.rawValue;
        } else {
            card.card = JSON.parse(decrypt(item.encryptedResult));
        }

        card.revealedRawValue = item.revealedRawValue;
        chain.push(card);
    }

    return {
        currentIndex: blockchain.currentIndex,
        cutCardIndex: blockchain.cutCardIndex,
        burnedCards: blockchain.burnedCards,
        firstRoundId: blockchain.firstRoundId,
        chain: chain,
        isNew: blockchain.currentIndex === blockchain.burnedCards,
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

const countUniqueBetUser = (betUserArr) => {
    return [...new Set(betUserArr)].length;
};

export const calculateBetUserPercentage = (betUserCount) => {
    if (!betUserCount) {
        return {};
    }

    const choices = Object.keys(betUserCount);
    const total = Object.values(betUserCount).reduce((accumulator, currentValue) => accumulator + countUniqueBetUser(currentValue), 0);

    if (total > 0) {
        const lastChoice = choices[choices.length - 1];

        return choices.slice(0, -1).reduce(
            (result, choice) => {
                result[choice] = Math.round((countUniqueBetUser(betUserCount[choice]) * 100) / total);
                result[lastChoice] -= result[choice];
                return result;
            },
            { [lastChoice]: 100 }
        );
    }

    return {};
};
