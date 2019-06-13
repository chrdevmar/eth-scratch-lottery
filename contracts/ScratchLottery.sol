pragma solidity >=0.4.21 <0.6.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/** @title Scratch Lottery */
contract ScratchLottery is Ownable {
    // .005 eth = 5000000000000000 wei
    uint public ticketPrice = .005 ether;
    uint public prizeMultiplier = .005 ether;
    uint public ticketCount = 0;
    uint public paidOut = 0 ether;
    uint payoutFloat = .5 ether;

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

    function jackpot () public view returns (uint) {
        if(address(this).balance < payoutFloat) {
            return address(this).balance;
        }
        return payoutFloat;
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

    function countTargetsInFirst5Bytes(bytes32 _hash) internal pure returns(uint8) {
        uint8 count = 0;
        for(uint8 i = 0; i < 5; i++) {
            if(uint8(_hash[i]) >= 0 && uint(_hash[i]) <= 18) {
                count++;
            }
        }
        return count;
    }
    /**
     * given 3 unique cells on a ticket,
     * awards a win if hashes of all 3 cells contain the same number of zeros in their hash
     * prize is .05 ether * number of zeros
     */
    function redeemWin(uint _index1, uint _index2, uint _index3) public {
        Ticket memory ticket = players[msg.sender];
        require(ticket.id != 0, 'You have no ticket');
        require(ticket.redeemableAt <= block.number, 'Ticket not mined yet');
        require(ticket.redeemedAt == 0, 'Ticket already redeemed');
        require(
            _index1 != _index2 && _index2 != _index3 && _index1 != _index3,
            'Must provide 3 unique cells'
        );
        require(
            _index1 < 12 && _index2 < 12 && _index3 < 12,
            'Tickets only contain cells 0 to 11'
        );
        bytes32 nextBlockHash = keccak256(abi.encodePacked((ticket.redeemableAt)));

        require(
            nextBlockHash != 0x0000000000000000000000000000000000000000000000000000000000000000,
            'Ticket is expired'
        );
        // get the number of bytes that are between 0 and 8 (inclusive) in the first 5 bytes of each cell
        bytes32 _hash1 = keccak256(abi.encodePacked(msg.sender,ticket.id,_index1,nextBlockHash));
        uint count1 = countTargetsInFirst5Bytes(_hash1);

        bytes32 _hash2 = keccak256(abi.encodePacked(msg.sender,ticket.id,_index2,nextBlockHash));
        uint8 count2 = countTargetsInFirst5Bytes(_hash2);

        bytes32 _hash3 = keccak256(abi.encodePacked(msg.sender,ticket.id,_index3,nextBlockHash));
        uint8 count3 = countTargetsInFirst5Bytes(_hash3);

        // make sure number of zeros for all claimed cells match
        require(count1 == count2 && count2 == count3, '3 matches required to win');
        // mark the ticket as redeemed
        require(count1 > 0, 'Ticket is not a winner');
        uint payout = prizeMultiplier * (10 ** (count1 - 1));
        if(payout > address(this).balance) {
            payout = address(this).balance;
        }
        players[msg.sender].redeemedAt = block.number;
        msg.sender.transfer(payout);
        paidOut += payout;
        emit TicketRedeemed(msg.sender, ticket.id, payout);
    }
}
