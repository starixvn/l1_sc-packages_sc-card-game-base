import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const settleTest = () => {
    describe("when settle", () => {
        it("should return settled finish data and updated blockchain", (done) => {
            // Arrange & Act
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
            client.handleSignedInEvent(() => {
                client.sendInGameEvent();
            });

            // Assert
            client.on(socketOptions.gameName, (data) => {
                if (data.finish && data.blockchain) {
                    client.close();
                    done();
                }
            });
        });
    });
};
