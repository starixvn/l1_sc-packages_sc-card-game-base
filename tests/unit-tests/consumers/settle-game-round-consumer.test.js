import SettleGameRoundConsumer from "../../../src/consumers/settle-game-round-consumer";
jest.mock("sc-game-base", () => {
    return {
        Core: {
            BaseEventConsumers: {
                SettleGameRoundConsumer: class Abc {},
            },
        },
    };
});

describe("settleRound", () => {
    it("should create new round and settle bets", async () => {
        // Arrange
        const consumer = new SettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            resultsRepository: {},
        });
        const result = {
            r: 123,
        };
        const settlementResult = {
            s: 124,
        };
        consumer.definition = {
            settle: jest.fn(() => settlementResult),
        };
        consumer.gameData = {
            roundId: 10,
            exchangeRates: {
                exId: 111,
            },
        };
        const newRound = {
            round: 1122,
        };
        consumer.roundsRepository = {
            create: jest.fn(() => newRound),
        };
        consumer.settleBets = jest.fn();

        // Act
        await consumer.settleRound(result);

        // Assert
        expect(consumer.settleBets).toHaveBeenCalled();
    });
});

describe("generateResult", () => {
    it("should update current index", async () => {
        // Arrange
        const consumer = new SettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            resultsRepository: {},
        });
        const result = { r: 11 };
        const usedCardsCount = 4;
        consumer.definition = {
            generateResult: jest.fn(() => {
                return { result, usedCardsCount };
            }),
            maxCardsPerRound: 6,
        };
        consumer.gameData = {
            blockchain: {
                currentIndex: 10,
            },
        };
        consumer.resultsRepository = {
            update: jest.fn(),
        };

        // Act
        await consumer.generateResult();

        // Assert
        expect(consumer.gameData.blockchain.currentIndex).toBe(14);
    });

    it("should update remaining cards", async () => {
        // Arrange
        const consumer = new SettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            resultsRepository: {},
        });
        const result = { r: 11 };
        const usedCardsCount = 4;
        consumer.definition = {
            generateResult: jest.fn(() => {
                return { result, usedCardsCount };
            }),
            maxCardsPerRound: 6,
        };
        consumer.gameData = {
            blockchain: {
                currentIndex: 10,
            },
        };
        consumer.resultsRepository = {
            update: jest.fn(),
        };

        // Act
        await consumer.generateResult();

        // Assert
        expect(consumer.gameData.blockchain.remainingCards).toBe(2);
    });

    it("should update result", async () => {
        // Arrange
        const consumer = new SettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            resultsRepository: {},
        });
        const result = { r: 11 };
        const usedCardsCount = 4;
        consumer.definition = {
            generateResult: jest.fn(() => {
                return { result, usedCardsCount };
            }),
            maxCardsPerRound: 6,
        };
        consumer.gameData = {
            blockchain: {
                currentIndex: 10,
                _id: 1234,
            },
        };
        consumer.resultsRepository = {
            update: jest.fn(),
        };

        // Act
        await consumer.generateResult();

        // Assert
        expect(consumer.resultsRepository.update).toHaveBeenCalledWith(
            { _id: 1234 },
            {
                $set: {
                    currentIndex: 14,
                    remainingCards: 2,
                },
            }
        );
    });
});
