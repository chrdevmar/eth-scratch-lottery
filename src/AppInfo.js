import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

class AppInfo extends Component {
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
        const { etherscanLink } = this.props;
        const { donation } = this.state;
        return (
            <React.Fragment>
                <Alert variant="success">
                    <Accordion>
                        <Accordion.Toggle
                            as={(props) => (
                                <Alert.Heading
                                    className="mb-0 clickable"
                                    onClick={props.onClick}
                                    as="h5"
                                >
                                    {props.children}
                                </Alert.Heading>
                            )}
                            eventKey="0"
                        >
                            <strong>Donate</strong>
                            <span className="fas fa-donate float-right align-bottom ml-2 clickable"></span>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <div>
                                <hr className="mb-1 mt-2"/>
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
                                        <Form.Label>Donation Amount</Form.Label>
                                        <InputGroup className="mb-3">
                                            <Form.Control
                                                onChange={this.handleChange}
                                                type="number"
                                                required
                                                placeholder="Amount (ETH)"
                                                name="amount"
                                                value={donation.amount}
                                                aria-label="Donation Amount"
                                                aria-describedby="Donation Amount"
                                            />
                                            <InputGroup.Append>
                                                <Button variant="primary" type="submit">Donate</Button>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Form.Group>
                                </Form>
                            </div>
                        </Accordion.Collapse>
                    </Accordion>
                </Alert>
                <Button variant="info" block target="_blank" href={etherscanLink}>View on etherscan</Button>
            </React.Fragment>
        )
    }
}

export default AppInfo;