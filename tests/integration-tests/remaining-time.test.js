import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { adminSocketOptions, socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "./game-service-setup/game-settings";

export const remainingTimeTest = () => {
    describe("remaining time test", () => {
        it("should return whole round time and changing deck round time correctly", (done) => {
            // Arrange
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            admin.emit("message", {
                [adminSocketOptions.gameName]: {
                    set_result: {
                        result: {
                            cards: [
                                { rank: 2, suit: 0 },
                                { rank: 2, suit: 1 },
                                { rank: 2, suit: 2 },
                                { rank: 3, suit: 0 },
                                { rank: 11, suit: 0 },
                                { rank: 2, suit: 1 },
                                { rank: 3, suit: 2 },
                                { rank: 4, suit: 3 },
                            ],
                            cutCardIndex: 9,
                        },
                    },
                },
            });

            // Assert
            let newChainFromAdmin = false;
            let normalRoundTime = false;
            let changingDeckRoundTime = false;
            client.handleInGameEvent((data) => {
                if (data.newBlockchain) {
                    newChainFromAdmin = true;
                }

                if (newChainFromAdmin) {
                    if (data.remainingTime === gameSettings.durations.wholeRound) {
                        normalRoundTime = true;
                    }

                    if (normalRoundTime && data.remainingTime === gameSettings.durations.wholeRound + gameSettings.durations.changingDeck) {
                        changingDeckRoundTime = true;
                    }

                    // after setting result from admin
                    // we have 2 rounds, one normal round before a changingDeck round
                    if (normalRoundTime && changingDeckRoundTime) {
                        client.close();
                        admin.close();
                        done();
                    }
                }
            });
        });
    });
};
