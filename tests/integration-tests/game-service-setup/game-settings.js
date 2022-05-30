export default {
    id: 10,
    name: "Baccarat",
    durations: {
        wholeRound: 5,
        placingBets: 4,
        lockingBet: 2,
        dealCards: 1,
        changingDeck: 1,
    },
    choices: ["player", "banker", "big", "small", "tie", "playerPair", "bankerPair"],
    choicesMapper: { player: 1, banker: 2, big: 3, small: 4, tie: 5, playerPair: 6, bankerPair: 7 },
    hedgeBetGroups: [
        ["player", "banker"],
        ["big", "small"],
    ],
    numberOfRoundHistory: 102,
    numberOfDecks: 2,
    maxCardsPerRound: 6,
    minCutCardIndex: 50,
    maxCutCardIndex: 52,
};
