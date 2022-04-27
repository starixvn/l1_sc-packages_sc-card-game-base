import { generateChain, generateCards } from "../../../src/helpers/card-chain";

describe("blockchain", () => {
    it("test", () => {
        generateChain(8);
    });
});

describe("generateCardShoe", () => {
    it("should generate card shoe with correct total card", () => {
        // Arrange
        const count = 8;

        // Act
        const result = generateCards(count);

        // Assert
        expect(result.length).toBe(52 * count);
    });
});
