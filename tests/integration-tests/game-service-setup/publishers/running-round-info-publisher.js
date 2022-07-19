import BaseRunningRoundInfoPublisher from "../../../../src/publishers/running-round-info-publisher";

export default class RunningRoundInfoPublisher extends BaseRunningRoundInfoPublisher {
    getBetUserCount() {
        const betUserCount = this.gameData.betUserCount;
        return {
            player: betUserCount["player"] || [],
            banker: betUserCount["banker"] || [],
            tie: betUserCount["tie"] || [],
        };
    }
}
