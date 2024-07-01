import RunningRoundInfoPublisher from "../../../src/publishers/running-round-info-publisher";
jest.mock("sc-game-base");

describe("publish", () => {
    describe("when having user bet", () => {
        it("should publish bet user percentage", () => {
            // Arrange
            const publisher = new RunningRoundInfoPublisher();
            publisher.gameData = {
                betUserCount: {
                    player: [5, 5, 1],
                    banker: [1, 2, 3, 4],
                },
            };
            publisher.publishToAllUsers = jest.fn();

            // Act
            publisher.publish();

            // Assert
            expect(publisher.publishToAllUsers).toHaveBeenCalledWith({ betPercentage: { player: 33, banker: 67 } });
        });
    });

    describe("when not having user bet", () => {
        it("should publish empty bet user percentage", () => {
            // Arrange
            const publisher = new RunningRoundInfoPublisher();
            publisher.gameData = {
                betUserCount: {},
            };
            publisher.publishToAllUsers = jest.fn();

            // Act
            publisher.publish();

            // Assert
            expect(publisher.publishToAllUsers).toHaveBeenCalledWith({ betPercentage: {} });
        });
    });
});
