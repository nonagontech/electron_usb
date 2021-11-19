import React, { Component } from 'react'
import { Input, Button, message, } from 'antd';
import { createFromIconfontCN, SyncOutlined } from '@ant-design/icons';

import './signIn.less'
import mellaLogo from './../../assets/images/mellaLogo.png'
import dui from './../../assets/images/dui.png'
import facebook from './../../assets/images/facebook.png'
import google from './../../assets/images/google.png'
import apple from './../../assets/images/apple.png'
import { fetchRequest } from './../../utils/FetchUtil1'
import { fetchRequest2 } from './../../utils/FetchUtil2'
import temporaryStorage from '../../utils/temporaryStorage';
import { fetchRequest1 } from '../../utils/FetchUtil';
let storage = window.localStorage;
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})
let num = 0
export default class SignIn extends Component {

  state = {
    isRemember: false,
    email: '',
    hash: '',
    isCode: false,
    baseUrl: '',
    QRToken: '',
    isExpired: false   //二维码是否过期

  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')
    console.log('--', storage.signIn, '---', storage.signIn === undefined);
    // storage.signIn = ''
    if (storage.signIn !== undefined && storage.signIn !== '') {
      let data = storage.signIn
      data = JSON.parse(data)
      this.setState({
        email: data.email,
        hash: data.hash,
        QRToken: ''
      })
    }
    if (storage.isRemember !== undefined) {
      switch (storage.isRemember) {
        case 'true': this.setState({ isRemember: true }); break;
        case 'false': this.setState({ isRemember: false }); break;
        default: console.log('莫得');
      }
    }
    // this._getQRCode()

  }
  componentWillUnmount () {
    this.timer && clearInterval(this.timer)
  }
  _getQRCode = () => {
    num = 0
    fetchRequest2('/user/getLoginQRcode', "GET", '')
      .then(res => {
        message.destroy()
        console.log('---获取二维码', res);
        if (res.flag === true) {
          this.setState({
            baseUrl: res.data.QRcode,
            QRToken: res.data.QRToken
          })
          this.timer = setInterval(() => {
            num++
            console.log('lunxin');
            this._polling()

            if (num > 280) {
              this.setState({
                isExpired: true
              })
              num = 0
              this.timer && clearInterval(this.timer)
            }
          }, 1000);
        } else {
          message.error('Failed to obtain QR code', 10)
        }
      })
      .catch(err => {
        message.error('Failed to obtain QR code', 10)
        console.log(err);
      })
  }
  _polling = () => {
    fetchRequest2(`/user/loginWithQRcode/${this.state.QRToken}`)
      .then(res => {
        console.log('轮询结果：', res);
        if (res.flag === true) {
          switch (res.code) {
            case 10001:
              console.log('未扫码');

              break;

            case 11033:
              console.log('扫码未点击登录');
              this.timer && clearInterval(this.timer)
              temporaryStorage.QRToken = this.state.QRToken
              let { name, url } = res.data
              this.props.history.replace({ pathname: '/user/login/scanCodeLogin', params: { name, url } })

              break;

            case 11023:
              console.log('过期');
              this.setState({
                isExpired: true
              })
              num = 0
              this.timer && clearInterval(this.timer)

              break;

            default:
              break;
          }
        }
        console.log('code', res.code);
      })
      .catch(err => {
        console.log(err);
      })
  }



