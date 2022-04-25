import { Core } from "sc-game-base";
import { decryptChainToShow } from "../helpers/result-helper";

export default class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const payload = await super.buildPayload(realPlayer);
        delete payload.resultHash;

        if (this.gameData.blockchain) {
            return {
                ...payload,
                blockchain: decryptChainToShow(this.gameData.blockchain),
            };
        } else {
            return payload;
        }
    }
}
