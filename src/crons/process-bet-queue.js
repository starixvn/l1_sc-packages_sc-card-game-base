import { Core } from "sc-game-base";

export default class ProcessBetQueue extends Core.Crons.ProcessBetQueue {
    adjustTotalBets(player, bet, rate) {
        super.adjustTotalBets(player, bet, rate);

        const { betChoice } = bet;
        if (!this.gameData.betUserCount[betChoice]) {
            this.gameData.betUserCount[betChoice] = [];
        }
        this.gameData.betUserCount[betChoice].push(player.UID);
    }
}
