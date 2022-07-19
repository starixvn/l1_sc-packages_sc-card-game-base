import TableProcessBetQueue from "../../../src/crons/table-process-bet-queue";
jest.mock("../../../src/crons/process-bet-queue", () => {
    return class Abc {
        generatePlacingBetResult() {
            return { xx: 11 };
        }
    };
});

describe("generatePlacingBetResult", () => {
    it("return ownbet", () => {
        // Arrange
        const processBetQueue = new TableProcessBetQueue();
        const player = { UID: 123 };
        const balance = 1000;
        const bet = { betChoice: "player", amount: 10 };
        const rate = 1;
        processBetQueue.gameData = {
            chips: {},
            players: {},
        };

        // Act
        const result = processBetQueue.generatePlacingBetResult(player, balance, bet, rate);

        // Assert
        expect(result).toEqual({ xx: 11, ownChip: { betChoice: "player", amount: 10 } });
    });

    describe("when there is chips at rate", () => {
        it("should update chips at bet choice", () => {
            // Arrange
            const processBetQueue = new TableProcessBetQueue();
            const player = { UID: 123 };
            const balance = 1000;
            const bet = { betChoice: "player", amount: 10 };
            const rate = 1;
            processBetQueue.gameData = {
                chips: { 1: {} },
                players: {},
            };

            // Act
            processBetQueue.generatePlacingBetResult(player, balance, bet, rate);

            // Assert
            expect(processBetQueue.gameData.chips).toEqual({ 1: { player: { 10: 1 } } });
        });
    });

    describe("when there is no chips at rate", () => {
        it("should update chips at bet choice", () => {
            // Arrange
            const processBetQueue = new TableProcessBetQueue();
            const player = { UID: 123 };
            const balance = 1000;
            const bet = { betChoice: "player", amount: 10 };
            const rate = 1;
            processBetQueue.gameData = {
                chips: {},
                players: {},
            };

            // Act
            processBetQueue.generatePlacingBetResult(player, balance, bet, rate);

            // Assert
            expect(processBetQueue.gameData.chips).toEqual({ 1: { player: { 10: 1 } } });
        });
    });
});
