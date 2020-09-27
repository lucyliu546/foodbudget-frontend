import React from 'react';
import './App.css';
import {Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Jumbotron from 'react-bootstrap/Jumbotron'
import Button from 'react-bootstrap/Button';
import bgimage from './images/background.jpg'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

class Home extends Component {
	constructor(props) {
	  super(props);
	}

	navClick = (event, form) => { // handles clicks to display proper modal and logout if needed
		this.props.display_form(form)
		this.props.handle_toggle()
		if (form === '') {
		  this.props.handle_logout()
		} 
		
	  }

	render() {
		return(
			<div>
				<div className='App' style={{mihHeight: '100%'}}>
					
				<Jumbotron style={{minHeight: '60vh', backgroundImage: `url(${bgimage})`, backgroundSize: 'cover', backgroundPosition: '50% 35%',
					display: 'flex', justifyContent: 'center', opacity: '1', backgroundColor: 'black',
					}}>
					<div style={{width: '100%', marginTop: '4%'}}><h1 style={{color: 'white', fontSize: '6vh'}}>Want more clarity on your food expenses?</h1>
					<div style={{justifyContent: 'center', display: 'flex'}}>
					<Button variant="light" style={{fontSize: '2.5vh', marginTop: '2%'}} onClick={(e) => {
          			this.navClick(e, 'signup')}}>
						Create an account now to get started!
					</Button>
					
					</div>
					</div>
				</Jumbotron>
				<div>
				<Container>
				<Row>
					<Col><img style={{marginLeft: '1%', height: '100%', width: '100%'}} src={require('./images/exampleChart.png')}/></Col>
					<Col style={{display: 'flex', justifyContent: 'flex-start'}}>
						<div style={{width:'100%', textAlign: 'left'}}>
							<h3 style={{fontSize: '5vh',marginBottom: '2%', color: 'gray'}}>Responsive Budgets</h3> 
							<p style={{fontSize: '3vh', color: '#999999'}}>Get a breakdown of different types of 
							food expenses for better spend management</p>
							<p style={{fontSize: '1.5vh', color: '#999999'}}>you may be shocked at how much you actually spend on coffee 😏</p>
						</div>
					</Col>
				</Row>
				</Container>
				</div>
				</div>
				
				
			</div>
		)
	}

}

export default Home