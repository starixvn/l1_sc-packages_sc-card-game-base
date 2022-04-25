import awilix from "awilix";
import { Table } from "sc-game-base";

import { GameCron } from "../../../src/crons/game-cron";
import { bets, rounds, tmpBets, results } from "./models";
import { SettleGameRoundConsumer, PlaceBetConsumer } from "./consumers";
import RoundResultConsumer from "../../../src/consumers/round-result-consumer";
import RoundResultPublisher from "../../../src/publishers/round-result-publisher";
import TableInGameConsumer from "../../../src/consumers/table-ingame-consumer";

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
            gameCron: asClass(GameCron).singleton().proxy(),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SettleGameRoundConsumer).singleton().proxy(),
            roundResultConsumer: asClass(RoundResultConsumer).singleton(),
            inGameConsumer: asClass(TableInGameConsumer).singleton(),
        });
    }

    registerPublishers() {
        super.registerPublishers();

        this.container.register({
            roundResultPublisher: asClass(RoundResultPublisher).singleton(),
        });
    }
}
