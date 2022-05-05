import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { adminSocketOptions, socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const adminSetResultTest = () => {
    describe("signin", () => {
        it("should receive signed in response", (done) => {
            // Arrange
            const admin = new GameClientDriver(adminSocketOptions, initUserSession(normalUser));
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            admin.emit("message", {
                [adminSocketOptions.gameName]: {
                    set_result: {
                        result: {
                            player: [
                                { card: 1, type: 0 },
                                { card: 2, type: 1 },
                            ],
                            banker: [
                                { card: 3, type: 2 },
                                { card: 4, type: 3 },
                            ],
                        },
                    },
                },
            });

            // Assert
            client.on(adminSocketOptions.gameName, (data) => {
                if (data.blockchain) {
                    const rawValues = [];
                    for (let i = 0; i < data.blockchain.currentIndex; i++) {
                        rawValues.push(data.blockchain.chain[i].rawValue);
                    }

                    const containsCard1 = rawValues.length >= 4 && rawValues[rawValues.length - 4].includes("1♥_");
                    const containsCard2 = rawValues.length >= 4 && rawValues[rawValues.length - 3].includes("3♣_");
                    const containsCard3 = rawValues.length >= 4 && rawValues[rawValues.length - 2].includes("2♦_");
                    const containsCard4 = rawValues.length >= 4 && rawValues[rawValues.length - 1].includes("4♠_");

                    if (containsCard1 && containsCard2 && containsCard3 && containsCard4) {
                        client.close();
                        admin.close();
                        done();
                    }
                }
            });
        });
    });
};
