import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import axios from 'axios';

import Table from 'react-bootstrap/Table'

import moment from 'moment';
import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";
import Papa from 'papaparse';

class AddExpenseBulk extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      options: [],
      selectedFile: ''
      
    }
  }

  componentDidMount(){
    var options = {}
    if (this.props.budgets) {
      this.props.budgets.forEach(i => {
        options[i.bName] = i.bID})
    this.setState({
      options
        })
      
    } else {
        fetch(('http://localhost:8000/budgets/'
          ), {
                headers: {
                  Authorization: `JWT ${localStorage.getItem('token')}`
                }
              })
          .then(res => 
            res.json()
          )
          .then(json => {
            json.forEach(i => {
              options[i.bName] = i.bID})
            this.setState({ options
            })
          }) 
        }
  }
  

  handleChange = (i, e) => {
    var prev = this.state.results
    prev[i][this.state.numCols] = (e.target.value)
    this.setState({
        results:  prev
    })
  }

  onFileChange = event => {
    this.setState({
      selectedFile: event.target.files[0]
    })
  }

  onFileUpload = () => {
    // Update the formData object 
    Papa.parse(this.state.selectedFile,  {
      complete: (results) => {
        this.setState({
          results: results.data,
          numCols: results.data[0].length,
        }, this.dataCategorizer)
      }, 
      dynamicTyping: true
    });
    
  }

  dataCategorizer = () => {
    var dateCol = ''
    var amountCol = ''
    var nameCol = ''
    var amountRegex = /^((USD)?\$)?-?(?:\d+|\d{1,3}(?:,\d{3})*)(?:\.\d{1,2})?$/

    this.state.results[0].forEach(function (column, i) {
      if (dateCol === '' && Date.parse(column)) {
        dateCol = i
      }

      if (amountCol === '' && amountRegex.test(column) ) {
        amountCol = i
      }

      if (nameCol === '' && ( /[a-zA-Z]/g.test(column) && column !== null) ) {
        nameCol = i
      }
    })
    const results = this.state.results.map((result, i) => {
      result.push('')
      return result
    })
    
    this.setState({
      dateCol, amountCol, nameCol, results
      
      })
    
   
  }

  // Packages data after user clicks submit and posts to API
  handleSubmitExpenses = async() => {
    var toUploadData = []
    var errors = []
    for (const [i, newExpense] of this.state.results.entries()) {
      if (newExpense[this.state.numCols]=== '') {
        errors.push(i)
      }
      toUploadData.push({
        'eAmount': (newExpense[this.state.amountCol]).toString(),
        'eDate': moment(newExpense[this.state.dateCol], 'MM-DD-YYYY').format('YYYY-MM-DD'),
        'bID' : this.state.options[newExpense[this.state.numCols]],
        'eUser': this.props.userID,
        'eName': newExpense[this.state.nameCol]
      })
    }
    
    if (errors.length === 0) {
      const config = {
          headers: {
              Authorization: `JWT ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
              } 
      }
      await axios.post('http://localhost:8000/expenses/', 
          JSON.stringify(toUploadData),
          config
          
      )
      .then(response => {this.setState({
        selectedFile : '',
        results: '',
        amountCol: '',
        dateCol: '',
        nameCol: '',
        numCols: '',
        postOk: response
        })}
      )
      .catch((error) => {
          console.log(error)
      })
    }
     

    
  }


  render() {
    return (
      <div>
        
        <div style={{marginLeft: 'auto', marginRight: 'auto'}}>
          <h2>Upload a csv file of expenses ...</h2>

          <input type="file" onChange={this.onFileChange}/>
          <Button variant="primary" name='showExpensePopup' size="lg" onClick={this.onFileUpload} >
                    Upload
          </Button>
        </div>


        <div style = {{maxWidth: '85%', marginLeft: 'auto', marginRight: 'auto', marginTop: '3%'}}>
        <Table striped bordered hover size="sm"  > 
                        <thead>
                            <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Budget</th>
                            
                            
                            </tr>
                        </thead>
                    <tbody>

              {this.state.results? this.state.results.map((expense, i) => (
           

              
                <tr>
                    <td>{expense[this.state.dateCol]}</td>
                    <td>{expense[this.state.nameCol]}</td>
                    <td>${expense[this.state.amountCol]}</td>
                    
                    
                    <td>
                      <InputGroup className="mb-3">
                              <Form.Control as="select"
                              
                              
                              name='tempBudget'
                              onChange={(e) => this.handleChange(i, e)}
                              aria-label="budget"
                              aria-describedby="basic-addon1"
                              > 
                                  
                                  <option></option>
                                  {(Object.entries(this.state.options)).map(i => (
                                      <option  >
                                      {i[0]}
                                      </option>
                                  ))} 
                              </Form.Control>
                      </InputGroup>   
                    </td>
                </tr>
            ))
         : <h2>Upload a file to start categorizing expenses!</h2>}

                    </tbody> 
                    
                    

        </Table> 

        <Button variant="primary" name='Submit' size="lg" onClick={this.handleSubmitExpenses} >
                    Submit!
        </Button>        
        </div>
      </div>
    );
  }
}

export default AddExpenseBulk;

