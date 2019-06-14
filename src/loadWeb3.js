import Web3 from 'web3';

async function loadWeb3() {
    let web3Provider;
    if (typeof web3 !== 'undefined') {
        web3Provider = web3.currentProvider
        console.log(web3.currentProvider);
        web3 = new Web3(web3.currentProvider)
    } else {
        throw new Error('web3 not inject, please connect with metamask')
    }
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed]
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    return web3Provider;
}

export default loadWeb3;
