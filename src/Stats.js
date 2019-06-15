import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { getTicketValue } from './helpers';
class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jackpot: 0
        }
    }

    render() {
        const {
            cellValues,
            ticket,
            jackpot,
            purchaseTicket,
            redeemTicket,
            miningTicket,
            miningPrize,
        } = this.props;
        const numCellsRevealed = Object.keys(cellValues).length;
        const ticketValue = getTicketValue(cellValues);
        return (
            <React.Fragment>
                <Alert variant="primary">
                    <h5 className="mb-0"><strong>
                        Jackpot: {jackpot} ETH
                        <OverlayTrigger trigger="hover" placement="left" overlay={
                            <Popover>
                                This jackpot value is either 50 ETH (the highest possible ticket value)
                                or all funds held by the contract.
                            </Popover>
                        }>
                            <i className="fas fa-question-circle float-right"></i>
                        </OverlayTrigger>
                    </strong></h5>
                </Alert>
                <Alert variant="warning">
                    <h5 className="mb-0"><strong>{numCellsRevealed} / 12 cells revealed</strong></h5>
                </Alert>
                {
                    !!ticket.redeemedAt.toNumber() &&
                    <Alert variant="success">
                        <Alert.Heading as="h5"><strong>Ticket redeemed</strong></Alert.Heading>
                        <hr />
                        <p>
                            This ticket has been redeemed, purchase another ticket to play again.
                        </p>
                        <Button
                            onClick={purchaseTicket}
                            variant="primary"
                        >
                            Get a new ticket
                        </Button>
                    </Alert>
                }
                {
                    !ticket.redeemedAt.toNumber() &&
                    numCellsRevealed === 12 && ticketValue > 0 &&
                    <Alert variant="success">
                        <Alert.Heading as="h5"><strong>Winner!</strong></Alert.Heading>
                        <hr />
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
                    !ticket.redeemedAt.toNumber() &&
                    numCellsRevealed === 12 && ticketValue === 0 &&
                    <Alert variant="danger">
                        <Alert.Heading as="h5"><strong>Loser!</strong></Alert.Heading>
                        <hr />
                        <p>
                            You didn't win anything, purchase another ticket to play again.
                        </p>
                        <Button
                            onClick={purchaseTicket}
                            variant="primary"
                        >
                            Get a new ticket
                        </Button>
                    </Alert>
                }
                {
                    miningTicket &&
                    <Alert variant="info">
                        <Alert.Heading as="h5">
                            <strong>Generating Ticket</strong>
                            {' '}
                            <Spinner animation="grow" size="sm"/>
                        </Alert.Heading>
                        <hr />
                        <p>
                            Please wait while your ticket is generated.
                        </p>
                    </Alert>
                }
                {
                    miningPrize &&
                    <Alert variant="info">
                        <Alert.Heading as="h5">
                            <strong>Redeeming Prize</strong>
                            {' '}
                            <Spinner animation="grow" size="sm"/>
                        </Alert.Heading>
                        <hr />
                        <p>
                            Please wait while your prize is redeemed.
                        </p>
                    </Alert>
                }
            </React.Fragment>
        )
    }
}

export default Stats;