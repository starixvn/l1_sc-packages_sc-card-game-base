import { Table } from "sc-game-base";

export default class TableProcessBetQueue extends Table.Crons.TableProcessBetQueue {
    adjustTotalBets(player, bet, rate) {
        super.adjustTotalBets(player, bet, rate);

        const { betChoice } = bet;
        if (this.definition.commonChoices.includes(betChoice)) {
            if (!this.gameData.betUserCount[betChoice]) {
                this.gameData.betUserCount[betChoice] = [];
            }
            this.gameData.betUserCount[betChoice].push(player.UID);
        }
    }
}
