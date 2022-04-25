import BaccaratGame from "./baccarat-game";
import * as BaseCard from "./card";
import { getCardValue } from "./card-helper";
import { shuffle } from "./shuffle-helper";

const getCards = (randomMode = 1) => {
    let cards = [...BaseCard.card];
    cards = shuffle[randomMode](cards);
    return cards;
};

const generateResult = (mode) => {
    const selectedMode = mode >= 1 && mode <= 3 ? mode : 1;
    const cards = getCards(selectedMode);
    const baccaratGame = new BaccaratGame([...cards]);
    let action = "";

    do {
        action = baccaratGame.getAction();
        baccaratGame[action]();
    } while (action !== BaccaratGame.Actions.finalComparison);

    return { result: { player: baccaratGame.player, banker: baccaratGame.banker, cards: cards.slice(0, 6) }, usedCardsCount: 4 };
};

const settlementRuleEntries = Object.entries({
    player: ({ player, banker }) => {
        const playerScore = getTotalScore(player);
        const bankerScore = getTotalScore(banker);
        return playerScore > bankerScore;
    },
    banker: ({ player, banker }) => {
        const playerScore = getTotalScore(player);
        const bankerScore = getTotalScore(banker);
        return playerScore < bankerScore;
    },
    tie: ({ player, banker }) => {
        const playerScore = getTotalScore(player);
        const bankerScore = getTotalScore(banker);
        return playerScore === bankerScore;
    },
    big: ({ player, banker }) => {
        const numberOfCards = getNumberOfCards(player) + getNumberOfCards(banker);
        return numberOfCards > 4;
    },
    small: ({ player, banker }) => {
        const numberOfCards = getNumberOfCards(player) + getNumberOfCards(banker);
        return numberOfCards === 4;
    },
    playerPair: ({ player, banker }) => hasPair(player),
    bankerPair: ({ player, banker }) => hasPair(banker),
    natural: ({ player, banker }) => {
        const numberOfCards = getNumberOfCards(player) + getNumberOfCards(banker);
        return numberOfCards === 4 && (getTotalScore(player) >= 8 || getTotalScore(banker) >= 8);
    },
});

const getTotalScore = (handResult) => {
    return Object.values(handResult).reduce((result, card) => {
        const cardValue = getCardValue(card);

        return (result + cardValue) % 10;
    }, 0);
};

const getNumberOfCards = (handResult) => {
    return Object.values(handResult).filter((card) => !!card).length;
};

const hasPair = (handResult) => {
    const { card1, card2 } = handResult;

    return card1.card === card2.card;
};

const getSettlementResult = (roundResult) => {
    return settlementRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(roundResult);

        return result;
    }, {});
};

const generateRawResultForHash = ({ cards }) => {
    let rawResult = "{";
    rawResult += cards.map((card) => `${BaseCard.name[card.card]}${BaseCard.type[card.type]}`).join(" ") + "}";
    return rawResult;
};

export { getCards, generateResult, getSettlementResult, generateRawResultForHash };
