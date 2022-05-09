import { Core } from "sc-game-base";

export default class GameDefinition extends Core.GameDefinition {
    constructor(
        {
            id = 0,
            name = "",
            durations = {},
            choices = [],
            choicesMapper = {},
            hedgeBetGroups = [],
            numberOfRoundHistory = 100,
            historyPageSize = 8,
            numberOfDecks = 1,
            maxCardsPerRound = 2,
            maxBurnedCards = 1,
            minCutCardIndex = 20,
            maxCutCardIndex = 22,
        },
        generateResult,
        settle
    ) {
        super(
            { id, name, durations, choices, choicesMapper, hedgeBetGroups, numberOfRoundHistory, historyPageSize },
            generateResult,
            settle
        );
        this.numberOfDecks = numberOfDecks;
        this.maxCardsPerRound = maxCardsPerRound;
        this.maxBurnedCards = maxBurnedCards;
        this.minCutCardIndex = minCutCardIndex;
        this.maxCutCardIndex = maxCutCardIndex;
    }
}
