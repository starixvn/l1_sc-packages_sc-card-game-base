import { generateChain } from "../helpers/card-chain";
import Chance from "chance";
import { decrypt } from "../helpers/crypto-helper";

export default class RoundResultConsumer {
    constructor(gameData, definition, roundResultPublisher, resultsRepository, logService) {
        this.gameData = gameData;
        this.definition = definition;
        this.roundResultPublisher = roundResultPublisher;
        this.resultsRepository = resultsRepository;
        this.logService = logService;
    }

    async generateAndPublishBlockchain() {
        const { isSufficient } = await this.checkSufficientChain();
        if (!isSufficient) {
            await this.setUnavailable();
            this.gameData.blockchain = await this.createResultRecord();
            this.gameData.settlementResultFromAdmin = {};
            this.roundResultPublisher.publishNewBlockchain();
        }
    }

    async checkSufficientChain() {
        let isSufficient = false;
        const blockchain = await this.resultsRepository.findOne({ isAvailable: true }).lean().exec();

        if (
            !this.hasResultFromAdmin() &&
            blockchain &&
            (blockchain.currentIndex < blockchain.cutCardIndex ||
                (blockchain.currentIndex === blockchain.cutCardIndex && blockchain.remainingCards !== 0))
        ) {
            isSufficient = true;
        }

        return { blockchain, isSufficient };
    }

    async setUnavailable() {
        await this.resultsRepository.update({ isAvailable: true }, { $set: { isAvailable: false } });
    }

    async createResultRecord() {
        const { randomMode } = this.gameData.gameConfigs;
        const { cardsFromAdmin, cutCardIndexFromAdmin } = this.getResultFromAdmin();
        const cardChain = generateChain(this.definition.numberOfDecks, cardsFromAdmin, randomMode);
        const chance = new Chance();
        const burnedCards = this.calculateBurnedCards(cardChain.chain);
        const currentIndex = burnedCards;
        const cutCardIndex =
            cutCardIndexFromAdmin > 0 && cutCardIndexFromAdmin < cardChain.chain.length - this.definition.maxCardsPerRound
                ? cutCardIndexFromAdmin
                : chance.integer({ min: this.definition.minCutCardIndex, max: this.definition.maxCutCardIndex });
        const record = {
            isAvailable: true,
            currentIndex: currentIndex,
            cutCardIndex: cutCardIndex,
            burnedCards: burnedCards,
            remainingCards: 0,
            chain: cardChain.chain,
            firstRoundId: this.gameData.roundId,
        };

        return this.resultsRepository.create(record);
    }

    calculateBurnedCards(cardChain) {
        const firstCard = JSON.parse(decrypt(cardChain[0].encryptedResult));
        const cardValue = firstCard.rank >= 10 ? 10 : firstCard.rank + 1;
        return cardValue + 1;
    }

    hasResultFromAdmin() {
        const { cardsFromAdmin, cutCardIndexFromAdmin } = this.getResultFromAdmin();
        return cardsFromAdmin.length > 0 || cutCardIndexFromAdmin > 0;
    }

    getResultFromAdmin() {
        let cardsFromAdmin = [];
        let cutCardIndexFromAdmin = 0;

        try {
            const resultFromAdmin = this.gameData.settlementResultFromAdmin;
            if (resultFromAdmin && resultFromAdmin.result && resultFromAdmin.result.cards) {
                cardsFromAdmin = resultFromAdmin.result.cards;
            }

            if (resultFromAdmin && resultFromAdmin.result && resultFromAdmin.result.cutCardIndex) {
                cutCardIndexFromAdmin = resultFromAdmin.result.cutCardIndex;
            }
        } catch (e) {}

        return { cardsFromAdmin, cutCardIndexFromAdmin };
    }
}
