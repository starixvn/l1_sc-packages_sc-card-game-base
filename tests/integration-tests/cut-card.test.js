import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { adminSocketOptions, socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const cutCardTest = () => {
    describe("cut card test", () => {
        it("should not change deck when current index < cut card index", (done) => {
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
            let finishCount = 0;
            let newChainFromAdmin = false;
            client.handleInGameEvent((data) => {
                if (data.finish) {
                    finishCount += 1;
                }

                if (data.newBlockchain) {
                    if (newChainFromAdmin) {
                        expect(finishCount).toBe(3);
                        client.close();
                        admin.close();
                        done();
                    }

                    newChainFromAdmin = true;
                }
            });
        });

        it("should not change deck when current index = cut card index and previous round remaining card > 0", (done) => {
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
                            cutCardIndex: 8,
                        },
                    },
                },
            });

            // Assert
            let finishCount = 0;
            let newChainFromAdmin = false;
            client.handleInGameEvent((data) => {
                if (data.finish) {
                    finishCount += 1;
                }

                if (data.newBlockchain) {
                    if (newChainFromAdmin) {
                        expect(finishCount).toBe(3);
                        client.close();
                        admin.close();
                        done();
                    }

                    newChainFromAdmin = true;
                }
            });
        });

        it("should change deck when current index = cut card index and previous round remaining card = 0", (done) => {
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
                                { rank: 1, suit: 0 },
                                { rank: 2, suit: 2 },
                                { rank: 1, suit: 1 },
                                { rank: 1, suit: 3 },
                                { rank: 3, suit: 2 },
                                { rank: 1, suit: 3 },
                            ],
                            cutCardIndex: 10,
                        },
                    },
                },
            });

            // Assert
            let finishCount = 0;
            let newChainFromAdmin = false;
            client.handleInGameEvent((data) => {
                if (data.finish) {
                    finishCount += 1;
                }

                if (data.newBlockchain) {
                    if (newChainFromAdmin) {
                        expect(finishCount).toBe(2);
                        client.close();
                        admin.close();
                        done();
                    }

                    newChainFromAdmin = true;
                }
            });
        });

        it("should change deck when current index > cut card index", (done) => {
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
                            cutCardIndex: 7,
                        },
                    },
                },
            });

            // Assert
            let finishCount = 0;
            let newChainFromAdmin = false;
            client.handleInGameEvent((data) => {
                if (data.finish) {
                    finishCount += 1;
                }

                if (data.newBlockchain) {
                    if (newChainFromAdmin) {
                        expect(finishCount).toBe(2);
                        client.close();
                        admin.close();
                        done();
                    }

                    newChainFromAdmin = true;
                }
            });
        });
    });
};
