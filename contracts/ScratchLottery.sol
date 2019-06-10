pragma solidity >=0.4.21 <0.6.0;

/** @title Scratch Lottery */
contract ScratchLottery {
    uint public ticketPrice;
    uint public prizeMultiplier;

    struct Ticket {
        uint id; //ticket number, unique to player (address)
        uint blockNumber; // block number at time of buying ticket
        uint redeemableAt; // block height when user can redeem ticket
        uint redeemedAt; // timestamp of when user redeemed ticket
    }

    struct Player {
        address playerAddress; //ethereum address of player
        uint ticketCount; //number of tickets created to date
        mapping(uint => Ticket) tickets;
    }

    mapping(address => Player) public players;

    event TicketPurchased(address player, uint id);
    event TicketRedeemed(address player, uint id, uint value);

    constructor() public {
        // .001 eth = 1000000000000000 wei
        ticketPrice = .001 ether;
        // .1 eth = 100000000000000000 wei
        prizeMultiplier = .05 ether;
    }

    function purchaseTicket() public payable {
        // require payment to run
        require(msg.value >= ticketPrice, 'Tickets cost 0.001 eth');

        // create the player if they dont exist
        // they dont exist unless they have at least one ticket
        if(players[msg.sender].ticketCount == 0) {
            players[msg.sender] = Player({
                playerAddress: msg.sender,
                ticketCount: 0
            });
        }
        players[msg.sender].ticketCount ++;
        uint ticketCount = players[msg.sender].ticketCount;
        players[msg.sender].tickets[players[msg.sender].ticketCount] = Ticket({
            id: ticketCount,
            blockNumber: block.number,
            redeemableAt: block.number + 1,
            redeemedAt: 0
        });
        // return any overpayment to the sender
        msg.sender.transfer(msg.value - ticketPrice);
        emit TicketPurchased(msg.sender, ticketCount);
    }

    function getTicketCount() public view returns (uint){
        return players[msg.sender].ticketCount;
    }

    function getTicket(uint ticketId) public view returns (
        uint id,
        uint blockNumber,
        uint redeemableAt,
        uint redeemedAt
    ) {
        Ticket memory ticket = players[msg.sender].tickets[ticketId];
        return (ticket.id, ticket.blockNumber, ticket.redeemableAt, ticket.redeemedAt);
    }

    function countZerosInFirst10Bytes(bytes32 _hash) public pure returns(uint8) {
        uint8 numZeros = 0;
        for(uint8 i = 0; i < 10; i++) {
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
    function redeemWin(uint ticketId, uint _match1, uint _match2, uint _match3) public {
        Ticket memory ticket = players[msg.sender].tickets[ticketId];
        require(ticket.redeemableAt <= block.number, 'Ticket not mined yet');
        require(ticket.redeemedAt == 0, 'Ticket already redeemed');
        require(
            _match1 != _match2 && _match2 != _match3 && _match1 != _match3,
            'Must provide 3 unique cells'
        );
        require(
            _match1 <= 12 && _match2 <= 12 && _match3 <= 12,
            'Tickets only contain cells 1 to 12'
        );
        bytes32 nextBlockHash = blockhash(ticket.redeemableAt);

        // get the number of zeros in the first 10 bytes of each claimed cell
        bytes32 _hash1 = keccak256(abi.encodePacked(msg.sender,ticketId,_match1,nextBlockHash));
        uint8 zeros1 = countZerosInFirst10Bytes(_hash1);

        bytes32 _hash2 = keccak256(abi.encodePacked(msg.sender,ticketId,_match2,nextBlockHash));
        uint8 zeros2 = countZerosInFirst10Bytes(_hash2);

        bytes32 _hash3 = keccak256(abi.encodePacked(msg.sender,ticketId,_match3,nextBlockHash));
        uint8 zeros3 = countZerosInFirst10Bytes(_hash3);

        // make sure number of zeros for all claimed cells match
        require(zeros1 == zeros2 && zeros2 == zeros3, '3 matches required to win');
        // mark the ticket as redeemed
        players[msg.sender].tickets[ticketId].redeemedAt = block.number;
        msg.sender.transfer(prizeMultiplier * zeros1);
        emit TicketRedeemed(msg.sender, ticket.id, zeros1);
    }
}
