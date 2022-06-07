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
        this.startCron();
    }

    async proceed() {
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.wholeRound + durations.changingDeck) {
            await this.checkGameStatus();
            if (!this.gameData.disabled) {
                await this.roundResultConsumer.generateAndPublishBlockchain();
            }
        }

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        if (this.isStartingTime(this.gameData.remainingTime, durations)) {
            this.resetForNewRound();
            this.bot && (await this.bot.reset());
        }

        if (this.gameData.remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound + durations.changingDeck;

            await this.settleGameRoundConsumer.settleRound(this.gameData);
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
        const { configName, durations } = this.definition;
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
            this.gameData.remainingTime = durations.wholeRound + durations.changingDeck;
            this.gameStatusPublisher.publishDisableGameStatus();

            await this.gameConfigsRepository.updateOne({ name: configName }, { disabledround: this.gameData.roundId });
        } else if (previouslyDisabled) {
            this.gameData.remainingTime = await this.getWholeRoundByChainStatus();
            await this.enableGame();
        } else {
            this.gameData.remainingTime = await this.getWholeRoundByChainStatus();
            this.gameStatusPublisher.publishStartGame();
        }
    }
}
