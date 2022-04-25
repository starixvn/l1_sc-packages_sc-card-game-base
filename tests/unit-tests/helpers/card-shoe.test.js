import { generateCardShoe } from "../../../src/helpers/card-shoe";

describe("generateCardShoe", () => {
    it("should generate card shoe with correct total card", () => {
        // Arrange
        const count = 8;

        // Act
        const result = generateCardShoe(count);

        // Assert
        expect(result.length).toBe(52 * count);
    });
});
