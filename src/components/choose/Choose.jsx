import React, { Component } from 'react'
import {
    Button,
} from 'antd';
import 'antd/dist/antd.css';
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'

import './choose.less'
let storage = window.localStorage;
export default class Choose extends Component {

    state = {
        radiobgc1: '#E1206D',
        radiobgc2: '',
        chooseNum: 1
    }
    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('small')
        if (storage.vetspireOrEzyvet !== undefined && storage.signIn !== '') {
            switch (storage.vetspireOrEzyvet) {
                case '1':
                    this.setState({
                        radiobgc1: '#E1206D',
                        radiobgc2: '',
                        chooseNum: parseInt(storage.vetspireOrEzyvet)
                    })
                    break;
                case '2':
                    this.setState({
                        radiobgc1: '',
                        radiobgc2: '#E1206D',
                        chooseNum: parseInt(storage.vetspireOrEzyvet)
                    })
                    break;
                default:
                    break;
            }
        }
    }
    _radio = (i) => {
        if (i === 1) {
            this.setState({
                radiobgc1: '#E1206D',
                radiobgc2: '',
                chooseNum: 1
            })
        }
        if (i === 2) {
            this.setState({
                radiobgc1: '',
                radiobgc2: '#E1206D',
                chooseNum: 2
            })
        }

    }
    _next = () => {
        const { chooseNum } = this.state
        console.log(chooseNum)
        storage.vetspireOrEzyvet = chooseNum
        if (chooseNum === 1) {
            this.props.history.push('/page2')
        } else {
            this.props.history.push('/ezyVetLogin')
        }

    }
    render () {
        const { radiobgc1, radiobgc2 } = this.state
        return (
            <div id="Choose">
                {/* 关闭缩小 */}
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                    onClick1={() => this.props.history.push('/')}
                />

                {/* 文本 */}
                <div className="text">Do you have</div>

                {/* 单选框 */}
                <div className="radios">
                    <div
                        className="radio1"
                        onClick={() => this._radio(1)}
                    >
                        <div className="radioText1">Vetspire</div>
                        <div className="radioBtn1">
                            <div style={{ backgroundColor: radiobgc1 }}></div>
                        </div>
                    </div>
                    <div
                        className="radio1"
                        onClick={() => this._radio(2)}
                    >
                        <div className="radioText1">EzyVet</div>
                        <div className="radioBtn1">
                            <div style={{ backgroundColor: radiobgc2 }}></div>
                        </div>
                    </div>
                </div>
                {/* 按钮 */}
                <div className="btn">
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                        onClick={this._next}
                    >
                        Next
                    </Button>
                </div>

            </div>
        )
    }
}