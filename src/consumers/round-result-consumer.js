import { generateChain } from "../helpers/card-chain";
import Chance from "chance";

export default class RoundResultConsumer {
    constructor(gameData, definition, roundResultPublisher, resultsRepository) {
        this.gameData = gameData;
        this.definition = definition;
        this.roundResultPublisher = roundResultPublisher;
        this.resultsRepository = resultsRepository;
    }

    async generateResultAndPublishHash() {
        let lastResultRecord = await this.resultsRepository.findOne({ isAvailable: true }).lean().exec();
        if (!lastResultRecord || !this.checkSufficientChain(lastResultRecord)) {
            await this.setUnavailable(lastResultRecord);
            lastResultRecord = await this.createResultRecord();
        }

        // todo: set result from admin here

        this.gameData.blockchain = lastResultRecord;

        this.roundResultPublisher.publishResultHash();
    }

    generateResult(resultRecord) {
        return this.definition.generateResult(resultRecord);
    }

    checkSufficientChain(resultRecord) {
        return resultRecord.currentIndex + this.definition.maxCardsPerRound < resultRecord.maxIndex ? true : false;
    }

    async setUnavailable(resultRecord) {
        if (resultRecord) {
            await this.resultsRepository.update({ _id: resultRecord._id }, { $set: { isAvailable: false } });
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
