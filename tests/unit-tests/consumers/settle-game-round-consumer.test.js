import { stub, stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { GameData, GameDefinition } from "sc-game-base/src/core";
import { UserBetResultPublisher } from "sc-game-base/src/core/event-publishers";
import GameManagementApiClientFactory from "sc-game-base/src/core/game-management-api";
import SettleGameRoundConsumer from "../../../src/consumers/settle-game-round-consumer";
import { RoundResultPublisher } from "../../../src/publishers";

const gameManagementApiClientFactory = new GameManagementApiClientFactory({});
const roundResultPublisher = stub(RoundResultPublisher);
const userBetResultPublisher = stub(UserBetResultPublisher);
const definition = stub(GameDefinition);
const gameData = stub(GameData);
const endGame = jest.fn();
const roundsRepository = stubMongoose(mongoose.Model);
const betsRepository = stubMongoose(mongoose.Model);
const resultsRepository = stubMongoose(mongoose.Model);

function initSettleGameRoundConsumer() {
    return new SettleGameRoundConsumer({
        definition,
        gameData,
        roundResultPublisher,
        userBetResultPublisher,
        endGame,
        roundsRepository,
        betsRepository,
        resultsRepository,
        gameManagementApiClientFactory,
    });
}

describe("settleRound", () => {
    it("should create new round and settle bets", async () => {
        // Arrange
        const consumer = initSettleGameRoundConsumer();
        const result = {
            r: 123,
        };
        const settlementResult = {
            s: 124,
        };
        consumer.definition = {
            settle: jest.fn(() => settlementResult),
        };
        consumer.gameData = {
            roundId: 10,
            exchangeRates: {
                exId: 111,
            },
        };
        const newRound = {
            round: 1122,
        };
        consumer.roundsRepository = {
            create: jest.fn(() => newRound),
        };
        consumer.settleBets = jest.fn();
        consumer.generateResult = jest.fn(() => result);

        // Act
        await consumer.settleRound();

        // Assert
        expect(consumer.settleBets).toHaveBeenCalled();
    });
});

describe("generateResult", () => {
    it("should update current index", async () => {
        // Arrange
        const consumer = initSettleGameRoundConsumer();

        const result = { r: 11 };
        const usedCardsCount = 4;
        consumer.definition = {
            generateResult: jest.fn(() => {
                return { result, usedCardsCount };
            }),
            maxCardsPerRound: 6,
        };
        consumer.gameData = {
            blockchain: {
                currentIndex: 10,
            },
        };
        consumer.resultsRepository = {
            update: jest.fn(),
        };

        // Act
        await consumer.generateResult();

        // Assert
        expect(consumer.gameData.blockchain.currentIndex).toBe(14);
    });

    it("should update remaining cards", async () => {
        // Arrange
        const consumer = initSettleGameRoundConsumer();

        const result = { r: 11 };
        const usedCardsCount = 4;
        consumer.definition = {
            generateResult: jest.fn(() => {
                return { result, usedCardsCount };
            }),
            maxCardsPerRound: 6,
        };
        consumer.gameData = {
            blockchain: {
                currentIndex: 10,
            },
        };
        consumer.resultsRepository = {
            update: jest.fn(),
        };

        // Act
        await consumer.generateResult();

        // Assert
        expect(consumer.gameData.blockchain.remainingCards).toBe(2);
    });

    it("should update result", async () => {
        // Arrange
        const consumer = initSettleGameRoundConsumer();

        const result = { r: 11 };
        const usedCardsCount = 4;
        consumer.definition = {
            generateResult: jest.fn(() => {
                return { result, usedCardsCount };
            }),
            maxCardsPerRound: 6,
        };
        consumer.gameData = {
            blockchain: {
                currentIndex: 10,
                _id: 1234,
            },
        };
        consumer.resultsRepository = {
            update: jest.fn(),
        };

        // Act
        await consumer.generateResult();

        // Assert
        expect(consumer.resultsRepository.update).toHaveBeenCalledWith(
            { _id: 1234 },
            {
                $set: {
                    currentIndex: 14,
                    remainingCards: 2,
                },
            }
        );
    });
});
