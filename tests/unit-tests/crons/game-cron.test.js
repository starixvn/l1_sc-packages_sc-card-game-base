jest.mock("sc-game-base", () => {
    return {
        Core: {
            Crons: {
                BaseGameCron: class BaseClass {
                    resetForNewRound() {}
                },
            },
            BaseEventConsumers: {
                InGameConsumer: class BaseClass {},
                SettleGameRoundConsumer: class BaseClass {},
            },
            BaseEventPublishers: {
                BaseEventPublisher: class BaseClass {},
            },
            GameDefinition: class BaseClass {},
            QueryApis: {
                RoundQuery: class BaseClass {},
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

    it("should reset totalTestBets", () => {
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
