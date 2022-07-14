import AdminMonitorConsumer from "../../../src/consumers/admin-monitor-consumer";
import { generateChain } from "../../../src/helpers/card-chain";
import { decryptChain } from "../../../src/helpers/result-helper";
jest.mock("sc-game-base");

describe("consume", () => {
    it("should publish payload with blockchain", async () => {
        // Arrange
        const adminMonitor = new AdminMonitorConsumer();
        const socketClient = { x: 1 };
        adminMonitor.adminPublisher = {
            publishToAdmin: jest.fn(),
        };
        const lastRound = {
            id: 1,
            result: { x: 1 },
            settlementResult: { y: 2 },
        };
        adminMonitor.roundsRepository = {
            findOne: jest.fn(() => {
                return {
                    lean: jest.fn(() => {
                        return {
                            exec: jest.fn(() => lastRound),
                        };
                    }),
                };
            }),
        };
        const cardChain = generateChain(8, [], 1);
        const blockchain = {
            isAvailable: true,
            currentIndex: 10,
            cutCardIndex: 100,
            burnedCards: 10,
            remainingCards: 0,
            chain: cardChain.chain,
            firstRoundId: 111,
        };
        adminMonitor.gameData = {
            remainingTime: 12,
            currencies: "US",
            exchangeRates: [{ xx: 1 }],
            blockchain: blockchain,
        };
        const expectedPayload = {
            roundId: 2,
            result: { x: 1 },
            settlementResult: { y: 2 },
            remainingTime: 12,
            currencies: "US",
            exchangeRates: [{ xx: 1 }],
            blockchain: decryptChain(blockchain),
        };

        // Act
        await adminMonitor.consume(socketClient);

        // Assert
        expect(adminMonitor.adminPublisher.publishToAdmin).toHaveBeenCalledWith(socketClient, expectedPayload);
    });

    it("should publish payload without blockchain", async () => {
        // Arrange
        const adminMonitor = new AdminMonitorConsumer();
        const socketClient = { x: 1 };
        adminMonitor.adminPublisher = {
            publishToAdmin: jest.fn(),
        };
        const lastRound = {
            id: 1,
            result: { x: 1 },
            settlementResult: { y: 2 },
        };
        adminMonitor.roundsRepository = {
            findOne: jest.fn(() => {
                return {
                    lean: jest.fn(() => {
                        return {
                            exec: jest.fn(() => lastRound),
                        };
                    }),
                };
            }),
        };
        const blockchain = null;
        adminMonitor.gameData = {
            remainingTime: 12,
            currencies: "US",
            exchangeRates: [{ xx: 1 }],
            blockchain: blockchain,
        };
        const expectedPayload = {
            roundId: 2,
            result: { x: 1 },
            settlementResult: { y: 2 },
            remainingTime: 12,
            currencies: "US",
            exchangeRates: [{ xx: 1 }],
        };

        // Act
        await adminMonitor.consume(socketClient);

        // Assert
        expect(adminMonitor.adminPublisher.publishToAdmin).toHaveBeenCalledWith(socketClient, expectedPayload);
    });
});
