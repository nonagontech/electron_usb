////这是普通用户的选择界面，后期集成时候别忘了identity，进入测量界面的身份，是vetspire、ezyvet、普通医生
import React, { Component } from 'react'
import {
  Table,
  Input,
  Button,
  Space,
  message,
  Menu

} from 'antd';
import moment from 'moment'
import 'antd/dist/antd.css';
import Heard from './../../utils/heard/Heard'
import { SyncOutlined, createFromIconfontCN } from '@ant-design/icons';
import MaxMin from '../../utils/maxminreturn/MaxMinReturn'
import './doctorSelectExam.less'

import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { FetchEszVet } from '../../utils/FetchEszVet'
import { fetchRequest } from '../../utils/FetchUtil1'
import gender from './../../utils/gender'
import temporaryStorage from '../../utils/temporaryStorage';

const { SubMenu } = Menu;
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})
let storage = window.localStorage;



export default class DoctorSelectExam extends Component {
  state = {
    loading: false,
    api: '',
    id: '',  //选择location的id
    locations: [],
    data: [],
    searchData: [],
    searchText: '',
    searchedColumn: '',
    seleceID: '',  //宠物医生id
    spin: false,   //刷新按钮是否旋转
    unixToURI: '',
    ezyVetToken: '',
    current: 1,
    closebgc: '',
    minbgc: '',
    closeColor: '',
    heardSearchText: '',
  }
  componentWillMount () {
    try {
      if ((this.props.location.listDate)) {
        console.log('------------', this.props.location);
        let data = JSON.parse(this.props.location.listDate)
        this.setState({
          data,
          current: parseInt(this.props.location.defaultCurrent)
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('big')
    storage.identity = '3'

    if ((this.props.location.listDate)) {
      console.log('------------', this.props.location);
      let data = JSON.parse(this.props.location.listDate)
      this.setState({
        data,
        current: parseInt(this.props.location.defaultCurrent)
      })
    } else {
      this._getExam()
    }
    temporaryStorage.logupVetInfo = {}
    temporaryStorage.logupSelectOrganization = {}
    temporaryStorage.logupSuccessData = {}
    temporaryStorage.logupOrganization = {}
    temporaryStorage.logupEmailCode = ''

    // this._getExam()

  }
  componentWillUnmount () {
    message.destroy()
  }

  _getExam = async () => {
    console.log('进来了');
    this.setState({
      loading: true,
      spin: false
    })
    let params = {
      doctorId: storage.userId,
    }
    if (storage.lastWorkplaceId) {
      params.workplaceId = storage.lastWorkplaceId
    }
    console.log('查询宠物的入参', params);
    const isUnKnow = (val) => {
      if (val) {
        return val
      } else {
        return 'unknown'
      }
    }

    fetchRequest('/user/listAllPetInfo', 'GET', params)
      .then(res => {
        console.log('查询到的宠物列表', res);
        this.setState({
          loading: false
        })
        if (res.flag === true) {
          let data = []
          for (let i = 0; i < res.data.length; i++) {
            let { age, createTime, patientId, petName, firstName, birthday, lastName, breedName, gender, petId, weight } = res.data[i]
            let owner = ''
            patientId = isUnKnow(patientId)
            petName = isUnKnow(petName)
            breedName = isUnKnow(breedName)
            age = isUnKnow(age)
            weight = isUnKnow(weight)
            if (!firstName) {
              firstName = ''
            }
            if (!lastName) {
              lastName = ''
            }
            if (lastName === '' && firstName === '') {
              owner = 'unknown'
            } else {
              owner = `${lastName} ${firstName}`
            }
            createTime = moment(createTime).format('X')
            let petGender = ''
            switch (`${gender}`) {
              case '1': petGender = 'F'

                break;
              case '0': petGender = "M"
                break;
              default: petGender = 'unknown'
                break;
            }
            let petAge = 'unknown'
            if (birthday) {
              petAge = moment(new Date()).diff(moment(birthday), 'years')
              // console.log('petAge', petAge);
            }

            let json = {
              insertedAt: createTime,
              patientId,
              petName,
              owner,
              breed: breedName,
              gender: petGender,
              age: petAge,
              petId,
              id: i,
              weight

            }
            data.push(json)

          }
          data.sort((a, b) => {
            return moment(parseInt(a.insertedAt) * 1000).format('YYYY-MM-DD HH:mm') > moment(parseInt(b.insertedAt) * 1000).format('YYYY-MM-DD HH:mm') ? -1 : 1
          })
          this.setState({
            data
          })


        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          loading: false
        })
      })



  }


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
    // this._getData()
    this._getExam()
  }

  /**------------------顶部start------------------------ */
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

    switch (e.key) {
      case '1': this.props.history.push('/page11'); break;
      case '2': this.props.history.push('/'); break;
      case '3': this.props.history.push('/page8'); break;
      case '4': this.props.history.push('/page12'); break;

      default:
        break;
    }

  };

  _search1 = (search) => {       //这个是搜索调用后台的函数，现在废弃20210929
    let params = {
      doctorId: storage.userId,
      petName: search,
    }
    this.setState({
      loading: true
    })
    if (storage.lastWorkplaceId) {
      params.workplaceId = storage.lastWorkplaceId
    }
    const isUnKnow = (val) => {
      if (val) {
        return val
      } else {
        return 'unknown'
      }
    }
    console.log('搜索的数据', params);
    fetchRequest('/pet/listPetsLike', "POST", params)
      .then(res => {
        console.log(res);

        if (res.flag === true) {
          let data = []
          for (let i = 0; i < res.data.length; i++) {
            let { age, createTime, patientId, petName, firstName, birthday, lastName, breedName, gender, petId, weight } = res.data[i]
            let owner = ''
            patientId = isUnKnow(patientId)
            petName = isUnKnow(petName)
            breedName = isUnKnow(breedName)
            age = isUnKnow(age)
            weight = isUnKnow(weight)
            if (!firstName) {
              firstName = ''
            }
            if (!lastName) {
              lastName = ''
            }
            if (lastName === '' && firstName === '') {
              owner = 'unknown'
            } else {
              owner = `${lastName} ${firstName}`
            }
            createTime = moment(createTime).format('X')
            let petGender = ''
            switch (`${gender}`) {
              case '1': petGender = 'F'

                break;
              case '0': petGender = "M"
                break;
              default: petGender = 'unknown'
                break;
            }
            let petAge = 'unknown'
            if (birthday) {
              petAge = moment(new Date()).diff(moment(birthday), 'years')
              // console.log('petAge', petAge);
            }

            let json = {
              insertedAt: createTime,
              patientId,
              petName,
              owner,
              breed: breedName,
              gender: petGender,
              age: petAge,
              petId,
              id: i,
              weight

            }
            data.push(json)

          }
          data.sort((a, b) => {
            return moment(parseInt(a.insertedAt) * 1000).format('YYYY-MM-DD HH:mm') > moment(parseInt(b.insertedAt) * 1000).format('YYYY-MM-DD HH:mm') ? -1 : 1
          })
          this.setState({
            searchData: data,
            loading: false
          })
        } else {
          this.setState({
            searchData: [],
            loading: false
          })
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          loading: false
        })
      })
  }

