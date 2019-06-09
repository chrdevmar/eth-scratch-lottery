pragma solidity >=0.4.21 <0.6.0;

/** @title Scratch Lottery */
contract ScratchLottery {
    uint public ticketPrice;
    uint public prize;

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

    constructor() public {
        // .001 eth = 1000000000000000 wei
        ticketPrice = .001 ether;
        // .1 eth = 100000000000000000 wei
        prize = .1 ether;
    }

    function purchaseTicket() public payable {
        // require payment to run
        require(msg.value == ticketPrice, 'Tickets cost 0.001 eth');

        // create the player if they dont exist
        // they dont exist unless they have at least one ticket
        if(players[msg.sender].ticketCount == 0) {
            players[msg.sender] = Player({
                playerAddress: msg.sender,
                ticketCount: 0
            });
        }

        players[msg.sender].ticketCount ++;
        players[msg.sender].tickets[players[msg.sender].ticketCount] = Ticket({
            id: players[msg.sender].ticketCount,
            blockNumber: block.number,
            redeemableAt: block.number + 2,
            redeemedAt: 0
        });
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
}
