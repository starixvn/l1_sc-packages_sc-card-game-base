import { Core } from "sc-game-base";
import { helpers } from "sc-common";

export default class PlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
    composeBettingTimeValidationCriteria(roundId) {
        const configs = this.gameData.gameConfigs;
        const isNewChain = this.gameData.blockchain && this.gameData.blockchain.currentIndex === this.gameData.blockchain.burnedCards;
        const dealCardsTime = isNewChain
            ? this.definition.durations.placingBets + this.definition.durations.changingDeck + this.definition.durations.dealCards
            : this.definition.durations.placingBets + this.definition.durations.dealCards;

        return [
            {
                failure: !configs.enabled,
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
            {
                failure: roundId !== this.gameData.roundId,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet, { gameRoundId: roundId }),
            },
            {
                failure:
                    this.gameData.remainingTime >= this.definition.durations.placingBets && this.gameData.remainingTime <= dealCardsTime,
                notice: this.getNoticeObj(helpers.noticeHelper.cannotPlaceBet),
            },
            {
                failure: this.gameData.remainingTime < this.definition.durations.lockingBet || this.gameData.remainingTime > dealCardsTime,
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
        ];
    }
}
