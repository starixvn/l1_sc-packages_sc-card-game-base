import constants from "../constants";
import { Consumers } from "../../../../src";

export default class SettleGameRoundConsumer extends Consumers.TableSettleGameRoundConsumer {
    calculateBetResult(settlementResult, bet, odds) {
        const { choices } = this.definition;

        const betResult = Object.entries(settlementResult)
            .filter(([choice, win]) => choices.includes(choice))
            .reduce(
                (result, [choice, win]) => {
                    if (choice === constants.choiceNames.tie && win) {
                        const playerBet = bet[constants.choiceNames.player] ?? 0;
                        const bankerBet = bet[constants.choiceNames.banker] ?? 0;
                        const refund = playerBet + bankerBet;

                        result.totalWin += refund;
                    }

                    const betAmount = bet[choice];
                    const originalOdds = odds[choice] || 1;
                    const winAmount = win ? betAmount * originalOdds : 0;

                    result.totalBetAmount += betAmount;
                    result.totalWin += winAmount;
                    result.winningByChoices[choice] = winAmount;

                    if (winAmount > 0) {
                        result.netWin += winAmount - betAmount;
                    } else {
                        result.totalLost += betAmount;
                    }

                    return result;
                },
                {
                    totalBetAmount: 0,
                    totalWin: 0,
                    netWin: 0,
                    totalLost: 0,
                    winningByChoices: {},
                }
            );

        betResult.totalWin = parseFloat(betResult.totalWin.toFixed(2));
        betResult.netWin = parseFloat(betResult.netWin.toFixed(2));

        return betResult;
    }
}
