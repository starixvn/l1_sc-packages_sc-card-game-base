import { Core } from "sc-game-base";
import { decryptChainToShow } from "../helpers/result-helper";

export default class RoundResultPublisher extends Core.BaseEventPublishers.BaseEventPublisher {
    publishRoundResult(roundResult) {
        const payload = { finish: roundResult };

        this.publishToAllUsers(payload);
        this.publishToAllAdmins(payload);
    }

    publishResultHash() {
        if (this.gameData.blockchain) {
            this.publishToAllUsers({
                blockchain: decryptChainToShow(this.gameData.blockchain),
            });
        }
    }
}
