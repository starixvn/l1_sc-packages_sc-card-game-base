jest.mock("../../../src/helpers/card-chain", () => {
    return {
        generateChain: jest.fn(() => {
            return {
                chain: "xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz",
            };
        }),
    };
});

import { Consumers } from "../../../src";

describe("generateAndPublishBlockchain", () => {
    describe("when isSufficient false", () => {
        it("should call setUnavailable", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.checkSufficientChain = jest.fn(() => {
                return { isSufficient: false };
            });
            consumer.createResultRecord = jest.fn();
            consumer.setUnavailable = jest.fn();
            consumer.gameData = {};
            consumer.roundResultPublisher = { publishNewBlockchain: jest.fn() };

            // Act
            await consumer.generateAndPublishBlockchain();

            // Assert
            expect(consumer.setUnavailable).toHaveBeenCalled();
        });

        it("should createResultRecord", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.checkSufficientChain = jest.fn(() => {
                return { isSufficient: false };
            });
            const blockchain = { x: 123 };
            consumer.createResultRecord = jest.fn(() => blockchain);
            consumer.setUnavailable = jest.fn();
            consumer.gameData = {};
            consumer.roundResultPublisher = { publishNewBlockchain: jest.fn() };

            // Act
            await consumer.generateAndPublishBlockchain();

            // Assert
            expect(consumer.gameData.blockchain).toBe(blockchain);
        });

        it("should call publishNewBlockchain", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.checkSufficientChain = jest.fn(() => {
                return { isSufficient: false };
            });
            const blockchain = { x: 123 };
            consumer.createResultRecord = jest.fn(() => blockchain);
            consumer.setUnavailable = jest.fn();
            consumer.gameData = {};
            consumer.roundResultPublisher = { publishNewBlockchain: jest.fn() };

            // Act
            await consumer.generateAndPublishBlockchain();

            // Assert
            expect(consumer.roundResultPublisher.publishNewBlockchain).toHaveBeenCalled();
        });
    });

    describe("when isSufficient true", () => {
        it("should not call createResultRecord", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.checkSufficientChain = jest.fn(() => {
                return { isSufficient: true };
            });
            const blockchain = { x: 123 };
            consumer.createResultRecord = jest.fn(() => blockchain);
            consumer.setUnavailable = jest.fn();
            consumer.gameData = {};
            consumer.roundResultPublisher = { publishNewBlockchain: jest.fn() };

            // Act
            await consumer.generateAndPublishBlockchain();

            // Assert
            expect(consumer.createResultRecord).not.toHaveBeenCalled();
        });

        it("should not call publishNewBlockchain", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.checkSufficientChain = jest.fn(() => {
                return { isSufficient: true };
            });
            const blockchain = { x: 123 };
            consumer.createResultRecord = jest.fn(() => blockchain);
            consumer.setUnavailable = jest.fn();
            consumer.gameData = {};
            consumer.roundResultPublisher = { publishNewBlockchain: jest.fn() };

            // Act
            await consumer.generateAndPublishBlockchain();

            // Assert
            expect(consumer.roundResultPublisher.publishNewBlockchain).not.toHaveBeenCalled();
        });
    });
});

describe("checkSufficientChain", () => {
    describe("when hasResultFromAdmin true", () => {
        it("should return isSufficient false", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.resultsRepository = {
                findOne: jest.fn(() => {
                    return {
                        lean: jest.fn(() => {
                            return { exec: jest.fn() };
                        }),
                    };
                }),
            };
            consumer.hasResultFromAdmin = jest.fn(() => true);

            // Assert
            const result = await consumer.checkSufficientChain();

            // Assert
            expect(result.isSufficient).toBe(false);
        });
    });

    describe("when blockchain is null", () => {
        it("should return isSufficient false", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.resultsRepository = {
                findOne: jest.fn(() => {
                    return {
                        lean: jest.fn(() => {
                            return { exec: jest.fn(() => null) };
                        }),
                    };
                }),
            };
            consumer.hasResultFromAdmin = jest.fn(() => false);

            // Assert
            const result = await consumer.checkSufficientChain();

            // Assert
            expect(result.isSufficient).toBe(false);
            expect(result.blockchain).toBe(null);
        });
    });

    describe("when blockchain currentIndex < cutCardIndex", () => {
        it("should return isSufficient true", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.resultsRepository = {
                findOne: jest.fn(() => {
                    return {
                        lean: jest.fn(() => {
                            return {
                                exec: jest.fn(() => {
                                    return {
                                        currentIndex: 1,
                                        cutCardIndex: 2,
                                    };
                                }),
                            };
                        }),
                    };
                }),
            };
            consumer.hasResultFromAdmin = jest.fn(() => false);

            // Assert
            const result = await consumer.checkSufficientChain();

            // Assert
            expect(result.isSufficient).toBe(true);
        });
    });

    describe("when blockchain currentIndex = cutCardIndex and remainingCards != 0", () => {
        it("should return isSufficient true", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.resultsRepository = {
                findOne: jest.fn(() => {
                    return {
                        lean: jest.fn(() => {
                            return {
                                exec: jest.fn(() => {
                                    return {
                                        currentIndex: 2,
                                        cutCardIndex: 2,
                                        remainingCards: 2,
                                    };
                                }),
                            };
                        }),
                    };
                }),
            };
            consumer.hasResultFromAdmin = jest.fn(() => false);

            // Assert
            const result = await consumer.checkSufficientChain();

            // Assert
            expect(result.isSufficient).toBe(true);
        });
    });
});

