import React from 'react';
import PropTypes from 'prop-types';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav'
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link} from 'react-router-dom'

function FoodNav(props) {

  function navClick(event, form) { // handles clicks to display proper modal and logout if needed
    props.display_form(form)
    props.handle_toggle()
    if (form === '') {
      props.handle_logout()
    } 
    
  }

  const loggedinNav = (
    <Navbar  bg="light" expand="lg">
    <Navbar.Brand href="/">FoodBudget</Navbar.Brand>
    
    <Navbar.Collapse id="basic-navbar-nav">
    <Form inline style={{overflow:'hidden'}}>
       
          <Button onClick={(e) => {
            navClick(e, '')}} variant="info"
            > <Link to='./' style={{color: 'white'}}>Logout</Link>
            </Button>
        </Form>
      

      <Nav  className='ml-auto'>
        <img style={{height: '2em', width: '2em'}} src={require('./images/user.png')}/>
        <Nav.Item style={{padding: '5% 5% 0 10%'}}>{props.username}</Nav.Item>
        
      
      
      </Nav>
      
      </Navbar.Collapse>
  </Navbar>)

  const loggedoutNav = (
    <Navbar  bg="light" expand="lg">
    <Navbar.Brand href="/">FoodBudget</Navbar.Brand>
    
    <Navbar.Collapse id="basic-navbar-nav">
      
      
        <Button style={{marginRight: '1%'}}onClick={(e) => {
          navClick(e, 'login')}} variant="info">Login</Button>
        <Button onClick={(e) => {
          navClick(e, 'signup')}} variant="info">Signup</Button>
      
    </Navbar.Collapse>
  </Navbar>)

  return (
    <div>
      {props.logged_in ? loggedinNav : loggedoutNav
        }
    </div>
  );
}


export default FoodNav;

Nav.propTypes = {
  logged_in: PropTypes.bool.isRequired,
  
  handle_logout: PropTypes.func.isRequired
};