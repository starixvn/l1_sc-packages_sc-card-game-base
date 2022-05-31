import { Core } from "sc-game-base";
import { decryptChain } from "../helpers/result-helper";

export default class RoundResultPublisher extends Core.BaseEventPublishers.BaseEventPublisher {
    publishRoundResult(roundResult) {
        const payload = { finish: roundResult };

        if (this.gameData.blockchain) {
            this.publishToAllUsers({
                finish: {
                    ...roundResult,
                    blockchain: decryptChain(this.gameData.blockchain),
                },
            });
        } else {
            this.publishToAllUsers(payload);
        }

        this.publishToAllAdmins(payload);
    }

    publishNewBlockchain() {
        if (this.gameData.blockchain) {
            this.publishToAllUsers({
                newBlockchain: decryptChain(this.gameData.blockchain),
            });
        }
    }
}
