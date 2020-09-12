import React from 'react';
import './App.css';
import {Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


class Home extends Component {
	constructor(props) {
	  super(props);
	}
	render() {
		return(
			<div>
				<div className='App'>
					

					<h3>
						{this.props.logged_in
						? `Hello, ${this.props.username}`
						: 'Please Log In'} 
					</h3>
				</div>
				
				
			</div>
		)
	}

}

export default Home