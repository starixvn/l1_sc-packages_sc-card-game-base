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
        let isNewBlockchain = false;

        let { blockchain, isSufficient } = await this.checkSufficientChain();
        if (!isSufficient) {
            await this.setUnavailable(blockchain);
            blockchain = await this.createResultRecord();
            isNewBlockchain = true;
        }

        this.gameData.blockchain = blockchain;

        if (isNewBlockchain) {
            this.roundResultPublisher.publishNewBlockchain();
        }
    }

    generateResult(blockchain) {
        return this.definition.generateResult(blockchain);
    }

    async checkSufficientChain() {
        let blockchain = await this.resultsRepository.findOne({ isAvailable: true }).lean().exec();
        let isSufficient = false;

        if (
            blockchain &&
            (blockchain.currentIndex < blockchain.cutCardIndex ||
                (blockchain.currentIndex === blockchain.cutCardIndex && blockchain.remainingCards !== 0))
        ) {
            isSufficient = true;
        }

        return { blockchain, isSufficient };
    }

    async setUnavailable(blockchain) {
        if (blockchain) {
            await this.resultsRepository.update({ _id: blockchain._id }, { $set: { isAvailable: false } });
        }
    }

    async createResultRecord() {
        const cardChain = generateChain(this.definition.numberOfDecks);
        const chance = new Chance();
        const burnedCards = this.calculateBurnedCards(cardChain.chain);
        const currentIndex = burnedCards;
        const cutCardIndex = chance.integer({ min: this.definition.minCutCardIndex, max: this.definition.maxCutCardIndex });
        const record = {
            isAvailable: true,
            currentIndex: currentIndex,
            cutCardIndex: cutCardIndex,
            burnedCards: burnedCards,
            remainingCards: 0,
            chain: cardChain.chain,
        };

        return this.resultsRepository.create(record);
    }

    calculateBurnedCards(cardChain) {
        const firstCard = JSON.parse(decrypt(cardChain[0].encryptedResult));
        const cardValue = firstCard.value >= 10 ? 10 : firstCard.value + 1;
        return cardValue + 1;
    }
}
