import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { getCellValue } from './helpers';

import './Cell.css';
import './Ticket.css';

const Cell = (props) => {
    const { index } = props;

    return (
        <div
            className="cell px-0 m-1"
            onClick={() => getCellValue(ticket, index)}
        >

        </div>
    )
}

class Ticket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticket: {}
        }
    }

    async componentDidMount() {
        const { scratchLottery } = this.props;

        try {
            const ticket = await scratchLottery.getTicket({
                from: this.props.account
            });

            this.setState({
                ticket,
                loaded: true
            });
        } catch (e) {
            console.log('ERROR', e)
            this.setState({
                loaded: true,
                ticket: null
            })
        }
    }

    render() {
        const { ticket } = this.state;
        const { scratchLottery, account } = this.props;
        return (
            <Container>
                {
                    ticket.id && ticket.id.toNumber() ?
                    (
                        <Row className="justify-content-center">
                            <Col xs="8" md="6" lg="4">
                                <Row className="ticket">
                                    <Col xs="12" className="ticket-header">
                                        <h3>Ticket #{ticket.id.toNumber()}</h3>
                                        <p>Match 3 squares to win</p>
                                    </Col>
                                    { Array(12).fill({}).map((val, index) => (
                                        <Col
                                            key={index}
                                            xs="4"
                                            className="px-0"
                                        >
                                            <Cell index={index} ticketId={ticket.id.toNumber()}/>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                        </Row>
                    ) : (
                        <div
                            onClick={async () => {
                                const newTicket = await scratchLottery.purchaseTicket({
                                    from: account,
                                    value: 5000000000000000
                                })
                                console.log('NEW TICKET', newTicket);
                            }}
                        >
                            Click here to purchase a ticket
                        </div>
                    )
                }
            </Container>
        )
    }
}

export default Ticket;