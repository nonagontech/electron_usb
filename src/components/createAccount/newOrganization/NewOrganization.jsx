import React, { Component, } from 'react'
import {
  Button,
  Select,
  Modal,
  message
} from 'antd';
import Draggable from "react-draggable";
import { CaretDownFilled } from '@ant-design/icons';
import 'antd/dist/antd.css';

import './newOrganization.less'
import imgArray from './../../../utils/areaCode/imgArray'
import MaxMin from './../../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest } from './../../../utils/FetchUtil1'
import countryList from './../../../utils/areaCode/country';
import temporaryStorage from '../../../utils/temporaryStorage'

const { Option } = Select;
export default class NewOrganization extends Component {

  state = {
    code: 1,
    imgArrayIndex: 0,
    phone: '',
    organizationName: '',
    practiceName: '',
    address: '',
    country: 'US',
    city: '',
    state: '',
    zipcode: '',
    address1: '',
    address2: '',
    workplaceTypeId: 1,
    email: '',
    visible: false,       //nodel框是否显示
    disabled: true,       //model是否可拖拽
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },
    countryArr: []



  }

  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('middle')
    let arr = countryList.map(item => item.locale)
    arr.sort(function (a, b) {
      return a.localeCompare(b)
    })
    this.setState({
      countryArr: arr
    })
  }



  _next = () => {
    let { organizationName, practiceName, workplaceTypeId, code, phone, country, city, state, address1, address2, zipcode, email } = this.state
    console.log({ organizationName, practiceName, workplaceTypeId, code, phone, country, city, state, address1, address2, zipcode });
    message.destroy()
    if (!organizationName) {
      message.error('Please enter an organization name', 3)
      return;
    }
    if (!practiceName) {
      message.error('Please enter an Practice name', 3)
      return;
    }
    if (!phone) {
      message.error('Please enter the phone number', 3)
      return;
    }
    if (!country) {
      message.error('Please enter country name', 3)
      return;
    }
    if (!city) {
      message.error('Please enter the city name', 3)
      return;
    }
    if (!address1) {
      message.error('Please enter address1', 3)
      return;
    }
    // if (!address2) {
    //   message.error('Please enter address2', 3)
    //   return;
    // }
    if (!zipcode) {
      message.error('Please enter the postal code', 3)
      return;
    }
    if (!email) {
      message.error('Please enter the contact email', 3)
      return;
    } else {
      if (email.indexOf('@') === -1 || email.indexOf('@') === 0 || email.indexOf('@') === email.length - 1) {
        message.error('E-mail format is incorrect', 3)
        return
      }
    }

    let params = {
      name: organizationName,
      workplaceName: practiceName,
      workplaceTypeId,
      address1,
      address2,
      phone: `+${code}${phone}`,
      country,
      city,
      state,
      zipcode,
      email
    }

    console.log('入参信息：', params);
    fetchRequest(`/organization/addOrganization/${temporaryStorage.logupSuccessData.userId}`, "POST", params)
      .then(res => {
        console.log('添加组织返回的信息', res);
        if (res.flag === true) {
          if (res.code === 11030) {
            this.setState({ visible: true })
          }
          if (res.code === 20000) {
            console.log('添加成功，跳转');
            temporaryStorage.logupOrganization = res.data
            this.props.history.push('/uesr/logUp/InviteTeam')
          }

        }
      })
      .catch(err => {
        console.log('添加组织接口失败', err);
        message.error(err.message, 3)
      })
  }

  onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = this.draggleRef?.current?.getBoundingClientRect();
    this.setState({
      bounds: {
        left: -targetRect?.left + uiData?.x,
        right: clientWidth - (targetRect?.right - uiData?.x),
        top: -targetRect?.top + uiData?.y,
        bottom: clientHeight - (targetRect?.bottom - uiData?.y)
      }
    });
  };



  render () {

    let { disabled, visible, bounds, address1, address2, phone, organizationName, practiceName, city, state, zipcode, workplaceTypeId, email } = this.state
    return (
      <div id="newOraganization" >
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => { console.log('fanhui'); this.props.history.goBack() }}
        />
        <div className="text">
          New Organization and Practice
        </div>
        <div className="text1">Tell us more about the place you will be using Mella!</div>
        <div className="form">
          <div className="item">
            <div className="l">
              <p>Organization Name*</p>
              <input
                type="text"
                value={organizationName}
                placeholder={'Organization Name'}
                onChange={(value) => {
                  let data = value.target.value
                  this.setState({
                    organizationName: data
                  })
                }}
              />

            </div>
          </div>
          <div className="item">
            <div className="l">
              <p>Practice Name*</p>
              <input
                type="text"
                value={practiceName}
                placeholder={'Practice Name'}
                onChange={(value) => {
                  let data = value.target.value
                  this.setState({
                    practiceName: data
                  })
                }}
              />

            </div>


            <div className="l">
              <p>Contact Email*</p>
              <input
                type="Email"
                value={email}
                onChange={(value) => {
                  let data = value.target.value
                  this.setState({
                    email: data
                  })
                }}
              />
            </div>
          </div>

          <div className="item">

            <div className="l">
              <p>Type of Practice*</p>
              <div className="select" >
                <Select
                  value={workplaceTypeId}
                  style={{ width: '100%', borderRadius: '100px' }}
                  onChange={(value) => { this.setState({ workplaceTypeId: value }) }}
                >
                  <Option value={1}>practice </Option>
                  <Option value={2}>clinic </Option>
                  <Option value={3}>shelter</Option>
                </Select>
              </div>
            </div>


            <div className="l">
              <ul id="list">
                {countryList.map((item, index) => {
                  let url = imgArray[item.locale.toLowerCase()] ? imgArray[item.locale.toLowerCase()].default : ''
                  return (
                    <li key={index}>
                      <div key={index}
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                        onClick={() => {
                          console.log(item, index);
                          this.setState({
                            code: item.code,
                            imgArrayIndex: index
                          })
                          document.getElementById('list').style.display = "none"
                        }}
                      >
                        <img src={url} alt="" />
                        <p >{`${item.en}   +${item.code}`}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <p>Contact Number*</p>
              <div className='phone'>
                <div
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                  onClick={() => {
                    document.getElementById('list').style.display = "block"
                  }}
                >
                  <img style={{ zIndex: '888' }}
                    src={imgArray[countryList[this.state.imgArrayIndex].locale.toLowerCase()].default} alt=""
                  />
                  <CaretDownFilled style={{ marginRight: '10px' }} />
                </div>


                <input
                  type="Phone"
                  value={phone}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      phone: data.replace(/[^\-?\d]/g, '')
                    })
                  }}
                />
              </div>

            </div>

          </div>
          <div className="item">
            <div className="l">
              <p>Address*</p>
              <div className="inputs">
                <input
                  type="text"
                  value={address1}
                  placeholder={'address1'}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      address1: data
                    })
                  }}
                />
                <input
                  type="text"
                  value={address2}
                  placeholder={'address2'}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      address2: data
                    })
                  }}
                />
                <input
                  type="text"
                  value={city}
                  placeholder={'city'}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      city: data
                    })
                  }}
                />
                <input
                  type="text"
                  value={state}
                  placeholder={'state'}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      state: data
                    })
                  }}
                />
                <input
                  type="text"
                  value={zipcode}
                  placeholder={'zipcode'}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      zipcode: data
                    })
                  }}
                />

                {/* <input
                  type="text"
                  value={country}
                  placeholder={'country'}
                  onChange={(value) => {
                    let data = value.target.value
                    this.setState({
                      country: data
                    })
                  }}
                /> */}
                <Select
                  // showSearch
                  style={{ width: 100, borderBottom: '1px solid rgba(216,216,216,1)' }}
                  bordered={false}
                  optionFilterProp="children"
                  defaultValue="US"
                  onSelect={(val) => {
                    console.log('选择的国家：', val);
                    this.setState({
                      country: val
                    })
                  }}
                >
                  {this.state.countryArr.map((item, index) => (
                    <Option key={index} value={item}>{item}</Option>
                  ))}
                </Select>



              </div>
            </div>
          </div>
          {/* 按钮 */}
          <div className="btn">
            <Button
              type="primary"
              shape="round"
              size='large'
              htmlType="submit"
              onClick={this._next}
            >
              Next
            </Button>
          </div>
        </div>
        <Modal
          title={
            <div
              style={{
                width: '100%',
                cursor: 'move',
                height: '20px',
                fontWeight: '700'
              }}
              onMouseOver={() => {
                if (disabled) {
                  this.setState({
                    disabled: false,
                  });
                }
              }}
              onMouseOut={() => {
                this.setState({
                  disabled: true,
                });
              }}
            >
              remind
            </div>
          }
          visible={visible}
          // visible={true}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={330}
          modalRender={(modal) => (
            <Draggable
              disabled={disabled}
              bounds={bounds}
              onStart={(event, uiData) => this.onStart(event, uiData)}
            >
              <div ref={this.draggleRef}>{modal}</div>
            </Draggable>
          )}
          footer={[
            <button
              style={{ width: '110px', height: '40px', border: 0, backgroundColor: '#E1206D', color: '#fff', borderRadius: '60px', fontSize: '18px' }}
              onClick={() => {
                this.setState({
                  visible: false,
                  organizationName: ''
                })
              }}
            >Cancel</button>,
            <button
              style={{ width: '110px', height: '40px', border: 0, backgroundColor: '#E1206D', color: '#fff', borderRadius: '60px', fontSize: '18px' }}
              onClick={() => {
                this.setState({
                  visible: false
                })
                this.props.history.replace('/uesr/logUp/FindMyOrganization')
              }}
            >Join</button>

          ]}
          destroyOnClose={true}
        >
          <div id='vetPrifileModal'>

            <p>This organization has already been registered, do you want to join?</p>
          </div>

        </Modal>

      </div>


    )
  }
}