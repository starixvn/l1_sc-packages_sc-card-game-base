import awilix from "awilix";
import { Table } from "sc-game-base";

import { bets, rounds, tmpBets, results } from "./models";
import { SettleGameRoundConsumer, PlaceBetConsumer, RoundResultConsumer } from "./consumers";
import AdminSocketRouter from "./routers/admin-socket-router";
import { Crons, Consumers, Publishers } from "../../../src";

const { asClass, asValue } = awilix;

export default class ContainerRegistry extends Table.TableContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(rounds),
            betsRepository: asValue(bets),
            tempBetsRepository: asValue(tmpBets),
            resultsRepository: asValue(results),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            gameCron: asClass(Crons.GameCron).singleton().proxy(),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SettleGameRoundConsumer).singleton().proxy(),
            roundResultConsumer: asClass(RoundResultConsumer).singleton(),
            inGameConsumer: asClass(Consumers.TableInGameConsumer).singleton(),
        });
    }

    registerPublishers() {
        super.registerPublishers();

        this.container.register({
            roundResultPublisher: asClass(Publishers.RoundResultPublisher).singleton(),
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            adminSocketRouter: asClass(AdminSocketRouter).proxy(),
        });
    }
}
