import React, { Component } from 'react';
import Navbar from 'react-bootstrap/Navbar';

import contract from 'truffle-contract';
import ScratchLotteryContract from '../build/contracts/ScratchLottery.json';
import loadWeb3 from './loadWeb3';

import Ticket from './Ticket';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blockNumber: 0,
            scratchLottery: null
        }
    }

    async componentDidMount() {
        const web3Provider = await loadWeb3();
        const ScratchLottery = contract(ScratchLotteryContract)
        ScratchLottery.setProvider(web3Provider)
        const scratchLottery = await ScratchLottery.deployed();
        const [account] = await web3.eth.getAccounts();
        this.setState({
            scratchLottery,
            account
        })
    }

    render() {
        const { scratchLottery, account } = this.state;
        return (
            <React.Fragment>
                <Navbar bg="dark" variant="dark" className="mb-5">
                    <Navbar.Brand>Ethereum Scratch Lottery ({account})</Navbar.Brand>
                </Navbar>
                {
                    scratchLottery &&
                    <Ticket
                        scratchLottery={scratchLottery}
                        account={account}
                    />
                }
            </React.Fragment>
        )
    }
}

export default App;