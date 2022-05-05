import { generateChain, hashAndEncryptCards, decryptCards } from "../helpers/card-chain";
import Chance from "chance";
import { deck } from "../helpers/card-data";

export default class RoundResultConsumer {
    constructor(gameData, definition, roundResultPublisher, resultsRepository, logService) {
        this.gameData = gameData;
        this.definition = definition;
        this.roundResultPublisher = roundResultPublisher;
        this.resultsRepository = resultsRepository;
        this.logService = logService;
    }

    async generateResultAndPublishHash() {
        let blockchain = await this.resultsRepository.findOne({ isAvailable: true }).lean().exec();
        if (!blockchain || !this.checkSufficientChain(blockchain)) {
            await this.setUnavailable(blockchain);
            blockchain = await this.createResultRecord();
        }

        await this.setResultFromAdmin(blockchain);

        this.gameData.blockchain = blockchain;

        this.roundResultPublisher.publishResultHash();
    }

    generateResult(blockchain) {
        return this.definition.generateResult(blockchain);
    }

    getCardsFromAdmin() {
        return [];
    }

    async setResultFromAdmin(blockchain) {
        try {
            const cardsFromAdmin = this.getCardsFromAdmin().filter((card) =>
                deck.find((c) => c.value === card.value && c.suit === card.suit)
            );
            const cards = decryptCards(blockchain.chain);
            for (let i = 0; i < cardsFromAdmin.length; i++) {
                cards[blockchain.currentIndex + i] = {
                    value: cardsFromAdmin[i].value,
                    suit: cardsFromAdmin[i].suit,
                };
            }
            blockchain.chain = hashAndEncryptCards(cards);
            await this.resultsRepository.update({ _id: blockchain._id }, { $set: { chain: blockchain.chain } });
        } catch (e) {
            this.logService.logError(`error in setResultFromAdmin ${JSON.stringify(this.gameData.settlementResultFromAdmin)}`);
        }
    }

    checkSufficientChain(blockchain) {
        return blockchain.currentIndex + this.definition.maxCardsPerRound <= blockchain.maxIndex ? true : false;
    }

    async setUnavailable(blockchain) {
        if (blockchain) {
            await this.resultsRepository.update({ _id: blockchain._id }, { $set: { isAvailable: false } });
        }
    }

    async createResultRecord() {
        const cardChain = generateChain(this.definition.numberOfDecks);
        const chance = new Chance();
        const skippedCount = chance.integer({ min: 1, max: 9 });
        const record = {
            isAvailable: true,
            currentIndex: skippedCount,
            maxIndex: Math.floor((52 * this.definition.numberOfDecks) / 2),
            skippedCount: skippedCount,
            chain: cardChain.chain,
        };

        return this.resultsRepository.create(record);
    }
}
