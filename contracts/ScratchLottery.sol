pragma solidity >=0.4.21 <0.6.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/** @title Scratch Lottery */
contract ScratchLottery is Ownable {
    // .001 eth = 1000000000000000 wei
    uint public ticketPrice = .005 ether;
    // .1 eth = 100000000000000000 wei
    uint public prizeMultiplier = .005 ether;
    uint public ticketCount = 0;
    uint float = .5 ether;

    struct Ticket {
        uint id; //ticket number, unique to player (address)
        uint blockNumber; // block number at time of buying ticket
        uint redeemableAt; // block height when user can redeem ticket
        uint redeemedAt; // timestamp of when user redeemed ticket
    }

    mapping(address => Ticket) public players;

    event TicketPurchased(address player, uint id);
    event TicketRedeemed(address player, uint id, uint value);

    function() external payable { }

    function balance () public view returns (uint) {
        return address(this).balance;
    }

    function withdraw(uint amount) public payable onlyOwner returns(bool) {
        uint payout = amount;
        if(amount > address(this).balance) {
            payout = address(this).balance;
        }
        address(uint160(owner())).transfer(payout - float);
        return true;
    }

    function purchaseTicket() public payable {
        // require payment to run
        require(msg.value >= ticketPrice, 'Tickets cost 0.005 eth');

        ticketCount++;

        players[msg.sender] = Ticket({
            id: ticketCount,
            blockNumber: block.number,
            redeemableAt: block.number + 1,
            redeemedAt: 0
        });

        // return any overpayment to the sender
        msg.sender.transfer(msg.value - ticketPrice);
        emit TicketPurchased(msg.sender, ticketCount);
    }

    function getTicket() public view returns (
        uint id,
        uint blockNumber,
        uint redeemableAt,
        uint redeemedAt
    ) {
        Ticket memory ticket = players[msg.sender];
        return (ticket.id, ticket.blockNumber, ticket.redeemableAt, ticket.redeemedAt);
    }

    function countZerosInFirst5Bytes(bytes32 _hash) internal pure returns(uint8) {
        uint8 numZeros = 0;
        for(uint8 i = 0; i < 5; i++) {
            if(uint8(_hash[i]) == 0) {
                numZeros++;
            }
        }
        return numZeros;
    }
    /**
     * given 3 unique cells on a ticket,
     * awards a win if hashes of all 3 cells contain the same number of zeros in their hash
     * prize is .05 ether * number of zeros
     */
    function redeemWin(uint _match1, uint _match2, uint _match3) public {
        Ticket memory ticket = players[msg.sender];
        require(ticket.id != 0, 'You have no ticket');
        require(ticket.redeemableAt <= block.number, 'Ticket not mined yet');
        require(ticket.redeemedAt == 0, 'Ticket already redeemed');
        require(
            _match1 != _match2 && _match2 != _match3 && _match1 != _match3,
            'Must provide 3 unique cells'
        );
        require(
            _match1 < 12 && _match2 < 12 && _match3 < 12,
            'Tickets only contain cells 0 to 11'
        );
        bytes32 nextBlockHash = keccak256(abi.encodePacked((ticket.redeemableAt)));

        require(
            nextBlockHash != 0x0000000000000000000000000000000000000000000000000000000000000000,
            'Ticket is expired'
        );
        // get the number of zeros in the first 10 bytes of each claimed cell
        bytes32 _hash1 = keccak256(abi.encodePacked(msg.sender,ticket.id,_match1,nextBlockHash));
        uint zeros1 = countZerosInFirst5Bytes(_hash1);

        bytes32 _hash2 = keccak256(abi.encodePacked(msg.sender,ticket.id,_match2,nextBlockHash));
        uint8 zeros2 = countZerosInFirst5Bytes(_hash2);

        bytes32 _hash3 = keccak256(abi.encodePacked(msg.sender,ticket.id,_match3,nextBlockHash));
        uint8 zeros3 = countZerosInFirst5Bytes(_hash3);

        // make sure number of zeros for all claimed cells match
        require(zeros1 == zeros2 && zeros2 == zeros3, '3 matches required to win');
        // mark the ticket as redeemed
        require(zeros1 > 0, 'Ticket is not a winner');
        players[msg.sender].redeemedAt = block.number;
        uint payout = prizeMultiplier * (10 ** zeros1);
        if(payout > address(this).balance) {
            payout = address(this).balance;
        }
        msg.sender.transfer(payout);
        emit TicketRedeemed(msg.sender, ticket.id, payout);
    }
}
