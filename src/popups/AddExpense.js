import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import axios from 'axios';

import moment from 'moment';
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";

class AddExpense extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      options: [],
      budgetName: '',
      expenseName: '',
    };
  }

  componentDidMount(){
      var options = {}
      this.props.budgetData.forEach((budget, i ) => {
        options[budget.bName] = budget.bID
    })
     /*  var options = this.props.budgetData.map(i => (
         
            options[i.bID] = i.bName
         
      
      ))  */

      this.setState({
          options: options,
          budgetName: Object.keys(options)[0]
      })
    
  }

  handle_change = (e) => {
    
    const {name , value} = e.target ? e.target : {name: "date", value: e}
    
    this.setState({
        [name] : value
      
    });
  };

  handleAddExpense = async() => {
    const date = moment(this.state.date).format("YYYY-MM-DD")
    const data = {eAmount: this.state.amount, eDate: date, bID: this.state.options[this.state.budgetName], eUser: this.props.userID, eName: this.state.expenseName}
    console.log(data)
    const config = {
        headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
            } 
    }
   await axios.post('http://localhost:8000/expenses/', 
        JSON.stringify(data),
        config
        
     )
    .catch((error) => {
        console.log(error)
    });

    this.props.fetchData()

    
}


  render() {
    return (
      <Modal 
        style={{opacity:1}}
        animation = {false}
        show = {true}
        
        onHide={()=>this.props.addExpenseClick('showExpensePopup')}
        backdrop='static'
        keyboard={false}
        backdropClassName = 'modalBackdrop'
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group controlId="exampleForm.ControlSelect2">
                    <Form.Label>Budget Type</Form.Label>
                    <Form.Control as="select" name='budgetName' value={this.state.budgetName} onChange={this.handle_change}
                    >
                            
                            {Object.entries(this.state.options).map(i => (
                                <option key={i[1]} >
                                  {i[0]}
                                </option>
                            ))}
                    </Form.Control>
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Name</Form.Label>
                    <Form.Control as="textarea" onChange={this.handle_change} name='expenseName' rows="1" />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control as="textarea" onChange={this.handle_change} name='amount' rows="1" />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Date</Form.Label>
                    <DatePicker name='date' value = {this.state.date} selected={this.state.date} onSelect={this.handle_change} />
                </Form.Group>
                <Button variant="primary" type="submit" onClick={() => {
                    
                    this.handleAddExpense()
                    this.props.addExpenseClick()
                }}>

                    Submit
                </Button>
            </Form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default AddExpense;

