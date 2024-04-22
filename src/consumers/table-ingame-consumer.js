import { Table } from "sc-game-base";
import { calculateBetUserPercentage, decryptChain } from "../helpers/result-helper";

export default class TableInGameConsumer extends Table.EventConsumers.TableInGameConsumer {
    async buildPayload(realPlayer) {
        const payload = await super.buildPayload(realPlayer);
        payload.betPercentage = calculateBetUserPercentage(this.gameData.betUserCount);
        delete payload.resultHash;

        if (this.gameData.blockchain) {
            return {
                ...payload,
                blockchain: decryptChain(this.gameData.blockchain),
            };
        } else {
            return payload;
        }
    }
}
