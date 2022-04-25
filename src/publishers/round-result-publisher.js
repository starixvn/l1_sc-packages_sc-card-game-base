import { Core } from "sc-game-base";
import { decrypt } from "../helpers/crypto-helper";

export default class RoundResultPublisher extends Core.BaseEventPublishers.BaseEventPublisher {
    publishRoundResult(roundResult) {
        const payload = { finish: roundResult };

        this.publishToAllUsers(payload);
        this.publishToAllAdmins(payload);
    }

    publishResultHash() {
        if (this.gameData.blockchain) {
            const chain = [];
            for (let i = 0; i < this.gameData.blockchain.chain.length; i++) {
                const item = this.gameData.blockchain.chain[i];
                const card = JSON.parse(decrypt(item.encryptedResultHash));
                if (i >= this.gameData.blockchain.currentIndex) {
                    delete card.rawValue;
                }

                chain.push(card);
            }

            this.publishToAllUsers({
                blockchain: {
                    currentIndex: this.gameData.blockchain.currentIndex,
                    maxIndex: this.gameData.blockchain.maxIndex,
                    skippedCount: this.gameData.blockchain.skippedCount,
                    chain: chain,
                },
            });
        }
    }
}
