import { Helpers } from "../../../src";

describe("generateCardShoe", () => {
    it("should generate card shoe with correct total card", () => {
        // Arrange
        const count = 8;

        // Act
        const result = Helpers.CardChain.generateCards(count);

        // Assert
        expect(result.length).toBe(52 * count);
    });
});

describe("update cards", () => {
    it("should update cards correctly", () => {
        // Arrange
        const count = 8;
        const cards = Helpers.CardChain.generateCards(count);
        const presetCards = [
            { rank: 1, suit: 0 },
            { rank: 2, suit: 0 },
        ];

        // Act
        const result = Helpers.CardChain.updateCards(cards, presetCards);

        // Assert
        expect(result.length).toBe(52 * count);
        expect(result[0]).toEqual({ rank: 1, suit: 0 });
        expect(result[1]).toEqual({ rank: 2, suit: 0 });
    });
});

describe("generateChain", () => {
    it("should generate chain as expected", () => {
        // Arrange
        const numOfDecks = 8,
            presetCards = [],
            randomMode = 1;

        // Act
        const result = Helpers.CardChain.generateChain(numOfDecks, presetCards, randomMode);

        // Assert
        expect(result.chain.length).toBe(numOfDecks * 52);
    });
});
