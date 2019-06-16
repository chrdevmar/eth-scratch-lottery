import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import { getTicketPower, getTicketValue } from './helpers';

import TicketForm from './TicketForm';

class Summary extends Component {
    render() {
        const {
            cellPowers,
            ticket,
            purchaseTicket,
            redeemTicket,
            isMiningTicket,
            isMiningPrize,
            currentBlockNumber,
            hideMiningStatus,
            defaultTicketPrice
        } = this.props;
        const numCellsRevealed = Object.keys(cellPowers).length;
        const ticketPower = getTicketPower(cellPowers);
        const ticketValue = getTicketValue(ticket, ticketPower);
        const ticketIsRedeemed = !!ticket.redeemedAt.toNumber();
        const ticketIsWinner = numCellsRevealed === 12 && ticketValue > 0;
        const ticketIsLoser = numCellsRevealed === 12 && ticketValue === 0;
        const ticketIsExpired = ticket.redeemableAt.toNumber() <= currentBlockNumber - 254;
        return (
            <React.Fragment>
                <Alert variant="warning">
                    <Alert.Heading as="h5">
                        <strong>Redeem your tickets ASAP!</strong>
                    </Alert.Heading>
                    <hr className="my-1" />
                    <p>Be sure to redeem tickets within 30 - 45 minutes of purchase.</p>
                    Prize verification relies on data that is unavailable past a certain point.
                    We are working towards tickets that live forever.
                </Alert>
                {
                    !isMiningTicket && ticketIsRedeemed &&
                    <Alert variant="success">
                        <Alert.Heading as="h5"><strong>Ticket Redeemed</strong></Alert.Heading>
                        <hr className="my-1" />
                        <p>
                            This ticket has been redeemed, purchase another ticket to play again.
                        </p>
                        <TicketForm defaultTicketPrice={defaultTicketPrice} purchaseTicket={purchaseTicket}/>
                    </Alert>
                }
                {
                    !isMiningPrize && !ticketIsExpired && !ticketIsRedeemed && ticketIsWinner &&
                    <Alert variant="success">
                        <Alert.Heading as="h5"><strong>Winner!</strong></Alert.Heading>
                        <hr className="my-1" />
                        <p>
                            Congratulations, you can redeem your ticket for {ticketValue} ETH.
                        </p>
                        <Button
                            onClick={redeemTicket}
                            variant="primary"
                        >
                                Redeem {ticketValue} ETH
                        </Button>
                    </Alert>
                }
                {
                    !isMiningTicket && !ticketIsExpired && !ticketIsRedeemed && ticketIsLoser &&
                    <Alert variant="danger">
                        <Alert.Heading as="h5"><strong>No Prize This Time</strong></Alert.Heading>
                        <hr className="my-1" />
                        <p>
                            You didn't win anything, purchase another ticket to play again.
                        </p>
                        <TicketForm defaultTicketPrice={defaultTicketPrice} purchaseTicket={purchaseTicket}/>
                    </Alert>
                }
                {
                    !!ticket.id.toNumber() && !isMiningTicket && !ticketIsRedeemed && ticketIsExpired &&
                    <Alert variant="danger">
                        <Alert.Heading as="h5"><strong>Ticket is expired</strong></Alert.Heading>
                        <hr className="my-1" />
                        <p>
                            Due to limitations in accessing ethereum block history,
                            tickets expire 255 blocks after they are generated.
                            Purchase a new ticket below.
                        </p>
                        <TicketForm defaultTicketPrice={defaultTicketPrice} purchaseTicket={purchaseTicket}/>
                    </Alert>
                }
                {
                    isMiningTicket &&
                    <Alert variant="info">
                        <Alert.Heading as="h5">
                            <strong>Generating Ticket</strong>
                            {' '}
                            <Spinner className="mb-1" animation="grow" size="sm"/>
                            <span
                                onClick={() => hideMiningStatus('isMiningTicket')}
                                className="fas fa-times-circle float-right align-bottom ml-2 clickable"
                            />
                        </Alert.Heading>
                        <hr className="my-1" />
                        <span>
                            Please wait while your ticket is generated.
                        </span>
                    </Alert>
                }
                {
                    isMiningPrize &&
                    <Alert variant="info">
                        <Alert.Heading as="h5">
                            <strong>Redeeming Prize</strong>
                            {' '}
                            <Spinner className="mb-1" animation="grow" size="sm"/>
                            <span
                                onClick={() => hideMiningStatus('isMiningPrize')}
                                className="fas fa-times-circle float-right align-bottom ml-2 clickable"
                            />
                        </Alert.Heading>
                        <hr className="my-1" />
                        <span>
                            Please wait while your prize is redeemed.
                        </span>
                    </Alert>
                }
            </React.Fragment>
        )
    }
}

export default Summary;