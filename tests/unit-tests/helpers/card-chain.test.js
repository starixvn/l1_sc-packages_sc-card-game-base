import { Helpers } from "../../../src";

describe("blockchain", () => {
    it("test", () => {
        Helpers.CardChain.generateChain(8);
    });
});

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
