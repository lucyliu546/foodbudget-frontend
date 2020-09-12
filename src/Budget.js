import React from 'react';
import {Component } from 'react';

import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Accordion from 'react-bootstrap/Accordion'
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'

import 'chartjs-plugin-datalabels';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CircularProgressWithLabel, { CircularProgressProps } from '@material-ui/core/CircularProgress';

import moment from 'moment';
import './index.css';
import axios from 'axios';
import FoodNav from './myNav.js'
import {Bar} from 'react-chartjs-2'
import AddBuget from './popups/AddBuget.js'
import DeleteBudget from './popups/DeleteBudget.js'
import ExpenseTable from './ExpenseTable.js';
import Select from '@material-ui/core/Select';
import DatePicker from "react-datepicker";

class Budgets extends Component {

  constructor(props) {
    super(props)
    this.state = {
    budgetData: [],
    expenseData: [],
    returnedData: false,
    clickAddBudget: false,
    clickDeleteBudget: false,
    individualexpenseData: [],
    showBudgets: false,
    currentBudget: 'Summary',
    dateFilterType: 'Monthly',
    filteredMonth: moment().format('MMMM'),
    filteredYear: moment().format('YYYY'),
    startDate: moment().year() + '-' + moment().format('MM') + '-01',
    endDate: moment().year() + '-' + moment().format('MM') + '-' + moment().daysInMonth()
    }
        
  }

