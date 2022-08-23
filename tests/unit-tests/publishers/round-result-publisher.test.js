import RoundResultPublisher from "../../../src/publishers/round-result-publisher";
import { generateChain } from "../../../src/helpers/card-chain";
import { decryptChain } from "../../../src/helpers/result-helper";
jest.mock("sc-game-base");

describe("publishRoundResult", () => {
    it("should publish payload with blockchain", () => {
        // Arrange
        const publisher = new RoundResultPublisher();
        const roundResult = {
            x: 12,
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
        publisher.gameData = {
            blockchain: blockchain,
        };
        publisher.publishToAllUsers = jest.fn();
        publisher.publishToAllAdmins = jest.fn();
        const expectPayload = {
            finish: {
                ...roundResult,
                blockchain: decryptChain(blockchain),
            },
        };

        // Act
        publisher.publishRoundResult(roundResult);

        // Assert
        expect(publisher.publishToAllUsers).toHaveBeenCalledWith(expectPayload);
        expect(publisher.publishToAllAdmins).toHaveBeenCalledWith(expectPayload);
    });

    it("should publish payload without blockchain", () => {
        // Arrange
        const publisher = new RoundResultPublisher();
        const roundResult = {
            x: 12,
        };
        const blockchain = null;
        publisher.gameData = {
            blockchain: blockchain,
        };
        publisher.publishToAllUsers = jest.fn();
        publisher.publishToAllAdmins = jest.fn();
        const expectPayload = {
            finish: {
                ...roundResult,
            },
        };

        // Act
        publisher.publishRoundResult(roundResult);

        // Assert
        expect(publisher.publishToAllUsers).toHaveBeenCalledWith(expectPayload);
        expect(publisher.publishToAllAdmins).toHaveBeenCalledWith(expectPayload);
    });
});

describe("publishNewBlockchain", () => {
    it("should publish payload with blockchain", () => {
        // Arrange
        const publisher = new RoundResultPublisher();
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
        publisher.gameData = {
            blockchain: blockchain,
        };
        publisher.publishToAllUsers = jest.fn();
        publisher.publishToAllAdmins = jest.fn();
        const expectPayload = {
            newBlockchain: decryptChain(blockchain),
        };

        // Act
        publisher.publishNewBlockchain();

        // Assert
        expect(publisher.publishToAllUsers).toHaveBeenCalledWith(expectPayload);
        expect(publisher.publishToAllAdmins).toHaveBeenCalledWith(expectPayload);
    });
});
