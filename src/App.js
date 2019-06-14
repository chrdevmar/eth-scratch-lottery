import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import contract from 'truffle-contract';
import ScratchLotteryContract from '../build/contracts/ScratchLottery.json';
import loadWeb3 from './loadWeb3';

import { getCellValue } from './helpers';

import Ticket from './Ticket';
import Stats from './Stats';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blockNumber: 0,
            scratchLottery: null,
            noWeb3: false,
            cellValues: {},
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

            this.setState({
                scratchLottery,
                ticket,
                account,
                ticketLoaded: true
            })
        } catch (e) {
            console.log('ERROR', e)
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
            ticketLoaded
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
                        />
                        {ReactDOM.createPortal(
                            <Stats
                                scratchLottery={scratchLottery}
                                cellValues={cellValues}
                                account={account}
                                ticket={ticket}
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