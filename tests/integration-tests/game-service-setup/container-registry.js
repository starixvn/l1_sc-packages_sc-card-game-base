import awilix from "awilix";
import { Table } from "sc-game-base";

import { bets, rounds, tmpBets, results } from "./models";
import { SettleGameRoundConsumer } from "./consumers";
import AdminSocketRouter from "./routers/admin-socket-router";
import { Crons, Consumers, Publishers, QueryApis } from "../../../src";
import RunningRoundInfoPublisher from "./publishers/running-round-info-publisher";

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
            processBetQueue: asClass(Crons.TableProcessBetQueue).singleton().proxy(),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(Consumers.PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SettleGameRoundConsumer).singleton().proxy(),
            roundResultConsumer: asClass(Consumers.RoundResultConsumer).singleton(),
            inGameConsumer: asClass(Consumers.TableInGameConsumer).singleton(),
            adminMonitorConsumer: asClass(Consumers.AdminMonitorConsumer).singleton(),
        });
    }

    registerPublishers() {
        super.registerPublishers();

        this.container.register({
            roundResultPublisher: asClass(Publishers.RoundResultPublisher).singleton(),
            runningRoundInfoPublisher: asClass(RunningRoundInfoPublisher).singleton(),
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            adminSocketRouter: asClass(AdminSocketRouter).proxy(),
        });
    }

    registerApis() {
        super.registerApis();

        this.container.register({
            roundQuery: asClass(QueryApis.RoundQuery).singleton(),
        });
    }
}
