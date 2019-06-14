import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import './Cell.css';
import './Ticket.css';

const Cell = (props) => {
    return (
        <div
            className={`cell px-0 m-1 ${props.value != null ? 'revealed' : 'hidden'}`}
            onClick={props.onClick}
        >
            <div>{props.value}<br/>ether</div>
        </div>
    )
}

class Ticket extends Component {

    render() {
        const {
            scratchLottery,
            account,
            cellValues,
            onCellClick,
            ticket,
            ticketLoaded
        } = this.props;
        return (
            <Container>
                {
                    ticketLoaded && ticket.id && !!ticket.id.toNumber() &&
                    (
                        <Card>
                            <Card.Body className="text-center">
                                <Card.Title><strong>Ticket #{ticket.id.toNumber()}</strong></Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">Match 3 squares to win</Card.Subtitle>
                                <hr/>
                                <Row className="m-0">
                                { Array(12).fill({}).map((val, index) => (
                                    <Col
                                        key={index}
                                        xs="4"
                                        className="px-0"
                                    >
                                        <Cell
                                            value={cellValues[index]}
                                            onClick={() => {
                                                onCellClick(index);
                                            }}
                                        />
                                    </Col>
                                ))}
                                </Row>
                            </Card.Body>
                        </Card>
                    )
                }
                {
                    ticketLoaded && ticket.id && !!!ticket.id.toNumber() &&
                    (
                        <Card>
                            <Card.Body className="text-center">
                                <Card.Title><strong>You have no ticket</strong></Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">you should get one</Card.Subtitle>
                                <hr/>
                                <Card.Text>
                                    Tickets cost .005 ether and take one block (10-20 seconds) to mine
                                </Card.Text>
                                <Button
                                    onClick={async () => {
                                        const newTicket = await scratchLottery.purchaseTicket({
                                            from: account,
                                            value: 5000000000000000
                                        })
                                        console.log('NEW TICKET', newTicket);
                                    }}
                                    variant="success"
                                >
                                    Get a ticket
                                </Button>
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
            </Container>
        )
    }
}

export default Ticket;