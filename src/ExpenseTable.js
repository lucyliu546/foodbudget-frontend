import React from 'react';
import {Component } from 'react';
import {Link} from "react-router-dom";

import Table from 'react-bootstrap/Table'

import AddExpense from './popups/AddExpense.js'
import AddExpenseBulk from './AddExpenseBulk.js'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';

import Button from 'react-bootstrap/Button'
import axios from 'axios';
import './index.css';
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import moment from 'moment';

import DatePicker from "react-datepicker";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class ExpenseTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showExpensePopup: false,
            editExpenseID: '',
            tempAmount: '',
            tempName: '',
            tempBudget: '',
            tempDate: '',
            options: [],
            
            
            
        }
    }

    componentDidMount() {
        var options = {}
        
        this.props.budgetData.forEach((budget, i ) => {
            options[budget.bName] = budget.bID
           
        
        })

      this.setState({
          options: options,
         
          
          
      })
    }

    setDefaultState = () => {
        this.setState({
            
            showExpensePopup: false,
            showBulkPopup: false, 
            editExpenseID: '',
            tempAmount: '',
            tempBudget: '',
            tempDate: '',
            options: []
        
        })
    }

    addExpenseClick = (e) => {
        const name = e.target? e.target.name: e
        this.setState(prevState => ({[name]: !prevState.showExpensePopup}))
    }

    /* Sets default temp state for row that is being edited */
    editExpenseClick = (eID, row, budget=this.props.currentBudget, e) => {
        this.setState({editExpenseID: eID,
        tempAmount: this.props.individualexpenseData[budget][0][row].eAmount,
        tempDate: this.props.individualexpenseData[budget][0][row].eDate,
        tempName: this.props.individualexpenseData[budget][0][row].eName,
        tempBudget: budget })
    }

    
    saveExpenseClick = async(eID, e) => {
        const self = this;
        const data = {eAmount: this.state.tempAmount, 
                eDate: this.state.tempDate, 
                eName: this.state.tempName,
                bID: this.state.options[this.state.tempBudget],
                eUser: this.props.userID}
        
        const config = {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
                } 
        }
        await axios.put((encodeURI("http://localhost:8000/expenses/"
		.concat((eID).toString() + '/')
			)), 
            JSON.stringify(data),
            config
            
        )
        .catch((error) => {
            console.log(error)
        });


        this.setDefaultState()
        this.props.fetchData()
       
        
    }

    deleteExpenseClick = async(eID, e) => {
        const config = {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`
                
                } 
        }
        await axios.delete((encodeURI("http://localhost:8000/expenses/"
		.concat((eID).toString() + '/')
			)), config)
        .catch((error) => {
            console.log(error)
        })

        this.props.fetchData()
    }
    

    /* handles value changes in row being edited */
    handleChange = (k, e) => {
        const {name , value} = e.target? e.target: {name: "tempDate", value: moment(e).format("YYYY-MM-DD")}
        this.setState({
            [name] : value
        })
        
        /* let expenses = this.props.individualexpenseData
        
        expenses[this.state.tempBudget][0][k][name] = value 
        console.log(expenses[this.state.tempBudget][0][k]) */
        
    }

    render(){

        const addExpenseButton = <Button variant="primary" name='showExpensePopup' size="lg" onClick={this.addExpenseClick} block >
                Add Expenses 
                <img style={{marginLeft: '1%', height: '1em'}} src={require('./images/plus.png')}/>
            </Button>
        
        const bulkAddExpenseButton = <Button variant="secondary" name='showBulkPopup' size="md" onClick={this.addExpenseClick}>
        Bulk Upload with CSV 
        </Button>

        const summaryPage = this.props.individualexpenseData ? Object.entries(this.props.individualexpenseData).map(budget => (
            budget[1].map(expenses => (
                Object.entries(expenses).map( ([k, expense]) => (
                
                expense.eID === this.state.editExpenseID ? 
                <tr>
                    <td>
                        <InputGroup className="mb-3">
                            <DatePicker
                            value={this.state.tempDate}
                            name='tempDate'
                            onChange={(e) => this.handleChange(k, e)}
                            aria-label="eDate"
                            aria-describedby="basic-addon1"
                            />
                        </InputGroup>
                        
                    </td>

                    <td>
                        <InputGroup className="mb-3">
                            <Form.Control
                            value= {this.state.tempName}
                            name='tempName'
                            onChange={(e) => this.handleChange(k, e)}
                            aria-label="budget"
                            aria-describedby="basic-addon1"
                            /> 
                            
                        </InputGroup> 
                        
                    </td>

                    <td>
                        <InputGroup className="mb-3">
                            <Form.Control
                            value= {this.state.tempAmount}
                            name='tempAmount'
                            onChange={(e) => this.handleChange(k, e)}
                            aria-label="eAmount"
                            aria-describedby="basic-addon1"
                            />
                        </InputGroup>   
                       
                    </td>

                    
                    {this.props.currentBudget === 'Summary' ? <td>
                        <InputGroup className="mb-3">
                            <Form.Control as="select"
                            value= {this.state.tempBudget}
                            name='tempBudget'
                            onChange={(e) => this.handleChange(k, e)}
                            aria-label="budget"
                            aria-describedby="basic-addon1"
                            > 
                                {(this.props.budgetData).map(i => (
                                    <option  >
                                    {i.bName}
                                    </option>
                                ))}
                            </Form.Control>
                        </InputGroup> 
                        
                        </td> : null}
                    
                     
                    <td style={{display: 'inline-block'}}>
                            <Button variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                onClick = {() => this.saveExpenseClick(expense.eID)}>
                            <img style={{height: '1em'}} src={require('./images/save.png')}/>
                            </Button>

                            
                        </td>
                </tr>
                :
                <tr>
                    <td>{expense.eDate}</td>
                    <td>{expense.eName}</td>
                    <td>${expense.eAmount}</td>
                    
                    {this.props.currentBudget === 'Summary' ? <td>{budget[0]}</td> : null }
                    <td>
                            <Button variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                onClick = {() => this.editExpenseClick(expense.eID, k, budget[0])}>
                            <img style={{height: '1em'}} src={require('./images/pencil.png')}/>
                            </Button>

                            <Button 
                                variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                onClick = {() => this.deleteExpenseClick(expense.eID)}>
                            <img style={{marginLeft: '1%', marginRight: '2%', height: '1em'}} src={require('./images/cross.png')}/>
                            </Button>
                        </td>
                </tr>
            )))
        ))) : <h2>No expenses to show</h2>

        const individualPage = this.props.individualexpenseData[this.props.currentBudget] ? 
                
                this.props.individualexpenseData[this.props.currentBudget].map(expenseList => (
                    Object.entries(expenseList).map( ([k, expense]) => (
                        expense.eID === this.state.editExpenseID ? 
                    
                    // shows an inline form if a user wants to edit an expense
                    <tr>
                        <td>
                            <InputGroup className="mb-3">
                                <DatePicker
                                value={moment(this.state.tempDate).format("YYYY-MM-DD")}
                                name = 'tempDate'
                                onChange = {(e) => this.handleChange(k, e)}
                                aria-label="eDate"
                                aria-describedby="basic-addon1"
                                />
                            </InputGroup>
                            
                        </td>

                        <td>
                            <InputGroup className="mb-3">
                                <Form.Control
                                value= {this.state.tempName}
                                name='tempName'
                                onChange={(e) => this.handleChange(k, e)}
                                aria-label="budget"
                                aria-describedby="basic-addon1"
                                /> 
                                
                            </InputGroup> 
                        
                        </td>

                        <td>
                            <InputGroup className="mb-3">
                                <Form.Control
                                value= {this.state.tempAmount}
                                name='tempAmount'
                                onChange = {(e) => this.handleChange(k, e)}
                                aria-label="eAmount"
                                aria-describedby="basic-addon1"
                                />
                            </InputGroup>   
                           
                        </td>
                        
                        <td style={{display: 'inline-block'}}>
                                <Button variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                    onClick = {() => this.saveExpenseClick(expense.eID)}>
                                <img style={{height: '1em'}} src={require('./images/save.png')}/>
                                </Button>

                               
                            </td>
                    </tr>
                    :
                        <tr>
                            <td>{expense.eDate}</td>
                            <td>{expense.eName} </td>
                            <td>${expense.eAmount} </td>
                            
                            <td>
                                <Button variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                    onClick = {() => this.editExpenseClick(expense.eID, k)}>
                                <img style={{height: '1em'}} src={require('./images/pencil.png')}/>

                                </Button>

                                <Button 
                                    variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                    onClick = {() => this.deleteExpenseClick(expense.eID)}>
                                <img style={{marginLeft: '1%', marginRight: '2%', height: '1em'}} src={require('./images/cross.png')}/>
                                </Button>
                            </td>
                        </tr>
                    )))) : <h2>No expenses to show</h2>
                
                
               

        return (
            <div style={{margin: '0.5% auto auto 1.5%',  maxWidth: '98%', backgroundColor: '#ededed', opacity: '0.9', }}>
                <div style={{backgroundColor: '#ededed', opacity: '0.9', 
                          minHeight: '100%', minWidth: '100%', padding: '0.5% 2% 1% 2%'}}>
                      <CardDeck style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Card style={{ maxWidth: '350px', borderRadius: '5px', minHeight: '100px', boxShadow: '0px 0px 2px  gray'}}>
                            <Card.Body style={{padding:'0',  minHeight:'auto', height:'auto'}}>
                                <Container className='card-container'>
                                <Row className='card-row'>
                                  
                                  <Col style={{justifyContent:'flex-end', display: 'flex', padding: '0', backgroundColor: this.props.currentBudget === 'Summary' ? 'gray' : `${this.props.colorScheme[this.props.currentBudget]}`, minHeight: '100%', 
                                        alignItems: 'center', paddingRight: '5%', color: 'white'}} >
                                    <Card.Title style={{fontSize: '1.25vw' ,width:'min-content', justifyContent: 'flex-end'}}>Percentage Spent</Card.Title>
                                  </Col>
                                  
                                  <Col className='card-col-2'/* style={{height: 'min-content', minHeight: 'min-content', justifyContent: 'center', alignItems: 'center', display: 'flex', 
                                              width:'min-content', padding: '0'}} */>
                                    <div style={{maxHeight: '90px', maxWidth: '90px', position: 'absolute', transform: 'translateY(-50%)',
                                                    top: '50%', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                                                        <CircularProgressbar value={this.props.percentage} text={`${this.props.percentage}%`} 
                                                            style= {{justifyContent: 'center', alignItems: 'center'}}
                                                            styles={buildStyles({textColor: 'black', 
                                                            pathColor: this.props.currentBudget === 'Summary' ? 'gray' : `${this.props.colorScheme[this.props.currentBudget]}`, 
                                                            trailColor: '#d1d1d1'})}
                                                        />
                                    </div>
                                  </Col>
                                </Row>
                                </Container> 
                            </Card.Body>
                        </Card>

                        <Card style={{ maxWidth: '350px', borderRadius: '5px', boxShadow: '0px 0px 2px  gray'}}> 
                        <Card.Body style={{padding:'0'}}>
                          <Container className='card-container'>
                          <Row className='card-row'>
                            <Col style={{justifyContent:'center', display: 'flex', padding: '0', minHeight: '74px', alignItems: 'center', backgroundColor: this.props.currentBudget === 'Summary' ? 'gray' : `${this.props.colorScheme[this.props.currentBudget]}`, minHeight: '100%',
                                        color: 'white', paddingRight: '5%' }}> 
                                <Card.Title style={{fontSize: '1.25vw' ,width:'min-content', height: 'min-content'}}>{this.props.dateFilterType === 'Monthly' ? 'Monthly' : 'Annual'} Budget</Card.Title>
                            </Col>
                            <Col className='card-col-2'><Card.Text style={{fontSize: '1.65vw' ,width:'min-content', }}>${this.props.currentBudgetTotal}</Card.Text></Col>
                          </Row>
                          </Container>
                          </Card.Body>
                        </Card>

                        <Card style={{ maxWidth: '350px', borderRadius: '5px', boxShadow: '0px 0px 2px  gray'}}>
                        <Card.Body style={{padding:'0'}}>
                          <Container className='card-container'>
                          <Row className='card-row'>
                            <Col style={{justifyContent:'center', display: 'flex', padding: '0', minHeight: '74px', alignItems: 'center', backgroundColor: this.props.currentBudget === 'Summary' ? 'gray' : `${this.props.colorScheme[this.props.currentBudget]}`, minHeight: '100%',
                                        color: 'white', paddingRight: '5%' }}>
                              <Card.Title style={{fontSize: '1.25vw' ,width:'min-content', height: 'min-content'}}>Total Spending</Card.Title>
                            </Col>
                            <Col className='card-col-2'>
                              <Card.Text style={{fontSize: '1.65vw' ,width:'min-content', }}>${this.props.currentExpenseTotal}</Card.Text>
                            </Col>
                          </Row>
                          </Container>
                        </Card.Body>
                        </Card>
                      

                      <Card style={{ maxWidth: '350px', borderRadius: '5px', boxShadow: '0px 0px 2px  gray' }}>
                        <Card.Body style={{padding:'0'}}>
                          <Container className='card-container'>
                          <Row className='card-row'>
                            <Col style={{justifyContent:'center', display: 'flex', padding: '0', minHeight: '74px', alignItems: 'center', backgroundColor: this.props.currentBudget === 'Summary' ? 'gray' : `${this.props.colorScheme[this.props.currentBudget]}`, minHeight: '100%',
                                        color: 'white', paddingRight: '5%'}}>
                              <Card.Title style={{fontSize: '1.25vw' ,width:'min-content', height: 'min-content'}}>On Track?</Card.Title>
                            </Col>
                            <Col className='card-col-2'>
                              <div style={{display:'inline-block', marginLeft: '5%',}}>
                                {this.props.spendingOnTrack? 
                                <img style={{ height: '4em'}} src={require('./images/success.png')}/>
                                :
                                <img style={{marginLeft: '1%', height: '5em'}} src={require('./images/caution.png')}/>}
                              </div>
                            </Col>
                          </Row>
                          </Container>
                          </Card.Body>
                          </Card>
                      </CardDeck>
                </div>     
                    
                  <div style={{backgroundColor: 'white', padding: '0.1% 0.2% 0% 0.2%'}}>
                    <Table striped bordered hover size="sm" style={{maxWidth: '100%'}} > 
                        <thead>
                            <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Amount</th>
                            
                            {this.props.currentBudget === 'Summary' ? <th>Budget</th> : null} 
                            <th></th>
                            </tr>
                        </thead>
                    <tbody>

                    {this.props.currentBudget !== 'Summary' ? individualPage : summaryPage} 

                    </tbody> 
                    
                    {/* Add expenses buttons */}

                    </Table>
                  </div>
                    {addExpenseButton}
                    {this.state.showExpensePopup ? 
                        <AddExpense 
                            budgetData = {this.props.budgetData}
                            addExpenseClick = {this.addExpenseClick} 
                            userID = {this.props.userID}
                            fetchData = {this.props.fetchData}/> :null }

                     <Link to='/bulkaddexpenses'> 
                        {bulkAddExpenseButton}
                    </Link>
                    {/* {this.state.showBulkPopup ? 
                        < AddExpenseBulk
                            addExpenseClick = {this.addExpenseClick} 
                            userID = {this.props.userID}
                            fetchData = {this.props.fetchData} /> : null} */}
                    
            </div>
                    
        )
    }
}

export default ExpenseTable