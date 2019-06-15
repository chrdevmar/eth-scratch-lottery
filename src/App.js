import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import contract from 'truffle-contract';
import ScratchLotteryContract from '../build/contracts/ScratchLottery.json';
import loadWeb3 from './loadWeb3';

import { getCellValue, getWinningCellIndexes, getTicketValue } from './helpers';

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
            jackpot: null
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
            const ticket = await scratchLottery.getTicket();
            const jackpot = await scratchLottery.jackpot();
            this.setState({
                ticket,
                jackpot: web3.utils.fromWei(jackpot),
                miningTicket: false,
                cellValues: {}
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
            await scratchLottery.redeemWin(
            ...winningCellIndexes,
            {
                from: account,
                gas: Math.round(gasEstimate * 1.5)
            })
            const ticket = await scratchLottery.getTicket()
            const jackpot = await scratchLottery.jackpot();
            this.setState({
                ticket,
                jackpot: web3.utils.fromWei(jackpot),
                miningPrize: false,
            });
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
            const ticket = await scratchLottery.getTicket({
                from: account
            });

            this.setState({
                scratchLottery,
                ticket,
                account,
                jackpot: web3.utils.fromWei(jackpot),
                ticketLoaded: true
            });
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
            miningTicket
        } = this.state;
        return (
            <React.Fragment>
                {
                    noWeb3 &&
                    <span>No Web 3</span>
                }
                {
                    scratchLottery &&
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
                            />,
                            document.getElementById('stats')
                        )}
                    </React.Fragment>
                }
            </React.Fragment>
        )
    }
}

export default App;