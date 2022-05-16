import { generateChain, hashAndEncryptCards, decryptCards } from "../helpers/card-chain";
import Chance from "chance";
import { deck } from "../helpers/card-data";
import { decrypt } from "../helpers/crypto-helper";

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

    getResultFromAdmin() {
        return [];
    }

    async setResultFromAdmin(blockchain) {
        try {
            let { cardsFromAdmin, cutCardIndexFromAdmin } = this.getResultFromAdmin();
            cardsFromAdmin = cardsFromAdmin.filter((card) => deck.find((c) => c.value === card.value && c.suit === card.suit));
            const cards = decryptCards(blockchain.chain);
            for (let i = 0; i < cardsFromAdmin.length; i++) {
                cards[blockchain.currentIndex + i] = {
                    value: cardsFromAdmin[i].value,
                    suit: cardsFromAdmin[i].suit,
                };
            }
            blockchain.chain = hashAndEncryptCards(cards);
            blockchain.cutCardIndex = cutCardIndexFromAdmin > blockchain.cutCardIndex ? cutCardIndexFromAdmin : blockchain.cutCardIndex;
            await this.resultsRepository.update(
                { _id: blockchain._id },
                { $set: { chain: blockchain.chain, cutCardIndex: blockchain.cutCardIndex } }
            );
        } catch (e) {
            this.logService.logError(`error in setResultFromAdmin ${JSON.stringify(this.gameData.settlementResultFromAdmin)}`);
        }
    }

    checkSufficientChain(blockchain) {
        let isSufficient = false;

        if (
            blockchain.currentIndex < blockchain.cutCardIndex ||
            (blockchain.currentIndex === blockchain.cutCardIndex && blockchain.remainingCards !== 0)
        ) {
            isSufficient = true;
        }

        return isSufficient;
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
