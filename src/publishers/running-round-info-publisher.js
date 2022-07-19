import { Core } from "sc-game-base";

export default class RunningRoundInfoPublisher extends Core.BaseEventPublishers.RunningRoundInfoPublisher {
    publish() {
        super.publish();

        this.publishUserBetPercentage();
    }

    publishUserBetPercentage() {
        const betUserCount = this.getBetUserCount();
        const choices = Object.keys(betUserCount);
        const total = Object.values(betUserCount).reduce(
            (accumulator, currentValue) => accumulator + this.countUniqueBetUser(currentValue),
            0
        );
        const betPercentage =
            total > 0
                ? choices.reduce((result, choice) => {
                      result[choice] = parseFloat(((this.countUniqueBetUser(betUserCount[choice]) * 100) / total).toFixed(2));

                      return result;
                  }, {})
                : {};

        this.publishToAllUsers({ betPercentage });
    }

    countUniqueBetUser(betUserArr) {
        return [...new Set(betUserArr)].length;
    }

    getBetUserCount() {
        return this.gameData.betUserCount;
    }
}
