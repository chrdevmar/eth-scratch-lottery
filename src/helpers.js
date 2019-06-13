export const getCellValue = async function(account, ticket, index) {
    console.log('redeemableAt', ticket.redeemableAt.toNumber())
    const redeemableAtBlock = await web3.eth.getBlock(ticket.redeemableAt.toNumber());
    const cellHash = web3.utils.soliditySha3(account, ticket.id.toNumber(), index, redeemableAtBlock.hash);
    const zeroToFiveCount = countZerosInFirst5Bytes(cellHash);

    let cellValue = 0;
    if(zeroToFiveCount > 0) {
        cellValue = 0.005 * (10 ** (zeroToFiveCount - 1));
    }
    console.log('cell value', cellValue);
}

export const simulate = function() {
    const values = {};
    for(let i = 0; i < 10000; i++) {
        const simulatedCardValue = simulateCard(i);
        values[simulatedCardValue] = values[simulatedCardValue] || 0;
        values[simulatedCardValue]++;
    }
    console.log('VALUES', values);
    const probs = {};
    for(let index in values) {
        probs[index] = values[index]/10000;
    }
    console.log('PROBS', probs);
    console.log('REVENUE: ', 10000 * .005);
    let payouts = 0;
    for (let value in values) {
        payouts += Number(value) * values[value];
    }
    console.log('PAYOUTS: ', payouts);
    console.log('PROFIT: ',  (10000 * .005) - payouts)
}

function simulateCard(cardNum) {
    const cells = {};
    for(let i = 0; i < 11; i++) {
        const cellHash = web3.utils.soliditySha3(i, cardNum, new Date().valueOf());
        const zeroToFiveCount = countZerosInFirst5Bytes(cellHash);

        let cellValue = 0;
        if(zeroToFiveCount > 0) {
            cellValue = 0.005 * (10 ** (zeroToFiveCount-1));
        }
        cells[`${cellValue}`] = cells[`${cellValue}`] || 0;
        cells[`${cellValue}`]++;
    }
    let cardValue = 0;
    for (let value in cells) {
        if(Number(value) > 0 && cells[value] >= 3) {
            cardValue = Number(value);
        }
    }
    console.log('CARD VALUE: ', cardValue);
    return cardValue;
}

function countZerosInFirst5Bytes(hash) {
    let count = 0;

    for(let i = 2; i < 12; i += 2) {
        const value = parseInt(`0x${hash.charAt(i)}${hash.charAt(i+1)}`);
        if(value >= 0 && value <= 18) {
            count++;
        }
    }
    return count;
}