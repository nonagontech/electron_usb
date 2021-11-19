import React, { Component } from 'react'
import {
  Input
} from 'antd';
import { createFromIconfontCN, SyncOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

import MaxMin from '../../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest } from '../../../utils/FetchUtil1'
import temporaryStorage from '../../../utils/temporaryStorage'
import Button from '../../../utils/button/Button'



import './findMyOrganization.less'

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})
export default class JoinworkplaceByName extends Component {

  state = {
    search: '',
    listData: [],
    searchData: [],
    selectId: {}

  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')
    fetchRequest(`/organization/listAll`, "GET", '')
      .then((res) => {
        console.log(res);
        if (res.msg === 'success') {
          this.setState({
            listData: res.data
          })
        }
      })
      .catch((err) => {
        console.log(err);
      })
    this.setState({
      selectId: temporaryStorage.logupSelectOrganization
    })
  }
  _search = (val) => {
    let search = val.target.value
    let { listData } = this.state
    let searchData = []
    for (let i = 0; i < listData.length; i++) {
      if (listData[i].name.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
        searchData.push(listData[i])
      }
    }
    this.setState({
      search,
      searchData
    })

  }
  _list = () => {
    const { search, listData, searchData } = this.state
    let data = (search.length > 0) ? searchData : listData
    let option = data.map((item, index) => {
      return <li key={item.organizationId}
        onClick={() => {
          this.setState({
            selectId: item
          })
          console.log(item);
          temporaryStorage.logupSelectOrganization = item
          this.props.history.push('/uesr/logUp/FindMyWorkplace')

        }}

      >
        {(this.state.selectId.organizationId === item.organizationId ? <span className="search">&#xe614;</span> : null)}
        {item.name}</li>
    })
    return (
      <ul>
        {option}
      </ul>
    )
  }

  render () {
    return (
      <div id="findMyOrganization">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push('/uesr/logUp/JoinOrganizationByOption')}
        />
        <div className="body">
          <div className="text">Find my organization</div>

          <div className="searchBox">
            <div><MyIcon type='icon-sousuo' className="icon" /></div>

            <Input
              placeholder="Please input organization name"
              bordered={false}
              allowClear={true}
              value={this.state.search}
              onChange={this._search}
            />

          </div>


          <div className="list">
            {this._list()}
          </div>

          <Button
            text={'My Organization Isn`t Listed'}
            textBoxStyle={{ marginTop: '50px' }}
            onClick={() => {
              this.props.history.push('/uesr/logUp/NewOrganization')
            }}
          />
        </div>




      </div>
    )
  }
}