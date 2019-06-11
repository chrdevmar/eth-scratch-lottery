import ReactDOM from 'react-dom';
import React from 'react';
import Web3 from 'web3';

const web3 = new Web3(
    Web3.givenProvider || new web3.providers.HttpProvider('http://127.0.0.1:7545'),
    null,
    {}
);

async function test() {
    const blockNumber = await web3.eth.getBlock();

    ReactDOM.render(
        <h1>Current block number: {`${blockNumber.number}`}</h1>,
        document.getElementById('app')
    );
}

test()