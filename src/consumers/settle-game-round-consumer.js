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
}
