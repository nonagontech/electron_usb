import React, { Component } from 'react'
import {
  Input,
  Button,
  message

} from 'antd';

import './scanCodeLogin.less'
import mellaLogo from '../../../assets/images/mellaLogo.png'
import temporaryStorage from '../../../utils/temporaryStorage';
import { fetchRequest } from '../../../utils/FetchUtil1';
import { fetchRequest2 } from '../../../utils/FetchUtil2';

let storage = window.localStorage;
let flog = false
export default class ScanCodeLogin extends Component {

  state = {
    name: '',
    url: ''
  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')
    this.timer = setInterval(() => {
      this._getUser()
    }, 1000);
    console.log(this.props.history);
    let { name, url } = this.props.history.location.params
    this.setState({
      name,
      url
    })
  }
  componentWillUnmount () {
    this.timer && clearInterval(this.timer)
  }
  _getUser = () => {
    fetchRequest2(`/user/loginWithQRcode/${temporaryStorage.QRToken}`)
      .then(res => {
        console.log('-----：', res);
        if (res.flag === true) {
          switch (res.code) {
            case 10001:
              console.log('未扫码');
              flog = false
              this.props.history.goBack()

              break;

            case 11033:
              console.log('扫码未点击登录');
              flog = false
              // let { name, url } = res.data
              // if (name === this.state.name && url === this.state.url) {
              //   return
              // }
              // this.setState({
              //   name,
              //   url
              // })
              break;

            case 11023:
              console.log('过期');
              this.timer && clearInterval(this.timer)
              if (!flog) {
                this.props.history.replace('/page11')
              }


              break;
            case 20000:
              this.timer && clearInterval(this.timer)
              console.log('--------------成功');
              flog = true
              storage.userId = res.data.userId
              storage.roleId = res.data.roleId
              if (res.data.lastWorkplaceId) {
                storage.lastWorkplaceId = res.data.lastWorkplaceId
              } else {
                storage.lastWorkplaceId = ''
              }
              if (res.data.lastOrganization) {
                storage.lastOrganization = res.data.lastOrganization
              } else {
                storage.lastOrganization = ''
              }
              this.props.history.push('/uesr/selectExam')


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
    this.props.history.replace('/page11')

  }

  render () {
    return (
      <div id="scanCodeLogin">


        <div className="text">Need to confirm login on mobile phone</div>

        <div className="imgF">
          <img src={this.state.url} alt="" />
        </div>
        <p>{this.state.name}</p>
        <div className="success">Scan code completed</div>


        <div className="button1">
          <Button
            type="primary"
            shape="round"
            size='large'
            onClick={this._continue}
          >
            Cancel login
          </Button>

        </div>


      </div>
    )
  }
}