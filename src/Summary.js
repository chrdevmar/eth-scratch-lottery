import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Accordion from 'react-bootstrap/Accordion';
import Popover from 'react-bootstrap/Popover';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { getTicketValue } from './helpers';

class Toggle extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }
}

class Summary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jackpot: 0,
            donation: {
                amount: 0,
                donateTo: 'contract'
            }
        }
        this.handleChange = this.handleChange.bind(this);
        this.donate = this.donate.bind(this);
    }

    donate(event) {
        event.preventDefault();
        const { donation } = this.state;
        const { donateToContract, donateToOwner } = this.props;
        switch(donation.donateTo) {
            case 'contract':
                return donateToContract(donation.amount);
            case 'owner':
                return donateToOwner(donation.amount);
        }
    }

    handleChange(event) {
        this.setState({
            donation: {
                ...this.state.donation,
                [event.target.name]: event.target.value
            }
        })
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
            currentBlockNumber
        } = this.props;
        const {
            donation
        } = this.state;
        const numCellsRevealed = Object.keys(cellValues).length;
        const ticketValue = getTicketValue(cellValues);
        const ticketIsRedeemed = !!ticket.redeemedAt.toNumber();
        const ticketIsWinner = numCellsRevealed === 12 && ticketValue > 0;
        const ticketIsLoser = numCellsRevealed === 12 && ticketValue === 0;
        const ticketIsExpired = ticket.redeemableAt.toNumber() <= currentBlockNumber - 254;
        return (
            <React.Fragment>
                <Alert variant="primary">
                    <Accordion>
                        <h5 className="mb-0"><strong>
                            Jackpot: {jackpot} ETH
                            <Accordion.Toggle
                                as={(props) => (
                                    <OverlayTrigger trigger="hover" placement="left" overlay={
                                        <Popover>
                                            Donate
                                        </Popover>
                                    }>
                                        <span onClick={props.onClick} className="fas fa-donate float-right align-bottom ml-2 clickable"></span>
                                    </OverlayTrigger>
                                )}
                                eventKey="0"
                            />
                            <OverlayTrigger trigger="hover" placement="left" overlay={
                                <Popover>
                                    This jackpot value is either 50 ETH (the highest possible ticket value)
                                    or all funds held by the contract.
                                </Popover>
                            }>
                                <span className="fas fa-question-circle float-right align-bottom"></span>
                            </OverlayTrigger>
                        </strong></h5>
                        <Accordion.Collapse eventKey="0">
                            <div>
                                <hr/>
                                <Form onSubmit={this.donate} autoComplete="off">
                                    <Form.Group controlId="donationType">
                                        <Form.Label className="d-block">Donate to</Form.Label>
                                        <Form.Check
                                            onChange={this.handleChange}
                                            inline
                                            id="contract"
                                            type="radio"
                                            label="Contract (jackpot pool)"
                                            name="donateTo"
                                            value="contract"
                                            checked={donation.donateTo === 'contract'}
                                        />
                                        <Form.Check
                                            onChange={this.handleChange}
                                            inline
                                            id="owner"
                                            type="radio"
                                            label="Creator"
                                            name="donateTo"
                                            value="owner"
                                            checked={donation.donateTo === 'owner'}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="amount">
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            onChange={this.handleChange}
                                            type="number"
                                            placeholder="amount (eth)"
                                            name="amount"
                                            value={donation.amount}
                                        />
                                    </Form.Group>
                                    <Button variant="warning" type="submit">
                                        Donate
                                    </Button>
                                </Form>
                            </div>
                        </Accordion.Collapse>
                    </Accordion>
                </Alert>
                <Alert variant="warning">
                    <h5 className="mb-0"><strong>{numCellsRevealed} / 12 cells revealed</strong></h5>
                </Alert>
                {
                    ticketIsRedeemed &&
                    <Alert variant="success">
                        <Alert.Heading as="h5"><strong>Ticket Redeemed</strong></Alert.Heading>
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
                    !ticketIsExpired && !ticketIsRedeemed && ticketIsWinner &&
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
                    !ticketIsExpired && !ticketIsRedeemed && ticketIsLoser &&
                    <Alert variant="danger">
                        <Alert.Heading as="h5"><strong>No Prize This Time</strong></Alert.Heading>
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
                    !ticketIsRedeemed && ticketIsExpired &&
                    <Alert variant="danger">
                        <Alert.Heading as="h5"><strong>Ticket is expired</strong></Alert.Heading>
                        <hr />
                        <p>
                            Due to limitations in accessing ethereum block history,
                            tickets expire 255 blocks after they are generated.
                            Purchase a new ticket below.
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

export default Summary;