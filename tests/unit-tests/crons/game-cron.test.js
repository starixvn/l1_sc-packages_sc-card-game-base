import { GameCron } from "../../../src/crons/game-cron";

jest.mock("sc-game-base", () => {
    return {
        Core: {
            Crons: {
                BaseGameCron: class BaseClass {
                    resetForNewRound() {}
                },
            },
        },
    };
});

describe("resetForNewRound", () => {
    it("should reset betCount", () => {
        // Arrange
        const gameCron = new GameCron();
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
        const gameCron = new GameCron();
        gameCron.gameData = {
            totalTestBets: { x: 1 },
        };

        // Act
        gameCron.resetForNewRound();

        // Assert
        expect(gameCron.gameData.totalTestBets).toEqual({});
    });
});
