import { shuffle } from "../../../src/helpers/shuffle-helper";

describe("shuffle-helper", () => {
    it("shuffle1 should work", () => {
        // Arrange
        const arr = [1, 2, 3, 4, 5, 6];

        // Act
        const result = shuffle["1"](arr);

        // Assert
        expect(result.length).toBe(arr.length);
    });

    it("shuffle2 should work", () => {
        // Arrange
        const arr = [1, 2, 3, 4, 5, 6];

        // Act
        const result = shuffle["2"](arr);

        // Assert
        expect(result.length).toBe(arr.length);
    });

    it("shuffle3 should work", () => {
        // Arrange
        const arr = [1, 2, 3, 4, 5, 6];

        // Act
        const result = shuffle["3"](arr);

        // Assert
        expect(result.length).toBe(arr.length);
    });
});
