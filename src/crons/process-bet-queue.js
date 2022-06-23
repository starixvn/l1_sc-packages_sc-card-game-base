import { Core } from "sc-game-base";

export default class ProcessBetQueue extends Core.Crons.ProcessBetQueue {
    async upsertBet(player, roundId, bet, rate) {
        const configs = this.gameData.gameConfigs;
        const newBet = {
            uid: player.UID,
            name: player.profile.name,
            time: new Date(),
            odds: configs.odds,
            freeBet: bet.freeBet,
            roundId,
        };
        const existingBetFilter = { uid: player.UID, roundId: roundId, freeBet: bet.freeBet };
        const existingBetIncrement = {
            [bet.betChoice]: bet.amount,
            totalAmount: bet.amount,
        };

        if (player.session) {
            newBet.playerId = player.session.memberId;
            newBet.siteId = player.session.siteId;
            newBet.currency = player.session.currencyName;
            newBet.rate = rate;

            newBet.operatorId = player.session.partnerId;
            newBet.playerId = player.session.memberId;
        }

        await this.betsRepository.updateOne(
            existingBetFilter,
            { $inc: existingBetIncrement, $setOnInsert: newBet },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    async insertBetLog(player, roundId, bet, rate) {
        const newBetLog = {
            uid: player.UID,
            name: player.profile.name,
            time: new Date(),
            choice: bet.betChoice,
            amount: bet.amount,
            freeBet: bet.freeBet,
            clientSentTime: bet.clientSentTime,
            receivedTime: bet.receivedTime,
            roundId,
        };

        if (player.session) {
            newBetLog.siteId = player.session.siteId;
            newBetLog.currency = player.session.currencyName;
            newBetLog.rate = rate;

            newBetLog.operatorId = player.session.partnerId;
            newBetLog.playerId = player.session.memberId;
        }

        await this.betLogsRepository.create(newBetLog);
    }
}
