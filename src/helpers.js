export const getCellValue = async function(account, ticket, index) {
    const redeemableAtBlock = await web3.eth.getBlock(ticket.redeemableAt.toNumber());
    const nextHashAsBytes = chunkHexString(redeemableAtBlock.hash);
    const bytesArgs = nextHashAsBytes.map(byte => ({t: 'bytes', v: byte}));

    const cellHash = web3.utils.soliditySha3(account, ticket.id.toNumber(), index, ...bytesArgs);
    const targetCount = countTargetsInFirstFiveBytes(cellHash);

    let cellValue = 0;
    if(targetCount > 0) {
        cellValue = 0.005 * (10 ** (targetCount - 1));
    }
    return cellValue;
}

function chunkHexString(hexStr) {
    const bytes = [];
    for(let i = 0; i < hexStr.length; i += 2) {
        bytes.push(hexStr.substr(i, 2))
    }
    return bytes;
}

export const simulate = function() {
    const values = {};
    let numSimulations = 500000
    for(let i = 0; i < numSimulations; i++) {
        const simulatedCardValue = simulateCard(i);
        values[simulatedCardValue] = values[simulatedCardValue] || 0;
        values[simulatedCardValue]++;
    }
    console.log('VALUES', values);
    const probs = {};
    for(let index in values) {
        probs[index] = values[index]/numSimulations;
    }
    console.log('PROBS', probs);
    console.log('REVENUE: ', numSimulations * .005);
    let payouts = 0;
    for (let value in values) {
        payouts += Number(value) * values[value];
    }
    console.log('PAYOUTS: ', payouts);
    console.log('PROFIT: ',  (numSimulations * .005) - payouts)
}

function simulateCard(cardNum) {
    const cells = {};
    for(let i = 0; i < 11; i++) {
        const cellHash = web3.utils.soliditySha3(i, cardNum, new Date().valueOf());
        const targetCount = countTargetsInFirstFiveBytes(cellHash);

        let cellValue = 0;
        if(targetCount > 0) {
            cellValue = 0.005 * (10 ** (targetCount-1));
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

function countTargetsInFirstFiveBytes(hash) {
    let count = 0;

    for(let i = 2; i < 12; i += 2) {
        const value = parseInt(`0x${hash.charAt(i)}${hash.charAt(i+1)}`);
        if(value >= 0 && value <= 12) {
            count++;
        }
    }
    return count;
}

export const getTicketValue = function(cellValues) {
    let valueCounts = {};
    Object.values(cellValues).forEach(cellValue => {
        valueCounts[cellValue] = valueCounts[cellValue] || 0;
        valueCounts[cellValue]++;
    });

    let ticketValue = 0;
    for(let value in valueCounts) {
        if(valueCounts[value] >= 3 && Number(value) > ticketValue) {
            ticketValue = Number(value);
        }
    }
    return ticketValue;
}

export const getWinningCellIndexes = function (ticketValue, cellValues) {
    const winningCellIndexes = [];
    for(let cellIndex in cellValues) {
        if(winningCellIndexes.length === 3) {
            continue;
        }
        if(Number(cellValues[cellIndex]) === ticketValue) {
            winningCellIndexes.push(Number(cellIndex))
        }
    }
    return winningCellIndexes;
}