  _search = (keyWord) => {       //这个是搜索功能 ，怎么展示列表的内容进行搜索

    /**
     * 使用indexof方法实现模糊查询
     *     语法：stringObject.indexOf(searchvalue, fromindex)
     *   参数：searchvalue 必需。规定需检索的字符串值。 fromindex 可选的整数参数。规定在字符串中开始检索的位置。它的合法取值是 0 到 stringObject.length - 1。如省略该参数，则将从字符串的首字符开始检索。
     *    说明：该方法将从头到尾地检索字符串 stringObject，看它是否含有子串 searchvalue。开始检索的位置在字符串的 fromindex 处或字符串的开头（没有指定 fromindex 时）。如果找到一个 searchvalue，则返回 searchvalue 的第一次出现的位置。stringObject 中的字符位置是从 0 开始的。如果没有找到，将返回 -1。
     *  
     * list         原数组
     * keyWord      查询关键词
     * searchData   查询的结果
     * 
     * toLowerCase（）方法：将字符串统一转成小写
     * toUpperCase（）方法：将字符串统一转成大写
     * 
     */
    this.setState({
      loading: true
    })
    let list = this.state.data
    let searchData = []
    for (let i = 0; i < list.length; i++) {
      let petName = list[i].petName.toLowerCase() || ''
      let patientId = list[i].patientId.toLowerCase() || ''
      if (`${petName}`.indexOf(keyWord.toLowerCase()) !== -1 || `${patientId}`.indexOf(keyWord.toLowerCase()) !== -1) {
        searchData.push(list[i])
      }
    }
    console.log(searchData);
    this.setState({
      searchData,
      loading: false
    })





  }

