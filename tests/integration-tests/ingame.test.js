import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const ingameTest = () => {
    describe("when user joins game", () => {
        it("should return blockchain data", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData.gameConfigs && inGameData.blockchain) {
                    inGameData.roundHistory.forEach((round) => {
                        expect(round.roundId).toBeGreaterThanOrEqual(inGameData.blockchain.firstRoundId);
                    });

                    normalUserClientDriver.close();
                    done();
                }
            });
        });
    });
};
