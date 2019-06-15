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
            isMiningTicket: localStorage.getItem('isMiningTicket') === 'true',
            isMiningPrize: localStorage.getItem('isMiningPrize') === 'true',
            jackpot: null,
            currentBlockNumber: null
        }
        this.purchaseTicket = this.purchaseTicket.bind(this);
        this.redeemTicket = this.redeemTicket.bind(this);
        this.donateToContract = this.donateToContract.bind(this);
        this.donateToOwner = this.donateToOwner.bind(this);
        this.hideMiningStatus = this.hideMiningStatus.bind(this);
    }

    hideMiningStatus(type) {
        this.setState({ [type]: false});
        localStorage.setItem(type, false);
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
            localStorage.setItem('isMiningTicket', true)
            this.setState({
                isMiningTicket: true
            })
            await scratchLottery.purchaseTicket({
                from: account,
                value: 5000000000000000
            })
        } catch (e) {
            localStorage.setItem('isMiningTicket', false)
            this.setState({
                isMiningTicket: false
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
            localStorage.setItem('isMiningPrize', true);
            this.setState({
                isMiningPrize: true
            })
            await scratchLottery.redeemWin(...winningCellIndexes, {
                from: account,
                gas: Math.round(gasEstimate * 1.5)
            })
        } catch (e) {
            localStorage.setItem('isMiningPrize', false);
            this.setState({
                isMiningPrize: false
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
                const { isMiningPrize, isMiningTicket, ticket } = this.state;
                const stateUpdates = {};
                const jackpot = await scratchLottery.jackpot();
                stateUpdates.jackpot = web3.utils.fromWei(jackpot);
                stateUpdates.currentBlockNumber = await web3.eth.getBlockNumber();
                const latestTicketInChain = await scratchLottery.getTicket({
                    from: account
                });
                if(isMiningTicket) {
                    if(latestTicketInChain.id.toNumber() > ticket.id.toNumber()) {
                        const syncedNextBlock = await web3.eth.getBlock(latestTicketInChain.redeemableAt.toNumber())
                        if(!syncedNextBlock) {

                            // node should catch up in 5 seconds
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                        stateUpdates.ticket = latestTicketInChain;
                        localStorage.setItem('isMiningTicket', false);
                        stateUpdates.isMiningTicket = false;
                        stateUpdates.cellValues = {};
                    }
                }
                if(isMiningPrize) {
                    if(latestTicketInChain.redeemedAt.toNumber()) {
                        stateUpdates.ticket = latestTicketInChain;
                        localStorage.setItem('isMiningPrize', false);
                        stateUpdates.isMiningPrize = false;
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
            isMiningPrize,
            isMiningTicket,
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
                                    isMiningTicket={isMiningTicket}
                                    isMiningPrize={isMiningPrize}
                                    jackpot={jackpot}
                                    donateToContract={this.donateToContract}
                                    donateToOwner={this.donateToOwner}
                                    currentBlockNumber={currentBlockNumber}
                                    hideMiningStatus={this.hideMiningStatus}
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