describe("setUnavailable", () => {
    it("should call resultsRepository update", async () => {
        // Arrange
        const consumer = new Consumers.RoundResultConsumer();
        consumer.resultsRepository = {
            update: jest.fn(),
        };
        const blockchain = {
            _id: 234,
        };

        // Act
        await consumer.setUnavailable(blockchain);

        // Assert
        expect(consumer.resultsRepository.update).toHaveBeenCalledWith({ _id: 234 }, { $set: { isAvailable: false } });
    });
});

describe("createResultRecord", () => {
    describe("when has cutCardIndexFromAdmin", () => {
        it("should create record with cutCardIndexFromAdmin", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.gameData = {
                gameConfigs: { randomMode: 1 },
                roundId: 123,
            };
            consumer.getResultFromAdmin = jest.fn(() => {
                return {
                    cutCardIndexFromAdmin: 10,
                };
            });
            consumer.definition = {
                numberOfDecks: 3,
                maxCardsPerRound: 6,
                minCutCardIndex: 20,
                maxCutCardIndex: 30,
            };

            consumer.calculateBurnedCards = jest.fn(() => 2);
            consumer.resultsRepository = {
                create: jest.fn(),
            };

            // Act
            await consumer.createResultRecord();

            // Assert
            expect(consumer.resultsRepository.create).toHaveBeenCalledWith({
                isAvailable: true,
                currentIndex: 2,
                cutCardIndex: 10,
                burnedCards: 2,
                remainingCards: 0,
                chain: "xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz",
                firstRoundId: 123,
            });
        });
    });

    describe("when does not have cutCardIndexFromAdmin", () => {
        it("should create record with random cutcard", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.gameData = {
                gameConfigs: { randomMode: 1 },
                roundId: 123,
            };
            consumer.getResultFromAdmin = jest.fn(() => {
                return {
                    cutCardIndexFromAdmin: 0,
                };
            });
            consumer.definition = {
                numberOfDecks: 3,
                maxCardsPerRound: 6,
                minCutCardIndex: 20,
                maxCutCardIndex: 20,
            };

            consumer.calculateBurnedCards = jest.fn(() => 2);
            consumer.resultsRepository = {
                create: jest.fn(),
            };

            // Act
            await consumer.createResultRecord();

            // Assert
            expect(consumer.resultsRepository.create).toHaveBeenCalledWith({
                isAvailable: true,
                currentIndex: 2,
                cutCardIndex: 20,
                burnedCards: 2,
                remainingCards: 0,
                chain: "xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz",
                firstRoundId: 123,
            });
        });
    });
});

describe("hasResultFromAdmin", () => {
    describe("when has cardsFromAdmin", () => {
        it("should return true", () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.gameData = {
                settlementResultFromAdmin: {
                    result: {
                        cards: [
                            { rank: 1, suit: 1 },
                            { rank: 1, suit: 0 },
                        ],
                    },
                },
            };

            // Act
            const result = consumer.hasResultFromAdmin();

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("when has cutCardIndexFromAdmin", () => {
        it("should return true", () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.gameData = {
                settlementResultFromAdmin: {
                    result: {
                        cutCardIndex: 12,
                    },
                },
            };

            // Act
            const result = consumer.hasResultFromAdmin();

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("when does not have cardsFromAdmin or cutCardIndexFromAdmin", () => {
        it("should return false", () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            consumer.gameData = {
                settlementResultFromAdmin: {},
            };

            // Act
            const result = consumer.hasResultFromAdmin();

            // Assert
            expect(result).toBe(false);
        });
    });
});
