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
        },
    };
});

import { Crons } from "../../../src";

describe("resetForNewRound", () => {
    it("should reset betCount", () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.gameData = {
            betCount: { x: 1 },
        };

        // Act
        gameCron.resetForNewRound();

        // Assert
        expect(gameCron.gameData.betCount).toEqual({});
    });

    it("should reset totalTestBets", () => {
        // Arrange
        const gameCron = new Crons.GameCron();
        gameCron.gameData = {
            totalTestBets: { x: 1 },
        };

        // Act
        gameCron.resetForNewRound();

        // Assert
        expect(gameCron.gameData.totalTestBets).toEqual({});
    });
});
