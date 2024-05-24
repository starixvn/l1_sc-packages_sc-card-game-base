import { Core } from "sc-game-base";

export default class UnsettledRoundConsumer extends Core.BaseEventConsumers.UnsettledRoundConsumer {
    async proceed() {
        const unsettledBets = await this.getUnsettledBets();

        if (unsettledBets.length > 0) {
            await this.loadGameConfigs();
            await this.settleGameRoundConsumer.settleRound();
        }
    }
}
