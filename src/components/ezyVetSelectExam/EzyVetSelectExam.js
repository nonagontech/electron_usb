//这里主要是直接从ezyVet获取数据
//这是ezyVet的选择界面，后期集成时候别忘了identity，进入测量界面的身份，是vetspire、ezyvet、普通医生
import React, { Component } from 'react'
import {
  Table,
  Input,
  Button,
  Space,
  message

} from 'antd';
import moment from 'moment'
import 'antd/dist/antd.css';
import { SyncOutlined } from '@ant-design/icons';
import MaxMin from '../../utils/maxminreturn/MaxMinReturn'
import './ezyVetSelectExam.less'

import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { FetchEszVet } from '../../utils/FetchEszVet'
import { fetchRequest2 } from '../../utils/FetchUtil2'
import gender from './../../utils/gender'

let storage = window.localStorage;


export default class EzyVetSelectExam extends Component {
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
    unixToURI: '',
    ezyVetToken: '',
    current: 1
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
    storage.identity = '2'
    if (storage.unixToURI !== '' && storage.unixToURI !== undefined) {
      this.setState({
        unixToURI: storage.unixToURI
      })
    }

    if (storage.ezyVetToken !== '' && storage.ezyVetToken !== undefined) {
      this.setState({
        ezyVetToken: storage.ezyVetToken
      })
    }



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



  }
  componentWillUnmount () {
    message.destroy()
  }

  _getExam = async () => {
    console.log('进来了');
    this.setState({
      loading: true
    })
    console.log(storage.unixToURI, '------------', storage.ezyVetToken);
    let params = {
      limit: '100',
      timestamp: storage.unixToURI
    }

    //1.获取病历单号但是缺少宠物信息
    let url = `/healthstatus?limit=100&timestamp=${storage.unixToURI}`
    if (storage.selectPatientId) {
      url += `&animal_id=${storage.selectPatientId}`
    }
    FetchEszVet(url, "GET", '', `Bearer ${storage.ezyVetToken}`)
      .then(res => {
        console.log('------------------------------res', res);
        if (res.messages.length === 0) {
          let examArr = res.items
          console.log('examArr', examArr);
          let healthStatusArr = [], animalIdArr = []


          for (let i = 0; i < examArr.length; i++) {
            let { animal_id, consult_id, created_at, id, timestamp, modified_at, heart_rate, notes } = examArr[i].healthstatus

            let json = {
              animal_id,
              consult_id,
              insertedAt: timestamp,
              key: id,
              created_at,
              heart_rate, notes,
              modified_at
            }

            healthStatusArr.push(json)
            if (animalIdArr.indexOf(parseInt(animal_id)) === -1) {
              animalIdArr.push(parseInt(animal_id))
            }
          }

          console.log(healthStatusArr, animalIdArr);
          let animal = `{"in":[${animalIdArr}]}`
          let uri = encodeURIComponent(animal)
          console.log('宠物id集合：', uri)
          //2.获取宠物信息
          FetchEszVet(`/animal?id=${uri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
            .then(res => {
              console.log('获取到的宠物信息1:', res, `Bearer ${storage.ezyVetToken}`);
              if (res.messages.length === 0) {

                let animalArr = res.items
                let animalInfoArr = []
                let breedIdArr = [], contactIDArr = []

                for (let i = 0; i < animalArr.length; i++) {
                  let { breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id, animalcolour_id, guid,
                    referring_clinic_id, referring_vet_id, residence_contact_id, species_id, created_at, modified_at, notes } = animalArr[i].animal
                  let animalInfo = {
                    breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id, animalcolour_id, guid,
                    referring_clinic_id, referring_vet_id, residence_contact_id, species_id, created_at, modified_at, notes
                  }
                  if (breedIdArr.indexOf(breed_id) === -1) {
                    breedIdArr.push(breed_id)
                  }
                  if (contactIDArr.indexOf(contact_id) === -1) {
                    contactIDArr.push(contact_id)
                  }
                  animalInfoArr.push(animalInfo)

                }
                console.log('我拿到了宠物的信息', animalInfoArr, '品种id集合', breedIdArr, '宠物主人id集合', contactIDArr);
                //3.遍历记录数组，把宠物信息添加到病历单-缺少宠物主人信息与品种
                let endArr = healthStatusArr.map((data, index) => {
                  let oneExam = data

                  for (let i = 0; i < animalInfoArr.length; i++) {

                    if (animalInfoArr[i].id === oneExam.animal_id) {
                      let { breed_id, date_of_birth, name, weight, weight_unit, contact_id, sex_id,

                        bree_id, animalcolour_id, guid,
                        referring_clinic_id, referring_vet_id, residence_contact_id, species_id

                      } = animalInfoArr[i]
                      let age = moment().diff(moment(parseInt(date_of_birth) * 1000), 'years')
                      oneExam.age = age
                      oneExam.breed = breed_id
                      oneExam.gender = gender[sex_id]
                      oneExam.contact_id = contact_id
                      oneExam.petName = name
                      oneExam.weight = `${parseInt(weight).toFixed(1)} ${weight_unit}`
                      oneExam.weightNum = `${parseInt(weight).toFixed(1)}`
                      oneExam.weight_unit = weight_unit
                      oneExam.animal = animalInfoArr[i]

                      break
                    }

                  }
                  return oneExam
                })

                console.log('融合后', endArr);
                let contactIDStr = `{"in":[${contactIDArr}]}`

                let contactIDUri = encodeURIComponent(contactIDStr)
                console.log(contactIDStr);

                let getContactArr = []
                //4. 获取宠物主人信息
                FetchEszVet(`/contact?id=${contactIDUri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
                  .then(res => {
                    console.log('-------宠物主人信息：', res);
                    if (res.messages.length === 0) {
                      let items = res.items
                      for (let i = 0; i < items.length; i++) {

                        const { first_name, last_name, id, address_physical, address_postal, business_name, code, contact_detail_list, created_at,
                          is_business, is_customer, is_staff_member, is_supplier, is_syndicate, is_vet, modified_at, ownership_id } = items[i].contact
                        let name = ''
                        if (first_name === '' && last_name === '') {
                          name = 'unknown'
                        } else {
                          name = `${last_name} ${first_name}`
                        }
                        let json = {
                          name,
                          id,
                          first_name, last_name, address_physical, address_postal, business_name, code, contact_detail_list, created_at,
                          is_business, is_customer, is_staff_member, is_supplier, is_syndicate, is_vet, modified_at, ownership_id
                        }
                        getContactArr.push(json)
                      }

                      console.log('endArr', endArr);
                      //5.把宠物信息并到病历单-----缺少品种
                      let dataArr = endArr.map((data) => {
                        let oneExam = data
                        for (let i = 0; i < getContactArr.length; i++) {
                          if (getContactArr[i].id === oneExam.contact_id) {
                            let { name } = getContactArr[i]
                            oneExam.owner = name
                            oneExam.contact = getContactArr[i]
                          }

                        }
                        return oneExam
                      })
                      console.log('添加过主人信息的记录：', dataArr);

                      //6.获取病历单
                      let breedIdStr = `{"in":[${breedIdArr}]}`

                      let breedIdUri = encodeURIComponent(breedIdStr)
                      console.log(breedIdUri);

                      let getbreedIdArr = []

                      FetchEszVet(`/breed?id=${breedIdUri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
                        .then(res => {
                          console.log('获取到了品种信息', res);

                          if (res.messages.length === 0) {

                            let items = res.items
                            for (let i = 0; i < items.length; i++) {

                              const { name, id, created_at, modified_at, species_id } = items[i].breed

                              if (name === '') {
                                name = 'unKnown'
                              }
                              let json = {
                                name,
                                id,
                                created_at, modified_at, species_id
                              }
                              getbreedIdArr.push(json)
                            }

                            console.log('endArr', endArr);
                            //5.把宠物品种并到病历单
                            let endExamArr = dataArr.map((data, index) => {
                              let oneExam = data

                              for (let i = 0; i < getbreedIdArr.length; i++) {

                                if (getbreedIdArr[i].id === oneExam.breed) {
                                  let { name } = getbreedIdArr[i]
                                  oneExam.breed = name
                                  oneExam.allBreed = getbreedIdArr[i]
                                }

                              }
                              return oneExam
                            })
                            console.log('最终合成的数据：', endExamArr);
                            this.setState({
                              data: endExamArr,
                              loading: false,
                              spin: false
                            })
                          }
                        })
                        .catch(err => {
                          console.log(err);
                          this.setState({
                            loading: false,
                            spin: false
                          })
                        })




                    }

                  })
                  .catch(err => {
                    this.setState({
                      loading: false,
                      spin: false
                    })
                    console.log(err);
                  })


              }
            })
            .catch(err => {
              this.setState({
                loading: false,
                spin: false
              })
              console.log(err);
            })

        }
      })
      .catch(err => {
        this.setState({
          loading: false,
          spin: false
        })
        console.log(err);
      })

  }

  //封装的日期排序方法<div className=" ForwardRankingDate(data, p) {
  ForwardRankingDate = (data, p) => {
    for (let i = 0; i < data.length - 1; i++) {
      for (let j = 0; j < data.length - 1 - i; j++) {
        // console.log(Date.parse(data[j][p]));
        if (Date.parse(data[j][p]) < Date.parse(data[j + 1][p])) {
          var temp = data[j];
          data[j] = data[j + 1];
          data[j + 1] = temp;
        }
      }
    }
    return data;
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
      {
        title: 'Weight',
        dataIndex: 'weight',
        key: 'weight',
        ...this.getColumnSearchProps('weight'),
      },
      {
        title: 'Time',
        dataIndex: 'insertedAt',
        key: 'insertedAt',
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

    ];
    const { loading, data, api, id, seleceID, spin } = this.state
    return (

      <div id="ezyVetSelectExam">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push({ pathname: '/EzyVetSelectTime' })}
        />

        <div className="textfa1">
          <div className="textfa">
            <div className="text">Select Patient Exam</div>
            <div className="text3"><SyncOutlined onClick={this._refresh} spin={spin} />   </div>
          </div>
          <div className="r"
            ref={add => this.add = add}
            onClick={() => {
              let electron = window.electron
              electron.shell.openExternal('https://apisandbox.trial.ezyvet.com/#')
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
            columns={columns}
            dataSource={data}
            loading={loading}
            locale={{ filterConfirm: <div>111</div> }}
            pagination={{ pageSize: 7, showSizeChanger: false, showQuickJumper: true, defaultCurrent: this.state.current }}
            onRow={(record) => {
              return {
                onClick: (event) => {

                  console.log('record', record);

                  if (record.consult_id === '') {
                    message.error('This record cannot be updated. Please try another record', 10)
                    return
                  }

                  let { allBreed, animal, contact } = record
                  let { animalcolour_id, breed_id, contact_id, date_of_birth, guid, id, name, referring_clinic_id, referring_vet_id,
                    residence_contact_id, sex_id, species_id, weight, weight_unit, created_at, modified_at
                  } = animal
                  let { address_physical, address_postal, business_name, contact_detail_list, first_name, is_business, is_customer,
                    is_staff_member, is_supplier, is_syndicate, is_vet, last_name, ownership_id, code, notes
                  } = contact
                  let breed = {}
                  if (allBreed) {
                    breed = {
                      id: allBreed.id,
                      created_at: allBreed.created_at,
                      modified_at: allBreed.modified_at,
                      name: allBreed.name,
                      species_id: allBreed.species_id
                    }
                  }
                  let params = [{
                    id,
                    created_at,
                    modified_at,
                    name,
                    sex_id,
                    animalcolour_id,
                    species_id,
                    breed_id,
                    contact_id,
                    date_of_birth,
                    referring_clinic_id,
                    referring_vet_id,
                    residence_contact_id,
                    weight,
                    weight_unit,
                    notes,
                    guid,
                    sex: '',
                    breed,
                    species: {
                      id: "",
                      created_at: "",
                      modified_at: "",
                      name: "",
                      icon: ""
                    },
                    contact: {
                      id: contact.id,
                      created_at: contact.created_at,
                      modified_at: contact.modified_at,
                      code,
                      first_name,
                      last_name,
                      business_name,
                      is_business,
                      is_customer,
                      is_supplier,
                      is_vet,
                      is_syndicate,
                      is_staff_member,
                      contact_detail_list,
                      address_physical,
                      address_postal,
                      ownership_id
                    }
                  }]
                  console.log('入参：', params);
                  fetchRequest2('/EzyVet/checkAndSaveAnimalList', 'POST', params)
                    .then(res => {
                      console.log('====', res);
                      if (res.flag === true) {
                        storage.ezyVetSelectHealthstatus = JSON.stringify(record)
                        storage.ezyVetList = JSON.stringify(this.state.data)
                        let selectNum = document.getElementsByClassName('ant-pagination-item-active')

                        storage.defaultCurrent = selectNum[0].title

                        this.props.history.push({ pathname: '/page10', })
                      }
                    })
                    .catch(err => {
                      console.log(err);
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




//下面这一块是通过后台获取到exam且进行集成
// import React, { Component } from 'react'
// import {
//   Table,
//   Input,
//   Button,
//   Space,
//   message

// } from 'antd';
// import moment from 'moment'
// import 'antd/dist/antd.css';
// import { SyncOutlined } from '@ant-design/icons';
// import MaxMin from '../../utils/maxminreturn/MaxMinReturn'
// import './ezyVetSelectExam.less'

// import Highlighter from 'react-highlight-words';
// import { SearchOutlined } from '@ant-design/icons';
// import { FetchEszVet } from '../../utils/FetchEszVet'
// import { fetchToken } from '../../utils/Fetch_token'
// import gender from './../../utils/gender'

// let storage = window.localStorage;


// export default class EzyVetSelectExam extends Component {
//   state = {
//     loading: false,
//     api: '',
//     id: '',  //选择location的id
//     locations: [],
//     data: [],
//     searchText: '',
//     searchedColumn: '',
//     seleceID: '',  //宠物医生id
//     spin: false,   //刷新按钮是否旋转



//     unixToURI: '',
//     ezyVetToken: ''
//   }

//   componentDidMount () {
//     let ipcRenderer = window.electron.ipcRenderer
//     ipcRenderer.send('big')
//     if (storage.unixToURI !== '' && storage.unixToURI !== undefined) {
//       this.setState({
//         unixToURI: storage.unixToURI
//       })
//     }

//     if (storage.ezyVetToken !== '' && storage.ezyVetToken !== undefined) {
//       this.setState({
//         ezyVetToken: storage.ezyVetToken
//       })
//     }

//     this._getExam()

//   }
//   componentWillUnmount () {
//     message.destroy()
//   }

//   _getExam = async () => {
//     console.log('进来了');
//     this.setState({
//       loading: true
//     })
//     console.log(storage.unixToURI, '------------', storage.ezyVetToken);
//     let params = {
//       limit: '100',
//       timestamp: storage.unixToURI
//     }

//     //1.获取病历单号但是缺少宠物信息
//     fetchToken(`/EzyVet/healthstatus`, "GET", params, `Bearer ${storage.ezyVetToken}`)
//       .then(res => {
//         console.log('res', res);
//         if (res.msg === 'success') {
//           let examArr = res.data.items
//           console.log(examArr);
//           let healthStatusArr = [], animalIdArr = []


//           for (let i = 0; i < examArr.length; i++) {
//             let { animal_id, consult_id, created_at, id, timestamp, modified_at } = examArr[i]

//             let json = {
//               animal_id,
//               consult_id,
//               insertedAt: timestamp,
//               key: id
//             }
//             healthStatusArr.push(json)
//             if (animalIdArr.indexOf(parseInt(animal_id)) === -1) {
//               animalIdArr.push(parseInt(animal_id))
//             }
//           }

//           console.log(healthStatusArr, animalIdArr);
//           let animal = `{"in":[${animalIdArr}]}`
//           let uri = encodeURIComponent(animal)
//           console.log('宠物id集合：', uri)
//           //2.获取宠物信息
//           fetchToken(`/EzyVet/animal?id=${uri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//             .then(res => {
//               console.log('获取到的宠物信息:', res, `Bearer ${storage.ezyVetToken}`);
//               if (res.msg === 'success') {

//                 let animalArr = res.data.items
//                 let animalInfoArr = []
//                 let breedIdArr = [], contactIDArr = []

//                 for (let i = 0; i < animalArr.length; i++) {
//                   let { breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id, } = animalArr[i]
//                   let animalInfo = {
//                     breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id
//                   }
//                   if (breedIdArr.indexOf(breed_id) === -1) {
//                     breedIdArr.push(breed_id)
//                   }
//                   if (contactIDArr.indexOf(contact_id) === -1) {
//                     contactIDArr.push(contact_id)
//                   }

//                   animalInfoArr.push(animalInfo)

//                 }
//                 console.log('我拿到了宠物的信息', animalInfoArr, '品种id集合', breedIdArr, '宠物主人id集合', contactIDArr);
//                 //3.遍历记录数组，把宠物信息添加到病历单-缺少宠物主人信息与品种
//                 let endArr = healthStatusArr.map((data, index) => {
//                   let oneExam = data

//                   for (let i = 0; i < animalInfoArr.length; i++) {

//                     if (animalInfoArr[i].id === oneExam.animal_id) {
//                       let { breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id, } = animalInfoArr[i]
//                       let age = moment().diff(moment(parseInt(date_of_birth) * 1000), 'years')
//                       oneExam.age = age
//                       oneExam.breed = breed_id
//                       oneExam.gender = gender[sex_id]
//                       oneExam.contact_id = contact_id
//                       oneExam.petName = name
//                       oneExam.weight = `${parseInt(weight).toFixed(1)} ${weight_unit}`
//                       break
//                     }

//                   }
//                   return oneExam
//                 })

//                 console.log('融合后', endArr);
//                 let contactIDStr = `{"in":[${contactIDArr}]}`

//                 let contactIDUri = encodeURIComponent(contactIDStr)
//                 console.log(contactIDStr);

//                 let getContactArr = []
//                 //4. 获取宠物主人信息
//                 fetchToken(`/EzyVet/contact?id=${contactIDUri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//                   .then(res => {
//                     console.log('-------宠物主人信息：', res);
//                     if (res.msg === 'success') {
//                       let items = res.data
//                       for (let i = 0; i < items.length; i++) {

//                         const { first_name, last_name, id } = items[i]
//                         let name = ''
//                         if (first_name === '' && last_name === '') {
//                           name = 'UnKnown'
//                         } else {
//                           name = `${last_name} ${first_name}`
//                         }
//                         let json = {
//                           name,
//                           id
//                         }
//                         getContactArr.push(json)
//                       }

//                       console.log('endArr', endArr);
//                       //5.把宠物信息并到病历单-----缺少品种
//                       let dataArr = endArr.map((data) => {
//                         let oneExam = data
//                         for (let i = 0; i < getContactArr.length; i++) {
//                           if (getContactArr[i].id === oneExam.contact_id) {
//                             let { name } = getContactArr[i]
//                             oneExam.owner = name
//                           }

//                         }
//                         return oneExam
//                       })


//                       //6.获取病历单
//                       let breedIdStr = `{"in":[${breedIdArr}]}`

//                       let breedIdUri = encodeURIComponent(breedIdStr)
//                       console.log(breedIdUri);

//                       let getbreedIdArr = []

//                       fetchToken(`/EzyVet/breed?id=${breedIdUri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//                         .then(res => {
//                           console.log('获取到了品种信息', res);



//                           let items = res.data
//                           for (let i = 0; i < items.length; i++) {

//                             const { name, id } = items[i]

//                             if (name === '') {
//                               name = 'UnKnown'
//                             }
//                             let json = {
//                               name,
//                               id
//                             }
//                             getbreedIdArr.push(json)
//                           }

//                           console.log('endArr', endArr);
//                           //5.把宠物品种并到病历单
//                           let endExamArr = dataArr.map((data, index) => {
//                             let oneExam = data

//                             for (let i = 0; i < getbreedIdArr.length; i++) {

//                               if (getbreedIdArr[i].id === oneExam.breed) {
//                                 let { name } = getbreedIdArr[i]
//                                 oneExam.breed = name
//                               }

//                             }
//                             return oneExam
//                           })
//                           this.setState({
//                             data: endExamArr,
//                             loading: false,
//                             spin: false
//                           })
//                         })
//                         .catch(err => {
//                           console.log(err);
//                           this.setState({
//                             loading: false,
//                             spin: false
//                           })
//                         })




//                     }

//                   })
//                   .catch(err => {
//                     this.setState({
//                       loading: false,
//                       spin: false
//                     })
//                     console.log(err);
//                   })


//               }
//             })
//             .catch(err => {
//               this.setState({
//                 loading: false,
//                 spin: false
//               })
//               console.log(err);
//             })

//         }
//       })
//       .catch(err => {
//         this.setState({
//           loading: false,
//           spin: false
//         })
//         console.log(err);
//       })



//     // FetchEszVet(`/healthstatus?limit=100&timestamp=${storage.unixToURI}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//     //   .then(res => {
//     //     console.log(res);
//     //     let examArr = res.items
//     //     console.log(examArr);
//     //     let healthStatusArr = [], animalIdArr = []


//     //     for (let i = 0; i < examArr.length; i++) {
//     //       let { animal_id, consult_id, created_at, id, timestamp, modified_at } = examArr[i].healthstatus

//     //       let json = {
//     //         animal_id,
//     //         consult_id,
//     //         insertedAt: timestamp,
//     //         key: id
//     //       }
//     //       healthStatusArr.push(json)
//     //       if (animalIdArr.indexOf(parseInt(animal_id)) === -1) {
//     //         animalIdArr.push(parseInt(animal_id))
//     //       }
//     //     }

//     //     console.log(healthStatusArr, animalIdArr);
//     //     let animal = `{"in":[${animalIdArr}]}`
//     //     // console.log(animal);
//     //     let uri = encodeURIComponent(animal)
//     //     //2.获取宠物信息
//     //     FetchEszVet(`/animal?id=${uri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//     //       .then(res => {
//     //         console.log('宠物信息', res);
//     //         let animalArr = res.items
//     //         let animalInfoArr = []
//     //         let breedIdArr = [], contactIDArr = []

//     //         for (let i = 0; i < animalArr.length; i++) {
//     //           let { breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id, } = animalArr[i].animal
//     //           let animalInfo = {
//     //             breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id
//     //           }
//     //           if (breedIdArr.indexOf(breed_id) === -1) {
//     //             breedIdArr.push(breed_id)
//     //           }
//     //           if (contactIDArr.indexOf(contact_id) === -1) {
//     //             contactIDArr.push(contact_id)
//     //           }

//     //           animalInfoArr.push(animalInfo)

//     //         }
//     //         console.log('我拿到了宠物的信息', animalInfoArr, '品种id集合', breedIdArr, '宠物主人id集合', contactIDArr);
//     //         //3.遍历记录数组，把宠物信息添加到病历单-缺少宠物主人信息与品种
//     //         let endArr = healthStatusArr.map((data, index) => {
//     //           let oneExam = data

//     //           for (let i = 0; i < animalInfoArr.length; i++) {

//     //             if (animalInfoArr[i].id === oneExam.animal_id) {
//     //               let { breed_id, date_of_birth, id, name, weight, weight_unit, contact_id, sex_id, } = animalInfoArr[i]
//     //               let age = moment().diff(moment(parseInt(date_of_birth) * 1000), 'years')
//     //               oneExam.age = age
//     //               oneExam.breed = breed_id
//     //               oneExam.gender = gender[sex_id]
//     //               oneExam.contact_id = contact_id
//     //               oneExam.petName = name
//     //               oneExam.weight = `${parseInt(weight).toFixed(1)} ${weight_unit}`
//     //               break
//     //             }

//     //           }
//     //           return oneExam
//     //         })

//     //         console.log(endArr);
//     //         let contactIDStr = `{"in":[${contactIDArr}]}`

//     //         let contactIDUri = encodeURIComponent(contactIDStr)
//     //         console.log(contactIDStr);

//     //         let getContactArr = []
//     //         //4. 获取宠物信息
//     //         FetchEszVet(`/contact?id=${contactIDUri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//     //           .then(res => {
//     //             console.log('-------宠物主人信息：', res);
//     //             let items = res.items
//     //             for (let i = 0; i < items.length; i++) {

//     //               const { first_name, last_name, id } = items[i].contact
//     //               let name = ''
//     //               if (first_name === '' && last_name === '') {
//     //                 name = 'UnKnown'
//     //               } else {
//     //                 name = `${last_name} ${first_name}`
//     //               }
//     //               let json = {
//     //                 name,
//     //                 id
//     //               }
//     //               getContactArr.push(json)
//     //             }

//     //             console.log('endArr', endArr);
//     //             //5.把宠物信息并到病历单-----缺少品种
//     //             let dataArr = endArr.map((data) => {
//     //               let oneExam = data
//     //               for (let i = 0; i < getContactArr.length; i++) {
//     //                 if (getContactArr[i].id === oneExam.contact_id) {
//     //                   let { name } = getContactArr[i]
//     //                   oneExam.owner = name
//     //                 }

//     //               }
//     //               return oneExam
//     //             })


//     //             //6.获取病历单
//     //             let breedIdStr = `{"in":[${breedIdArr}]}`

//     //             let breedIdUri = encodeURIComponent(breedIdStr)
//     //             console.log(breedIdUri);

//     //             let getbreedIdArr = []

//     //             FetchEszVet(`/breed?id=${breedIdUri}`, "GET", '', `Bearer ${storage.ezyVetToken}`)
//     //               .then(res => {
//     //                 console.log('获取到了品种信息', res);



//     //                 let items = res.items
//     //                 for (let i = 0; i < items.length; i++) {

//     //                   const { name, id } = items[i].breed

//     //                   if (name === '') {
//     //                     name = 'UnKnown'
//     //                   }
//     //                   let json = {
//     //                     name,
//     //                     id
//     //                   }
//     //                   getbreedIdArr.push(json)
//     //                 }

//     //                 console.log('endArr', endArr);
//     //                 //5.把宠物品种并到病历单
//     //                 let endExamArr = dataArr.map((data, index) => {
//     //                   let oneExam = data

//     //                   for (let i = 0; i < getbreedIdArr.length; i++) {

//     //                     if (getbreedIdArr[i].id === oneExam.breed) {
//     //                       let { name } = getbreedIdArr[i]
//     //                       oneExam.breed = name
//     //                     }

//     //                   }
//     //                   return oneExam
//     //                 })
//     //                 this.setState({
//     //                   data: endExamArr,
//     //                   loading: false,
//     //                   spin: false
//     //                 })
//     //               })
//     //               .catch(err => {
//     //                 console.log(err);
//     //                 this.setState({
//     //                   loading: false,
//     //                   spin: false
//     //                 })
//     //               })

//     //           })
//     //           .catch(err => {
//     //             console.log(err);
//     //             this.setState({
//     //               loading: false,
//     //               spin: false
//     //             })
//     //           })



//     //       })
//     //       .catch(err => {
//     //         this.setState({
//     //           loading: false,
//     //           spin: false
//     //         })
//     //         console.log(err);
//     //       })


//     //   })
//     //   .catch(err => {
//     //     console.log(err);
//     //     this.setState({
//     //       loading: false,
//     //       spin: false
//     //     })
//     //   })

//   }

//   //封装的日期排序方法<div className=" ForwardRankingDate(data, p) {
//   ForwardRankingDate = (data, p) => {
//     for (let i = 0; i < data.length - 1; i++) {
//       for (let j = 0; j < data.length - 1 - i; j++) {
//         // console.log(Date.parse(data[j][p]));
//         if (Date.parse(data[j][p]) < Date.parse(data[j + 1][p])) {
//           var temp = data[j];
//           data[j] = data[j + 1];
//           data[j + 1] = temp;
//         }
//       }
//     }
//     return data;
//   }


//   getColumnSearchProps = dataIndex => ({
//     //dataIndex 是标题名称
//     filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => ( //通过 filterDropdown 自定义的列筛选功能，并实现一个搜索列的示例。
//       <div style={{ padding: 8 }}>
//         <Input
//           ref={node => {
//             this.searchInput = node;
//           }}
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//           onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{ width: 188, marginBottom: 8, display: 'block' }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Search
//           </Button>
//           <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
//             Reset
//           </Button>
//         </Space>
//       </div>
//     ),
//     //自定义Icon
//     filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
//     //	本地模式下，确定筛选的运行函数 value:输入框里输入的内容     record:所有的项，相当于遍历
//     onFilter: (value, record) => {
//       console.log(value, record, dataIndex);
//       return record[dataIndex]
//         ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
//         : ''
//     },
//     onFilterDropdownVisibleChange: visible => {
//       if (visible) {
//         setTimeout(() => this.searchInput.select(), 100);
//       }
//     },
//     render: text =>
//       this.state.searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
//           searchWords={[this.state.searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ''}
//         />
//       ) : (
//         text
//       ),
//   });

//   handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     this.setState({
//       searchText: selectedKeys[0],
//       searchedColumn: dataIndex,
//     });
//   };

//   handleReset = clearFilters => {
//     clearFilters();
//     this.setState({ searchText: '' });
//   };
//   _refresh = () => {
//     console.log('点击了');
//     this.setState({
//       spin: true
//     })
//     // this._getData()
//     this._getExam()
//   }
//   render () {
//     const columns = [
//       {
//         title: 'Pet Name',
//         dataIndex: 'petName',
//         key: 'petName',
//         //   width: '30%',
//         ...this.getColumnSearchProps('petName'),
//       },
//       {
//         title: 'Owner',
//         dataIndex: 'owner',
//         key: 'owner',
//         //   width: '20%',
//         ...this.getColumnSearchProps('owner'),
//       },
//       {
//         title: 'Breed',
//         dataIndex: 'breed',
//         key: 'breed',
//         ...this.getColumnSearchProps('breed'),
//       },

//       {
//         title: 'Gender',
//         dataIndex: 'gender',
//         key: 'gender',
//         // width: '30%',
//         ...this.getColumnSearchProps('gender'),
//       },
//       {
//         title: 'Age',
//         dataIndex: 'age',
//         key: 'age',
//         // width: '20%',
//         render: (text, record, index) => {
//           // console.log(text);

//           if (`${text}` === 'NaN') {
//             return (
//               <p style={{ textAlign: 'center', justifyItems: 'center' }}>{'unknown'}</p>
//             )
//           } else {
//             return (
//               <p style={{ textAlign: 'center' }}>{text}</p>
//             )
//           }

//         }
//       },
//       {
//         title: 'Weight',
//         dataIndex: 'weight',
//         key: 'weight',
//         ...this.getColumnSearchProps('weight'),
//       },
//       {
//         title: 'Creation time',
//         dataIndex: 'insertedAt',
//         key: 'insertedAt',
//         render: (text, record, index) => {
//           let chazhi = new Date().getTimezoneOffset()
//           // console.log(moment(parseInt(text) * 1000).format('YYYY-MM-DD HH:mm'));
//           let newTime = moment(parseInt(text) * 1000).format('YYYY-MM-DD HH:mm');
//           // console.log(moment(parseInt(text) * 1000).add(chazhi, 'm').format('YYYY-MM-DD HH:mm'));
//           return (
//             <p style={{ textAlign: 'center' }}>{newTime}</p>
//           )

//         }
//       },

//     ];
//     const { loading, data, api, id, seleceID, spin } = this.state
//     return (

//       <div id="ezyVetSelectExam">
//         {/* 关闭缩小 */}
//         <MaxMin
//           onClick={() => { this.props.history.push('/') }}
//           onClick1={() => this.props.history.push({ pathname: '/EzyVetSelectTime' })}
//         />

//         <div className="textfa1">
//           <div className="textfa">
//             <div className="text">Select Patient Exam</div>
//             <div className="text3"><SyncOutlined onClick={this._refresh} spin={spin} />   </div>
//           </div>
//           <div className="r" onClick={() => {
//             let electron = window.electron
//             electron.shell.openExternal('https://mella.vetspire.com/clients')
//           }}>+</div>
//         </div>


//         <div className="table">
//           <Table
//             columns={columns}
//             dataSource={data}
//             loading={loading}
//             locale={{ filterConfirm: <div>111</div> }}
//             pagination={{ pageSize: 7, showSizeChanger: false, showQuickJumper: true }}
//             onRow={(record) => {
//               return {
//                 onClick: (event) => {

//                   console.log(record);
//                   if (record.consult_id === '') {
//                     message.error('This record cannot be updated. Please try another record', 10)
//                     return
//                   }
//                   storage.ezyVetSelectHealthstatus = JSON.stringify(record)

//                   // let patientId = record.key
//                   // let petName = record.petName

//                   // console.log(patientId, petName);
//                   // storage.selectExamId = record.key
//                   // storage.selectPatientId = record.patientId

//                   // storage.selectAge = record.age
//                   // storage.selectBreed = record.breed
//                   // storage.selectOwner = record.owner
//                   // storage.selectWeight = record.weight
//                   // storage.selectPetName = record.petName

//                   this.props.history.push({ pathname: '/page10', })

//                 }, // 点击行

//               };
//             }}
//           />
//         </div>

//       </div>
//     )
//   }
// }

