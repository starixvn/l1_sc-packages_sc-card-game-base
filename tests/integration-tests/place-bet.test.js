import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "./game-service-setup/game-settings";

export const placeBetTest = () => {
    describe("place bet", () => {
        const getTimeOutToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.lockingBet) {
                timeout = durations.wholeRound - durations.placingBets + remainingTime + 1;
            } else if (remainingTime >= durations.placingBets) {
                timeout = remainingTime - durations.placingBets + 1;
            }

            return timeout;
        };

        describe("when place bet in placing bet time", () => {
            it("should return total bet and bet user percentage", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
                client.handleSignedInEvent(() => {
                    client.sendInGameEvent();
                });
                let receivedRemainingTime = false;

                // Act
                client.on(socketOptions.gameName, (inGameData) => {
                    if (inGameData.remainingTime && !receivedRemainingTime) {
                        receivedRemainingTime = true;
                        setTimeout(() => {
                            client.emit(eventTypes.bet, { betChoice: "player", amount: 123 });
                        }, getTimeOutToBet(inGameData.remainingTime, gameSettings.durations) * 1000);
                    }
                });

                // Assert
                client.on(socketOptions.gameName, (data) => {
                    if (data.totalBets && data.totalBets.player === 123) {
                        client.close();
                        done();
                    }
                });
            });

            it("should return bet user percentage", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
                client.handleSignedInEvent(() => {
                    client.sendInGameEvent();
                });
                let receivedRemainingTime = false;

                // Act
                client.on(socketOptions.gameName, (inGameData) => {
                    if (inGameData.remainingTime && !receivedRemainingTime) {
                        receivedRemainingTime = true;
                        setTimeout(() => {
                            client.emit(eventTypes.bet, { betChoice: "player", amount: 123 });
                        }, getTimeOutToBet(inGameData.remainingTime, gameSettings.durations) * 1000);
                    }
                });

                // Assert
                client.on(socketOptions.gameName, (data) => {
                    if (data.betPercentage && data.betPercentage.player === 100) {
                        client.close();
                        done();
                    }
                });
            });
        });
    });
};
