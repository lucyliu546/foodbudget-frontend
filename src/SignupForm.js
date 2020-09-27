import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/Modal'

class SignupForm extends React.Component {
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
          <Modal.Title>Signup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={e => this.props.handle_signup(e, this.state)}>
            
            <label htmlFor="username" style={{display:'block'}}>Username</label>
            <input
              style={{display:'block'}}
              type="text"
              name="username"
              value={this.state.username}
              onChange={this.handle_change}
            />
            <label htmlFor="password" style={{display:'block'}}>Password</label>
            <input
              style={{display:'block'}}
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handle_change}
            />
            <input type="submit" style={{marginTop: '2%'}}/>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default SignupForm;

SignupForm.propTypes = {
  handle_signup: PropTypes.func.isRequired
};