  render () {
    const columns = [
      {
        title: 'Time',
        dataIndex: 'insertedAt',
        key: 'insertedAt',
        ...this.getColumnSearchProps('insertedAt'),
        render: (text, record, index) => {
          let chazhi = new Date().getTimezoneOffset()
          // console.log(moment(parseInt(text) * 1000).format('YYYY-MM-DD HH:mm'));
          let newTime = moment(parseInt(text) * 1000).format('YYYY-MM-DD HH:mm');
          // console.log(moment(parseInt(text) * 1000).add(chazhi, 'm').format('YYYY-MM-DD HH:mm'));
          return (
            <p style={{ textAlign: 'center' }}>{newTime}</p>
          )

        }
      },
      {
        title: 'Pet ID',
        dataIndex: 'patientId',
        key: 'patientId',
        //   width: '30%',
        ...this.getColumnSearchProps('patientId'),
      },
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
        render: (text, record, index) => {
          if (!text || text === 'defaultdog' || text === 'defaultother' || text === 'defaultcat') {
            return (
              <p style={{ textAlign: 'center' }}>{'unknown'}</p>
            )
          } else {
            return (
              <p style={{ textAlign: 'center' }}>{text}</p>
            )
          }

        }
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
        render: (text, record, index) => {
          // console.log(text);

          if (`${text}` === 'NaN') {
            return (
              <p style={{ textAlign: 'center', justifyItems: 'center' }}>{'unknown'}</p>
            )
          } else {
            return (
              <p style={{ textAlign: 'center' }}>{text}</p>
            )
          }

        }
      },
      // {
      //   title: 'Weight',
      //   dataIndex: 'weight',
      //   key: 'weight',
      //   ...this.getColumnSearchProps('weight'),
      // },


    ];
    const { loading, data, api, id, seleceID, spin, closeColor, closebgc, minbgc } = this.state
    return (

      <div id="doctorSelectExam">
        {/* 关闭缩小 */}

        {/* <div className="close1">

          <div className="menu">
            <Menu
              onClick={this.handleClick}
              selectedKeys={['menu']}
              mode="horizontal"
              theme={'drak'}
            >

              <SubMenu key="SubMenu"
                popupOffset={[0, -8]}
                icon={<MyIcon type='icon-ic_menu_px' className="icon" />}
              >
                <Menu.Item key="2">Home</Menu.Item>
                <Menu.Item key="4">Workplace</Menu.Item>
                <Menu.Item key='3'>Clinical Study Mode</Menu.Item>

              </SubMenu>

            </Menu>
          </div>

          <div className="return"
            onClick={() => {
              this.handleClick({ key: '1' })
            }}
          >
            <div
              className=" iconfont icon-left heard"
              onClick={() => console.log('返回')}
            />
          </div>

          <div className="search">
            <input
              value={this.state.heardSearchText}
              placeholder="Search by pet name    "

              onChange={(item) => {
                // console.log(item.target.value.replace(/(^\s*)/g, ""));
                this.setState({
                  heardSearchText: item.target.value.replace(/(^\s*)/g, "")
                })
                let search = item.target.value.replace(/(^\s*)/g, "")
                if (search.length === 0) {
                  console.log('清空了');
                } else {
                  this._search(search)
                }
              }}

              onKeyDown={(e) => {
                // console.log('------', e);
                if (e.keyCode === 13) {
                  console.log('搜索');
                  if (this.state.heardSearchText.length > 0) {
                    this._search(this.state.heardSearchText)
                  }
                }
              }}
            />

            <div className="searchIconFa"
              onClick={() => {
                console.log('点击');
                if (this.state.heardSearchText.length > 0) {
                  this._search(this.state.heardSearchText)
                }

              }}
            >
              <span className=" iconfont icon-sousuo searchIcon" />
            </div>


          </div>



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
        </div> */}

        <Heard
          onReturn={() => {
            this.props.history.push('/page11')
          }}
        />

        <div className="textfa1">
          <div className="textfa">
            <div className="text">Scheduled Patients</div>
            <div className="text3"><SyncOutlined onClick={this._refresh} spin={spin} />   </div>
          </div>
          <div className="r"
            ref={add => this.add = add}
            onClick={() => {
              console.log('我要去添加宠物');
              // /pet/doctorAddPet
              this.props.history.push({ pathname: '/pet/doctorAddPet' })
            }}
            onMouseDown={() => {
              this.add.style.color = 'rgba(0,0,0,0.3)'
            }}
            onMouseUp={() => {
              this.add.style.color = 'rgba(0,0,0)'
            }}
          >+</div>
        </div>


        <div className="table">
          <Table
            rowKey={data => data.id}
            bordered={false}
            columns={columns}
            dataSource={(this.state.heardSearchText.length === 0) ? data : this.state.searchData}
            loading={loading}
            locale={{ filterConfirm: <div>111</div> }}
            pagination={{ pageSize: 7, showSizeChanger: false, showQuickJumper: true, defaultCurrent: this.state.current }}
            onRow={(record) => {
              return {
                onClick: (event) => {

                  console.log('record', record);
                  storage.doctorExam = JSON.stringify(record)
                  let selectNum = document.getElementsByClassName('ant-pagination-item-active')

                  storage.defaultCurrent = selectNum[0].title
                  storage.doctorList = JSON.stringify(this.state.data)

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
