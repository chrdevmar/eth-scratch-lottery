export const getCellPower = async function(account, ticket, index) {
    const redeemableAtBlock = await web3.eth.getBlock(ticket.redeemableAt.toNumber());
    const nextHashAsBytes = chunkHexString(redeemableAtBlock.hash);
    const bytesArgs = nextHashAsBytes.map(byte => ({t: 'bytes', v: byte}));

    const cellHash = web3.utils.soliditySha3(account, ticket.id.toNumber(), index, ...bytesArgs);
    return countTargetsInFirstFiveBytes(cellHash);
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
    let numSimulations = 10000
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
            cellValue = 0.005 * (10 ** (targetCount - 1));
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
        if(value >= 0 && value <= 18) {
            count++;
        }
    }
    return count;
}

export const getTicketPower = function(cellPowers) {
    let powerCounts = {};
    Object.values(cellPowers).forEach(cellPower => {
        powerCounts[cellPower] = powerCounts[cellPower] || 0;
        powerCounts[cellPower]++;
    });

    let ticketPower = 0;
    for(let power in powerCounts) {
        if(powerCounts[power] >= 3 && power > ticketPower) {
            ticketPower = power;
        }
    }
    return Number(ticketPower);
}

export const getTicketJackpot = async function(ticket, scratchLottery) {
    const maxTicketJackpot = web3.utils.fromWei(ticket.price) * 10000;
    const contractBalance = web3.utils.fromWei(await scratchLottery.balance());
    if(contractBalance < maxTicketJackpot) {
        return contractBalance;
    }
    return maxTicketJackpot;
}

export const getTicketValue = function(ticket, ticketPower) {
    let ticketValue = 0;
    if(ticketPower > 0) {
        ticketValue = web3.utils.fromWei(ticket.price) * (10 ** (ticketPower - 1));
    }
    return ticketValue;
}

export const getWinningCellIndexes = function (ticketPower, cellPowers) {
    const winningCellIndexes = [];
    for(let cellIndex in cellPowers) {
        console.log('inspecting cell index', cellIndex, typeof ticketPower)
        if(winningCellIndexes.length === 3) {
            continue;
        }
        console.log('cell power', cellPowers[cellIndex])
        if(cellPowers[cellIndex] === ticketPower) {
            winningCellIndexes.push(Number(cellIndex))
        }
    }
    console.log(ticketPower, cellPowers, winningCellIndexes);
    return winningCellIndexes;
}