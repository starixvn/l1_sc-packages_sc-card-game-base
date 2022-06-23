import { Core } from "sc-game-base";

export default class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    constructor({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        resultsRepository,
    }) {
        super({ definition, gameData, roundResultPublisher, userBetResultPublisher, endGame, roundsRepository, betsRepository });
        this.resultsRepository = resultsRepository;
    }

    async settleRound() {
        const result = await this.generateResult();
        const settlementResult = this.definition.settle(result);
        const { roundId, exchangeRates } = this.gameData;
        const newRound = await this.roundsRepository.create({
            id: roundId,
            result,
            settlementResult,
            time: new Date(),
            exchangeRateId: exchangeRates.exId,
        });

        if (newRound) {
            const finish = {
                settlementResult,
                result,
                roundId: newRound.id,
                time: newRound.time,
            };

            this.gameData.roundId = finish.roundId + 1;

            await this.settleBets(finish);
        }
    }

    async generateResult() {
        const { result, usedCardsCount } = this.definition.generateResult(this.gameData.blockchain);
        this.gameData.blockchain.currentIndex = this.gameData.blockchain.currentIndex + usedCardsCount;
        this.gameData.blockchain.remainingCards = this.definition.maxCardsPerRound - usedCardsCount;
        await this.resultsRepository.update(
            { _id: this.gameData.blockchain._id },
            {
                $set: {
                    currentIndex: this.gameData.blockchain.currentIndex,
                    remainingCards: this.gameData.blockchain.remainingCards,
                },
            }
        );

        return result;
    }

    queryBets(roundId) {
        return this.betsRepository.find({ roundId: roundId }).exec();
    }

    async settleBets({ result, settlementResult, roundId, time }) {
        const bets = await this.queryBets(roundId);

        if (bets && bets.length) {
            const { odds } = this.gameData.gameConfigs;

            await Promise.all(
                bets.map(async (bet) => {
                    const betResult = this.calculateBetResult(settlementResult, bet, odds);

                    bet.betwin = betResult.totalWin;
                    bet.paid = true;

                    await bet.save();
                    await this.callEndGame(bet, roundId, time, betResult);

                    this.captureBetResult(bet.uid, betResult, bet.rate);
                    await this.userBetResultPublisher.publish(bet.uid, betResult);
                })
            );
        }

        this.roundResultPublisher.publishRoundResult(this.collectRoundResult(result, settlementResult, roundId));
    }

    formatEndGameInfo(bet, roundId, time, betResult) {
        const gameInfo = {
            gameId: this.definition.id,
            gameRoundId: roundId,
            memberId: bet.playerId,
            siteId: bet.siteId,
            partnerId: bet.operatorId,
            time: time,
            operatorId: bet.operatorId,
            playerId: bet.playerId,
        };
        const settlementInfo = {
            redPlay: betResult.totalBetAmount,
            freeBet: bet.freeBet,
        };

        if (betResult.totalWin > 0) {
            settlementInfo.red = betResult.totalWin;
        }

        if (betResult.netWin > 0) {
            settlementInfo.redWin = betResult.netWin;
        }

        if (betResult.totalLost > 0) {
            settlementInfo.redLost = betResult.totalLost;
        }

        return { gameInfo, settlementInfo };
    }
}
