jest.mock("sc-game-base", () => {
    return {
        Core: {
            Crons: {
                BaseGameCron: class BaseClass {
                    resetForNewRound() {}
                },
                ProcessBetQueue: class BaseClass {
                    resetForNewRound() {}
                },
            },
            BaseEventConsumers: {
                InGameConsumer: class BaseClass {},
                SettleGameRoundConsumer: class BaseClass {},
                AdminMonitorConsumer: class BaseClass {},
            },
            BaseEventPublishers: {
                BaseEventPublisher: class BaseClass {},
            },
            GameDefinition: class BaseClass {},
            QueryApis: {
                RoundQuery: class BaseClass {},
                HistoryQuery: class BaseClass {},
            },
        },
    };
});

import { Crons } from "../../../src";

describe("resetForNewRound", () => {
    it("should reset chips", () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.gameData = {
            chips: { x: 1 },
        };

        // Act
        gameCron.resetForNewRound();

        // Assert
        expect(gameCron.gameData.chips).toEqual({});
    });

    it("should reset winningPlayers", () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.gameData = {
            winningPlayers: { x: 1 },
        };

        // Act
        gameCron.resetForNewRound();

        // Assert
        expect(gameCron.gameData.winningPlayers).toEqual({});
    });
});

describe("start", () => {
    it("should call initRoundId", async () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.initRoundId).toHaveBeenCalled();
    });

    it("should call getSettingForNewRound", async () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.getSettingForNewRound).toHaveBeenCalled();
    });

    it("should call updateExchangeRates", async () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.updateExchangeRates).toHaveBeenCalled();
    });

    it("should call startCron", async () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.startCron).toHaveBeenCalled();
    });
});