  _continue = () => {
    const { email, hash, isRemember } = this.state

    message.destroy()
    let params = {
      email: email.replace(/(^\s*)/g, ""),
      hash,
      identityTypeId: '1'
    }
    if (email === '') {
      message.error('please input your email')
      return
    }
    if (hash === '') {
      message.error('please input your password')
      return
    }
    console.log(params);
    fetchRequest('/user/mellaLogin', 'POST', params)
      .then(res => {
        console.log(res);
        if (res.status && res.status === 404) {
          message.error('system error');
          return
        }
        if (res.code === 10001 && res.msg === '账号错误') {
          message.error('Account error');
          return
        }
        if (res.code === 10002 && res.msg === '密码错误') {
          message.error('wrong password')
          return;
        }
        if (res.code === 0 && res.msg === 'success' && res.success.roleId === 1) {
          message.error('You do not have the authority of a doctor, please contact the administrator or customer service', 10)
          return
        }

        if (res.code === 0 && res.msg === 'success') {
          console.log('账号密码正确，登录进去了');
          storage.userId = ''
          if (isRemember === true) {
            let data = {
              email: email.replace(/(^\s*)/g, ""),
              hash
            }
            data = JSON.stringify(data)
            console.log(data);
            storage.signIn = data
          } else {
            storage.signIn = ''
          }
          storage.userId = res.success.userId
          storage.roleId = res.success.roleId
          if (res.success.lastWorkplaceId) {
            storage.lastWorkplaceId = res.success.lastWorkplaceId
          } else {
            storage.lastWorkplaceId = ''
          }
          this.props.history.push('/uesr/selectExam')
        }
      })
      .catch(err => {
        console.log(err);
      })


  }
  _signUp = (e) => {
    e.preventDefault();
    this.props.history.push('/uesr/logUp/VetPrifile')
  }
  _change = () => {
    let { isCode } = this.state
    message.destroy()
    if (isCode === false) {
      this._getQRCode()
    } else {
      this.timer && clearInterval(this.timer)
      num = 0
      this.setState({
        isExpired: false
      })
    }
    this.setState({ isCode: !this.state.isCode })
  }
  _qrCode = () => {
    let { isCode, baseUrl, isExpired } = this.state
    if (!isCode) {
      return (<>
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
          <Input.Password className='inp'
            visibilityToggle={false}
            style={{ border: 'none', outline: 'medium' }}
            value={this.state.hash}
            placeholder='********'
            bordered={false}
            onChange={(item) => {
              let str = item.target.value
              this.setState({
                hash: str
              })
            }}
          />
        </div>
        <div className="stay">
          <div className="remember">
            <p>Stay Signed In</p>
            <div className="box" onClick={() => {
              let { isRemember } = this.state
              this.setState({
                isRemember: !isRemember
              })
              storage.isRemember = !isRemember

            }}>
              {this.state.isRemember && <img src={dui} alt="" />}
            </div>
          </div>
          <div className="forgot"
            onMouseDown={() => {
              let forget = document.querySelectorAll('#signIn .forgot')
              forget[0].style.opacity = 0.5
            }}
            onMouseUp={() => {
              document.querySelectorAll('#signIn .forgot')[0].style.opacity = 1
              if (this.state.email) {
                temporaryStorage.forgotPassword_email = this.state.email
              }

              this.props.history.push('/user/login/forgotPassword')
            }}
          >Forgot?</div>
        </div>

        <div className="button">
          <Button
            type="primary"
            shape="round"
            size='large'
            onClick={this._continue}
          >
            CONTINUE
          </Button>

        </div>

        <div className="text2">
          <p>Do not have an account? <a href="#" onClick={this._signUp}>Sign Up</a></p>
        </div>
      </>)
    } else {
      if (!isExpired) {
        return (
          <div className="qrcode">
            <img src={`data:image/jpeg;base64,${baseUrl}`} alt="" style={{ opacity: '1' }} />


          </div>
        )
      } else {
        return (
          <div className="qrcode">
            <img src={`data:image/jpeg;base64,${baseUrl}`} alt="" style={{ opacity: '0.1' }} />

            <div className="err">
              <div className="errText">QR code has expired</div>
              <div className="btn" onClick={this.refresh}>Refresh</div>
            </div>
          </div>
        )
      }
    }
  }
  refresh = () => {
    this.setState({
      isExpired: false
    })
    num = 0
    this._getQRCode()

  }

  render () {
    let { isCode, baseUrl } = this.state
    let code = isCode ? 'icon-diannao-copy' : 'icon-erweima-copy'
    return (
      <div id="signIn">
        <div className="iconfont icon-left heard return" onClick={() => { this.props.history.push('/') }} />
        <div className="logo">
          <img src={mellaLogo} alt="" />
        </div>
        <div className="body" style={{ position: 'relative' }}>
          <div className="text">
            {!isCode ? 'Please enter email and password' : 'Mobile phone scan code login'}
          </div>
          <div className="iconBox"
            onClick={this._change}
          >
            <MyIcon type={code} className="icon " style={{ color: '#e1206d' }} />
          </div>
          {
            this._qrCode()
          }


        </div>


        <div className="other">
          <div className='line' /> <span>or sign up via</span>  <div className='line' />
        </div>

        <div className="foot">
          <img src={google} alt="" />
          <img src={facebook} alt="" />
          <img src={apple} alt="" />
        </div>

      </div>
    )
  }
}