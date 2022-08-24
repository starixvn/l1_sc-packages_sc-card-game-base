import GameCron from "./game-cron";

export default class TableGameCron extends GameCron {
    async start() {
        await this.bot.resetInRoomTrackings();
        await super.start();
    }
}
