import { decrypt } from "./crypto-helper";

export const decryptChainToShow = (blockchain) => {
    const chain = [];
    for (let i = 0; i < blockchain.chain.length; i++) {
        const item = blockchain.chain[i];
        const card = JSON.parse(decrypt(item.encryptedResultHash));
        if (i >= blockchain.currentIndex) {
            delete card.rawValue;
        }

        chain.push(card);
    }

    return {
        currentIndex: blockchain.currentIndex,
        maxIndex: blockchain.maxIndex,
        skippedCount: blockchain.skippedCount,
        chain: chain,
    };
};
