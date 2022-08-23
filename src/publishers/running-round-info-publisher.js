import { Core } from "sc-game-base";
import { calculateBetUserPercentage } from "../helpers/result-helper";

export default class RunningRoundInfoPublisher extends Core.BaseEventPublishers.RunningRoundInfoPublisher {
    publish() {
        super.publish();

        this.publishUserBetPercentage();
    }

    publishUserBetPercentage() {
        const betPercentage = calculateBetUserPercentage(this.gameData.betUserCount);
        this.publishToAllUsers({ betPercentage });
    }
}
