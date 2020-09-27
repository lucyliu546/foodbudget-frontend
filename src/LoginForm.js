import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/esm/ModalHeader';
import './App.css';

class LoginForm extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      username: '',
      password: ''
    };
  }

  handle_change = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState(prevstate => {
      const newState = { ...prevstate };
      newState[name] = value;
      return newState;
    });
  };

  render() {
    return (
      <Modal 
        style={{opacity:1}}
        animation = {false}
        show = {true}
        onHide={this.props.handle_toggle}
        backdrop='static'
        keyboard={false}
        backdropClassName = 'modalBackdrop'
      >
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={e => this.props.handle_login(e, this.state)} style={{display: 'block'}}>
            <label htmlFor="username" style={{display:'block'}}>Username</label>
            <input
              type="text"
              name="username"
              value={this.state.username}
              onChange={this.handle_change}
              style={{display:'block'}}
            />
            <label htmlFor="password" style={{display:'block'}}>Password</label>
            <input 
              style={{display:'block'}}
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handle_change}
            />
            <input type="submit" style={{marginTop: '2%'}} />
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default LoginForm;

LoginForm.propTypes = {
  handle_login: PropTypes.func.isRequired
};