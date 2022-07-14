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
        };

        // Act
        const result = await ingameConsumer.buildPayload();

        // Assert
        expect(result.blockchain.currentIndex).toEqual(blockchain.currentIndex);
        expect(result.blockchain.chain.length).toEqual(blockchain.chain.length);
    });
});
