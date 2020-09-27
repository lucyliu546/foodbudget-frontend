import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

class AddBudget extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      options: [],
      allBudgets: ['Grocery',
      'Fast Food', 
      'Restaurants',
      'Bars',
      'Coffee', 
      'Dessert'],
      budgetName: ''
    };
  }

  componentDidMount(){
      var options = []
      var budgets = this.props.budgetData.map( budget => {
          return budget.bName
      })
      for (var budget of this.state.allBudgets) {
          const found = budgets.includes(budget)
          if (found === false) {
              options.push(budget)
          } 
        
        }
      this.setState({
          options: options,
          budgetName: options[0]
      })
    
  }

  handle_change = e => {
    const {name, value} = e.target
    this.setState({
      [name] : value
    });
  };

  render() {
    return (
      <Modal 
        style={{opacity:1}}
        animation = {false}
        show = {true}
        onHide={this.props.addBudgetClick}
        backdrop='static'
        keyboard={false}
        backdropClassName = 'modalBackdrop'
      >
        <Modal.Header closeButton>
          <Modal.Title>Add budget</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group controlId="exampleForm.ControlSelect2">
                    <Form.Label>Budget Type</Form.Label>
                    <Form.Control as="select" 
                        name='budgetName' value={this.state.budgetName} onChange={this.handle_change}
                        defaultValue={this.state.budgetName} defaultValue={this.props.currentBudget}>
                            
                            {this.state.options.map(i => (
                                <option>{i}</option>
                            ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control as="textarea" onChange={this.handle_change} name='amount' rows="1" />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={() => {
                    this.props.addBudgetClick(); 
                    this.props.handleAddBudget(this.state.budgetName, this.state.amount);
                }}>

                    Submit
                </Button>
            </Form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default AddBudget;

