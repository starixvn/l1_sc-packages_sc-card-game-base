import { Core } from "sc-game-base";
import { decryptChain } from "../helpers/result-helper";

export default class AdminMonitorConsumer extends Core.BaseEventConsumers.AdminMonitorConsumer {
    async consume(socketClient) {
        const lastRound = await this.roundsRepository
            .findOne({}, { id: true, result: true, settlementResult: true }, { sort: { id: -1 } })
            .lean()
            .exec();

        if (lastRound) {
            const payload = {
                roundId: lastRound.id + 1,
                result: lastRound.result,
                settlementResult: lastRound.settlementResult,
                remainingTime: this.gameData.remainingTime,
                currencies: this.gameData.currencies,
                exchangeRates: this.gameData.exchangeRates,
            };

            if (this.gameData.blockchain) {
                const updatedPayload = {
                    ...payload,
                    blockchain: decryptChain(this.gameData.blockchain),
                };
                this.adminPublisher.publishToAdmin(socketClient, updatedPayload);
            } else {
                this.adminPublisher.publishToAdmin(socketClient, payload);
            }
        }
    }
}
