import React, { Component, } from 'react'
import {
    Select,
    Button,
    Modal

} from 'antd';
import 'antd/dist/antd.css';

import './praviders.less'
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest1 } from './../../utils/FetchUtil'

const { Option } = Select;
export default class Praviders extends Component {
    state = {
        loading: true,
        api: '',
        id: '',//location id
        data: [],
        radiobgc1: '#E1206D',
        radiobgc2: '',
        chooseNum: 1,
        seleceID: '',
        visible: false,
        modalText: ''

    }
    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('small')
        let props = this.props.location.query
        console.log(props);

        this.setState({
            api: props.api,
            id: props.id,
        })
        let params = {
            APIkey: props.api,
            locationId: props.id
        }
        console.log('发送的数据：', params);
        // this.setState({ loading: true });
        fetchRequest1('/VetSpire/selectProvidersByLocationId', 'POST', params)
            .then(res => {
                console.log('接收到的数据', res);
                if (res.code === 14002) {
                    this.setState({
                        loading: false
                    })
                    console.log(res.message);
                    let datas = res.data.Location.providers
                    console.log(datas);
                    let arr = []
                    for (let i = 0; i < datas.length; i++) {
                        let data = {
                            id: datas[i].id,
                            name: datas[i].name
                        }
                        arr.push(data)
                    }
                    this.setState({
                        data: arr
                    })

                }

            })
            .catch(err => {
                console.log('错误', err);
            })
    }

    _option = () => {
        const { data } = this.state
        for (let i = 0; i < data.length; i++) {
            return <Option value={`${data[i].id}`}>{data[i].name}</Option>
        }
    }
    _select = (value) => {
        console.log(value);  //value的值为id
        this.setState({
            seleceID: value
        })
    }

    _radio = (i) => {
        console.log(i);
        // console.log('11111');
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
        const { seleceID, api, id } = this.state
        if (seleceID) {
            console.log('tiaozhuan');
            this.props.history.push({ pathname: '/page6', query: { api, id, seleceID } })
        } else {
            this.setState({
                visible: true,
                modalText: 'Please choose your own name'
            })
        }
    }
    render () {
        const { api, id, radiobgc1, radiobgc2 } = this.state
        const options = this.state.data.map(d => <Option key={d.id}>{d.name}</Option>);
        return (
            <div id="praviders">
                {/* 关闭缩小 */}
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                    onClick1={() => this.props.history.push({ pathname: '/page4', query: { api, id } })}
                />

                <div className="text">I  am</div>
                <div className="select">
                    <Select
                        showSearch
                        style={{ width: '80%' }}
                        // size = {'small'}        
                        placeholder="Search to Select"
                        optionFilterProp="children"
                        listHeight={256}
                        onSelect={(value) => this._select(value)}
                        loading={this.state.loading}
                        filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
                    >
                        {options}
                    </Select>
                </div>

                <div className="text1">This computer is for my</div>

                {/* 单选框 */}
                <div className="radios">
                    <div
                        className="radio1"
                        onClick={() => this._radio(1)}
                    >

                        <div className="radioBtn1">
                            <div style={{ backgroundColor: radiobgc1 }}></div>
                        </div>
                        <div className="radioText1">for my use only</div>
                    </div>
                    <div
                        className="radio1"
                        onClick={() => this._radio(2)}
                    >
                        <div className="radioBtn1">
                            <div style={{ backgroundColor: radiobgc2 }}></div>
                        </div>
                        <div className="radioText1">shared</div>
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
                        Continue
                    </Button>
                </div>
                <Modal
                    title='warning'
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