import { RoundResultConsumer as BaseRoundResultConsumer } from "../../../../src/consumers";

export default class RoundResultConsumer extends BaseRoundResultConsumer {
    getResultFromAdmin() {
        let cardsFromAdmin = [];
        let cutCardIndexFromAdmin = 0;

        const resultFromAdmin = this.gameData.settlementResultFromAdmin;
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
