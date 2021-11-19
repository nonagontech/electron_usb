import React, { Component } from 'react'
import {
  Input,
  Button,
  message

} from 'antd';

import './resetPassword.less'
import mellaLogo from '../../../assets/images/mellaLogo.png'
import temporaryStorage from '../../../utils/temporaryStorage';
import { fetchRequest } from '../../../utils/FetchUtil1';

let storage = window.localStorage;
export default class ResetPassword extends Component {

  state = {
    hash: '',
    hash1: ''
  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')
  }
  componentWillUnmount () {
  }

  _continue = () => {
    console.log('点击了发送按钮')
    message.destroy()
    let { hash, hash1 } = this.state
    console.log(hash, hash1, hash !== hash1);
    if (!hash && !hash1) {

      message.error('Please enter a new password', 10)
      return
    }
    if (hash !== hash1) {
      message.error('The two passwords are inconsistent, please re-enter', 10)
      return
    }

    fetchRequest(`/user/resetPWD/${temporaryStorage.forgotUserId}/${hash}`, "GET", '')
      .then(res => {
        console.log('修改密码返回结果', res);
        if (res.flag === true) {
          let data = {
            email: temporaryStorage.forgotPassword_email,
            hash: this.state.hash
          }
          console.log(data);
          data = JSON.stringify(data)
          storage.signIn = data
          temporaryStorage.forgotPassword_email = ''
          temporaryStorage.forgotUserId = ''
          this.props.history.replace('/page11')
          // this.props.history.push('/page11')
        }
      })
      .catch(err => {
        console.log('err', err);
      })
  }

  render () {
    return (
      <div id="resetPassword">
        <div className="iconfont icon-left heard return" onClick={() => { this.props.history.goBack() }} />
        <div className="logo">
          <img src={mellaLogo} alt="" />
        </div>
        <div className="text">Reset Your<br />Password</div>

        <div className="inpF">
          <Input.Password className='inp'
            visibilityToggle={false}
            style={{ border: 'none', outline: 'medium' }}
            value={this.state.hash}
            placeholder='New Password'
            bordered={false}
            onChange={(item) => {
              let str = item.target.value
              this.setState({
                hash: str
              })
            }}
          />
          <Input.Password className='inp'
            visibilityToggle={false}
            style={{ border: 'none', outline: 'medium' }}
            value={this.state.hash1}
            placeholder='Re-Enter New Password'
            bordered={false}
            onChange={(item) => {
              let str = item.target.value
              this.setState({
                hash1: str
              })
            }}
          />
        </div>

        <div className="button1">
          <Button
            type="primary"
            shape="round"
            size='large'
            onClick={this._continue}
          >
            Continue
          </Button>

        </div>


      </div>
    )
  }
}