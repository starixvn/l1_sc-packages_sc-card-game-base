import { getCardValue } from "./card-helper";

export default class BaccaratPlayer {
    constructor() {
        this.card1 = null;
        this.card2 = null;
        this.card3 = null;
    }

    getTotalScore() {
        return [this.card1, this.card2, this.card3].reduce((result, card) => {
            const cardValue = getCardValue(card);

            return (result + cardValue) % 10;
        }, 0);
    }

    getThirdCardValue() {
        return getCardValue(this.card3);
    }

    getNumberOfCards() {
        return [this.card1, this.card2, this.card3].filter((card) => !!card).length;
    }

    hasPair() {
        return this.card1.card === this.card2.card;
    }

    getCards() {
        if (this.card3) {
            return [this.card1, this.card2, this.card3];
        }

        return [this.card1, this.card2];
    }

    setCards(cards) {
        [...Array(3).keys()].forEach((index) => (this[`card${index + 1}`] = null));
        cards.forEach((card, index) => {
            if (card && card.value >= 0) {
                this[`card${index + 1}`] = {
                    value: card.value,
                    type: card.type,
                };
            }
        });
    }
}
