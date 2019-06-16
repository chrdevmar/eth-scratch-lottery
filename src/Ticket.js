import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './Cell.css';
import './Ticket.css';

import TicketForm from './TicketForm';

const cellValueClassMappings = {
    0: 'value-0',
    1: 'value-1',
    2: 'value-2',
    3: 'value-3',
    4: 'value-4',
    5: 'value-5'
}

const Cell = (props) => {
    const {ticket, cellPower} = props;
    let cellValue = 0;
    if(cellPower > 0) {
        cellValue = web3.utils.fromWei(ticket.price) * (10 ** (cellPower - 1));
    }
    return (
        <div
            className={`cell px-0 m-1 ${cellValueClassMappings[cellPower]} ${cellPower != null ? 'revealed' : 'hidden'}`}
            onClick={props.onClick}
        >
            <div>
                <img src="./assets/eth.png"></img><br/>
                <strong>{cellValue}</strong>
            </div>
        </div>
    )
}

class Ticket extends Component {
    render() {
        const {
            cellPowers,
            onCellClick,
            ticket,
            ticketLoaded,
            purchaseTicket,
            defaultTicketPrice,
            jackpot
        } = this.props;

        const ticketPrice = Number(web3.utils.fromWei(ticket.price));
        const numCellsRevealed = Object.keys(cellPowers).length;
        return (
            <React.Fragment>
                {
                    ticketLoaded && !!ticket.id.toNumber() &&
                    (
                        <Card className="ticket text-center">
                            <Card.Title as="h4">
                                <strong>Ticket #{ticket.id.toNumber()}</strong>
                            </Card.Title>
                            <Card.Subtitle as="h5" className="mb-2">Ticket Price: {ticketPrice} ETH</Card.Subtitle>
                            <Card.Subtitle as="h5" className="mb-2">
                                <strong>Ticket Jackpot: {jackpot} ETH</strong>
                                <OverlayTrigger
                                    trigger="hover"
                                    placement="left"
                                    overlay={
                                        <Popover>
                                            Total jackpot is ticket price ^ 5 ({ticketPrice * 10000} ETH)
                                            or total funds held by ethereum scratchies, whichever is less.
                                        </Popover>
                                    }
                                >
                                    <span className="fas fa-question-circle ml-2"></span>
                                </OverlayTrigger>
                            </Card.Subtitle>
                            <Card.Subtitle as="h5" className="mb-2">{numCellsRevealed} / 12 Cells Revealed</Card.Subtitle>
                            <hr/>
                            <Row className="m-0">
                            { Array(12).fill({}).map((val, index) => (
                                <Col
                                    key={index}
                                    xs="4"
                                    className="px-0"
                                >
                                    <Cell
                                        ticket={ticket}
                                        cellPower={cellPowers[index]}
                                        onClick={() => {
                                            onCellClick(index);
                                        }}
                                    />
                                </Col>
                            ))}
                            </Row>
                        </Card>
                    )
                }
                {
                    ticketLoaded && !!!ticket.id.toNumber() &&
                    (
                        <Card>
                            <Card.Body className="text-center">
                                <Card.Title><strong>You have no ticket</strong></Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">Buy one below</Card.Subtitle>
                                <hr/>
                                <div className="text-left mb-2">
                                    <strong>The more you pay for your ticket, the higher your potential reward</strong>
                                </div>
                                <TicketForm defaultTicketPrice={defaultTicketPrice} purchaseTicket={purchaseTicket}/>
                            </Card.Body>
                        </Card>
                    )
                }
                {
                    !ticketLoaded &&
                    <div className="w-100 text-center">
                        <Spinner animation="grow" />
                    </div>
                }
            </React.Fragment>
        )
    }
}

export default Ticket;