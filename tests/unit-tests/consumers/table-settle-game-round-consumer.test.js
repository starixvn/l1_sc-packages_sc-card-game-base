import TableSettleGameRoundConsumer from "../../../src/consumers/table-settle-game-round-consumer";
jest.mock("../../../src/consumers/settle-game-round-consumer", () => {
    return class Abc {
        collectRoundResult() {
            return {};
        }
        captureBetResult() {}
    };
});

describe("queryBets", () => {
    it("should return bets + tempBets", async () => {
        // Arrange
        const consumer = new TableSettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            tempBetsRepository: {},
            resultsRepository: {},
        });
        const roundId = 1;
        const realPlayerBets = [{ id: 1, amount: 10 }];
        const botBets = [
            { id: 2, amount: 10 },
            { id: 3, amount: 100 },
        ];
        consumer.betsRepository = {
            find: jest.fn(() => {
                return {
                    exec: jest.fn(() => realPlayerBets),
                };
            }),
        };
        consumer.tempBetsRepository = {
            find: jest.fn(() => {
                return {
                    exec: jest.fn(() => botBets),
                };
            }),
        };

        // Act
        const result = await consumer.queryBets(roundId);

        // Assert
        expect(result).toEqual([
            { id: 1, amount: 10 },
            { id: 2, amount: 10 },
            { id: 3, amount: 100 },
        ]);
    });
});

describe("captureBetResult", () => {
    it("should update winningPlayers", async () => {
        // Arrange
        const consumer = new TableSettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            tempBetsRepository: {},
            resultsRepository: {},
        });
        const betResult = {
            winningByChoices: {
                player: 30,
            },
            totalWin: 11,
        };
        const uid = "abcd123";
        consumer.gameData = {
            winningPlayers: {
                [uid]: {
                    bet: 11,
                    winningByChoices: { player: 20 },
                },
            },
            players: { [uid]: { red: 100 } },
        };

        // Act
        await consumer.captureBetResult(uid, betResult, 1);

        // Assert
        expect(consumer.gameData.winningPlayers[uid]).toEqual({
            rate: 1,
            win: true,
            bet: 22,
            winningByChoices: { player: 30 },
        });
    });

    it("should update players", async () => {
        // Arrange
        const consumer = new TableSettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            tempBetsRepository: {},
            resultsRepository: {},
        });
        const betResult = {
            winningByChoices: {
                player: 30,
            },
            totalWin: 11,
        };
        const uid = "abcd123";
        consumer.gameData = {
            winningPlayers: {
                [uid]: {
                    bet: 11,
                    winningByChoices: { player: 20 },
                },
            },
            players: { [uid]: { red: 100 } },
        };

        // Act
        await consumer.captureBetResult(uid, betResult, 1);

        // Assert
        expect(consumer.gameData.players[uid].red).toBe(111);
    });
});

describe("collectRoundResult", () => {
    it("should update winningPlayers ", () => {
        // Arrange
        const consumer = new TableSettleGameRoundConsumer({
            definition: {},
            gameData: {},
            roundResultPublisher: {},
            userBetResultPublisher: {},
            endGame: {},
            roundsRepository: {},
            betsRepository: {},
            tempBetsRepository: {},
            resultsRepository: {},
        });
        consumer.gameData = {
            winningPlayers: [{ id: 123 }],
        };

        // Assert
        const result = consumer.collectRoundResult({}, {}, 1);

        // Assert
        expect(result).toEqual({ winningPlayers: [{ id: 123 }] });
    });
});
