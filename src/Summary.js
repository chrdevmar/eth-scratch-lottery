import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Accordion from 'react-bootstrap/Accordion';
import Popover from 'react-bootstrap/Popover';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

class Toggle extends Component {
    render() {
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }
}

import { getTicketValue } from './helpers';
class Stats extends Component {
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
        } = this.props;
        const {
            donation
        } = this.state;
        const numCellsRevealed = Object.keys(cellValues).length;
        const ticketValue = getTicketValue(cellValues);
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