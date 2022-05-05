const deck = [...Array(13).keys()].reduce((result, currentValue) => {
    result.push({ value: currentValue, suit: 0 });
    result.push({ value: currentValue, suit: 1 });
    result.push({ value: currentValue, suit: 2 });
    result.push({ value: currentValue, suit: 3 });

    return result;
}, []);
const name = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suit = ["♥", "♦", "♣", "♠"];

export { deck, name, suit };
