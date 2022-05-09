import { Core } from "sc-game-base";
import { decryptChain } from "../helpers/result-helper";

export default class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const payload = await super.buildPayload(realPlayer);
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
