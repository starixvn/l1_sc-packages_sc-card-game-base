import ProcessBetQueue from "../../../src/crons/process-bet-queue";
jest.mock("sc-game-base");

describe("adjustTotalBets", () => {
    describe("when not existing bet", () => {
        it("should calculate betUserCount correctly", () => {
            // Arrange
            const processBetQueue = new ProcessBetQueue();
            const player = {
                UID: 2,
            };
            const bet = { betChoice: "player" };
            processBetQueue.gameData = {
                betUserCount: { banker: [2, 3] },
            };
            processBetQueue.definition = {
                commonChoices: ["player", "banker", "tie"],
            };

            // Act
            processBetQueue.adjustTotalBets(player, bet, null);

            // Assert
            expect(processBetQueue.gameData.betUserCount).toEqual({ banker: [2, 3], player: [2] });
        });
    });

    describe("when existing bet", () => {
        it("should calculate betUserCount for common choices", () => {
            // Arrange
            const processBetQueue = new ProcessBetQueue();
            const player = {
                UID: 2,
            };
            const bet = { betChoice: "player" };
            processBetQueue.definition = {
                commonChoices: ["player", "banker", "tie"],
            };
            processBetQueue.gameData = {
                betUserCount: { banker: [2, 3], player: [2], tie: [1] },
            };

            // Act
            processBetQueue.adjustTotalBets(player, bet, null);

            // Assert
            expect(processBetQueue.gameData.betUserCount).toEqual({ banker: [2, 3], player: [2, 2], tie: [1] });
        });

        it("should not calculate betUserCount for other choices", () => {
            // Arrange
            const processBetQueue = new ProcessBetQueue();
            const player = {
                UID: 2,
            };
            const bet = { betChoice: "big" };
            processBetQueue.definition = {
                commonChoices: ["player", "banker", "tie"],
            };
            processBetQueue.gameData = {
                betUserCount: { banker: [2, 3], player: [2] },
            };

            // Act
            processBetQueue.adjustTotalBets(player, bet, null);

            // Assert
            expect(processBetQueue.gameData.betUserCount).toEqual({ banker: [2, 3], player: [2] });
        });
    });
});
