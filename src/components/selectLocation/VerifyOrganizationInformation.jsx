import React, { Component, } from 'react'
import {
    Table,
    Select,
    Button,
    message

} from 'antd';
import 'antd/dist/antd.css';
import MaxMin from '../../utils/maxminreturn/MaxMinReturn'
import './VerifyOrganizationInformation.less'
import { fetchRequest1 } from '../../utils/FetchUtil'
const { Option } = Select;
let storage = window.localStorage;
export default class Location extends Component {
    state = {
        loading: false,
        api: '',
        id: '',  //location ID
        locations: [],
        locationData: [],
        selectLocationId: '',
        selectLocationName: '',
        vetData: [],
        selectvetId: '',
        selectvetName: ''

    }
    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('big')
        this.setState({
            api: storage.API,
            id: storage.id,
        })
        let params = {
            APIkey: storage.API
        }
        console.log('发送的数据：', params);
        this.setState({ loading: true });
        fetchRequest1('/VetSpire/selectLocations', 'POST', params)
            .then(res => {
                console.log('接收到的数据', res, res.data.Locations);
                let locations = res.data.Locations

                let datas = []
                for (let i = 0; i < locations.length; i++) {
                    const { address, displayName, name, phoneNumber, id } = locations[i]
                    let data = {
                        locationId: id,
                        locationName: name,
                        // display: displayName,
                        // address,
                        // phoneNumber
                    }
                    datas.push(data)
                }
                console.log(datas);
                this.setState({
                    loading: false,
                    locationData: datas
                });


            })
            .catch(err => {
                console.log('错误', err);
                this.setState({ loading: false });

            })

        if (storage.locationKey !== undefined) {
            let params = {
                APIkey: storage.API,
                locationId: storage.locationKey
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
                                vetId: datas[i].id,
                                VetName: datas[i].name
                            }
                            arr.push(data)
                        }
                        this.setState({
                            vetData: arr
                        })

                    }

                })
                .catch(err => {
                    console.log('错误', err);
                })
        }
    }
    _selectLocation = () => {
        let locationDefaultValue = storage.locationDefaultValue
        let options = this.state.locationData.map(d => <Option key={d.locationId}>{d.locationName}</Option>)
        const _select = (value, data) => {
            console.log(value, data, '------------', value, data.children);  //value的值为id
            storage.locationDefaultValue = data.children
            storage.locationKey = value
            storage.vetDefaultValue = undefined
            storage.vetKey = undefined
            this.setState({})
            this.setState({
                selectLocationId: value,
                selectLocationName: data.children
            })

            let params = {
                APIkey: storage.API,
                locationId: value
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
                                vetId: datas[i].id,
                                VetName: datas[i].name
                            }
                            arr.push(data)
                        }
                        this.setState({
                            vetData: arr
                        })

                    }

                })
                .catch(err => {
                    console.log('错误', err);
                })
        }
        return (
            <div className="select">
                <p>Select Location:</p>
                <Select
                    showSearch
                    style={{ width: '40%' }}
                    defaultValue={locationDefaultValue}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    listHeight={256}
                    onSelect={(value, data) => _select(value, data)}
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
                >
                    {options}
                </Select>
            </div>
        )
    }
    _selectVet = () => {
        let vetDefaultValue = storage.vetDefaultValue
        let options = this.state.vetData.map(d => <Option key={d.vetId}>{d.VetName}</Option>)
        const _select = (value, data) => {
            console.log(value, data, '------------', value, data.children);  //value的值为id
            storage.vetDefaultValue = data.children
            storage.vetKey = value
            this.setState({
                selectvetId: value,
                selectvetName: data.children
            })
        }
        return (
            <div className="select" style={{ marginTop: '90px' }}>
                <p>Select Vet:</p>
                <Select
                    showSearch
                    style={{ width: '40%' }}
                    // size = {'small'}     
                    defaultValue={vetDefaultValue}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    listHeight={256}
                    onSelect={(value, data) => _select(value, data)}
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
                >
                    {options}
                </Select>
            </div>
        )
    }
    _btn = () => {

        return (
            <div className="btn">
                <div className="button">
                    <Button

                        type="primary"
                        shape="round"
                        size='large'
                        onClick={() => { this.props.history.push('/page2') }}>
                        Try Again
                    </Button>
                </div>
                <div className="button">
                    <Button

                        type="primary"
                        shape="round"
                        size='large'
                        onClick={this._verify}>
                        Verify
                    </Button>
                </div>
            </div>
        )
    }
    _verify = () => {
        let { selectvetId, selectvetName, selectLocationName, selectLocationId } = this.state

        if ((selectLocationName != '' && selectvetName === '') || (storage.vetDefaultValue != '' && storage.locationDefaultValue != '')) {
            // let arr = [{selectLocationId:'765',selectvetId:''}]
            storage.selectvetId = selectvetId
            storage.selectLocationId = selectLocationId
            this.props.history.push('/page4')

        } else {
            message.error('Please select Verify Organization Information')
        }

    }

    render () {
        return (
            <div id="location">
                {/* 关闭缩小 */}
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                    onClick1={() => this.props.history.push('/page2')}
                />

                <div className="title">Verify Organization Information</div>
                <div className="goodpets">Good Pets</div>

                {this._selectLocation()}

                {this._selectVet()}


                {this._btn()}


            </div>
        )
    }
}