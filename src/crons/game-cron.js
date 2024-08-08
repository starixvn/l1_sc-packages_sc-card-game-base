import { Core } from "sc-game-base";

export default class GameCron extends Core.Crons.BaseGameCron {
    resetForNewRound() {
        super.resetForNewRound();

        this.gameData.chips = {};
        this.gameData.winningPlayers = {};
        this.gameData.betUserCount = {};
    }

    async start() {
        await this.roundIdConsumer.initRoundId();
        await this.getSettingForNewRound();
        await this.updateExchangeRates();

        await this.initBlockchain();
        await this.unsettledRoundConsumer.proceed();
        await this.initNewRound();
        this.startCron();
    }

    async initNewRound() {
        this.gameData.isNewRound = true;
        this.gameData.remainingTime = await this.getWholeRoundByChainStatus();
    }

    async initBlockchain() {
        if (this.resultsRepository) {
            this.gameData.blockchain = await this.resultsRepository
                .findOne({ isAvailable: true }, null, { sort: { time: -1 } })
                .lean()
                .exec();
        }
    }

    async proceed() {
        const { durations } = this.definition;

        if (this.gameData.isNewRound) {
            await this.checkGameStatus();

            if (!this.gameData.disabled) {
                this.gameData.isNewRound = false;
            }
        }

        if (!this.gameData.disabled && this.gameData.remainingTime === durations.placingBets + durations.changingDeck + 5) {
            await this.resetForNewRoundWhenChangingShoe();

            const isHavingSufficientChain = await this.generateAndPublishBlockchain();
            if (isHavingSufficientChain) {
                this.gameData.remainingTime--;
            }
        } else if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        if (this.isStartingTime(this.gameData.remainingTime, durations)) {
            this.resetForNewRound();
            await this.bot?.reset();
            this.appConfigs.enabledBoostedOdds && (await this.updatePromotionOddsAndNotify());
        }

        const remainingTime = this.gameData.remainingTime;
        if (remainingTime === durations.placingBets) {
            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (remainingTime === durations.lockingBet - 1) {
            this.gameStatusPublisher.publishEndPlacingBetStatus();
        }

        if (this.gameData.remainingTime < 0) {
            const result = await this.settleGameRoundConsumer.generateResult();
            await this.initNewRound();
            await this.settleGameRoundConsumer.settleRound(result);
        } else if (this.gameData.remainingTime < durations.placingBets) {
            await this.bot?.run();
            this.runningRoundInfoPublisher.publish();
        }
    }

    async resetForNewRoundWhenChangingShoe() {
        const { isSufficient } = await this.roundResultConsumer.checkSufficientChain();
        if (!isSufficient) {
            // for changing shoe round, we reset data at the moment of changing shoe instead of doing reset at starting time like normal round
            // isSufficient = false: meaning changing shoe
            this.resetForNewRound();
        }
    }

    async generateAndPublishBlockchain() {
        if (!this.isGeneratingResult) {
            try {
                this.isGeneratingResult = true;
                await this.roundResultConsumer.generateAndPublishBlockchain();
            } catch (e) {
                this.logService.logError(e);
            } finally {
                this.isGeneratingResult = false;
            }

            const { isSufficient } = await this.roundResultConsumer.checkSufficientChain();
            return isSufficient;
        } else {
            return false;
        }
    }

    async getWholeRoundByChainStatus() {
        const { durations } = this.definition;
        const { isSufficient } = await this.roundResultConsumer.checkSufficientChain();
        return isSufficient ? durations.wholeRound : durations.wholeRound + durations.changingDeck;
    }

    async handleGameStatus(previouslyDisabled) {
        super.handleGameStatus(previouslyDisabled);
        if (this.gameData.disabled) {
            this.initNewRound();
        }
    }
}
