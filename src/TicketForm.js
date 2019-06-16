import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

class TicketForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticketPrice: props.defaultTicketPrice
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.defaultTicketPrice !== this.props.defaultTicketPrice) {
            this.setState({ ticketPrice: this.props.defaultTicketPrice });
        }
    }

    render() {
        const { purchaseTicket } = this.props;
        const { ticketPrice } = this.state;
        return (
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    purchaseTicket(ticketPrice)
                }}
                autoComplete="off"
                className="text-left"
            >
                <Form.Group controlId="amount">
                    <Form.Label>Ticket Price (ETH) (min = .00001)</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control
                            onChange={({ target }) => this.setState({ ticketPrice: target.value})}
                            type="number"
                            placeholder="Amount (ETH)"
                            name="amount"
                            required
                            value={ticketPrice}
                            aria-label="Ticket price"
                            aria-describedby="Ticket price"
                        />
                        <InputGroup.Append>
                            <Button variant="primary" type="submit">Purchase</Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
            </Form>
        )
    }
}

export default TicketForm