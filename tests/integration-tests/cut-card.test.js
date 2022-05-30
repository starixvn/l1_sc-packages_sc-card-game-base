import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { adminSocketOptions, socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const cutCardTest = () => {
    describe("cut card test", () => {
        it("should not change deck when current index < cut card index", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData.gameConfigs && inGameData.blockchain) {
                    admin.emit("message", {
                        [adminSocketOptions.gameName]: {
                            set_result: {
                                result: {
                                    player: [
                                        { value: 5, suit: 0 },
                                        { value: 2, suit: 1 },
                                    ],
                                    banker: [
                                        { value: 3, suit: 2 },
                                        { value: 4, suit: 3 },
                                    ],
                                    cutCardIndex: inGameData.blockchain.currentIndex + 4 + 1,
                                },
                            },
                        },
                    });

                    let finishCount = 0;
                    normalUserClientDriver.handleInGameEvent((data) => {
                        if (data.finish) {
                            finishCount += 1;
                        }

                        if (data.newBlockchain) {
                            expect(finishCount).toBe(2);
                            normalUserClientDriver.close();
                            done();
                        }
                    });
                }
            });
        });

        it("should not change deck when current index = cut card index and previous round remaining card > 0", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData.gameConfigs && inGameData.blockchain) {
                    admin.emit("message", {
                        [adminSocketOptions.gameName]: {
                            set_result: {
                                result: {
                                    player: [
                                        { value: 5, suit: 0 },
                                        { value: 2, suit: 1 },
                                    ],
                                    banker: [
                                        { value: 3, suit: 2 },
                                        { value: 4, suit: 3 },
                                    ],
                                    cutCardIndex: inGameData.blockchain.currentIndex + 4,
                                },
                            },
                        },
                    });

                    let finishCount = 0;
                    normalUserClientDriver.handleInGameEvent((data) => {
                        if (data.finish) {
                            finishCount += 1;
                        }

                        if (data.newBlockchain) {
                            expect(finishCount).toBe(2);
                            normalUserClientDriver.close();
                            done();
                        }
                    });
                }
            });
        });

        it("should change deck when current index = cut card index and previous round remaining card = 0", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData.gameConfigs && inGameData.blockchain) {
                    admin.emit("message", {
                        [adminSocketOptions.gameName]: {
                            set_result: {
                                result: {
                                    player: [
                                        { value: 1, suit: 0 },
                                        { value: 1, suit: 1 },
                                        { value: 3, suit: 2 },
                                    ],
                                    banker: [
                                        { value: 2, suit: 2 },
                                        { value: 1, suit: 3 },
                                        { value: 1, suit: 3 },
                                    ],
                                    cutCardIndex: inGameData.blockchain.currentIndex + 6,
                                },
                            },
                        },
                    });

                    let finishCount = 0;
                    normalUserClientDriver.handleInGameEvent((data) => {
                        if (data.finish) {
                            finishCount += 1;
                        }

                        if (data.newBlockchain) {
                            expect(finishCount).toBe(1);
                            normalUserClientDriver.close();
                            done();
                        }
                    });
                }
            });
        });

        it("should change deck when current index > cut card index", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData.gameConfigs && inGameData.blockchain) {
                    admin.emit("message", {
                        [adminSocketOptions.gameName]: {
                            set_result: {
                                result: {
                                    player: [
                                        { value: 5, suit: 0 },
                                        { value: 2, suit: 1 },
                                    ],
                                    banker: [
                                        { value: 3, suit: 2 },
                                        { value: 4, suit: 3 },
                                    ],
                                    cutCardIndex: inGameData.blockchain.currentIndex + 2,
                                },
                            },
                        },
                    });

                    let finishCount = 0;
                    normalUserClientDriver.handleInGameEvent((data) => {
                        if (data.finish) {
                            finishCount += 1;
                        }

                        if (data.newBlockchain) {
                            expect(finishCount).toBe(1);
                            normalUserClientDriver.close();
                            done();
                        }
                    });
                }
            });
        });
    });
};
