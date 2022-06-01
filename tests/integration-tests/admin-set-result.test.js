import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { adminSocketOptions, socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const adminSetResultTest = () => {
    describe("admin set result", () => {
        it("should set player cards, banker cards correctly", (done) => {
            // Arrange
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            admin.emit("message", {
                [adminSocketOptions.gameName]: {
                    set_result: {
                        result: {
                            cards: [
                                { rank: 11, suit: 0 },
                                { rank: 2, suit: 1 },
                                { rank: 3, suit: 2 },
                                { rank: 4, suit: 3 },
                            ],
                            cutCardIndex: 15,
                        },
                    },
                },
            });

            // Assert
            client.on(adminSocketOptions.gameName, (data) => {
                if (data.finish && data.finish.blockchain) {
                    const rawValues = [];
                    for (let i = 0; i < data.finish.blockchain.currentIndex; i++) {
                        rawValues.push(data.finish.blockchain.chain[i].rawValue);
                    }

                    const containsCard1 = rawValues.length >= 4 && rawValues[0].includes("Q♥_");
                    const containsCard2 = rawValues.length >= 4 && rawValues[1].includes("3♦_");
                    const containsCard3 = rawValues.length >= 4 && rawValues[2].includes("4♣_");
                    const containsCard4 = rawValues.length >= 4 && rawValues[3].includes("5♠_");

                    if (
                        containsCard1 &&
                        containsCard2 &&
                        containsCard3 &&
                        containsCard4 &&
                        data.finish.blockchain.cutCardIndex === 15 &&
                        data.finish.blockchain.burnedCards === 11
                    ) {
                        client.close();
                        admin.close();
                        done();
                    }
                }
            });
        });
    });
};
