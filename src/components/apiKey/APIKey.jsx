import React, { Component, } from 'react'
import {
    Button,
    Input,
    Spin,
    Alert,
    Form,
    Modal
} from 'antd';
import { InfoCircleOutlined, UserOutlined, createFromIconfontCN } from '@ant-design/icons';

import 'antd/dist/antd.css';
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import dui from './../../assets/images/dui.png'
import './apikey.less'
import { fetchRequest1 } from './../../utils/FetchUtil'

const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2326495_ryrpg35knb.js'
})
let storage = window.localStorage;
export default class APIKey extends Component {
    state = {
        value: '',
        loading: false,
        id: '', // location 的ID
        name: '',
        flog: false,
        visible: false,
        modalText: '',
        api: '',
        selectApi: false
    }
    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('big')
    }
    componentWillMount () {
        if (storage.selectApi === `true`) {
            if (`${storage.API}` !== `undefined`) {
                this.setState({
                    api: storage.API
                })
            }
            this.setState({
                selectApi: storage.selectApi
            })
        }
        console.log('----------', storage.selectApi, storage.API);

    }
    onFinish = values => {
        console.log("Success:", values);
        console.log('跳转');
        if (values) {
            this.setState({
                loading: true
            })
            let params = {
                APIkey: values.api
            }
            console.log('传入的数据：', params);

            fetchRequest1('/VetSpire/selectLocationsByOrganization', 'POST', params)
                .then(res => {
                    console.log('接收到的数据', res);
                    this.setState({
                        loading: false
                    })
                    if (res.code === 14002) {


                        storage.selectApi = this.state.selectApi
                        console.log(this.state.selectApi);
                        storage.API = values.api
                        console.log(res.message);
                        let data = res.data.org
                        console.log(data);
                        this.setState({
                            id: data.id,
                            name: data.name,
                            flog: true,
                            api: params.APIkey
                        })
                        storage.id = data.id
                        console.log(storage.id);
                        this.props.history.push({ pathname: '/page3', })
                    } else {
                        this.setState({
                            visible: true,
                            modalText: 'The input API is wrong',
                            flog: false
                        })
                    }
                })
                .catch(err => {
                    console.log('错误', err);
                    this.setState({
                        loading: false,
                        visible: true,
                        modalText: `${err}`,
                        flog: false
                    })
                })

        }
    };
    onFinishFailed = errorInfo => {
        console.log("Failed:", errorInfo);
    };
    render () {
        const { api, id } = this.state
        return (
            <div id="inputAPI">
                {/* 关闭缩小 */}
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                    onClick1={() => this.props.history.push('/page1')}
                />


                <Spin tip="Loading..." spinning={this.state.loading} delay={500}>

                    {/* 文本 */}
                    <div className="text">Enter your Vetspire API key<br />and we’ll take care of the rest.</div>


                    <Form
                        name="basic"
                        initialValues={{
                            remember: true
                        }}
                        onFinish={(value) => this.onFinish(value)}
                        onFinishFailed={(value) => this.onFinishFailed(value)}
                    >
                        <div className="inptDiv">
                            <Form.Item
                                name="api"
                                initialValue={this.state.api}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please input your vetspire API key!"
                                    }
                                ]}
                            >
                                <Input
                                    className='input'
                                    placeholder="Your Vetspire API Key"

                                />

                            </Form.Item>
                        </div>
                        <div className="remember">
                            <div className="text1">Remember Me</div>
                            <div className="square" onClick={() => {
                                this.setState({ selectApi: !this.state.selectApi })
                            }}>
                                {(this.state.selectApi) ? (<img src={dui} width={'40px'} alt="" />) : (null)}
                            </div>
                        </div>

                        {/* {(!this.state.flog) ? ( */}
                        {(true) ? (
                            <Form.Item>
                                <div className="btn">
                                    <Button
                                        type="primary"
                                        shape="round"
                                        size='large'
                                        htmlType="submit"
                                    >
                                        Connect
                                    </Button>
                                </div>
                            </Form.Item>
                        ) : (null)}

                    </Form>

                </Spin>

                {/* {(this.state.flog) ? ( */}
                {(false) ? (
                    <div>
                        <div className="text2"> Verify Organization<br />Information</div>
                        <div className="text9">Business Name <span>{this.state.name}</span></div>
                        <div className="btns">
                            <div className="btn1">
                                <Button
                                    type="primary"
                                    shape="round"
                                    size='large'
                                    onClick={() => this.setState({ flog: false })}
                                >
                                    Try Again
                                </Button>
                            </div>
                            <div className="btn2">
                                <Button
                                    type="primary"
                                    shape="round"
                                    size='large'
                                    onClick={() => {
                                        console.log('点击了');
                                        this.props.history.push({ pathname: '/page4', query: { api, id } })
                                    }}
                                >
                                    Verify
                                </Button>
                            </div>
                        </div>
                    </div>

                ) : (null)}


                <Modal
                    title='err'
                    visible={this.state.visible}
                    footer={[]}
                    onCancel={() => this.setState({ visible: false })}
                >
                    {this.state.modalText}
                </Modal>




            </div>
        )
    }
}