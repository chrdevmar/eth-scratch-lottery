import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import './Cell.css';
import './Ticket.css';

const cellValueClassMappings = {
    '0': 'value-0',
    '0.005': 'value-0005',
    '0.05': 'value-005',
    '0.5': 'value-05',
    '5': 'value-5',
    '50': 'value-50',
}

const Cell = (props) => {
    return (
        <div
            className={`cell px-0 m-1 ${cellValueClassMappings[props.value]} ${props.value != null ? 'revealed' : 'hidden'}`}
            onClick={props.onClick}
        >
            <div>
                <img src="./assets/eth.png"></img><br/>
                <strong>{props.value}</strong>
            </div>
        </div>
    )
}

class Ticket extends Component {
    render() {
        const {
            cellValues,
            onCellClick,
            ticket,
            ticketLoaded,
            purchaseTicket
        } = this.props;
        return (
            <React.Fragment>
                {
                    ticketLoaded && ticket.id && !!ticket.id.toNumber() &&
                    (
                        <Card className="ticket text-center">
                            <Card.Title as="h3"><strong>Ticket #{ticket.id.toNumber()}</strong></Card.Title>
                            <Card.Subtitle className="mb-2">Reveal 3 matching squares to win!</Card.Subtitle>
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
                                    Tickets cost .005 ETH and take one block (10-20 seconds) to mine
                                </Card.Text>
                                <Button
                                    onClick={purchaseTicket}
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
            </React.Fragment>
        )
    }
}

export default Ticket;