import { Core } from "sc-game-base";
import { decryptCards, hashAndEncryptCards } from "../helpers/card-chain";
import { deck } from "../helpers/card-data";

export class AdminSocketRouter extends Core.Routers.BaseAdminSocketRouter {
    constructor({
        definition,
        gameData,
        adminAuthenticationConsumer,
        adminMonitorConsumer,
        adminDisconnectConsumer,
        logService,
        appConfigs,
        resultsRepository,
        roundResultPublisher,
    }) {
        super({
            definition,
            gameData,
            adminAuthenticationConsumer,
            adminMonitorConsumer,
            adminDisconnectConsumer,
            logService,
            appConfigs,
        });

        this.resultsRepository = resultsRepository;
        this.roundResultPublisher = roundResultPublisher;
    }

    async handleMessage(payload) {
        try {
            if (payload.authentication) {
                this.adminAuthenticationConsumer.consume(this.socketClient, payload.authentication.jwt);
            }

            if (payload[this.definition.name] && payload[this.definition.name].get_new && this.verify()) {
                await this.adminMonitorConsumer.consume(this.socketClient);
            }

            if (
                this.appConfigs.sentry.env !== "PROD" &&
                payload[this.definition.name] &&
                payload[this.definition.name].set_result &&
                this.verify()
            ) {
                const { set_result } = payload[this.definition.name];

                const settlementResultFromAdmin = {
                    roundId: set_result.roundId,
                    result: set_result.result,
                };

                const isResultUpdated = await this.setResultFromAdmin(settlementResultFromAdmin);
                if (isResultUpdated) {
                    this.roundResultPublisher.publishUpdatedBlockchain();
                }
            }
        } catch (err) {
            this.logService.logError(err);
        }
    }

    async setResultFromAdmin(settlementResultFromAdmin) {
        try {
            const blockchain = this.gameData.blockchain;
            let { cardsFromAdmin, cutCardIndexFromAdmin } = this.getResultFromAdmin(settlementResultFromAdmin);

            if (blockchain && (cardsFromAdmin.length > 0 || cutCardIndexFromAdmin)) {
                cardsFromAdmin = cardsFromAdmin.filter((card) => deck.find((c) => c.value === card.value && c.suit === card.suit));
                const cards = decryptCards(blockchain.chain);
                for (let i = 0; i < cardsFromAdmin.length; i++) {
                    cards[blockchain.currentIndex + i] = {
                        value: cardsFromAdmin[i].value,
                        suit: cardsFromAdmin[i].suit,
                    };
                }
                blockchain.chain = hashAndEncryptCards(cards);
                blockchain.cutCardIndex = cutCardIndexFromAdmin ? cutCardIndexFromAdmin : blockchain.cutCardIndex;
                await this.resultsRepository.update(
                    { _id: blockchain._id },
                    { $set: { chain: blockchain.chain, cutCardIndex: blockchain.cutCardIndex } }
                );

                return true;
            }
        } catch (e) {
            this.logService.logError(`error in setResultFromAdmin ${JSON.stringify(settlementResultFromAdmin)}`);
        }

        return false;
    }

    getResultFromAdmin(resultFromAdmin) {
        let cardsFromAdmin = [];
        let cutCardIndexFromAdmin = 0;

        if (resultFromAdmin && resultFromAdmin.result && resultFromAdmin.result.player && resultFromAdmin.result.banker) {
            const { player, banker } = resultFromAdmin.result;
            cardsFromAdmin = [player[0], banker[0], player[1], banker[1]];
            if (player.length === 3) {
                cardsFromAdmin.push(player[2]);
            }
            if (banker.length === 3) {
                cardsFromAdmin.push(banker[2]);
            }
            cutCardIndexFromAdmin = resultFromAdmin.result.cutCardIndex;
        }

        if (resultFromAdmin && resultFromAdmin.result && resultFromAdmin.result.cutCardIndex) {
            cutCardIndexFromAdmin = resultFromAdmin.result.cutCardIndex;
        }

        return { cardsFromAdmin, cutCardIndexFromAdmin };
    }
}
