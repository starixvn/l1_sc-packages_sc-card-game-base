import { generateCardChain } from "../helpers/card-chain";
import Chance from "chance";

export default class RoundResultConsumer {
    constructor(gameData, definition, roundResultPublisher, resultsRepository) {
        this.gameData = gameData;
        this.definition = definition;
        this.roundResultPublisher = roundResultPublisher;
        this.resultsRepository = resultsRepository;
    }

    async generateResultAndPublishHash() {
        try {
            let lastResultRecord = await this.resultsRepository.findOne({ isAvailable: true }).lean().exec();
            if (!lastResultRecord || !this.checkSufficientChain(lastResultRecord)) {
                await this.setUnavailable(lastResultRecord);
                lastResultRecord = await this.createResultRecord();
            }

            // todo: set result from admin here

            this.gameData.blockchain = lastResultRecord;

            // settle here, will be moved to settle consumer
            //const { result, usedCardsCount } = this.generateResult(lastResultRecord);
            //this.gameData.result = result;
            //lastResultRecord.currentIndex = usedCardsCount + lastResultRecord.currentIndex;
            //await updateResultRecord(lastResultRecord);

            this.roundResultPublisher.publishResultHash();
        } catch (e) {
            const x = 1;
        }
    }

    generateResult(resultRecord) {
        return this.definition.generateResult(resultRecord);
    }

    checkSufficientChain(resultRecord) {
        let isSufficient = false;
        if (resultRecord.currentIndex < resultRecord.maxIndex) {
            const { usedCardsCount } = this.generateResult(resultRecord);
            if (usedCardsCount + resultRecord.currentIndex <= resultRecord.maxIndex) {
                isSufficient = true;
            }
        }

        return isSufficient;
    }

    async setUnavailable(resultRecord) {
        if (resultRecord) {
            await this.resultsRepository.update({ _id: resultRecord._id }, { $set: { isAvailable: false } });
        }
    }

    async createResultRecord() {
        const cardChain = generateCardChain(this.definition.numberOfPacks);
        const chance = new Chance();
        const skippedCount = chance.integer({ min: 1, max: 9 });
        const record = {
            isAvailable: true,
            currentIndex: skippedCount,
            maxIndex: Math.floor((52 * this.definition.numberOfPacks) / 2),
            skippedCount: skippedCount,
            chain: cardChain.chain,
        };
        await this.resultsRepository.create(record);

        return record;
    }
}
