jest.mock("sc-game-base", () => {
    return {
        Core: {
            QueryApis: {
                RoundQuery: class Abc {},
            },
        },
    };
});

import RoundQuery from "../../../src/query-apis/round-query";

describe("getList", () => {
    it("should return list of round result", async () => {
        // Arrange
        const gameData = {
            blockchain: { firstRoundId: 123 },
        };
        const query = new RoundQuery(gameData);
        const rounds = [
            {
                id: 1,
                result: { x: 1 },
                settlementResult: { y: 12 },
            },
            {
                id: 2,
                result: { x: 2 },
                settlementResult: { y: 13 },
            },
        ];
        query.roundsRepository = {
            find: jest.fn(() => {
                return {
                    lean: jest.fn(() => {
                        return {
                            exec: jest.fn(() => rounds),
                        };
                    }),
                };
            }),
        };

        // Act
        const result = await query.getList(10, {});

        // Assert
        expect(result).toEqual([
            { roundId: 1, result: { x: 1 }, settlementResult: { y: 12 } },
            { roundId: 2, result: { x: 2 }, settlementResult: { y: 13 } },
        ]);
    });

    describe("when result not exist", () => {
        it("should return list of round result", async () => {
            // Arrange
            const gameData = {
                blockchain: { firstRoundId: 123 },
            };
            const query = new RoundQuery(gameData);
            const rounds = [
                {
                    id: 1,
                    someResult: { x: 1 },
                    settlementResult: { y: 12 },
                },
                {
                    id: 2,
                    someResult: { x: 2 },
                    settlementResult: { y: 13 },
                },
            ];
            query.roundsRepository = {
                find: jest.fn(() => {
                    return {
                        lean: jest.fn(() => {
                            return {
                                exec: jest.fn(() => rounds),
                            };
                        }),
                    };
                }),
            };
            query.convertResult = (round) => {
                return round.someResult;
            };

            // Act
            const result = await query.getList(10, {});

            // Assert
            expect(result).toEqual([
                { roundId: 1, result: { x: 1 }, settlementResult: { y: 12 } },
                { roundId: 2, result: { x: 2 }, settlementResult: { y: 13 } },
            ]);
        });
    });

    describe("when setttlementResult not exist", () => {
        it("should return list of round result", async () => {
            // Arrange
            const gameData = {
                blockchain: { firstRoundId: 123 },
            };
            const query = new RoundQuery(gameData);
            const rounds = [
                {
                    id: 1,
                    result: { x: 1 },
                },
                {
                    id: 2,
                    result: { x: 2 },
                },
            ];
            query.roundsRepository = {
                find: jest.fn(() => {
                    return {
                        lean: jest.fn(() => {
                            return {
                                exec: jest.fn(() => rounds),
                            };
                        }),
                    };
                }),
            };
            query.convertSettlementResult = (result) => {
                return result;
            };

            // Act
            const result = await query.getList(10, {});

            // Assert
            expect(result).toEqual([
                { roundId: 1, result: { x: 1 }, settlementResult: { x: 1 } },
                { roundId: 2, result: { x: 2 }, settlementResult: { x: 2 } },
            ]);
        });
    });
});
