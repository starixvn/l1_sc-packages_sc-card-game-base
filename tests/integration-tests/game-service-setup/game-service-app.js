import { Core, Table } from "sc-game-base";
import { initAPIStub } from "sc-game-service-integration-utils";

import appConfigs from "./app-configs.IGT";
import constants from "./constants";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult, generateRawResultForHash } from "./helpers/result-helper";
import ContainerRegistry from "./container-registry";
import GameDefinition from "../../../src/game-definition";

export const run = async () => {
    initAPIStub(appConfigs.apiSettings.apiUrl);
    const definition = new GameDefinition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
