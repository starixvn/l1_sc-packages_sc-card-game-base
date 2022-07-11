import { decryptChain, getCards } from "../../../src/helpers/result-helper";
import { generateChain } from "../../../src/helpers/card-chain";

describe("decryptChain", () => {
    it("should descrypt chain correctly", () => {
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

        // Act
        const result = decryptChain(blockchain);

        // Assert
        expect(result.chain.length).toBe(cardChain.chain.length);
        expect(result.chain[0].rawValue).not.toBe(undefined);
        expect(result.chain[result.chain.length - 1].rawValue).toBe(undefined);
    });
});

describe("getCards", () => {
    it("should get cards correctly", () => {
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

        // Act
        const result = getCards(blockchain, 6);

        // Assert
        expect(result.length).toBe(6);
    });
});
