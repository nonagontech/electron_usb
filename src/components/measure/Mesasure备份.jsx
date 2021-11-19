
//这是以前集合做的测量界面，暂时保留 20210515
import React, { Component } from 'react'
import { Input, Button, Menu, Table, message } from 'antd';
import moment from 'moment'
import 'antd/dist/antd.css';
import { createFromIconfontCN, SyncOutlined } from '@ant-design/icons';

import './mesasure.less'
import img from './../../assets/images/bigYe.png'
import note from './../../assets/images/notes.png'
import ye from './../../assets/images/ye.png'
import { fetchRequest } from '../../utils/FetchUtil'
const { TextArea } = Input;
const { SubMenu } = Menu;
// const MyIcon =
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_n04nuipwmil.js'
})
const jiange = 100

export default class Mesasure extends Component {
  state = {
    closebgc: '',
    minbgc: '',
    closeColor: '',
    value: '',
    api: '',
    id: '',
    dataArr: [],
    noteArr: [],
    petName: '',
    noteID: '',
    seleceID: '',//医生id
    spin: false,   //刷新按钮是否旋转
    loading: false,
    progress: 314 //圆环进度 范围是0~314
  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    // ipcRenderer.send('mesasure')
    ipcRenderer.send('big')
    // this._getData()
    // this._newData()
  }
  _newData = () => {
    let props = this.props.location.query
    console.log(props);
    this.setState({
      api: props.api,
      id: props.id,
      seleceID: props.seleceID
    })
    console.log('seleceID', props.seleceID);
    let params = {
      APIkey: props.api,
      patientId: props.patientId
    }
    console.log('发送的数据：', params);

    fetchRequest('/VetSpire/selectLatestExamsByPatientId', 'POST', params)
      .then(res => {
        this.setState({ loading: false });
        console.log('11111111111111接收到的数据', res,);
        if (res.code === 14002) {
          console.log('成功');

          let datas = res.data.encounters
          let noteArr = []
          console.log('111111111111111111', datas);
          let arr = []
          for (let i = 0; i < datas.length; i++) {

            let times = datas[i].insertedAt
            let chazhi = new Date().getTimezoneOffset()
            times = moment(times).subtract(chazhi, 'm').format()
            console.log('转换后的时间：', times);

            let date = moment(times).format('MMM DD')
            let time = moment(times).format('LT')
            console.log('----------', date, time);
            let notes = ''
            if (datas[i].vitals.customs[0]) {
              notes = datas[i].vitals.customs[0].value
            }
            let temp = ''
            if (datas[i].vitals.temp) {
              temp = `${datas[i].vitals.temp}℉`
            }

            let data = {
              key: datas[i].id,
              date,
              time,
              temp,
              placement: '',
              notes,
              noteId: datas[i].vitals.id
            }
            let note = {
              id: datas[i].id,
              notes
            }
            console.log('1111111111111111转换后111111111111', data);
            noteArr.push(data)
          }
          this.setState({
            loading: false,
            noteArr,
            spin: false
          })
        } else {
          this.setState({ loading: false, spin: false });
        }

      })
      .catch(err => {
        console.log('错误', err);
        this.setState({ loading: false, spin: false });
      })
  }
  _getData = () => {
    //历史记录
    let props = this.props.location.query
    console.log(props);
    this.setState({
      api: props.api,
      id: props.id,
      seleceID: props.seleceID
    })
    console.log('seleceID', props.seleceID);
    let time = new Date()
    let updateAtEnd = moment(time).format('YYYY-MM-DD')
    console.log(time, updateAtEnd);
    let params = {
      APIkey: props.api,
      patientId: props.patientId,
      updateAtEnd
    }
    console.log('发送的数据：', params);
    this.setState({ loading: true });
    fetchRequest('/VetSpire/selectHistoryExamsByPatientId', 'POST', params)
      .then(res => {
        this.setState({ loading: false });
        console.log('222222222222接收到的数据', res,);
        if (res.code === 14002) {
          console.log('成功');

          let datas = res.data.encounters
          console.log(datas);
          let petName = ''
          if (datas[0]) {
            petName = datas[0].patient.name
          }
          this.setState({
            petName
          })
          let arr = []
          for (let i = 0; i < datas.length; i++) {
            let times = datas[i].insertedAt
            let chazhi = new Date().getTimezoneOffset()
            times = moment(times).subtract(chazhi, 'm').format()
            console.log('转换后的时间：', times);

            let date = moment(times).format('MMM DD')
            let time = moment(times).format('LT')
            console.log('----------', date, time);
            let notes = ''
            if (datas[i].vitals.customs[0]) {
              notes = datas[i].vitals.customs[0].value
            }
            let temp = ''
            if (datas[i].vitals.temp) {
              temp = `${datas[i].vitals.temp}℉`
            }

            let data = {
              key: datas[i].id,
              date,
              time,
              temp,
              placement: '',
              notes,
              noteId: datas[i].vitals.id
            }
            let note = {
              id: datas[i].id,
              notes
            }
            arr.push(data)
          }
          this.setState({
            loading: false,
            dataArr: arr,
            spin: false
          })
        } else {
          this.setState({ loading: false, spin: false });
        }

      })
      .catch(err => {
        console.log('错误', err);
        this.setState({ loading: false, spin: false });
      })
  }
  _close = () => {
    let ipcRenderer = window.electron.ipcRenderer
    console.log('关闭程序');
    ipcRenderer.send('window-close')
  }
  _min = () => {
    let ipcRenderer = window.electron.ipcRenderer
    console.log('最小化程序');
    ipcRenderer.send('window-min')
    this.setState({
      minbgc: '',
    })
  }
  _minMove = () => {

    this.setState({
      minbgc: 'rgb(211, 205, 205)'
    })
  }
  _minLeave = () => {
    this.setState({
      minbgc: ''
    })
  }
  _closeMove = () => {
    this.setState({
      closeColor: 'red',
      closebgc: '#fff'
    })
  }
  _closeLeave = () => {
    this.setState({
      closeColor: '#fff',
      closebgc: ''
    })
  }

