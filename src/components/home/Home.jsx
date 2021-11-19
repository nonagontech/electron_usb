import React, { Component, } from 'react'
import {
    Button,
} from 'antd';
import 'antd/dist/antd.css';
import './home.less'
import logo from './../../assets/images/mella.png'
import MaxMin from './../../utils/maxMin/MaxMin'
import temporaryStorage from './../../utils/temporaryStorage'
let storage = window.localStorage;
export default class Home extends Component {
    state = {
        imgurl: ''
    }
    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('small')
        storage.measurepatientId = '';
        temporaryStorage.logupVetInfo = {}


    }



    _quickStart = () => {
        console.log('dianji2')
        this.props.history.push('/page1')
    }
    _createAccount = () => {
        this.props.history.push('/uesr/logUp/VetPrifile')
        // this.props.history.push('/uesr/logUp/JoinOrganizationByOption')

    }
    _test = () => {
        console.log('点击');
        console.log(navigator);
        console.log(navigator.userAgent);
        console.log('---------------------------');


    }
    render () {
        return (

            <div id="home">
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                />
                <div className="heard" ><img src={logo} alt="" /></div>

                <div className="button">
                    <Button

                        type="primary"
                        shape="round"
                        size='large'
                        onClick={() => { this.props.history.push('/page11') }}
                    >
                        Sign in with Email
                    </Button>

                </div>

                <div className="button">
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                        onClick={this._quickStart}
                    >
                        Sign in with PMS
                    </Button>

                </div>
                <p className="text">Do not have an account?</p>

                <div className="create">
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                        onClick={this._createAccount}
                    >
                        Create an Account
                    </Button>
                </div>



            </div>
        )
    }
}