  async componentDidMount() {
    await this.fetchData()
    
    this.onTrack()
    
  }

  
  // fetch budget data based on dates
  fetchData = async() => {

    
    await fetch((encodeURI('http://localhost:8000/budgets/?format=json&type=all&startdate='
      .concat((this.state.startDate).toString())
      .concat('&enddate='+ (this.state.endDate).toString())
      )), {
            headers: {
              Authorization: `JWT ${localStorage.getItem('token')}`
            }
          })
      .then(res => 
        res.json()
      )
      .then(json => {
        this.setState({ budgetData: json})
        this.props.handle_budget(json)
      }) 

// fetch expense data based on dates
    await fetch((encodeURI('http://localhost:8000/sumexpenses/?format=json&datetype='
      .concat((this.state.dateFilterType).toString()))), {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
        .then(res => 
          res.json()
        )
        .then(json => {
          var filtered = {}
                
          for (let key in json) {
            var currDate = moment(key, 'YYYY-MM-DD')
            if (currDate.isBetween(this.state.startDate, this.state.endDate, undefined, '[]')) {
              filtered[key] = json[key]
            }
          } 
          json = this.state.dateFilterType === 'Monthly' ? filtered: json
                
          var totalBudget = this.state.budgetData.reduce((acc, t) => 
            t.bAmount !== null ? acc + parseFloat(t.bAmount): acc, 0
          )
          var totalExpenses = this.state.budgetData.reduce((acc, t) => 
            t.total_expenses !== null ? acc + parseFloat(t.total_expenses): acc, 0
          )
          this.setState({ expenseData: json,
                            totalBudget,
                            totalExpenses,
                            currentExpenseTotal: totalExpenses,
                            currentBudgetTotal: totalBudget,
                            percentage: Math.ceil(((totalExpenses/totalBudget) * 100)),
                            budgetToExpenseData: this.state.budgetData.reduce((totals, t) => {
                                totals[t.bName] = {'total_expenses': t.total_expenses, 'budget': t.bAmount}
                                return totals
                            } , {}),
                            chartData: this.state.chartData ? this.state.chartData : this.state.budgetData.map(budget => (Object.entries(this.state.expenseData).map(t => {

                              if (t[1][budget.bName]) {
                                 return t[1][budget.bName][0][0]
                             } else {
                                 return 0 
                             } 
                            })))      
                    })
			})
			await fetch((encodeURI('http://localhost:8000/sumexpenses/?format=json&type=all&startdate='
            .concat((this.state.startDate).toString()).concat('&enddate='+ (this.state.endDate).toString())
                )), {
				headers: {
				  Authorization: `JWT ${localStorage.getItem('token')}`
				}
			  })
				.then(res => 
					res.json()
				)
				.then(json => {
				  this.setState({ individualexpenseData: json,
								returnedData: true,
								
						})
        })

    }
  

  addBudgetClick = () => {
    this.setState(prevState => ({clickAddBudget: !prevState.clickAddBudget}))
  }

  deleteBudgetClick = e => {
    
    if (e) {
      e.preventDefault()
    }
    
    this.setState(prevState => ({clickDeleteBudget: !prevState.clickDeleteBudget}))
  }

  handleAddBudget = async(name, amount) => {
        const data = {bName: name, bAmount: amount, bUser: this.props.userID }
        const config = {
            headers: {
                Authorization: `JWT ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
                } 
        }
       await axios.post('http://localhost:8000/budgets/', 
            JSON.stringify(data),
            config
            
         )
        .catch((error) => {
            console.log(error)
        });

        this.fetchData()
        
  }
  
  onTrack = () => {
    if (moment(this.state.startDate).month() === moment().month()) {
      const daysPassed = moment().date()
      const dailyBudget = this.state.currentBudgetTotal/ moment().daysInMonth()
      const currentDailySpendRate = this.state.currentExpenseTotal / daysPassed
      const spendingOnTrack = currentDailySpendRate <= dailyBudget ? true : false
      this.setState({
        spendingOnTrack
      }) 
    }
  }
	
	changeBudget = (budget) => {
    
		this.setState({
            currentBudget: budget,
            currentExpenseTotal: budget === 'Summary' ? this.state.totalExpenses: this.state.budgetToExpenseData[budget].total_expenses,
            currentBudgetTotal: budget === 'Summary' ? this.state.totalBudget: this.state.budgetToExpenseData[budget].budget,
            percentage: budget === 'Summary' ? Math.ceil(((this.state.totalExpenses/this.state.totalBudget) * 100)) :
                Math.ceil(((this.state.budgetToExpenseData[budget].total_expenses / this.state.budgetToExpenseData[budget].budget) * 100)),
            chartData: budget ==='Summary'? 
                this.state.budgetData.map(budget => (Object.entries(this.state.expenseData).map(t => {
                  
                  if (t[1][budget.bName]) {
                    
                    return t[1][budget.bName][0][0]
                } else {
                    return 0 
                } 
            }
            )))
            : 
            (Object.entries(this.state.expenseData).map(t => {

                  if (t[1][budget]) {
                     return t[1][budget][0][0]
                 } else {
                     return 0 
                 } 
             }
             ))
		}, this.onTrack)
  }

  toggleBudgets = () => {
        this.setState(prevState => ({showBudgets: !prevState.showBudgets}))
  }
    
  handleChange = (name, value) => {
        
        value = (value instanceof Date) ?  moment(value).format("YYYY-MM-DD"): value
        this.setState({
			[name]: value
        }, 
            this.fetchData
        ) 
  }

  // order: sets new date => fetches date filtered date => updates chart to only show current budget
  handleDateChange = async(name, value) => {
    await this.setDate(name, value)
    await this.fetchData()
    this.changeBudget(this.state.currentBudget)
  }

  setDate = async(name, value) => {
    value = moment(value).format("YYYY-MM-DD")
    if (name === 'filteredMonth') {
      this.setState({
        dateFilterType: 'Monthly',
        filteredMonth: moment(value).format('MMMM'),
        startDate: value,
        endDate: moment(value).year()  + '-' + moment(value).format('MM') +  '-' + moment(value).daysInMonth()
      })
    } else {
      this.setState({
        dateFilterType: 'Annually',
        filteredYear: moment(value).format('YYYY'),
        startDate: moment(value).year() + '-01-01',
        endDate: moment(value).year()  + '-12-31' 
      })
    }
  }

  render() {
    
    // sets chart data 
    if (this.state.returnedData === true) {
            const months = {1: "January", 2:"February", 3:"March", 4:"April", 5:"May", 6:"June",
            7:"July", 8:"August", 9:"September", 10:"October", 11:"November", 12:"December"
          }
            var dates = this.state.dateFilterType === 'Annually' ? Object.keys(this.state.expenseData).map(k =>
              months[k]): Object.keys(this.state.expenseData)
            var data = {
                labels: dates, 
                datasets: []
            }   
            
             
            if (this.state.currentBudget === 'Summary') {
              
              this.state.budgetData.forEach((budget, i ) => {
                  data.datasets.push({
                      label: budget.bName,
                      data: this.state.chartData[i],
                      backgroundColor: (this.props.colorScheme[budget.bName]),
                      borderColor: this.props.colorScheme[budget.bName]
                  })
            })
            } else {
              
              data.datasets = [{
                label:this.state.currentBudget,
                data: this.state.chartData,
                backgroundColor: this.props.colorScheme[this.state.currentBudget]
              }]

            }
            
    }

    const addBudgetButton = this.state.budgetData && this.state.budgetData.length < 6 ? 
            < Card style={{marginBottom: '2%', backgroundColor:'white', 
                            color: 'white', minWidth: '85px', maxWidth: '85px', maxHeight: '85%', float: 'right'
                            , borderRadius: '25px'}}>
                
                <Button variant="outline-light"  block style={{height: '85%', fontSize: '25px', borderRadius: '25px'}}
                    onClick = {this.addBudgetClick}>
                         
                    <img style={{marginLeft: '1%', height: '2em', width: '2em'}} src={require('./images/plus.png')}/>
                </Button>        
            </Card> : <div></div>

        
        
		return(
      (this.state.chartData) ? 
        <div style={{display: 'flex', paddingLeft: '1%'}}> 

          {/* Sidebar for budgets */}
          <div style={{flex: '7%',  paddingTop: '0.7%',}}>
            <h2 style ={{marginBottom: '4%'}}> My Budgets</h2>
            <hr style={{height: '5', marginBottom: '5%'}}/>

            <CardGroup style={{marginTop: '3%'}}>
              <div className='budgetCard'>
                <Container style={{ }}>
                  {this.state.currentBudget === 'Summary' ? 
                    <Card style={{backgroundColor: "gray", color: 'white', minWidth: '350px', 
                    maxWidth: '350px', maxHeight: '85px', height: '80px', marginBottom: '4%'
                    }}
                      onClick={() => this.changeBudget('Summary')}>
                                <Card.Body style={{position: 'absolute', top: '50%', left: '50%',transform: 'translate(-95%, -50%)'}}>
                                <Card.Title style={{fontSize: '30px'}}>Summary</Card.Title>
        
                                </Card.Body>
                    </Card>
                    :
                  <Card style={{backgroundColor: "white",  minWidth: '350px', 
                                maxWidth: '350px', maxHeight: '85px', height: '80px', marginBottom: '4%', color: 'gray'
                                }}
                                  onClick={() => this.changeBudget('Summary')}>
                                            <Card.Body style={{position: 'absolute', top: '50%', left: '50%',transform: 'translate(-95%, -50%)'}}>
                                            <Card.Title style={{fontSize: '30px'}}>Summary</Card.Title>
                    
                                            </Card.Body>
                  </Card>

                              }
                </Container>
              </div>

        

              
                {this.state.budgetData.map((budget, i) => {

                  // different styling depending on if a user has clicked on a budget if/else
                  if (this.state.currentBudget === budget.bName) {
                      return (
                        <div key={i} style={{leftMargin: '2px', marginBottom: '3.5%', }}>
                          <Container style={{ maxHeight: '70px', height: '70px', leftMargin: '2px'}}>
                          <Row style={{backgroundColor: `${this.props.colorScheme[budget.bName]}`, margin: '0', maxHeight: '70px', height: '70px', lineHeight: '70px',
                                      minWidth: '350px', maxWidth: '350px', border: '1px solid #d4d4d4', borderRadius: '4px'}}>   
                            <Card style={{backgroundColor: `${this.props.colorScheme[budget.bName]}`, border: 'none',
                                           width: '90%', maxWidth: '90%', maxHeight: '100%', height: '100%'}}
                                        onClick={() => this.changeBudget(budget.bName)}>
                              
                                
                                <Col sm={12} style={{maxHeight: '70px', maxWidth:'', height: '70px', width: '', paddingLeft: '0.1px', paddingRight: '0px'}}>
                                  <hr style={{float: 'left', background: `${this.props.colorScheme[budget.bName]}`, height: '97%', 
                                        width: '5%', paddingBottom: '0', margin: '0', borderRadius: '2px'}}/>
                                  <Card.Img  src={require(`${this.props.icons[budget.bName]}`)} 
                                    style={{maxHeight:'98%', maxWidth:'30%', background: '#f2f2f2', opacity: '70%', float: 'left',
                                          paddingLeft: '1.5%', marginBottom: '6%'
                                          }} /> 
                                
                                
                                  <Card.Body style={{padding: '0', maxWidth: '50%', width:'50%', float: 'left', maxHeight: '100%'}}>
                                    <Card.Title style={{marginLeft: '7%', marginTop: '15%', marginBottom: '25%', color: 'white', fontSize: '22px'}}>{budget.bName}</Card.Title>
                                  </Card.Body>
                                </Col>
                
                            </Card>

                            <Col sm={2} style={{maxWidth: '10%', padding: '0'}}>
                                  {this.props.currentBudget !== 'Summary' ? 
                                          <Dropdown style={{transition: 'none'}} 
                                              >
                                          <Dropdown.Toggle id="dropdown-basic" style={{ display: 'inline-block', padding: '0', maxWidth: '100%',
                                                    backgroundColor: `${this.props.colorScheme[budget.bName]}`, transition: 'none',
                                                    outlineColor: `${this.props.colorScheme[budget.bName]}`, borderColor: `${this.props.colorScheme[budget.bName]}`,}}>
                                          <img style={{marginLeft: '1%', marginRight: '2%', height: '2em',  
                                                    display: 'inline-block', transform: 'rotate(90deg)', opacity: '40%'}} src={require('./images/more.png')}/>
                                          </Dropdown.Toggle>
                                          
                                          <Dropdown.Menu 
                                            style={{backgroundColor: 'white', transition: 'none'}}>
                                            
                                            <Dropdown.Item onClick={e => {this.deleteBudgetClick(e); this.handleChange('budgetToDelete', budget.bID)}}>Delete Budget</Dropdown.Item>
                                          </Dropdown.Menu>
                                        </Dropdown>  : null} 
                                </Col>
                                </Row>
                          </Container>
                        </div>) } else {
                                    return (
                                      <div key={i} style={{leftMargin: '2px', marginBottom: '3.5%'}}>
                                      <Container style={{ maxHeight: '70px', height: '70px', leftMargin: '2px'}}>
                                      <Row style={{margin: '0', maxHeight: '70px', height: '70px', lineHeight: '70px',
                                                  minWidth: '350px', maxWidth: '350px', border: '1px solid #d4d4d4', borderRadius: '4px'}}>   
                                        <Card style={{backgroundColor: 'white', border: 'none',
                                                      color: 'white', width: '90%', maxWidth: '90%', maxHeight: '100%', height: '100%'}}
                                                    onClick={() => this.changeBudget(budget.bName)}>
                                          
                                            
                                            <Col sm={12} style={{maxHeight: '70px', maxWidth:'', height: '70px', width: '', paddingLeft: '0.1px', paddingRight: '0px'}}>
                                              <hr style={{float: 'left', background: `${this.props.colorScheme[budget.bName]}`, height: '97%', 
                                                    width: '5%', paddingBottom: '0', margin: '0', borderRadius: '2px'}}/>
                                              <Card.Img  src={require(`${this.props.icons[budget.bName]}`)} 
                                                style={{maxHeight:'98%', maxWidth:'30%', background: '#f2f2f2', opacity: '70%', float: 'left',
                                                      paddingLeft: '1.5%', marginBottom: '6%'
                                                      }} /> 
                                            
                                            
                                              <Card.Body style={{padding: '0', maxWidth: '50%', width:'50%', float: 'left', maxHeight: '100%'}}>
                                                <Card.Title style={{marginLeft: '7%', marginTop: '15%', marginBottom: '25%', color: 'gray', fontSize: '22px'}}>{budget.bName}</Card.Title>
                                              </Card.Body>
                                            </Col>
                            
                                        </Card>
            
                                        <Col sm={2} style={{maxWidth: '10%', padding: '0'}}>
                                              {this.props.currentBudget !== 'Summary' ? 
                                                      <Dropdown  
                                                          >
                                                      <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: 'white', 
                                                          outlineColor: 'white', borderColor: 'white', display: 'inline-block', padding: '0', maxWidth: '100%'}}>
                                                      <img style={{marginLeft: '1%', marginRight: '2%', height: '2em', 
                                                                display: 'inline-block', transform: 'rotate(90deg)', opacity: '40%'}} src={require('./images/more.png')}/>
                                                      </Dropdown.Toggle>
                                                      
                                                      <Dropdown.Menu>
                                                        
                                                        <Dropdown.Item as='button' onClick={e => {this.deleteBudgetClick(e); this.handleChange('budgetToDelete', budget.bID)}}>Delete Budget</Dropdown.Item>
                                                      </Dropdown.Menu>
                                                    </Dropdown>  : null} 
                                            </Col>
                                            </Row>
                                      </Container>
                                    </div>)
                                  }
                }
              ) }

						{/* Add budget button */}
                  <Container>
                    {addBudgetButton}
                  </Container>      
                </CardGroup>
            
          

          </div>


          
          {/* <div style={{flex: '3%',}}>
            
            <hr style={{background: '#e8e8e8', height: '100%', width: '4%', paddingTop: '0', marginTop: '0'}}></hr>
          </div> */}

          {/* Main content for graph/table */}
          <div style={{flex: '80%', paddingTop: '0.7%', backgroundColor: '#ededed', opacity: '0.9', minHeight: '100vh'}}>       
                    <Container style={{ display:'inline-block', margin: 'auto auto 1.5% auto'}}>

                    <h2 style={{display: 'block', width: '20%'}}>{this.state.currentBudget}</h2>
                      {/* dropdown for annually/monthly */}
                    <Dropdown style={{transition: 'none'}}>
                      <Dropdown.Toggle id="dropdown-basic" title='hello' style={{ display: 'inline-block', padding: '0', maxWidth: '100%',
                                        backgroundColor: 'white', color: 'gray', borderStyle: 'none'}}>
                        {this.state.dateFilterType}
                      </Dropdown.Toggle>
                                          
                      <Dropdown.Menu style={{backgroundColor: 'white', transition: 'none'}}>
                        <Dropdown.Item onClick={() => 
                          {this.handleDateChange('filteredYear', this.state.startDate); }}>
                              Annually
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => {this.handleDateChange('filteredMonth', this.state.startDate)} }>Monthly</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                    {/* dropdown for specific month/year */}
                    {this.state.dateFilterType === 'Monthly' ? 
                    <DatePicker
                    value={this.state.filteredMonth}
                    
                    dateFormat = 'MM'
                    showMonthYearPicker
                    onChange={( e) => this.handleDateChange('filteredMonth', e)}
                    popperPlacement="bottom"
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

                    : 

                    <DatePicker
                      value={this.state.filteredYear}
                      
                      dateFormat = 'yyyy'
                      showYearPicker
                      onChange={( e) => this.handleDateChange('filteredYear', e)}
                      popperPlacement="bottom"
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
                    }
                    </Container>
                

                {/* bar chart  */}
                <div style = {{ position: 'relative',  marginLeft: '1.5%', padding: '1% 1.5% 1% 1%',
                    marginRight: '1.5%', backgroundColor: 'white', borderRadius: '10px'}}>
                  
                  
                    <Bar
                    data = {data}
                    height = {'65%'}
                    options = {{
                        /* responsive: true,
                        maintainAspectRatio: true, */
                        title: {
                            display: false,
                            text: 'Food Budgets'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        scales: {
                            xAxes: [{
                                stacked: true,
                            }],
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    callback:  (value, index, values) => {
                                        return '$' + value; } 
                                    
                                    
                                },
                                stacked: true
                            }]
                        },
                        plugins: {
                          datalabels: {
                            display: false,
                            color: 'white'
                         }
                        }
                        /* tooltips: {
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    return '$' + data.datasets[0].data[tooltipItem.index] ;
                                }
                            }
                        }, */
                        
                    }}
                    
                    /> 
                  
                  
                </div> 
                <div> 
                    <ExpenseTable style={{display: 'inline-block'}} 
                        individualexpenseData={this.state.individualexpenseData}
                        currentBudget={this.state.currentBudget}
                        budgetData={this.state.budgetData}
                        userID = {this.props.userID}
                        spendingOnTrack = {this.state.spendingOnTrack}
                        dateFilterType = {this.state.dateFilterType}
                        fetchData = {this.fetchData}
                        handleChange={this.handleChange}
                        colorScheme={this.props.colorScheme}
                        percentage = {this.state.percentage}
                        currentBudgetTotal = {this.state.currentBudgetTotal}
                        currentExpenseTotal = {this.state.currentExpenseTotal}
                        />	
				        </div>

				{/* Add budget popup once button is clicked*/}
                {this.state.clickAddBudget ? <AddBuget addBudgetClick = {this.addBudgetClick} budgetData={this.state.budgetData} handleAddBudget = {this.handleAddBudget}/>: null}
        
        {/* Delete budget popup once button is clicked */}

                {this.state.clickDeleteBudget ? <DeleteBudget 
                          deleteBudgetClick = {this.deleteBudgetClick} budgetToDelete = {this.state.budgetToDelete}
                          fetchData = {this.fetchData}/> : null}

                Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
        </div></div> 
            
      : <div></div> // return empty div if data has not been loaded 
		)
    }

}

export default Budgets