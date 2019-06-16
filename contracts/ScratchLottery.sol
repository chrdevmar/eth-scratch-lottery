pragma solidity >=0.4.21 <0.6.0;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/** @title Scratch Lottery */
contract ScratchLottery is Ownable {
    uint public minTicketPrice = .00001 ether;
    uint public ticketCount = 0;
    /** amount withdrawable by contract owner */
    uint public donationsToOwner = 0 ether;

    struct Ticket {
        uint id; //ticket number, unique to player (address)
        uint blockNumber; // block number at time of buying ticket
        uint redeemableAt; // block height when user can redeem ticket
        uint redeemedAt; // timestamp of when user redeemed ticket
        uint price; // ticket price as specified by player
    }

    mapping(address => Ticket) public players;

    event TicketPurchased(address player, uint id);
    event DonationReceived();
    event TicketRedeemed(address player, uint id, uint value);

    function() external payable { }

    function balance () public view returns (uint) {
        return address(this).balance;
    }

    /**
        Accepts donations and increments the amount withdrawable
        by contract owner
    */
    function donateToOwner() public payable {
        donationsToOwner += msg.value;
        emit DonationReceived();
    }

    function donateToContract() public payable {
        emit DonationReceived();
    }

    /**
        Withdraws all funds that contrat owner is allowed to access.
        Players must specifically choose to donate to owner to give them access.
    */
    function withdrawDonationsToOwner() public payable onlyOwner {
        require(donationsToOwner > 0, 'No donations for owner to withdraw');
        uint amountToWithdraw = donationsToOwner;
        donationsToOwner = 0;
        address(uint160(owner())).transfer(amountToWithdraw);
    }

    function purchaseTicket() public payable {
        // require payment to run

        require(msg.value >= minTicketPrice, 'Minimum ticket price is 0.00001 ether');

        ticketCount++;

        players[msg.sender] = Ticket({
            id: ticketCount,
            blockNumber: block.number,
            redeemableAt: block.number + 1,
            redeemedAt: 0,
            price: msg.value
        });

        emit TicketPurchased(msg.sender, ticketCount);
    }

    function getTicket() public view returns (
        uint id,
        uint blockNumber,
        uint redeemableAt,
        uint redeemedAt,
        uint price
    ) {
        Ticket memory ticket = players[msg.sender];
        return (ticket.id, ticket.blockNumber, ticket.redeemableAt, ticket.redeemedAt, ticket.price);
    }

    /**
        @dev counts the number of values between 0 and 18 in the first 5 digits of a 32 byte hex hash
    */
    function countTargetsInFirst5Bytes(bytes32 _hash) internal pure returns(uint8) {
        uint8 count = 0;
        for(uint8 i = 0; i < 5; i++) {
            if(uint8(_hash[i]) >= 0 && uint8(_hash[i]) <= 18) {
                count++;
            }
        }
        return count;
    }

    /**
     * given 3 unique cells on a ticket,
     * awards a win if hashes of all 3 cells contain the same number of zeros in their hash
     * prize is <ticket.price> ^ number of targets
     */
    function redeemWin(uint _index1, uint _index2, uint _index3) public {
        require(
            _index1 != _index2 && _index2 != _index3 && _index1 != _index3,
            'Must provide 3 unique cells'
        );
        require(
            _index1 < 12 && _index2 < 12 && _index3 < 12,
            'Tickets only contain cells 0 to 11'
        );
        Ticket memory ticket = players[msg.sender];
        require(ticket.id > 0, 'You have no ticket');
        require(ticket.redeemableAt <= block.number, 'Ticket not mined yet');
        require(ticket.redeemedAt == 0, 'Ticket already redeemed');
        bytes32 nextBlockHash = blockhash(ticket.redeemableAt);

        require(
            nextBlockHash != 0x0000000000000000000000000000000000000000000000000000000000000000,
            'Ticket is expired'
        );
        // get the number of bytes that are between 0 and 18 (inclusive) in the first 5 bytes of each cell
        bytes32 _hash1 = keccak256(abi.encodePacked(msg.sender,ticket.id,_index1,nextBlockHash));
        uint count1 = countTargetsInFirst5Bytes(_hash1);

        bytes32 _hash2 = keccak256(abi.encodePacked(msg.sender,ticket.id,_index2,nextBlockHash));
        uint count2 = countTargetsInFirst5Bytes(_hash2);

        bytes32 _hash3 = keccak256(abi.encodePacked(msg.sender,ticket.id,_index3,nextBlockHash));
        uint count3 = countTargetsInFirst5Bytes(_hash3);

        // make sure number of zeros for all claimed cells match
        require(count1 == count2 && count2 == count3, '3 matches required to win');
        // mark the ticket as redeemed
        require(count1 > 0, 'Ticket is not a winner');
        uint payout = ticket.price * (10 ** (count1 - 1));
        if(payout > address(this).balance) {
            payout = address(this).balance;
        }
        players[msg.sender].redeemedAt = block.number;
        msg.sender.transfer(payout);
        emit TicketRedeemed(msg.sender, ticket.id, payout);
    }
}
