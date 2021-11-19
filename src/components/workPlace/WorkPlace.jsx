import React, { Component, } from 'react'
import {
  Select,
  Button,
  Modal,
  message

} from 'antd';
import 'antd/dist/antd.css';

import './workplace.less'
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest } from './../../utils/FetchUtil1'

const { Option } = Select;
let storage = window.localStorage;
export default class WorkPlace extends Component {
  state = {
    organization: '',
    workplaceList: [],
    workplaceId: '',

  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')




    fetchRequest(`/organization/listWorkplaceAndOrganizationByUserId/${storage.userId}`)
      .then(res => {
        console.log('获取的组织与工作场所信息：', res);
        if (res.msg === 'success') {
          console.log('获取成功');
          let data = res.data
          let { organizationEntity, workplaceEntityList } = data
          let organization = organizationEntity.name
          let organizationId = organizationEntity.organizationId
          let workplaceList = []
          for (let i = 0; i < workplaceEntityList.length; i++) {
            let { workplaceName, workplaceId } = workplaceEntityList[i]
            let data = {
              workplaceId,
              workplaceName,

            }
            workplaceList.push(data)
          }
          this.setState({
            organization,
            workplaceList,
            workplaceId: storage.lastWorkplaceId
          })



        } else {
          message.error('Data loading failed, please try later')
        }
      })
      .catch(err => {
        console.log(err);
        message.error('Data loading failed, please try later')
      })

  }
  _select = (value, e) => {
    console.log(value, e);  //value的值为id

  }

  _next = () => {
    // this.props.history.push('/page8')
    let { workplaceId } = this.state
    console.log(workplaceId);
    fetchRequest(`/organization/updateLastWorkplace/${storage.userId}/${workplaceId}`)
      .then(res => {
        console.log(res);
        if (res.msg === 'success') {
          storage.lastWorkplaceId = workplaceId
          this.props.history.goBack()
        }
      })
      .catch(err => {
        console.log(err);
      })
  }
  render () {
    let department = 'Anesthesia'
    console.log(storage.department);
    if (storage.department !== undefined) {
      department = storage.department
    }
    let options = this.state.workplaceList.map(item => <Option key={item.workplaceId}>{item.workplaceName}</Option>)
    return (
      <div id="workplace1111">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.goBack()}
        />

        <div className="text">Choose personal information</div>
        <div className="select" >
          <p>{`Select Organization:`}  <span style={{ fontWeight: '600', fontSize: '20px' }}>{`${this.state.organization}`}</span></p>
          {/* <Select style={{ width: 260 }}
            defaultValue={'University of Georgia'}
            onChange={(val, e) => {
              console.log(val, e)
              this.setState({ organization: e.children })
            }}>
            <Option value="1">University of Georgia</Option>
          </Select> */}
        </div>

        <div className="select" >
          <p>Select Location:</p>
          <Select style={{ width: 260 }}
            defaultValue={storage.lastWorkplaceId}
            onChange={(val, e) => {
              console.log(val, e)
              this.setState({ workplaceId: e.key })
            }}>
            {/* <Option value="1">UGA Veterinary Teaching Hospital</Option> */}
            {options}
          </Select>
        </div>

        {/* <div className="select" >
          <p>Select Department:</p>
          <Select style={{ width: 260 }}
            defaultValue={department}
            onChange={(val, e) => {
              console.log(val, e)
              storage.department = e.children
              this.setState({ organization: e.children })

            }}>
            <Option value="1">Anesthesia</Option>
            <Option value="2">Emergency room</Option>
          
          </Select>
        </div> */}


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

      </div>

    )
  }
}