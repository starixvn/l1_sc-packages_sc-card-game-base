import { Core, Table } from "sc-game-base";
import { initAPIStub, stubUserService } from "sc-game-service-integration-utils";

import appConfigs from "./app-configs.IGT";
import constants from "./constants";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult } from "./helpers/result-helper";
import ContainerRegistry from "./container-registry";
import { GameDefinition, TableGameData } from "../../../src";

export const run = async () => {
    initAPIStub(appConfigs.apiSettings.apiUrl);
    stubUserService(appConfigs);

    const definition = new GameDefinition(gameSettings, generateResult, getSettlementResult);
    const gameData = new TableGameData(gameSettings.durations.wholeRound + gameSettings.durations.changingDeck, constants.resetTotalBets);
    const container = new ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("Baccarat", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
