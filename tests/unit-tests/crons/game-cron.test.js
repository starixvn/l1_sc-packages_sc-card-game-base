import { stub, stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { GameData, GameDefinition } from "sc-game-base/src/core";
import { BaseBot } from "sc-game-base/src/core/crons";
import { ProvablyFairConsumer, RoundIdConsumer } from "sc-game-base/src/core/event-consumers";
import { GameStatusPublisher } from "sc-game-base/src/core/event-publishers";
import GameManagementApiClientFactory from "sc-game-base/src/core/game-management-api";
import { Crons } from "../../../src";
import { RoundResultConsumer, SettleGameRoundConsumer, UnsettledRoundConsumer } from "../../../src/consumers";
import { RunningRoundInfoPublisher } from "../../../src/publishers";

const gameManagementApiClientFactory = new GameManagementApiClientFactory({});
const definition = stub(GameDefinition);
const gameData = stub(GameData);
const resultsRepository = stubMongoose(mongoose.Model);
const bot = stub(BaseBot);
const roundIdConsumer = stub(RoundIdConsumer);
const appConfigs = {};
const settleGameRoundConsumer = stub(SettleGameRoundConsumer);
const roundResultConsumer = stub(RoundResultConsumer);
const gameStatusPublisher = stub(GameStatusPublisher);
const runningRoundInfoPublisher = stub(RunningRoundInfoPublisher);
const unsettledRoundConsumer = stub(UnsettledRoundConsumer)
const provablyFairConsumer = stub(ProvablyFairConsumer)
function initCron() {
    return new Crons.GameCron({
        definition,
        gameData,
        bot,
        settleGameRoundConsumer,
        gameStatusPublisher,
        runningRoundInfoPublisher,
        roundResultConsumer,
        resultsRepository,
        appConfigs,
        gameManagementApiClientFactory,
        roundIdConsumer,
        unsettledRoundConsumer,
        provablyFairConsumer
    });
}
describe("resetForNewRound", () => {
    it("should reset chips", () => {
        // Arrange
        const gameCron = initCron();
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
        const gameCron = initCron();
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
        const gameCron = initCron();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.initNewRound = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(roundIdConsumer.initRoundId).toHaveBeenCalled();
    });

    it("should call getSettingForNewRound", async () => {
        // Arrange
        const gameCron = initCron();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.initNewRound = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.getSettingForNewRound).toHaveBeenCalled();
    });

    it("should call updateExchangeRates", async () => {
        // Arrange
        const gameCron = initCron();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.initNewRound = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.updateExchangeRates).toHaveBeenCalled();
    });

    it("should call startCron", async () => {
        // Arrange
        const gameCron = initCron();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.initNewRound = jest.fn();

        // Act
        await gameCron.start();

        // Assert
        expect(gameCron.startCron).toHaveBeenCalled();
    });
});

describe("proceed", () => {
    describe("when isNewRound", () => {
        it("should checkGameStatus", async () => {
            // Arrange
            const gameCron = initCron();
            gameCron.gameData = {
                remainingTime: 10,
                disabled: true,
                isNewRound: true,
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
            expect(gameCron.checkGameStatus).toHaveBeenCalled();
        });

        describe("when gameData disabled", () => {
            it("should not update isNewRound", async () => {
                // Arrange
                const gameCron = initCron();
                gameCron.gameData = {
                    remainingTime: 10,
                    disabled: true,
                    isNewRound: true,
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
                expect(gameCron.gameData.isNewRound).toBe(true);
            });
        });

        describe("when gameData not disabled", () => {
            it("should update isNewRound", async () => {
                // Arrange
                const gameCron = initCron();
                gameCron.gameData = {
                    remainingTime: 10,
                    disabled: false,
                    isNewRound: true,
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
                expect(gameCron.gameData.isNewRound).toBe(false);
            });
        });
    });

    describe("when remainingTime = placing bets + changing deck", () => {
        describe("when disabled", () => {
            it("should not call generateAndPublishBlockchain", async () => {
                // Arrange
                const gameCron = initCron();
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
                const gameCron = initCron();
                gameCron.gameData = {
                    remainingTime: 15,
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
                    checkSufficientChain: jest.fn(() => {
                        return {
                            isSufficient: false,
                        };
                    }),
                };
                gameCron.checkGameStatus = jest.fn();
                gameCron.isStartingTime = jest.fn(() => false);
                gameCron.logService = { log: jest.fn() };

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
            const gameCron = initCron();
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
            const gameCron = initCron();
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
        it("should call settleRound", async () => {
            // Arrange
            const gameCron = initCron();
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
                generateResult: jest.fn().mockReturnValue({}),
            };
            gameCron.initNewRound = jest.fn();

            // Act
            await gameCron.proceed();

            // Assert
            expect(gameCron.settleGameRoundConsumer.settleRound).toHaveBeenCalled();
        });
    });

    describe("remainingTime < placingBets", () => {
        it("should call bot run", async () => {
            // Arrange
            const gameCron = initCron();
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
            const gameCron = initCron();
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
            const gameCron = initCron();
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
            const gameCron = initCron();
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

describe("initNewRound", () => {
    it("should set isNewRound true", async () => {
        // Arrange
        const gameCron = initCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.getWholeRoundByChainStatus = jest.fn();
        gameCron.gameData = {};

        // Act
        await gameCron.initNewRound();

        // Assert
        expect(gameCron.gameData.isNewRound).toBe(true);
    });

    it("should init remainingTime", async () => {
        // Arrange
        const gameCron = initCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.getWholeRoundByChainStatus = jest.fn(() => 10);
        gameCron.gameData = {};

        // Act
        await gameCron.initNewRound();

        // Assert
        expect(gameCron.gameData.remainingTime).toBe(10);
    });
});

describe("initBlockchain", () => {
    it("should init blockchain", async () => {
        // Arrange
        const gameCron = initCron();
        gameCron.initRoundId = jest.fn();
        gameCron.getSettingForNewRound = jest.fn();
        gameCron.updateExchangeRates = jest.fn();
        gameCron.startCron = jest.fn();
        gameCron.getWholeRoundByChainStatus = jest.fn(() => 10);
        gameCron.gameData = {};
        gameCron.resultsRepository = {
            findOne: jest.fn(() => {
                return {
                    lean: jest.fn(() => {
                        return {
                            exec: jest.fn(() => {
                                return { xx: 123 };
                            }),
                        };
                    }),
                };
            }),
        };

        // Act
        await gameCron.initBlockchain();

        // Assert
        expect(gameCron.gameData.blockchain).toEqual({
            xx: 123,
        });
    });
});
