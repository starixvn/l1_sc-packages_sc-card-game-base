import { Core } from "sc-game-base";

export default class GameCron extends Core.Crons.BaseGameCron {
    resetForNewRound() {
        super.resetForNewRound();

        this.gameData.chips = {};
        this.gameData.winningPlayers = {};
    }

    async start() {
        await this.initRoundId();
        await this.getSettingForNewRound();
        await this.updateExchangeRates();
        await this.initBlockchain();
        await this.initNewRound();
        this.startCron();
    }

    async initNewRound() {
        this.gameData.isNewRound = true;
        this.gameData.remainingTime = await this.getWholeRoundByChainStatus();
    }

    async initBlockchain() {
        if (this.resultsRepository) {
            this.gameData.blockchain = await this.resultsRepository.findOne({ isAvailable: true }).lean().exec();
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

        if (!this.gameData.disabled && this.gameData.remainingTime === durations.placingBets + durations.changingDeck + 4) {
            await this.roundResultConsumer.generateAndPublishBlockchain();
        }

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        if (this.isStartingTime(this.gameData.remainingTime, durations)) {
            this.resetForNewRound();
            this.bot && (await this.bot.reset());
        }

        if (this.gameData.remainingTime < 0) {
            const result = await this.settleGameRoundConsumer.generateResult();
            await this.initNewRound();
            await this.settleGameRoundConsumer.settleRound(result);
        } else if (this.gameData.remainingTime < durations.placingBets) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }
    }

    async getWholeRoundByChainStatus() {
        const { durations } = this.definition;
        const { isSufficient } = await this.roundResultConsumer.checkSufficientChain();
        return isSufficient ? durations.wholeRound : durations.wholeRound + durations.changingDeck;
    }

    async checkGameStatus() {
        const { configName } = this.definition;
        const configs = await this.gameConfigsRepository.findOne({ name: configName }).lean().exec();
        const previouslyDisabled = this.gameData.disabled;
        const configuredlyDisabled = !configs || !configs.enabled;

        if (previouslyDisabled) {
            if (this.gameData.delayStartTime > 0) {
                this.gameData.delayStartTime--;
            } else if (!configuredlyDisabled) {
                this.gameData.delayStartTime = configs?.delayStartTime ?? 0;
            }
        }

        this.gameData.umMessages =
            (await this.notificationRepository.findOne({ gameName: configName, displayKind: 2 }, "messages").lean().exec())?.messages ?? {};

        this.gameData.gameConfigs = configs ?? {};
        this.gameData.disabled = configuredlyDisabled || this.gameData.delayStartTime > 0;
        await this.getSettingForNewRound();

        if (this.gameData.gameConfigs.exchangeReload) {
            await this.updateExchangeRates();
            await this.gameConfigsRepository.updateOne({ name: configName }, { exchangeReload: false });
            this.gameData.gameConfigs.exchangeReload = false;
        }

        if (this.gameData.disabled) {
            await this.initNewRound();
            this.gameStatusPublisher.publishDisableGameStatus();

            await this.gameConfigsRepository.updateOne({ name: configName }, { disabledround: this.gameData.roundId });
        } else if (previouslyDisabled) {
            await this.enableGame();
        } else {
            this.gameStatusPublisher.publishStartGame();
        }
    }
}
