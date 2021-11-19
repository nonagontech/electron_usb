import React, { Component, } from 'react'
import {

  Select,
  DatePicker, Space,
  message,
  Button,
  Input
} from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import moment from 'moment';

import 'antd/dist/antd.css';
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import dui from './../../assets/images/dui.png'
import './ezyVetSelectTime.less'
import { FetchEszVet } from './../../utils/FetchEszVet'


let storage = window.localStorage;
const { RangePicker } = DatePicker;

export default class EzyVetSelectTime extends Component {

  state = {
    startTime: moment(moment().format("YYYY-MM-DD")),
    endTime: moment(),
    patientId: ''
  }

  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('middle')
    console.log(storage.selectTime);
    if (storage.selectTime && `${storage.selectTime}` !== `undefined` && storage.selectTime !== '') {
      try {
        this.setState({
          startTime: moment(JSON.parse(storage.selectTime).startTime),
          endTime: moment(JSON.parse(storage.selectTime).endTime)
        })
      } catch (error) {
        console.log('时间转换错误', error);
      }

    }
    console.log('============', storage.selectPatientId);
    if (storage.selectPatientId && `${storage.selectPatientId}` !== `undefined` && storage.selectPatientId !== '') {
      try {
        this.setState({
          patientId: storage.selectPatientId

        })
      } catch (error) {
        console.log('时间转换错误', error);
      }

    }

  }
  _next = () => {
    let { startTime, endTime } = this.state
    if (startTime === null || endTime === null) {
      message.error('Please select a date range')
      return
    }
    let saveSart = startTime.format('YYYY-MM-DD HH:mm:ss'), saveEnd = endTime.format('YYYY-MM-DD HH:mm:ss');
    console.log('开始时间', startTime.format('YYYY-MM-DD HH:mm:ss'), '---------------结束时间', endTime.format('YYYY-MM-DD HH:mm:ss'));
    let chazhi = new Date().getTimezoneOffset()
    let start = startTime.add(chazhi, 'm').format('YYYY-MM-DD HH:mm:ss');
    let end = endTime.add(chazhi, 'm').format('YYYY-MM-DD HH:mm:ss');
    console.log(start, end);
    let unix = `{">": ${moment(start).format('X')}, "<": ${moment(end).format('X')}}`
    let uri = encodeURIComponent(unix)
    console.log('-----------', unix, uri);
    storage.unixToURI = uri
    let selectTime = {
      startTime: saveSart,
      endTime: saveEnd,
    }
    console.log('最终的选择时间：', selectTime);
    storage.selectTime = JSON.stringify(selectTime)
    storage.selectPatientId = this.state.patientId
    console.log(storage.selectTime, JSON.parse(storage.selectTime), storage.selectPatientId);
    this.props.history.push('EzyVetSelectExam')
  }

  render () {
    return (
      <div id="ezyVetSelectTime">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push('/ezyVetLogin')}
        />
        <div className="text">
          Please select the scope of <br /> search for medical records
        </div>

        <div className="patirntID">
          <p style={{ width: '80px' }}>Patient ID:</p>
          <Input
            style={{ outline: 'medium' }}
            value={this.state.patientId}
            // bordered={false}
            onChange={(item) => {
              console.log(item);
              this.setState({
                patientId: item.target.value
              })
            }}

          />

        </div>

        <div className="time">
          <Space direction="vertical" size={12}>
            <RangePicker
              value={[this.state.startTime, this.state.endTime]}
              showTime
              ranges={{
                Today: [moment(moment().format("YYYY-MM-DD")), moment(moment().endOf('day'))],
              }}
              onChange={(dates, dateStrings) => {
                // console.log('From: ', dates[0], ', to: ', dates[1]);
                // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
                console.log('我是第一个', dates, dateStrings);
                // this.setState({
                //   startTime: dateStrings[0],
                //   endTime: dateStrings[1]
                // })
              }}
              onCalendarChange={(dates, dateStrings) => {
                console.log('我是第二个', dates, dateStrings);
                this.setState({
                  startTime: moment(dateStrings[0]),
                  endTime: moment(dateStrings[1])
                })
              }}
            />
          </Space>
        </div>

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