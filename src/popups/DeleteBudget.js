import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import axios from 'axios';

class DeleteBudget extends React.Component {
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
       
    
  }

  handle_change = e => {
    const {name, value} = e.target
    this.setState({
      [name] : value
    });
  }

  handleBudgetDelete = async() => {
    const config = {
        headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`
            
            } 
    }
    await axios.delete((encodeURI("http://localhost:8000/budgets/"
    .concat(this.props.budgetToDelete.toString() + '/')
        )), config)
    .catch((error) => {
        console.log(error)
    })
    this.props.deleteBudgetClick()
    this.props.fetchData()
  }


  render() {
    return (
      <Modal 
        style={{opacity:1, margin: 'auto'}}
        animation = {false}
        show = {true}
        centered
        backdrop='static'
        keyboard={false}
        backdropClassName = 'modalBackdrop'
      >
        <Modal.Header >
            <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <p>Deleting a budget will also delete any associated expenses. </p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="light" onClick={this.props.deleteBudgetClick}>Cancel</Button>
            <Button variant="danger" onClick={this.handleBudgetDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default DeleteBudget;

