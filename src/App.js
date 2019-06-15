import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import contract from 'truffle-contract';
import ScratchLotteryContract from '../build/contracts/ScratchLottery.json';
import loadWeb3 from './loadWeb3';

import { getCellValue, getWinningCellIndexes, getTicketValue } from './helpers';

import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Ticket from './Ticket';
import Summary from './Summary';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blockNumber: 0,
            scratchLottery: null,
            noWeb3: false,
            cellValues: {},
            miningTicket: false,
            miningPrize: false,
            jackpot: null,
            currentBlockNumber: null
        }
        this.purchaseTicket = this.purchaseTicket.bind(this);
        this.redeemTicket = this.redeemTicket.bind(this);
        this.donateToContract = this.donateToContract.bind(this);
        this.donateToOwner = this.donateToOwner.bind(this);
    }

    async donateToContract(amount) {
        const { scratchLottery, account } = this.state;
        await scratchLottery.donateToContract({
            value: web3.utils.toWei(amount),
            from: account
        });
        const jackpot = await scratchLottery.jackpot();
        this.setState({
            jackpot: web3.utils.fromWei(jackpot)
        })
    }

    async donateToOwner(amount) {
        const { scratchLottery, account } = this.state;
        await scratchLottery.donateToOwner({
            value: web3.utils.toWei(amount),
            from: account
        });
        const jackpot = await scratchLottery.jackpot();
        this.setState({
            jackpot: web3.utils.fromWei(jackpot)
        })
    }

    async purchaseTicket() {
        const { scratchLottery, account } = this.state;
        try {
            this.setState({
                miningTicket: true
            })
            await scratchLottery.purchaseTicket({
                from: account,
                value: 5000000000000000
            })
        } catch (e) {
            this.setState({
                miningTicket: false
            })
        }
    }

    async redeemTicket() {
        const { scratchLottery, account, cellValues } = this.state;

        const ticketValue = getTicketValue(cellValues);
        const winningCellIndexes = getWinningCellIndexes(ticketValue, cellValues);
        const gasEstimate = await scratchLottery.methods["redeemWin(uint256,uint256,uint256)"]
        .estimateGas(...winningCellIndexes, {
            from: account
        })
        try {
            this.setState({
                miningPrize: true
            })
            await scratchLottery.redeemWin(...winningCellIndexes, {
                from: account,
                gas: Math.round(gasEstimate * 1.5)
            })
        } catch (e) {
            this.setState({
                miningPrize: false
            })
        }
    }

    async componentDidMount() {
        try {
            const ScratchLottery = contract(ScratchLotteryContract)
            const web3Provider = await loadWeb3();
            ScratchLottery.setProvider(web3Provider)
            const scratchLottery = await ScratchLottery.deployed();
            const [account] = await web3.eth.getAccounts();
            const jackpot = await scratchLottery.jackpot();
            const currentBlockNumber = await web3.eth.getBlockNumber();
            const ticket = await scratchLottery.getTicket({
                from: account
            });

            this.setState({
                scratchLottery,
                ticket,
                account,
                currentBlockNumber,
                jackpot: web3.utils.fromWei(jackpot),
                ticketLoaded: true
            });

            web3.eth.subscribe('newBlockHeaders')
            .on('data', async () => {
                console.log('******NEW BLOCK HEADER ARRIVED*****')
                const { miningPrize, miningTicket, ticket } = this.state;
                const stateUpdates = {};
                const jackpot = await scratchLottery.jackpot();
                stateUpdates.jackpot = web3.utils.fromWei(jackpot);
                stateUpdates.currentBlockNumber = await web3.eth.getBlockNumber();
                const latestTicketInChain = await scratchLottery.getTicket({
                    from: account
                });
                console.log('CURRENTLY MINING TICKET?: ', miningTicket);
                console.log('CURRENTLY MINING PRIZE?: ', miningPrize);
                console.log('LATEST TICKET IN CHAIN', latestTicketInChain.id.toNumber());
                console.log('CURRENT TICKET', ticket.id.toNumber());
                if(miningTicket) {
                    if(latestTicketInChain.id.toNumber() > ticket.id.toNumber()) {
                        if(await web3.eth.getBlock(ticket.redeemableAt.toNumber())) {
                            console.log('resetting miningTicket flag');
                            console.log('updating ticket', latestTicketInChain.id.toNumber());
                            stateUpdates.ticket = latestTicketInChain
                            stateUpdates.miningTicket = false;
                            stateUpdates.cellValues = {};
                        }
                    }
                }
                if(miningPrize) {
                    if(latestTicketInChain.redeemedAt.toNumber()) {
                        console.log('resetting miningPrize flag');
                        console.log('updating ticket', latestTicketInChain.id.toNumber());
                        stateUpdates.ticket = latestTicketInChain
                        stateUpdates.miningPrize = false;
                    }
                }
                this.setState(stateUpdates);
            })
        } catch (e) {
            this.setState({
                noWeb3: true,
                loaded: true,
                ticket: null
            })
        }
    }

    render() {
        const {
            scratchLottery,
            account,
            noWeb3,
            cellValues,
            ticket,
            jackpot,
            ticketLoaded,
            miningPrize,
            miningTicket,
            currentBlockNumber
        } = this.state;
        return (
            <React.Fragment>
                {
                    noWeb3 &&
                    <Alert variant="warning">
                        <Alert.Heading as="h5"><strong>No web3 Detected</strong></Alert.Heading>
                        <hr />
                        <p>
                            We couldn't find the write wiring for your web browser to communicate with the blockchain.
                        </p>
                        <p>
                        <a href="https://metamask.io/">Click here</a> to learn about MetaMask.
                        </p>
                    </Alert>
                }
                {
                    scratchLottery ? (
                        <React.Fragment>
                            <Ticket
                                scratchLottery={scratchLottery}
                                account={account}
                                onCellClick={async (index) => {
                                    const cellValue = await getCellValue(account, ticket, index)
                                    this.setState({
                                        cellValues: {
                                            ...cellValues,
                                            [index]: cellValue
                                        }
                                    })
                                }}
                                cellValues={cellValues}
                                ticket={ticket}
                                ticketLoaded={ticketLoaded}
                                purchaseTicket={this.purchaseTicket}
                            />
                            {ReactDOM.createPortal(
                                <Summary
                                    cellValues={cellValues}
                                    ticket={ticket}
                                    purchaseTicket={this.purchaseTicket}
                                    redeemTicket={this.redeemTicket}
                                    miningTicket={miningTicket}
                                    miningPrize={miningPrize}
                                    jackpot={jackpot}
                                    donateToContract={this.donateToContract}
                                    donateToOwner={this.donateToOwner}
                                    currentBlockNumber={currentBlockNumber}
                                />,
                                document.getElementById('stats')
                            )}
                        </React.Fragment>
                    ) : (
                        <div className="w-100 text-center">
                            <Spinner animation="grow"/>
                        </div>
                    )
                }
            </React.Fragment>
        )
    }
}

export default App;