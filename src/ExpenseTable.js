import React from 'react';
import {Component } from 'react';
import {Link} from "react-router-dom";

import Table from 'react-bootstrap/Table'
import "react-datepicker/dist/react-datepicker.css";
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
import Modal from 'react-bootstrap/Modal'
import DatePicker from "react-datepicker";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Overlay from 'react-bootstrap/Overlay'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import PopoverContent from 'react-bootstrap/PopoverContent'

import ClickAwayListener from '@material-ui/core/ClickAwayListener';

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
            editBudget: false,
            currentAnnualBudgetTotal: (this.props.currentBudgetTotal * 12).toLocaleString()
            
            
            
        }
    }

    componentDidMount() {
        var options = {}
        document.addEventListener('mousedown', this.handleClickOutside);
        this.props.budgetData.forEach((budget, i ) => {
            options[budget.bName] = budget.bID
           
        
        })

      this.setState({
          options: options,
         
          
          
      })
    }

    componentWillUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
  }


    handleClickAway = () => {
      this.setState({
        editBudget: false,
        editExpenseID: '',
        showEditExpensePopup: false
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
            tempBudgetAmount: '',
            showEditExpensePopup: false,
           
        
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

    saveBudgetClick = async(e) => {
      if (e.charCode === 13) {  //check if enter key is pressed
        this.handleChange('editBudget', e)
        const self = this;
        const bID = this.state.options[this.props.currentBudget]
        const data = {
                bName : this.props.currentBudget,
                bAmount : this.state.tempBudgetAmount,
                bID,
                bUser: this.props.userID}
        console.log(data)
        const config = {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
                } 
        }
        await axios.put((encodeURI("http://localhost:8000/budgets/"
        .concat((bID).toString() + '/')
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
            console.log(k, e)
            if (e.target) {
              var {name, value} = k === 'editBudget' ? {name: k, value: ! this.state.editBudget} : e.target
            } else {
              var {name , value} = {name: "tempDate", value: moment(e).format("YYYY-MM-DD")}
              this.handleToggle()
            }
            
            
            this.setState({
                [name] : value
            })
    }

    handleToggle = () => {
      this.setState(prevState => ({showEditExpensePopup: !prevState.showEditExpensePopup}))
    }

    

    render(){

        const addExpenseButton = <Button variant="primary" name='showExpensePopup' size="lg" onClick={this.addExpenseClick} block >
                Add Expenses 
                <img style={{marginLeft: '1%', height: '1em'}} src={require('./images/plus.png')}/>
            </Button>
        
        const bulkAddExpenseButton = <Button variant="secondary" style={{marginTop: '1%'}} name='showBulkPopup' size="md" onClick={this.addExpenseClick}>
        Bulk Upload with CSV 
        </Button>

        const expenseDateEditPopover = 
            
            <Popover id="popover-basic">
            
            <Popover.Content>
              <DatePicker
                      value={moment(this.state.tempDate).format("YYYY-MM-DD")}
                      name = 'tempDate'
                      
                      onChange = {(e) => this.handleChange(this.state.editExpenseID, e[0])}
                      aria-label="eDate"
                      aria-describedby="basic-addon1"
                      selectsRange
                      inline
                      popperModifiers={{
                      flip: {
                          behavior: ["bottom"] // don't allow it to flip to be above
                      },
                      preventOverflow: {
                          enabled: false // tell it not to try to stay within the view (this prevents the popper from covering the element you clicked)
                      },
                      hide: {
                          enabled: false // turn off since needs preventOverflow to be enabled
                      }
                      }}
                      />
            </Popover.Content>
          </Popover>
            

        const summaryPage = this.props.individualexpenseData ? Object.entries(this.props.individualexpenseData).map(budget => (
            budget[1].map(expenses => (
                Object.entries(expenses).map( ([k, expense]) => (
                
                expense.eID === this.state.editExpenseID ? 
                <tr style={{maxHeight: '48px', height: '45px'}}>
                    <td style={{marginLeft: '5%'}}>
                            <OverlayTrigger
                              placement="bottom"
                              delay={{ show: 250, hide: 400 }}
                              overlay={expenseDateEditPopover}
                              show = {this.state.showEditExpensePopup}
                            >
                              <InputGroup className="mb-3">
                                  <Form.Control
                                      value= {this.state.tempDate}
                                      name='tempName'
                                      onClick={(e) => this.handleToggle()}
                                      aria-label="budget"
                                      aria-describedby="basic-addon1"
                                  /> 
                              </InputGroup>
                            </OverlayTrigger> 
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
                <tr style={{maxHeight: '48px', height: '45px'}}>
                    <td style={{maxHeight: '48px', height: '45px'}}>{expense.eDate}</td>
                    <td style={{maxHeight: '48px', height: '45px'}}>{expense.eName}</td>
                    <td style={{maxHeight: '48px', height: '45px'}}>${expense.eAmount}</td>
                    
                    {this.props.currentBudget === 'Summary' ? <td>{budget[0]}</td> : null }
                    <td style={{maxHeight: '48px', height: '45px'}}>
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
                    <ClickAwayListener onClickAway={this.handleClickAway}>
                      <tr>
                          <td style={{marginLeft: '5%'}}>
                            <OverlayTrigger
                              placement="bottom"
                              delay={{ show: 250, hide: 400 }}
                              overlay={expenseDateEditPopover}
                              show = {this.state.showEditExpensePopup}
                            >
                              <InputGroup className="mb-3">
                                  <Form.Control
                                      value= {this.state.tempDate}
                                      name='tempName'
                                      onClick={(e) => this.handleToggle()}
                                      aria-label="budget"
                                      aria-describedby="basic-addon1"
                                  /> 
                              </InputGroup>
                            </OverlayTrigger> 
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
                      </ClickAwayListener>
                    :
                        <tr style={{maxHeight: '48px', height: '45px'}}>
                            <td style={{maxHeight: '48px', height: '45px'}}>{expense.eDate}</td>
                            <td style={{maxHeight: '48px', height: '45px'}}>{expense.eName} </td>
                            <td style={{maxHeight: '48px', height: '45px'}}>${expense.eAmount} </td>
                            
                            <td style={{maxHeight: '48px', height: '45px', maxWidth: '100px', width: '100px', minWidth: '100px',  }}>
                              <div style={{maxWidth: '100px', width: '100px', minWidth: '100px', display: 'flex', justifyContent: 'center'}}>
                                <Button variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                    onClick = {() => this.editExpenseClick(expense.eID, k)}>
                                <img style={{height: '1em'}} src={require('./images/pencil.png')}/>

                                </Button>

                                <Button 
                                    variant="light" style={{marginLeft: '2%', marginRight: '2%'}}
                                    onClick = {() => this.deleteExpenseClick(expense.eID)}>
                                <img style={{marginLeft: '1%', marginRight: '2%', height: '1em'}} src={require('./images/cross.png')}/>
                                </Button>
                                </div>
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
                            {!this.state.editBudget  ? 
                              <Col className='card-col-2' style={{height: '100%', display: 'flex', alignContent: 'center'}} 
                              id= {this.props.currentBudget !== 'Summary' && this.props.dateFilterType === 'Monthly' ? 'editBudget' : ''} name='editBudget' 
                              onClick={(this.props.currentBudget !=='Summary' && this.props.dateFilterType === 'Monthly') && (e => this.handleChange('editBudget', e))}>
                                          
                                            <Card.Text 
                                              style={{padding: '0', margin: '0'}}
                                              className='editNumber'>${this.props.dateFilterType === 'Monthly' ? this.props.currentBudgetTotal.toLocaleString() : (this.props.currentBudget === 'Summary' ? 
                                                this.props.currentBudgetTotal.toLocaleString() : (this.props.currentBudgetTotal * 12).toLocaleString())}
                                            </Card.Text>
                                          

                                          <div className='editImg'>
                                            <img style={{ height: '3em'}} src={require('./images/edit.png')}/>
                                          </div>
                                         
                              </Col>
                              : 
                              <ClickAwayListener onClickAway={this.handleClickAway}>
                                <Col className='card-col-2' style={{height: '100%', width: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}  name='editBudget' >
                                  <InputGroup className="mb-3" style={{maxWidth: '90%'}}>
                                    <Form.Control
                                    value= {this.state.tempBudgetAmount}
                                    name='tempBudgetAmount'
                                    onChange = {(e) => this.handleChange(true, e)}
                                    aria-label="bAmount"
                                    aria-describedby="basic-addon1"
                                    onKeyPress = {this.saveBudgetClick}
                                    style={{}}
                                    
                                    />
                                  </InputGroup>
                                  
                                </Col>
                                </ClickAwayListener>  
                            }
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
                            <Col className='card-col-2' style={{height: '100%'}}>
                              <Card.Text style={{fontSize: '3vmin' ,width:'min-content',  maxWidth: '100%'}}>${this.props.currentExpenseTotal.toLocaleString(undefined, {maximumFractionDigits:2})}</Card.Text>
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
                              <Card.Title style={{fontSize: '1.25vw' ,width:'min-content', height: 'min-content'}}>{(this.props.dateFilterType === 'Monthly' && moment(this.props.startDate).month() === moment().month()) || (this.props.dateFilterType === 'Annually' && moment(this.props.startDate).year() === moment().year())  ? 'On Track' : 'Met Budget'}?</Card.Title>
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
                    
                  <div style={{backgroundColor: 'white', padding: '0.1% 0.2% 0% 0.2%',  maxWidth: '96%', marginLeft: 'auto', marginRight: 'auto'}}>
                    
                    <div style={{maxHeight: '600px', overflowY: 'scroll', position: 'relative'}}>
                      <Table striped bordered hover size="sm" style={{ fontSize: '2vmin', overflow: 'visible'}} > 

                          <thead>
                              <tr>
                              <th >Date</th>
                              <th>Name</th>
                              <th>Amount</th>
                              
                              {this.props.currentBudget === 'Summary' ? <th>Budget</th> : null} 
                              <th style={{maxWidth: '105px', width: '105px', minWidth: '105px'}}></th>
                              </tr>
                          </thead>
                      <tbody>

                      {this.props.currentBudget !== 'Summary' ? individualPage : summaryPage} 

                      </tbody> 
                      
                      {/* Add expenses buttons */}

                      </Table>
                    </div>
                    {addExpenseButton }
                    <Link to='/bulkaddexpenses'> 
                        {bulkAddExpenseButton}
                    </Link>
                  </div>
                  
                    {this.state.showExpensePopup ? 
                        <AddExpense 
                            budgetData = {this.props.budgetData}
                            currentBudget={this.props.currentBudget}
                            addExpenseClick = {this.addExpenseClick} 
                            userID = {this.props.userID}
                            fetchData = {this.props.fetchData}/> :null }

                    
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