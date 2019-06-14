import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

function getTicketValue(cellValues) {
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

function getWinningCellIndexes(ticketValue, cellValues) {
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

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jackpot: 0
        }
    }

    async componentDidMount() {
        const { scratchLottery } = this.props;

        try {
            const jackpot = await scratchLottery.jackpot();

            this.setState({
                jackpot: web3.utils.fromWei(jackpot),
                loaded: true
            });
        } catch (e) {
            console.log('ERROR', e)
            this.setState({
                jackpot: 0,
                loaded: true,
            })
        }
    }

    render() {
        const { jackpot } = this.state;
        const { cellValues, scratchLottery, account, ticket } = this.props;
        const numCellsRevealed = Object.keys(cellValues).length;
        const ticketValue = getTicketValue(cellValues);
        return (
            <React.Fragment>
                <Alert variant="info">
                    <strong>Jackpot:</strong> {jackpot} eth
                </Alert>
                <Alert variant="warning">
                    <strong>{numCellsRevealed} / 12 cells revealed</strong>
                </Alert>
                {
                    ticket.redeemedAt && !!ticket.redeemedAt.toNumber() &&
                    <Alert variant="info">
                        <Alert.Heading as="h5"><strong>Ticket redeemed</strong></Alert.Heading>
                        <hr />
                        <p>
                            You have already redeemed this ticket, purchase another ticket to play again.
                        </p>
                        <Button
                            onClick={async () => {
                                const newTicket = await scratchLottery.purchaseTicket({
                                    from: account,
                                    value: 5000000000000000
                                })
                                console.log('NEW TICKET', newTicket);
                            }}
                            variant="success"
                        >
                            Get a new ticket
                        </Button>
                    </Alert>
                }
                {
                    numCellsRevealed === 12 && ticketValue > 0 &&
                    <Alert variant="success">
                        <Alert.Heading as="h5"><strong>Winner!</strong></Alert.Heading>
                        <hr />
                        <p>
                            Congratulations, you can redeem your ticket for {ticketValue} eth.
                        </p>
                        <Button
                            onClick={async () => {
                                const winningCellIndexes = getWinningCellIndexes(ticketValue, cellValues);
                                console.log('WINNING INDEXES', winningCellIndexes)
                                const redeemed = await scratchLottery.redeemWin(
                                ...winningCellIndexes,
                                {
                                    from: account,
                                    gas: 100000
                                })
                                console.log('TICKET REDEEMED', redeemed);
                            }}
                            variant="success"
                        >
                                Redeem {ticketValue} eth
                        </Button>
                    </Alert>
                }
                {
                    numCellsRevealed === 12 && ticketValue === 0 &&
                    <Alert variant="danger">
                        <Alert.Heading as="h5">Loser!</Alert.Heading>
                        <hr />
                        <p>
                            You didn't win anything, purchase another ticket to play again.
                        </p>
                        <Button
                            onClick={async () => {
                                const newTicket = await scratchLottery.purchaseTicket({
                                    from: account,
                                    value: 5000000000000000
                                })
                                console.log('NEW TICKET', newTicket);
                            }}
                            variant="success"
                        >
                                Get a new ticket
                        </Button>
                    </Alert>
                }
            </React.Fragment>
        )
    }
}

export default Stats;