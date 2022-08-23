import { randomString } from "../../../src/helpers/crypto-helper";

describe("randomString", () => {
    it("should generate random string", () => {
        // Arrange & Act
        const result1 = randomString();
        const result2 = randomString();

        // Assert
        expect(result1.length).toBe(result2.length);
        expect(result1).not.toEqual(result2);
    });
});
