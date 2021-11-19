import React, { Component } from 'react'
import {
  Button,
} from 'antd';
import 'antd/dist/antd.css';
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import dui from './../../assets/images/dui.png'

import './selectMella.less'
export default class SelectMella extends Component {

  state = {
    radiobgc1: '#E1206D',
    radiobgc2: '',
    radiobgc3: '',
    chooseNum: 1,
    isNotAsk: false,
    isDefault: true
  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('big')
  }
  _radio = (i) => {
    console.log(i);
    switch (i) {
      case 1:
        this.setState({
          radiobgc1: '#E1206D',
          radiobgc2: '',
          radiobgc3: '',
          chooseNum: 1
        })
        break;

      case 2:
        this.setState({
          radiobgc1: '',
          radiobgc2: '#E1206D',
          radiobgc3: '',
          chooseNum: 2
        })
        break;
      case 3:
        this.setState({
          radiobgc1: '',
          radiobgc2: '',
          radiobgc3: '#E1206D',
          chooseNum: 3
        })
        break;

      default:
        break;
    }


  }
  _next = () => {
    const { chooseNum } = this.state
    this.props.history.push({ pathname: '/page5' })
  }
  render () {
    const { radiobgc1, radiobgc2, radiobgc3 } = this.state
    return (
      <div id="selectMella">
        {/* 关闭缩小 */}
        <MaxMin
          onClick1={() => { this.props.history.push('/page3') }}
          onClick={() => this.props.history.push('/')}
        />

        {/* 文本 */}
        <div className="text">Select Your Mella</div>

        {/* 单选框 */}
        <div className="radios">
          <div
            className="radio1"
            onClick={() => this._radio(1)}>
            <div className="radioText1">Mella 001</div>
            <div className="radioBtn1">
              <div style={{ backgroundColor: radiobgc1 }}></div>
            </div>
          </div>
          <div
            className="radio1"
            onClick={() => this._radio(2)}>
            <div className="radioText1">Mella 002</div>
            <div className="radioBtn1">
              <div style={{ backgroundColor: radiobgc2 }}></div>
            </div>
          </div>
          <div
            className="radio1"
            onClick={() => this._radio(3)}>
            <div className="radioText1">Mella 003</div>
            <div className="radioBtn1">
              <div style={{ backgroundColor: radiobgc3 }}></div>
            </div>
          </div>
        </div>

        <div className="select">
          <div className="notAsk">
            <div
              className="zheng"
              onClick={() => {
                console.log(123);
                this.setState({
                  isNotAsk: !this.state.isNotAsk
                })
              }}>
              {(this.state.isNotAsk) ? (<img src={dui} alt='' width='40px' />) : (null)}
            </div>
            <p>Don’t ask again</p>
          </div>
        </div>

        <div className="select">
          <div className="notAsk">
            <div className="zheng" onClick={() => this.setState({ isDefault: !this.state.isDefault })}>
              {(this.state.isDefault) ? (<img src={dui} alt='' width='40px' />) : (null)}
            </div>
            <p>Default Device &nbsp; </p>
          </div>
        </div>




        {/* 按钮 */}
        <div className="btn">
          <Button
            type="primary"
            shape="round"
            size='large'>
            New Device
          </Button>
          <Button
            type="primary"
            shape="round"
            size='large'
            onClick={this._next}>
            Connect
          </Button>
        </div>

      </div>
    )
  }
}