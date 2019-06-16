import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import contract from 'truffle-contract';
import ScratchLotteryContract from '../build/contracts/ScratchLottery.json';
import loadWeb3 from './loadWeb3';

import {
    getCellPower,
    getWinningCellIndexes,
    getTicketValue,
    getTicketJackpot,
    getTicketPower
} from './helpers';

import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Ticket from './Ticket';
import Summary from './Summary';
import AppInfo from './AppInfo';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blockNumber: 0,
            scratchLottery: null,
            noWeb3: false,
            cellPowers: {},
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
        const { ticket, scratchLottery, account } = this.state;
        await scratchLottery.donateToContract({
            value: web3.utils.toWei(amount),
            from: account
        });
        const jackpot = await getTicketJackpot(ticket, scratchLottery);
        this.setState({
            jackpot
        })
    }

    async donateToOwner(amount) {
        const { ticket, scratchLottery, account } = this.state;
        await scratchLottery.donateToOwner({
            value: web3.utils.toWei(amount),
            from: account
        });
        const jackpot = await getTicketJackpot(ticket, scratchLottery);
        this.setState({
            jackpot
        })
    }

    async purchaseTicket(price) {
        const { scratchLottery, account } = this.state;
        try {
            localStorage.setItem('isMiningTicket', true)
            this.setState({
                isMiningTicket: true
            })
            await scratchLottery.purchaseTicket({
                from: account,
                value: price * web3.utils.toWei('1')
            })
        } catch (e) {
            localStorage.setItem('isMiningTicket', false)
            this.setState({
                isMiningTicket: false
            })
        }
    }

    async redeemTicket() {
        const { scratchLottery, account, cellPowers, ticket } = this.state;

        const ticketPower = getTicketPower(cellPowers)
        const winningCellIndexes = getWinningCellIndexes(ticketPower, cellPowers);
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
            const ticket = await scratchLottery.getTicket({
                from: account
            });
            const jackpot = await getTicketJackpot(ticket, scratchLottery);
            const currentBlockNumber = await web3.eth.getBlockNumber();
            let etherscanLink = `etherscan.io/address/${scratchLottery.address}`
            const networkName = await web3.eth.net.getNetworkType();
            switch(networkName) {
                case 'ropsten':
                    etherscanLink = `https://ropsten.${etherscanLink}`;
                    break;
                default:
                    etherscanLink = `https://${etherscanLink}`;
                    break;
            }


            this.setState({
                scratchLottery,
                ticket,
                account,
                currentBlockNumber,
                etherscanLink,
                jackpot,
                ticketLoaded: true
            });

            web3.eth.subscribe('newBlockHeaders')
            .on('data', async () => {
                const { isMiningPrize, isMiningTicket, ticket, scratchLottery } = this.state;
                const stateUpdates = {};
                stateUpdates.jackpot = await getTicketJackpot(ticket, scratchLottery);
                stateUpdates.currentBlockNumber = await web3.eth.getBlockNumber();
                const latestTicketInChain = await scratchLottery.getTicket({
                    from: account
                });
                if(isMiningTicket) {
                    if(latestTicketInChain.id.toNumber() > ticket.id.toNumber()) {
                        const syncedNextBlock = await web3.eth.getBlock(latestTicketInChain.redeemableAt.toNumber())
                        if(!syncedNextBlock && networkName !== 'private') {
                            // node should catch up in 5 seconds
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                        stateUpdates.ticket = latestTicketInChain;
                        localStorage.setItem('isMiningTicket', false);
                        stateUpdates.isMiningTicket = false;
                        stateUpdates.cellPowers = {};
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
            cellPowers,
            ticket,
            jackpot,
            ticketLoaded,
            isMiningPrize,
            isMiningTicket,
            currentBlockNumber,
            etherscanLink
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
                            You need to use a browser wallet that provides access to web3.
                        </p>
                        <p>
                        <a href="https://metamask.io/">Click here</a> to learn about MetaMask, the most common browser wallet.
                        </p>
                    </Alert>
                }
                {
                    scratchLottery ? (
                        <React.Fragment>
                            {ReactDOM.createPortal(
                                <AppInfo
                                    donateToContract={this.donateToContract}
                                    donateToOwner={this.donateToOwner}
                                    etherscanLink={etherscanLink}
                                />,
                                document.getElementById('appinfo')
                            )}
                            <Ticket
                                scratchLottery={scratchLottery}
                                account={account}
                                onCellClick={async (index) => {
                                    const cellPower = await getCellPower(account, ticket, index)
                                    this.setState({
                                        cellPowers: {
                                            ...cellPowers,
                                            [index]: cellPower
                                        }
                                    })
                                }}
                                cellPowers={cellPowers}
                                ticket={ticket}
                                ticketLoaded={ticketLoaded}
                                purchaseTicket={this.purchaseTicket}
                                jackpot={jackpot}
                            />
                            {ReactDOM.createPortal(
                                <Summary
                                    cellPowers={cellPowers}
                                    ticket={ticket}
                                    purchaseTicket={this.purchaseTicket}
                                    redeemTicket={this.redeemTicket}
                                    isMiningTicket={isMiningTicket}
                                    isMiningPrize={isMiningPrize}
                                    currentBlockNumber={currentBlockNumber}
                                    hideMiningStatus={this.hideMiningStatus}
                                />,
                                document.getElementById('summary')
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