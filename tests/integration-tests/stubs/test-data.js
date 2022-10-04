import gameSetting from "../game-service-setup/game-settings";

const game = {
    id: gameSetting.id,
    name: gameSetting.name,
};

const currencyData = { code: "USD", name: "$US" };

const socketOptions = {
    socketUri: `http://localhost:5002/user/${gameSetting.name.toLowerCase()}`,
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const adminSocketOptions = {
    socketUri: `http://localhost:5002/admin/${gameSetting.name.toLowerCase()}`,
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const gameConfig = {
    type: 0,
    name: gameSetting.name.toLowerCase(),
    minBet: 1,
    maxBet: 3000,
    maxBetPerChoices: { even: 3000, odd: 3000, red3: 3000, white3: 3000, red4: 1000, white4: 1000, red2: 3000 },
    odds: { player: 2, banker: 1.96, big: 1.54, small: 2.4, tie: 8, playerPair: 11, bankerPair: 11 },
};

const rounds = [
    {
        id: 1190119,
        result: {
            player: { card1: { rank: 0, suit: 0 }, card2: { rank: 0, suit: 0 } },
            banker: { card1: { rank: 0, suit: 0 }, card2: { rank: 0, suit: 0 } },
        },
        settlementResult: {
            player: false,
            banker: true,
            big: true,
            small: false,
            tie: false,
            playerPair: false,
            bankerPair: true,
            natural: false,
        },
    },
    {
        id: 1190118,
        result: {
            player: { card1: { rank: 0, suit: 0 }, card2: { rank: 0, suit: 0 } },
            banker: { card1: { rank: 0, suit: 0 }, card2: { rank: 0, suit: 0 } },
        },
        settlementResult: {
            player: false,
            banker: true,
            big: true,
            small: false,
            tie: false,
            playerPair: false,
            bankerPair: true,
            natural: false,
        },
    },
    {
        id: 1190117,
        result: {
            player: { card1: { rank: 0, suit: 0 }, card2: { rank: 0, suit: 0 } },
            banker: { card1: { rank: 0, suit: 0 }, card2: { rank: 0, suit: 0 } },
        },
        settlementResult: {
            player: false,
            banker: true,
            big: true,
            small: false,
            tie: false,
            playerPair: false,
            bankerPair: true,
            natural: false,
        },
    },
];

const userBetData = (uid) => {
    return [
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            playerId: 1,
            name: "NormalUser",
            odds: gameConfig.odds,
            operatorId: "dummy-partner-id",
            rate: 1,
            siteId: "111",
            paid: true,
            roundId: 1190119,
            banker: 0,
            bankerPair: 0,
            big: 0,
            small: 0,
            player: 0,
            playerPair: 0,
            tie: 1,
            partnerId: "dummy-partner-id",
            paid: true,
        },
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            playerId: 4,
            name: "NormalUser",
            odds: gameConfig.odds,
            operatorId: "dummy-partner-id",
            rate: 1,
            siteId: "111",
            roundId: 1190119,
            paid: true,
            banker: 0,
            bankerPair: 0,
            big: 0,
            small: 0,
            player: 0,
            playerPair: 0,
            tie: 1,
            partnerId: "dummy-partner-id",
            paid: true,
        },
    ];
};

export { game, currencyData, socketOptions, adminSocketOptions, gameConfig, rounds, userBetData };
