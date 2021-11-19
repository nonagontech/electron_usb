import React, { Component } from 'react'
import {
  Table,
  Input,
  Button,
  Space

} from 'antd';
import moment from 'moment'
import 'antd/dist/antd.css';
import { SyncOutlined } from '@ant-design/icons';
import MaxMin from '../../utils/maxminreturn/MaxMinReturn'
import './selectExam.less'

import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { fetchRequest1 } from '../../utils/FetchUtil'

let storage = window.localStorage;


export default class SelectExam extends Component {
  state = {
    loading: false,
    api: '',
    id: '',  //选择location的id
    locations: [],
    data: [],
    searchText: '',
    searchedColumn: '',
    seleceID: '',  //宠物医生id
    spin: false,   //刷新按钮是否旋转

  }

  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('big')
    this._getData()

  }
  _getData = async () => {
    this.setState({
      api: storage.API,
      id: storage.selectLocationId,
      seleceID: storage.selectvetId
    })
    let time = new Date()
    let updateAtStart = moment(time).format('YYYY-MM-DD')
    console.log(time, updateAtStart);
    let params = {
      APIkey: storage.API,
      providerId: storage.selectvetId,
      updateAtStart
    }
    console.log('发送获取宠物列表数据：', params);
    this.setState({ loading: true });
    fetchRequest1('/VetSpire/selectPatientsByProviderId', 'POST', params)
      .then(res => {
        this.setState({ loading: false, spin: false });
        console.log('接收到的宠物列表数据', res,);

        if (res.code === 14002) {
          let patients = res.data.encounters
          console.log(patients);
          let arr = []

          let deduplication = []
          for (let i = 0; i < patients.length; i++) {
            console.log(patients[i].location.id === storage.selectLocationId);
            if (deduplication.indexOf(patients[i].patient.id) === -1 && patients[i].location.id === storage.selectLocationId) {
              deduplication.push(patients[i].patient.id)
              let obj = new Date();
              let year = obj.getFullYear(); //获取完整的年份(4位)
              let month = obj.getMonth() + 1; //获取当前月份(0-11,0代表1月)
              // console.log(year ,month);
              let birthYear = patients[i].patient.birthYear
              let birthMonth = patients[i].patient.birthMonth
              // console.log('-----------', birthYear, birthMonth);
              let age = month - birthMonth < 0 ? year - birthYear - 1 : year - birthYear
              let unit = patients[i].patient.latestWeight.unit ? patients[i].patient.latestWeight.unit : 'LB'

              let data = {
                key: patients[i].patient.id,
                petName: patients[i].patient.name,
                owner: patients[i].patient.client.name,
                breed: patients[i].patient.breed,
                gender: patients[i].patient.sex,
                age,
                weight: `${patients[i].patient.latestWeight.value} ${unit}`,
              }
              arr.push(data)
            }

          }


          console.log('转换的数据：', arr);
          let examData = []
          let indexArr = []
          for (let i = 0; i < arr.length; i++) {
            let sendData = {
              APIkey: storage.API,
              patientId: arr[i].key
            }
            console.log('发送获取exam数据', sendData);

            fetchRequest1('/VetSpire/selectExamByPatientId', 'POST', sendData)
              .then(res => {
                console.log('接收exam数据', i, res);
                indexArr.push(i)
                if (res.flag === true) {
                  let examArr = res.data.encounters
                  for (let index = 0; index < examArr.length; index++) {
                    let chazhi = new Date().getTimezoneOffset()
                    let newTime = moment(new Date()).add(chazhi, 'm').format('YYYY-MM-DD');
                    let insertedAt = moment(examArr[index].insertedAt).format('YYYY-MM-DD')
                    if (newTime === insertedAt) {
                      let examId = examArr[index].vitals.id
                      let patientId = examArr[index].patient.id
                      let json = {
                        examId,
                        patientId,
                        insertedAt: examArr[index].insertedAt,
                        petName: examArr[index].patient.name
                      }
                      examData.push(json)
                    }

                  }
                }
                if (indexArr.length === arr.length) {

                  let tableArr = []
                  for (let j = 0; j < arr.length; j++) {
                    for (let k = 0; k < examData.length; k++) {
                      if (arr[j].key === examData[k].patientId) {
                        let { age, breed, gender, owner, petName, weight } = arr[j]
                        let { examId, insertedAt, patientId } = examData[k]
                        let json1 = {
                          age, breed, gender, owner, key: examId, petName, weight, insertedAt, patientId
                        }
                        tableArr.push(json1)
                      }
                    }
                  }
                  console.log('最终合成的数据：', tableArr);
                  this.setState({
                    data: tableArr
                  })
                }

              })
              .catch(err => {
                console.log('err', err);
              })

          }

        }
      })
      .catch(err => {
        console.log('错误', err);
        this.setState({ loading: false, spin: false });
      })
  }

  // _getExam = async (sendData) => {

  //   return fetchRequest('VetSpire/selectExamByPatientId', 'POST', sendData)

  // }


  getColumnSearchProps = dataIndex => ({
    //dataIndex 是标题名称
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => ( //通过 filterDropdown 自定义的列筛选功能，并实现一个搜索列的示例。
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
              </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
              </Button>
        </Space>
      </div>
    ),
    //自定义Icon
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    //	本地模式下，确定筛选的运行函数 value:输入框里输入的内容     record:所有的项，相当于遍历
    onFilter: (value, record) => {
      console.log(value, record, dataIndex);
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : ''
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
  };
  _refresh = () => {
    console.log('点击了');
    this.setState({
      spin: true
    })
    this._getData()
  }
  render () {
    const columns = [
      {
        title: 'Pet Name',
        dataIndex: 'petName',
        key: 'petName',
        //   width: '30%',
        ...this.getColumnSearchProps('petName'),
      },
      {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner',
        //   width: '20%',
        ...this.getColumnSearchProps('owner'),
      },
      {
        title: 'Breed',
        dataIndex: 'breed',
        key: 'breed',
        ...this.getColumnSearchProps('breed'),
      },

      {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
        // width: '30%',
        ...this.getColumnSearchProps('gender'),
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        // width: '20%',
        ...this.getColumnSearchProps('age'),
      },
      {
        title: 'Weight',
        dataIndex: 'weight',
        key: 'weight',
        ...this.getColumnSearchProps('weight'),
      },
      {
        title: 'Creation time',
        dataIndex: 'insertedAt',
        key: 'insertedAt',
        render: (text, record, index) => {
          let chazhi = new Date().getTimezoneOffset()

          let newTime = moment(text).subtract(chazhi, 'm').format('YYYY-MM-DD HH:mm');
          return (
            <p style={{ textAlign: 'center' }}>{newTime}</p>
          )

        }
      },
      // {
      //   title: '',
      //   dataIndex: 'patientId',
      //   key: 'patientId',
      //   render: (text, record, index) => {
      //     // console.log(text, record, index);
      //     let chazhi = new Date().getTimezoneOffset()

      //     let newTime = moment(text).subtract(chazhi, 'm').format('YYYY-MM-DD HH:mm');
      //     return (
      //       null
      //     )

      //   }
      // },
    ];
    const { loading, data, api, id, seleceID, spin } = this.state
    return (

      <div className="patient">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push({ pathname: '/page4' })}
        />

        <div className="textfa1">
          <div className="textfa">
            <div className="text">Select Patient Exam</div>
            <div className="text3"><SyncOutlined onClick={this._refresh} spin={spin} />   </div>
          </div>
          <div className="r" onClick={() => {
            let electron = window.electron
            electron.shell.openExternal('https://mella.vetspire.com/clients')
          }}>+</div>
        </div>


        <div className="table">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            locale={{ filterConfirm: <div>111</div> }}
            pagination={{ pageSize: 7, showSizeChanger: false, showQuickJumper: true }}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  console.log(record);
                  let patientId = record.key
                  let petName = record.petName

                  console.log(patientId, petName);
                  storage.selectExamId = record.key
                  storage.selectPatientId = record.patientId

                  storage.selectAge = record.age
                  storage.selectBreed = record.breed
                  storage.selectOwner = record.owner
                  storage.selectWeight = record.weight
                  storage.selectPetName = record.petName

                  this.props.history.push({ pathname: '/page10', })

                }, // 点击行

              };
            }}
          />
        </div>

      </div>
    )
  }
}