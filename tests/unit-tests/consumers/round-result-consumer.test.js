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

        // Act
        await consumer.setUnavailable();

        // Assert
        expect(consumer.resultsRepository.update).toHaveBeenCalledWith(
            { isAvailable: true },
            { $set: { isAvailable: false } },
            { multi: true }
        );
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

describe("calculateBurnedCards", () => {
    describe("when card rank >= 10", () => {
        it("should calculate burned cards correctly", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            const cardChain = [
                {
                    encryptedResult: {
                        iv: "f844cb2887cc08404f74e68a4120a6b1",
                        content: "c84ae94bc5d4e61b5c3d05aa6ddf79423b27cfea",
                    },
                    encryptedResultHash: {
                        iv: "122f7bb7aab426a40d3d5d23e400c455",
                        content:
                            "08d79330f3e3f6802b03b359f3bde3a77ac92304528e7c52a20221bf24c4618adf3851f73f91b094e47c03de056f7c5af9ba427ae2d2a19e0c068a7962a8e71eb1139e25cc28ae3880de7462bf0a2ee86f926c0f71091913464bb9d1600cf8689749a1180298a1f9a0825f0c506bd0432093d4948caf95e5fdb4c93b1450bda21b52fc722230d5d21d6ef1b090b25352fbb643de292094026225555875820cdb3270160c",
                    },
                    revealedRawValue: "92",
                },
            ];

            // Act
            const result = await consumer.calculateBurnedCards(cardChain);

            // Assert
            expect(result).toBe(11);
        });
    });

    describe("when card rank < 10", () => {
        it("should calculate burned cards correctly", async () => {
            // Arrange
            const consumer = new Consumers.RoundResultConsumer();
            const cardChain = [
                {
                    encryptedResult: {
                        iv: "ebe88bdbec817f09267594dfe954d0ce",
                        content: "610b397567596e5176334eda22149d825700b8",
                    },
                    encryptedResultHash: {
                        iv: "9cc98dad7ef06df1ed86e00b4da23f9e",
                        content:
                            "e52351c0438e13aff887b4880fe77b216b5a79cf0aa227e9fd34d10b54baaa4006df430748aa1570f4b3fe58238f86fca1a3f36666f4ac7ee43395860aa8e90272e3ac6663e2abfb2cb37996c886c8735fc0f707142008bed1f8e1d5770d7e66595fbf982e35bf1551beb8b7667a690b5a390e4578ba2856dca263c1fa6d18ccace568ea59339c18fe3acdcd50022396debbcb655732c785d4371b5ad135a7addc55f599",
                    },
                    revealedRawValue: "8d",
                },
            ];

            // Act
            const result = await consumer.calculateBurnedCards(cardChain);

            // Assert
            expect(result).toBe(10);
        });
    });
});
