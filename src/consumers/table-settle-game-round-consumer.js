import { Table } from "sc-game-base";

export default class TableSettleGameRoundConsumer extends Table.EventConsumers.TableSettleGameRoundConsumer {
    constructor({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        tempBetsRepository,
        gameManagementApiClientFactory,
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
            gameManagementApiClientFactory,
            tempBetsRepository,
        });

        this.resultsRepository = resultsRepository;
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

    collectRoundResult(result, settlementResult, roundId) {
        const roundResult = super.collectRoundResult(result, settlementResult, roundId);

        roundResult.winningPlayers = this.gameData.winningPlayers;

        return roundResult;
    }
}
