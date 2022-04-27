import SettleGameRoundConsumer from "./settle-game-round-consumer";

export default class TableSettleGameRoundConsumer extends SettleGameRoundConsumer {
    defaultWinningStatus = {
        win: true,
        bet: 0,
        winningByChoices: {},
    };

    constructor({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        tempBetsRepository,
        resultsRepository,
    }) {
        super({
            definition,
            gameData,
            roundResultPublisher,
            userBetResultPublisher,
            endGame,
            roundsRepository,
            betsRepository,
            resultsRepository,
        });

        this.tempBetsRepository = tempBetsRepository;
    }

    async queryBets(roundId) {
        const realPlayerBets = await this.betsRepository.find({ phien: roundId }).exec();
        const botBets = await this.tempBetsRepository.find({ phien: roundId }).exec();

        return realPlayerBets.concat(botBets);
    }

    captureBetResult(uid, betResult, rate) {
        if (betResult.totalWin > 0) {
            const existingWinningStatus = this.gameData.winningPlayers[uid] ?? this.defaultWinningStatus;
            const winningStatus = {
                rate: rate ?? 1,
                win: true,
                bet: existingWinningStatus.bet + betResult.totalWin,
                winningByChoices: Object.assign({}, existingWinningStatus.winningByChoices, betResult.winningByChoices),
            };

            this.gameData.winningPlayers[uid] = winningStatus;

            if (this.gameData.players[uid]) {
                this.gameData.players[uid].red += betResult.totalWin;
            }
        }

        super.captureBetResult(uid, betResult);
    }

    collectRoundResult(result, settlementResult, roundId) {
        const roundResult = super.collectRoundResult(result, settlementResult, roundId);

        roundResult.winningPlayers = this.gameData.winningPlayers;

        return roundResult;
    }
}