  handleClick = e => {
    console.log('click ', e);
    const { api, id, seleceID } = this.state
    if (e.key === '1') {
      this.props.history.push({ pathname: '/page6', query: { api, id, seleceID } })
    }
    if (e.key === '2') {
      this.props.history.push('/')
    }

  };
  _revise = (data) => {


    let { noteID, value, api } = this.state
    console.log(this.state.noteArr[0]);
    if (!noteID) {
      noteID = this.state.noteArr[0].noteId
    }
    console.log(noteID, noteID.length > 0);
    if (data === 'del') {
      value = ''
    }
    if (noteID.length > 0) {
      let params = {
        APIkey: api,
        vitalId: noteID,
        customsName: 'Mella Note',
        customsValue: value
      }
      console.log('入参：', params);
      fetchRequest('/VetSpire/updateNoteByVitalId', 'POST', params)
        .then(res => {
          // this.setState({ loading: false });
          console.log('接收到的数据33333333333333333333333', res,);
          if (res.code === 20000) {

            this._getData()
            this._newData()
            if (data === 'del') {
              this.setState({ value: '' })
            }
            message.success('successfully modified');
          }


        })
        .catch(err => {
          console.log('错误', err);
        })
    }


  }
  _onChange = ({ target: { value } }) => {
    // console.log('--------',value);
    this.setState({
      value: value
    })
  }
  _refresh = () => {
    console.log('点击了');
    this.setState({
      spin: true
    })
    this._getData()
  }
  render () {
    const { closeColor, closebgc, minbgc, value, dataArr, spin, loading } = this.state
    console.log(this.state.dataArr);
    const columns = [
      {
        title: 'Date',
        dataIndex: 'date',

      },
      {
        title: 'Time',
        dataIndex: 'time',

      },
      {
        title: 'Temp(℉)',
        dataIndex: 'temp',
        width: 75,
      },
      {
        title: 'Placement',
        dataIndex: 'placement',
        width: 85,
        render: (record) => <img src={ye} alt="" width="20px" />
      },
      {
        title: 'Notes',
        dataIndex: 'notes',
        render: (record) => <img src={note} alt="" width="20px" />
      }
    ];
    // console.log('加载。。。。。。。。。。。。。。', this.state.noteArr[0]);
    let petName = this.state.petName
    if (this.props.location.query) {
      petName = this.props.location.query.petName
    }
    return (
      <div className="mesasure">
        {/* 头部 */}
        <div className="close1">
          {/* 菜单 */}
          <div className="menu">
            <Menu
              onClick={this.handleClick}
              selectedKeys={['menu']}
              mode="horizontal"
              theme={'drak'}
            >

              <SubMenu key="SubMenu"
                icon={<MyIcon type='icon-ic_menu_px' className="icon" />}
              >
                <Menu.Item key="1">return</Menu.Item>
                <Menu.Item key="2">home</Menu.Item>

              </SubMenu>

            </Menu>
          </div>
          <div className="text">mella</div>
          <div className='maxmin'>
            <div
              className="min iconfont icon-64"
              onClick={this._min}
              onMouseEnter={this._minMove}
              onMouseLeave={this._minLeave}
              style={{ backgroundColor: minbgc }}
            ></div>

            <div
              className="max iconfont icon-guanbi2"
              onClick={this._close}
              onMouseEnter={this._closeMove}
              onMouseLeave={this._closeLeave}
              style={{ backgroundColor: closebgc, color: closeColor }}
            ></div>
          </div>



        </div>
        {/* 设备名称 */}
        <div className="text1">Device: Mella001</div>
        {/* 宠物名称回显 */}
        <div className="text5">{`pet name：${petName}`}</div>
        {/* 小狗与测量图片 */}
        <div className="img">
          <img src={img} alt='' />
          <div style={{ backgroundColor: 'hotpink', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="110" width="110" viewBox="0 0 110 110" style={{ backgroundColor: 'pink' }}>
              <linearGradient id="svg-gradient" gradientUnits="userSpaceOnUse" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="26%" style={{ stopColor: '#4ad9ec' }} />
                <stop offset="60%" style={{ stopColor: '#a6f4d5' }} />
                <stop offset="90%" style={{ stopColor: '#f85e8c' }} />
              </linearGradient>
              <circle cx="50%" cy="50%" r="50" strokeWidth="10" stroke="#F2F2F2" fill="none"

                transform="rotate(150 55 55)"
                strokeDasharray={`${314 / 3 * 2} , 314`}
                strokeLinecap='round'
              ></circle>
              <circle id="ring" cx="50%" cy="50%" r="50" strokeWidth="10" fill="none"
                transform="rotate(150 55 55)"
                strokeDasharray={`${this.state.progress} , 314`}
                strokeLinecap='round'
                stroke="url(#svg-gradient)"

              ></circle>
              <text x="50%" y="50%" style={{ fill: 'red', dominantBaseline: 'middle', textAnchor: 'middle' }}>Normal</text>
            </svg>
            <div>
              {this.state.progress}
            </div>
          </div>
        </div>

        {/* notes */}
        <div>
          <div className="text2">Notes</div>
          <div className="input">
            <TextArea
              value={value}
              onChange={(val) => this._onChange(val)}
              autoSize={{ minRows: 5, maxRows: 7 }}
            />
          </div>
        </div>
        {/* 按钮 */}
        <div className="btns">
          <div className="btn1">
            <Button
              type="primary"
              shape="round"
              size='large'
              onClick={() => this._revise('del')}
            >Delete</Button>
          </div>
          <div className="btn2">
            <Button
              type="primary"
              shape="round"
              size='large'
              onClick={() => this._revise('save')}
            >Save</Button>
          </div>
        </div>
        {/* 测量记录 */}
        <div className="table">
          <div className="text4">Latest Exam</div>
          {(this.state.noteArr.length > 0) ?
            (<div className="info"
              onClick={() => {
                console.log('8888888888888888888888');
                const { noteArr } = this.state
                this.setState({
                  value: noteArr.notes,
                  noteID: noteArr.noteId
                })
              }
              }

            >
              <div className="text9">{`${this.state.noteArr[0].date}`}</div>
              <div className="text9">{`${this.state.noteArr[0].time}`}</div>
              <div className="text9">{`${this.state.noteArr[0].temp}`}</div>
              <div className="img"><img src={ye} alt="" width="20px" /></div>
              <div className="img"><img src={note} alt="" width="20px" /></div>


            </div>) :
            (null)}
          <div className="text3">Measurement &#8195;  <SyncOutlined onClick={this._refresh} spin={spin} />   </div>
          <Table
            columns={columns}
            size="middle"
            // rowKey={record => record.login.uuid}
            dataSource={dataArr}
            // pagination={pagination}
            loading={loading}
            scroll={{ y: 195 }}
            pagination={false}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  console.log(record);
                  console.log('点击了');
                  this.setState({
                    value: record.notes,
                    noteID: record.noteId
                  })

                }, // 点击行

              };
            }}
          />
        </div>

      </div>
    )
  }
}