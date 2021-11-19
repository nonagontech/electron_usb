import React, { Component } from 'react'
import {
  Input,
  Button,
  message

} from 'antd';

import './forgotPassword.less'
import mellaLogo from '../../../assets/images/mellaLogo.png'
import temporaryStorage from '../../../utils/temporaryStorage';
import { fetchRequest } from '../../../utils/FetchUtil1';

//num做超时处理
let num = 0
export default class ForgotPassword extends Component {

  state = {
    email: '',
    success1: false

  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')
    if (temporaryStorage.forgotPassword_email) {
      this.setState({
        email: temporaryStorage.forgotPassword_email
      })
    }
  }
  componentWillUnmount () {
    this.timer && clearInterval(this.timer)
  }

  _continue = () => {
    console.log('点击了发送按钮')
    message.destroy()

    fetchRequest(`/user/forgetPwd/${this.state.email}`, "GET", '')
      .then(res => {
        console.log('调用验证邮箱返回的数据', res);
        if (res.flag === true) {
          console.log('邮件发送成功,请注意查收')
          this.timer && clearInterval(this.timer)
          this.timer = setInterval(() => {
            num++
            if (num > 300) {
              message.error('The email is invalid, please click send again', 10)
              num = 0
              this.timer && clearInterval(this.timer)
            }
            this._validation()

          }, 1000);
          message.success('The email was sent successfully, please check it', 10)
        } else {
          console.log('邮件发送失败');
          message.error('The account does not exist', 10)
        }
      })
      .catch(err => {
        console.log('err', err);
      })
  }
  _validation = () => {

    fetchRequest(`/user/checkForgetPassword/${this.state.email}`, "GET", '')
      .then(res => {
        console.log('验证结果', res);
        if (res.flag === true) {
          temporaryStorage.forgotUserId = res.data.userId

          this.timer && clearInterval(this.timer)
          if (this.state.success1 === false) {
            this.setState({
              success1: true
            }, () => {
              console.log('跳转');
              this.props.history.push('/user/login/resetPassword')
            })
          }
          console.log('成功了');
        }
      })
      .catch(err => {
        console.log(err);
      })
  }

  render () {
    return (
      <div id="forgotPassword">
        <div className="iconfont icon-left heard return" onClick={() => { this.props.history.goBack() }} />
        <div className="logo">
          <img src={mellaLogo} alt="" />
        </div>
        <div className="text">
          Forgot Your Password?
        </div>
        <div className="text1">Please enter email and we</div>
        <div className="text1">will send you a link if there is an</div>
        <div className="text1">account associated with that address.</div>
        <div className="inpF">
          <Input className='inp'
            style={{ border: 'none', outline: 'medium' }}
            value={this.state.email}
            placeholder='rachel@friends.com'
            bordered={false}
            onChange={(item) => {
              let str = item.target.value
              this.setState({
                email: str
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
            SEND LINK
          </Button>

        </div>


      </div>
    )
  }
}