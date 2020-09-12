import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Redirect } from 'react-router';
import './index.css';
import LoginForm from './LoginForm.js';
import SignupForm from './SignupForm.js';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import FoodNav from './myNav.js'

import Home from './Home.js'
import Budgets from './Budget.js'
import AddExpenseBulk from './AddExpenseBulk';

class App extends Component {
	
	constructor() {
		super()
		this.state = {
			displayed_form: '',
			logged_in: localStorage.getItem('token') !== null ? true : false,
			username: '',
			userID: '',
			show: false,
			colorScheme: {'Bars': '#70c1b3',
						'Restaurants': '#c08497',
						'Grocery': '#ff70a6',
						'Dessert': '#FCAA67',
						'Fast Food': '#668586',
						'Coffee': '#a7bed3' 
					},
			icons: {
				'Bars': './images/cocktail.png',
				'Restaurants': './images/dinner-table (1).png',
				'Grocery': './images/food-delivery.png',
				'Dessert': './images/cake.png',
				'Fast Food': './images/fast-food.png',
				'Coffee': './images/coffee-bean.png'
				},
			budgets: ''

			}
		
		  };
	

	componentDidMount() {
		
		if (this.state.logged_in) {
			try{
				fetch('http://localhost:8000/current_user/', {
				headers: {
					Authorization: `JWT ${localStorage.getItem('token')}`
				}
				})
				.then(res => res.json())
				.then(json => {
					this.setState({ username: json.username, 
									userID: json.id,
									logged_in: json.username !== 'undefined' ? true : false });
				});
				} catch(error) {
					console.log(error)
					console.log(this.state)
				}
		  }
		}

	handle_login = (event, data) => {
		event.preventDefault();
		fetch('http://localhost:8000/token-auth/', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		  })
			.then(res => res.json())
			.then(json => {
			  localStorage.setItem('token', json.token);
			  this.setState({
				logged_in: json.user.username !== 'undefined' ? true: false,
				displayed_form: '',
				username: json.user.username,
				redirect: true
			  })
			})
	}

	handle_signup = (event, data) => {
		event.preventDefault();
		fetch('http://localhost:8000/users/', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json'
		  },
		  body: JSON.stringify(data)
		})
		  .then(res => res.json())
		  .then(json => {
			localStorage.setItem('token', json.token);
			this.setState({
			  logged_in: true,
			  displayed_form: '',
			  username: json.username
			});
		  });
	  };


	display_form = form => {
		this.setState({
		  displayed_form: form
		});
	};

	handle_logout = () => {
			localStorage.removeItem('token');
			this.setState({ }, window.location.reload())
			
		}

	handle_toggle = () => {
			this.setState(prevstate => ({
					show: !prevstate.show
			}))
		}

	handle_budget = (budget) => {
		this.setState({
			budget
		})
	}
	
	render() {

		
		let form;
		switch (this.state.displayed_form) {
		case 'login':
			form = <LoginForm handle_login={this.handle_login} handle_toggle = {this.handle_toggle}/>;
			break;
		case 'signup':
			form = <SignupForm handle_signup={this.handle_signup} handle_toggle = {this.handle_toggle}/>;
			break;
		default:
			form = null;
		} 

		return (
			<main>
				<FoodNav
						logged_in={this.state.logged_in}
						display_form={this.display_form}
						handle_logout={this.handle_logout}
						handle_toggle={this.handle_toggle}
					/>

				{this.state.show ? form : null}

				<Switch>
					<Route path="/" render={(props) => <Home {...props} 
						username = {this.state.username}
						logged_in = {this.state.logged_in}
						/>} exact >
							{this.state.redirect && <Redirect to ='/budgets'/>}
					</Route>
					
					<Route path="/budgets" render={(props) => <Budgets {...props} 
						colorScheme = {this.state.colorScheme}
						icons = {this.state.icons}
						userID = {this.state.userID}
						handle_budget = {this.handle_budget}
						/>}  />
					<Route path="/bulkaddexpenses" render={(props) => <AddExpenseBulk {...props} 
						colorScheme = {this.state.colorScheme}
						icons = {this.state.icons}
						userID = {this.state.userID}
						budgets = {this.state.budget}
						/>}  />
					<Route component ={Error} />
					
				</Switch>
			</main>
		)
	}
}

export default App