import PlaceBetConsumer from "../../../src/consumers/place-bet-consumer";

describe("composeBettingTimeValidationCriteria", () => {
    describe("when isNewChain true", () => {
        it("should return time validation correctly when remainingTime < dealCardTime and remainingTime > placingBets", () => {
            // Arrange
            const placeBet = new PlaceBetConsumer();
            placeBet.gameData = {
                blockchain: {
                    currentIndex: 3,
                    burnedCards: 3,
                },
                gameConfigs: {
                    enabled: false,
                },
                roundId: 123,
                remainingTime: 40,
            };
            placeBet.definition = {
                durations: {
                    placingBets: 30,
                    changingDeck: 10,
                    dealCards: 2,
                },
            };

            // Act
            const result = placeBet.composeBettingTimeValidationCriteria(124);

            // Assert
            expect(result[0]).toEqual({ failure: true, notice: { errorCode: "SB1905" } });
            expect(result[1]).toEqual({ failure: true, notice: { errorCode: "SB1935", gameRoundId: 124 } });
            expect(result[2]).toEqual({ failure: true, notice: { errorCode: "SB1906" } });
            expect(result[3]).toEqual({ failure: false, notice: { errorCode: "SB1905" } });
        });

        it("should return time validation correctly when remainingTime > dealCardTime", () => {
            // Arrange
            const placeBet = new PlaceBetConsumer();
            placeBet.gameData = {
                blockchain: {
                    currentIndex: 3,
                    burnedCards: 3,
                },
                gameConfigs: {
                    enabled: false,
                },
                roundId: 123,
                remainingTime: 44,
            };
            placeBet.definition = {
                durations: {
                    placingBets: 30,
                    changingDeck: 10,
                    dealCards: 2,
                },
            };

            // Act
            const result = placeBet.composeBettingTimeValidationCriteria(124);

            // Assert
            expect(result[0]).toEqual({ failure: true, notice: { errorCode: "SB1905" } });
            expect(result[1]).toEqual({ failure: true, notice: { errorCode: "SB1935", gameRoundId: 124 } });
            expect(result[2]).toEqual({ failure: false, notice: { errorCode: "SB1906" } });
            expect(result[3]).toEqual({ failure: true, notice: { errorCode: "SB1905" } });
        });
    });

    describe("when isNewChain false", () => {
        it("should return time validation correctly when remainingTime < dealCardTime", () => {
            // Arrange
            const placeBet = new PlaceBetConsumer();
            placeBet.gameData = {
                blockchain: {
                    currentIndex: 3,
                    burnedCards: 2,
                },
                gameConfigs: {
                    enabled: false,
                },
                roundId: 123,
                remainingTime: 31,
            };
            placeBet.definition = {
                durations: {
                    placingBets: 30,
                    changingDeck: 10,
                    dealCards: 2,
                },
            };

            // Act
            const result = placeBet.composeBettingTimeValidationCriteria(124);

            // Assert
            expect(result[0]).toEqual({ failure: true, notice: { errorCode: "SB1905" } });
            expect(result[1]).toEqual({ failure: true, notice: { errorCode: "SB1935", gameRoundId: 124 } });
            expect(result[2]).toEqual({ failure: true, notice: { errorCode: "SB1906" } });
            expect(result[3]).toEqual({ failure: false, notice: { errorCode: "SB1905" } });
        });

        it("should return time validation correctly when remainingTime > dealCardTime", () => {
            // Arrange
            const placeBet = new PlaceBetConsumer();
            placeBet.gameData = {
                blockchain: {
                    currentIndex: 3,
                    burnedCards: 2,
                },
                gameConfigs: {
                    enabled: false,
                },
                roundId: 123,
                remainingTime: 33,
            };
            placeBet.definition = {
                durations: {
                    placingBets: 30,
                    changingDeck: 10,
                    dealCards: 2,
                },
            };

            // Act
            const result = placeBet.composeBettingTimeValidationCriteria(124);

            // Assert
            expect(result[0]).toEqual({ failure: true, notice: { errorCode: "SB1905" } });
            expect(result[1]).toEqual({ failure: true, notice: { errorCode: "SB1935", gameRoundId: 124 } });
            expect(result[2]).toEqual({ failure: false, notice: { errorCode: "SB1906" } });
            expect(result[3]).toEqual({ failure: true, notice: { errorCode: "SB1905" } });
        });
    });
});