describe("proceed", () => {
    describe("when remainingTime = placing bets + changing deck", () => {
        describe("when disabled", () => {
            it("should not call generateAndPublishBlockchain", async () => {
                // Arrange
                const gameCron = new Crons.GameCron();
                gameCron.gameData = {
                    remainingTime: 10,
                    disabled: true,
                };
                gameCron.definition = {
                    durations: {
                        placingBets: 8,
                        changingDeck: 2,
                    },
                };
                gameCron.roundResultConsumer = {
                    generateAndPublishBlockchain: jest.fn(),
                };
                gameCron.checkGameStatus = jest.fn();
                gameCron.isStartingTime = jest.fn(() => false);

                // Act
                await gameCron.proceed();

                // Assert
                expect(gameCron.roundResultConsumer.generateAndPublishBlockchain).not.toHaveBeenCalled();
            });
        });
        describe("when not disabled", () => {
            it("should call generateAndPublishBlockchain", async () => {
                // Arrange
                const gameCron = new Crons.GameCron();
                gameCron.gameData = {
                    remainingTime: 10,
                    disabled: false,
                };
                gameCron.definition = {
                    durations: {
                        placingBets: 8,
                        changingDeck: 2,
                    },
                };
                gameCron.roundResultConsumer = {
                    generateAndPublishBlockchain: jest.fn(),
                };
                gameCron.checkGameStatus = jest.fn();
                gameCron.isStartingTime = jest.fn(() => false);

                // Act
                await gameCron.proceed();

                // Assert
                expect(gameCron.roundResultConsumer.generateAndPublishBlockchain).toHaveBeenCalled();
            });
        });
    });

    describe("when isStartingTime true", () => {
        it("should call resetForNewRound", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.gameData = {
                remainingTime: 5,
                disabled: true,
            };
            gameCron.definition = {
                durations: {
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                generateAndPublishBlockchain: jest.fn(),
            };
            gameCron.checkGameStatus = jest.fn();
            gameCron.isStartingTime = jest.fn(() => true);
            gameCron.resetForNewRound = jest.fn();
            gameCron.bot = {
                reset: jest.fn(),
            };

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.resetForNewRound).toHaveBeenCalled();
        });

        it("should call bot reset", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.gameData = {
                remainingTime: 5,
                disabled: true,
            };
            gameCron.definition = {
                durations: {
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                generateAndPublishBlockchain: jest.fn(),
            };
            gameCron.checkGameStatus = jest.fn();
            gameCron.isStartingTime = jest.fn(() => true);
            gameCron.resetForNewRound = jest.fn();
            gameCron.bot = {
                reset: jest.fn(),
            };

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.bot.reset).toHaveBeenCalled();
        });
    });

    describe("when remainingTime < 0", () => {
        it("should update remainingTime = wholeRound + changingDeck", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.gameData = {
                remainingTime: -1,
                disabled: true,
            };
            gameCron.definition = {
                durations: {
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                generateAndPublishBlockchain: jest.fn(),
            };
            gameCron.checkGameStatus = jest.fn();
            gameCron.isStartingTime = jest.fn(() => false);
            gameCron.settleGameRoundConsumer = {
                settleRound: jest.fn(),
            };

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.gameData.remainingTime).toBe(8 + 2);
        });

        it("should call settleRound", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.gameData = {
                remainingTime: -1,
                disabled: true,
            };
            gameCron.definition = {
                durations: {
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                generateAndPublishBlockchain: jest.fn(),
            };
            gameCron.checkGameStatus = jest.fn();
            gameCron.isStartingTime = jest.fn(() => false);
            gameCron.settleGameRoundConsumer = {
                settleRound: jest.fn(),
            };

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.settleGameRoundConsumer.settleRound).toHaveBeenCalled();
        });
    });

    describe("remainingTime < placingBets", () => {
        it("should call bot run", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.gameData = {
                remainingTime: 4,
                disabled: true,
            };
            gameCron.definition = {
                durations: {
                    placingBets: 5,
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                generateAndPublishBlockchain: jest.fn(),
            };
            gameCron.checkGameStatus = jest.fn();
            gameCron.isStartingTime = jest.fn(() => false);
            gameCron.settleGameRoundConsumer = {
                settleRound: jest.fn(),
            };
            gameCron.bot = {
                run: jest.fn(),
            };
            gameCron.runningRoundInfoPublisher = {
                publish: jest.fn(),
            };

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.bot.run).toHaveBeenCalled();
        });

        it("should call runningRoundInfoPublisher publish", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.gameData = {
                remainingTime: 4,
                disabled: true,
            };
            gameCron.definition = {
                durations: {
                    placingBets: 5,
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                generateAndPublishBlockchain: jest.fn(),
            };
            gameCron.checkGameStatus = jest.fn();
            gameCron.isStartingTime = jest.fn(() => false);
            gameCron.settleGameRoundConsumer = {
                settleRound: jest.fn(),
            };
            gameCron.bot = {
                run: jest.fn(),
            };
            gameCron.runningRoundInfoPublisher = {
                publish: jest.fn(),
            };

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.runningRoundInfoPublisher.publish).toHaveBeenCalled();
        });
    });
});

describe("getWholeRoundByChainStatus", () => {
    describe("when isSufficient is true", () => {
        it("should return wholeRound", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.definition = {
                durations: {
                    placingBets: 5,
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                checkSufficientChain: jest.fn(() => {
                    return { isSufficient: true };
                }),
            };

            // Act
            const result = await gameCron.getWholeRoundByChainStatus();

            // Assert
            expect(result).toBe(8);
        });
    });

    describe("when isSufficient is false", () => {
        it("should return wholeRound + changingDeck", async () => {
            // Arrange
            const gameCron = new Crons.GameCron();
            gameCron.definition = {
                durations: {
                    placingBets: 5,
                    wholeRound: 8,
                    changingDeck: 2,
                },
            };
            gameCron.roundResultConsumer = {
                checkSufficientChain: jest.fn(() => {
                    return { isSufficient: false };
                }),
            };

            // Act
            const result = await gameCron.getWholeRoundByChainStatus();

            // Assert
            expect(result).toBe(10);
        });
    });
});
