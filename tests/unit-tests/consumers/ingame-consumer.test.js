jest.mock("sc-game-base", () => {
    return {
        Core: {
            BaseEventConsumers: {
                InGameConsumer: class Abc {
                    async buildPayload() {
                        return { x: 123 };
                    }
                },
            },
        },
    };
});

import InGameConsumer from "../../../src/consumers/ingame-consumer";
import { generateChain } from "../../../src/helpers/card-chain";

describe("buildPayload", () => {
    it("should build payload with blockchain", async () => {
        // Arrange
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
        const ingameConsumer = new InGameConsumer();
        ingameConsumer.gameData = {
            blockchain: blockchain,
            betUserCount: {
                player: [5, 5, 1],
                banker: [1, 2, 3, 4],
            },
        };

        // Act
        const result = await ingameConsumer.buildPayload();

        // Assert
        expect(result.blockchain.currentIndex).toEqual(blockchain.currentIndex);
        expect(result.blockchain.chain.length).toEqual(blockchain.chain.length);
    });

    it("should build payload without blockchain", async () => {
        // Arrange
        const blockchain = null;
        const ingameConsumer = new InGameConsumer();
        ingameConsumer.gameData = {
            blockchain: blockchain,
        };
        ingameConsumer.gameData = {
            blockchain: blockchain,
            betUserCount: {
                player: [5, 5, 1],
                banker: [1, 2, 3, 4],
            },
        };

        // Act
        const result = await ingameConsumer.buildPayload();

        // Assert
        expect(result.blockchain).toBe(undefined);
    });
});
