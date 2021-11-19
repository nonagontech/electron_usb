
import React, { Component } from 'react'
import {
  Table,
  Popconfirm,
  Modal,
  Input,
  message,
  Select

} from 'antd'
import moment from 'moment'
import Draggable from "react-draggable";

import './unassigned.less'
import Heard from './../../../utils/heard/Heard'
import { fetchRequest } from '../../../utils/FetchUtil1'

import del from './../../../assets/images/del.png'
import UploadImg from './../../../utils/uploadImg/UploadImg'

let storage = window.localStorage;
const { Option } = Select;

export default class Unassigned extends Component {

  state = {
    historyData: [],        //列表的数据集合
    units: '℉',
    searchText: '',         //搜索框输入的内容
    seleceEmergencies: {},  //分配的这条记录里的所有内容，比如温度、id、时间等
    visible: false,       //nodel框是否显示
    disabled: true,       //model是否可拖拽
    imgId: -1,            //上传后返回的图像id号

    assignPatientId: '',
    assignPetName: '',
    assignOwnerName: '',
    assignBreed: '',
    assignBreedId: '',
    assignPetAge: '',
    assignPetWeight: '',
    assignPetId: '',
    assignPetImgUrl: '',
    inputDisabled: false,

    breedArr: [],          //猫、狗品种集合




  }

  componentDidMount () {
    this._getEmergencyHistory()
    this._getBreed()
  }



  _getEmergencyHistory = () => {

    //封装的日期排序方法
    function ForwardRankingDate (data, p) {
      for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < data.length - 1 - i; j++) {
          if (Date.parse(data[j][p]) < Date.parse(data[j + 1][p])) {
            var temp = data[j];
            data[j] = data[j + 1];
            data[j + 1] = temp;
          }
        }
      }
      return data;
    }
    let historys = []
    fetchRequest(`/pet/getPetExamByDoctorId/${storage.userId}`, 'GET', '')  //userID要自动的
      .then(res => {
        if (res.flag === true) {
          let datas = res.data
          for (let i = datas.length - 1; i >= 0; i--) {
            if (datas[i].petId === null) {
              let { petId, examId, userId, petVitalTypeId, temperature, roomTemperature, bloodPressure, memo, clinicalDatagroupId,
                bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, createTime, clinicalDataEntity } = datas[i]
              let Tem = temperature
              try {
                Tem = temperature || clinicalDataEntity.data0
              } catch (error) {
                console.log('抛出的异常', error);
              }


              let str = {
                clinicalDatagroupId,
                createTime,
                date: moment(createTime).format('MMM DD'),
                time: moment(createTime).format('hh:mm A'),
                temp: parseInt(Tem * 10) / 10,
                placement: petVitalTypeId,
                note: memo,
                historyId: examId,
                bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId
              }

              historys.push(str)
            }
          }

          //把所有数据拿完后做个排序

          let historyData = ForwardRankingDate(historys, "createTime");
          console.log('historyData:', historyData);
          this.setState({
            historyData
          })
        }
      })
      .catch(err => {
        console.log(err);
      })

  }
  _getBreed = () => {
    fetchRequest(`/pet/selectBreedBySpeciesId`, 'POST', { speciesId: 1 })
      .then(res => {
        if (res.code === 0) {
          let arr = []
          res.petlist.map((item, index) => {
            let data = {
              petSpeciesBreedId: item.petSpeciesBreedId,
              breedName: item.breedName,
              speciesId: 1
            }
            arr.push(data)
          })

          fetchRequest(`/pet/selectBreedBySpeciesId`, 'POST', { speciesId: 2 })
            .then(res => {
              if (res.code === 0) {

                res.petlist.map((item, index) => {
                  let data = {
                    petSpeciesBreedId: item.petSpeciesBreedId,
                    breedName: item.breedName,
                    speciesId: 2
                  }
                  arr.push(data)
                })



                console.log('----品种集合：', arr);
                this.setState({
                  breedArr: arr
                })
              }
            })
            .catch(err => {
              console.log(err);
            })

        }
      })
      .catch(err => {
        console.log(err);
      })

  }

  _search = () => {
    console.log('我要去搜索了');
  }

  draggleRef = React.createRef();



  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
      assignPatientId: '',
      assignPetName: '',
      assignOwnerName: '',
      assignBreed: '',
      assignBreedId: '',
      assignPetAge: '',
      assignPetWeight: '',
      assignPetId: '',
      assignPetImgUrl: ''
    });
  };

  handleCancel = (e) => {
    console.log('取消');
    this.setState({
      visible: false,
      assignPatientId: '',
      assignPetName: '',
      assignOwnerName: '',
      assignBreed: '',
      assignBreedId: '',
      assignPetAge: '',
      assignPetWeight: '',
      assignPetId: '',
      assignPetImgUrl: ''
    });
  };

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
  _select = (value, data) => {
    console.log(value, data);  //value的值为id
    this.setState({
      assignBreedId: value,
      assignBreed: data.children
    })
  }

  _modal = () => {
    let that = this

    function getPetInfoByPatientId () {


      switch (storage.identity) {
        case '1':
          console.log('我是vetspire查找');

          break;

        case '2':
          console.log('我是ezyVet查找');
          let params = {
            animalId: that.state.assignPatientId,
            organizationId: 4
          }
          let paramsArray = [];
          Object.keys(params).forEach(key =>
            paramsArray.push(key + "=" + params[key])
          );
          let url = 'http://ec2-3-214-224-72.compute-1.amazonaws.com:8080/mellaserver/petall/getPetInfoByAnimalId'
          // 判断是否地址拼接的有没有 ？,当没有的时候，使用 ？拼接第一个参数，如果有参数拼接，则用&符号拼接后边的参数   
          if (url.search(/\?/) === -1) {
            url = url + "?" + paramsArray.join("&");
          } else {
            url = url + "&" + paramsArray.join("&");
          }
          console.log('ezyVet集成查找宠物入参-请求地址', params, url);
          fetch(url, {
            method: "GET",
            headers: {
              'authorization': `Bearer ${storage.ezyVetToken}`,
            }
          }).then((response) => response.json())
            .then((res) => {
              console.log('res', res);
              this.setState({
                spin: false
              })
              if (res.flag === true) {
                //有宠物，进入1
                let petArr = res.data
                if (petArr.length > 1) {
                  petArr.sort(function (a, b) {
                    return a.createTime > b.createTime ? -1 : -1;
                  })
                }
                console.log(petArr);

                let { petId } = petArr
                // assign(petId)

              } else {
                //没有宠物
                message.error('There are no pets under this patientID')
              }
            })
            .catch((err) => {
              console.log(err);
              message.error('There are no pets under this patientID')
            });

          break;

        case '3':
          console.log('我是一般医生查找');
          let datas = {
            patientId: that.state.assignPatientId,
            doctorId: storage.userId,
          }
          if (storage.lastWorkplaceId) {
            datas.workplaceId = storage.lastWorkplaceId
          }
          console.log('入参：', datas);
          fetchRequest('/pet/getPetInfoByPatientIdAndPetId', 'POST', datas)
            .then(res => {
              if (res.flag === true) {
                //有宠物，进入1
                let petArr = res.data
                if (petArr.length > 1) {
                  petArr.sort(function (a, b) {
                    return a.createTime > b.createTime ? -1 : -1;
                  })
                }

                console.log('获取到宠物信息', petArr);

                let { petId, petName, firstName, lastName, breedName, age, weight, url, birthday } = petArr[0]

                let assignPetName = petName ? petName : '';
                let assignOwnerName = lastName ? lastName : ''
                assignOwnerName = firstName ? `${assignOwnerName} ${firstName}` : assignOwnerName;
                let assignBreed = breedName ? breedName : '';
                let assignPetAge = age ? age : '';
                let assignPetWeight = weight ? weight : ''
                let assignPetImgUrl = url ? url : ''

                if (!assignPetAge) {
                  let now = moment(new Date())
                  let year = now.diff(moment(birthday), 'years')
                  assignPetAge = year
                }


                that.setState({
                  assignPetName,
                  assignBreed,
                  assignPetAge,
                  assignPetWeight,
                  assignPetId: petId,
                  assignPetImgUrl,
                  inputDisabled: true
                })


                // assign(petId)
              } else {
                that.setState({
                  inputDisabled: false,
                  assignPetName: '',
                  assignOwnerName: '',
                  assignBreed: '',
                  assignBreedId: '',
                  assignPetAge: '',
                  assignPetWeight: '',
                  assignPetId: '',
                  assignPetImgUrl: ''
                })
                message.error('There are no pets under this patientID')
              }
            })
            .catch(err => {
              that.setState({
                inputDisabled: false,
                assignPetName: '',
                assignOwnerName: '',
                assignBreed: '',
                assignBreedId: '',
                assignPetAge: '',
                assignPetWeight: '',
                assignPetId: '',
                assignPetImgUrl: ''
              })
              message.error('There are no pets under this patientID')
              console.log(err);
            })
          break;

        default:
          break;
      }
    }
    const assignPet = () => {
      let parmes = {
        petId: this.state.assignPetId,
        clinicalDatagroupId: that.state.seleceEmergencies.clinicalDatagroupId
      }
      console.log('分配的数据信息', parmes);
      fetchRequest(`/pet/addAndSavePetExam/${that.state.seleceEmergencies.historyId}`, 'POST', parmes)
        .then(res => {
          console.log('----------', res);
          if (res.flag === true) {
            console.log('分配成功');
            message.success('Assigned successfully')
            that._getEmergencyHistory()
            that.setState({
              visible: false,
              assignPatientId: '',
              assignPetName: '',
              assignOwnerName: '',
              assignBreed: '',
              assignBreedId: '',
              assignPetAge: '',
              assignPetWeight: '',
              assignPetId: '',
              assignPetImgUrl: ''
            })
          } else {
            message.error('Assignment failed')
          }

        })
        .catch(err => {
          console.log(err);
          message.error('Assignment failed')
        })
    }



    let { disabled, bounds, visible } = this.state
    let options = this.state.breedArr.map(d => <Option key={d.petSpeciesBreedId}>{d.breedName}</Option>);
    return (
      <Modal
        wrapClassName={'web'}//对话框外部的类名，主要是用来修改这个modal的样式的
        destroyOnClose={true}
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
              height: '30px',
              textAlign: 'center',

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

            onFocus={() => { }}
            onBlur={() => { }}
          // end
          >

          </div>
        }
        visible={visible}
        // visible={true}
        onOk={this.handleOk}
        onCancel={this.handleCancel}

        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => this.onStart(event, uiData)}
          >
            <div ref={this.draggleRef}>{modal}</div>
          </Draggable>
        )}
        footer={[]} // 设置footer为空，去掉 取消 确定默认按钮
      >
        <div id="unassignedModal">
          <div className="title">
            Assign <br />
            Measurement to
          </div>

          <div className="addPhoto">
            <UploadImg

              getImg={(val) => {
                console.log('hahahahahahah我获得了', val);
                this.setState({
                  imgId: val.imageId
                })
              }}
              imgUrl={this.state.assignPetImgUrl}
              disable={this.state.inputDisabled}
            />
          </div>






          <div className="item">
            <p >Patient ID:</p>
            <Input
              value={this.state.assignPatientId}
              bordered={false}
              onChange={(item) => {
                this.setState({
                  assignPatientId: item.target.value
                })

              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  getPetInfoByPatientId()
                }
                if (e.keyCode === 27) {
                  console.log('清空');
                  this.setState({
                    assignPatientId: ''
                  })
                }
              }}
              onBlur={() => {
                if (this.state.assignPatientId.length > 0) {
                  getPetInfoByPatientId()
                }

              }}

            />
          </div>




          <div className="item">
            <p >Pet Name:</p>
            <Input
              disabled={this.state.inputDisabled}
              value={this.state.assignPetName}
              bordered={false}
              onChange={(item) => {
                this.setState({
                  assignPetName: item.target.value
                })

              }}

            />
          </div>

          <div className="item">
            <p >Owner Name:</p>
            <Input
              disabled={this.state.inputDisabled}
              value={this.state.assignOwnerName}
              bordered={false}
              onChange={(item) => {
                this.setState({
                  assignOwnerName: item.target.value
                })

              }}

            />
          </div>
          <div className="item">
            <p >Breed:</p>
            <div className="infoInput">
              {/* <Input bordered={false} /> */}
              <Select
                disabled={this.state.inputDisabled}
                showSearch
                style={{ width: '100%' }}
                bordered={false}
                value={this.state.assignBreed}
                // size = {'small'}        
                placeholder="Search to Select"
                optionFilterProp="children"
                listHeight={256}
                onSelect={(value, data) => this._select(value, data)}
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
              >
                {options}
              </Select>
            </div>
          </div>
          <div className="item">
            <p >Pet Age:</p>
            <Input
              disabled={this.state.inputDisabled}
              value={this.state.assignPetAge}
              bordered={false}
              onChange={(item) => {
                this.setState({
                  assignPetAge: item.target.value
                })

              }}
            />

          </div>
          <div className="item">
            <p >Pet Weight:</p>
            <Input
              disabled={this.state.inputDisabled}
              value={this.state.assignPetWeight}
              bordered={false}
              onChange={(item) => {
                this.setState({
                  assignPetWeight: item.target.value
                })

              }}

            />

            <div className="unit">{`kg`}</div>
          </div>

          <div className="btnF">
            <div className="btn" onClick={this.handleCancel}>Cancel</div>
            <div className="btn" onClick={() => {
              if (this.state.assignPetId) {
                assignPet()
              } else {
                message.error('Did not find this pet')
              }

            }}>Confirm</div>
          </div>

        </div>

      </Modal>

    )

  }

  render () {
    const _del = (key, record) => {
      console.log('删除', key, record);

      fetchRequest(`/pet/deletePetExamByExamId/${key}`, 'DELETE')
        .then(res => {
          if (res.flag === true) {
            console.log('删除成功');
            const historyData = [...this.state.historyData];
            console.log(historyData);
            this.setState({
              historyData: historyData.filter((item) => item.historyId !== key)
            });
          } else {
            console.log('删除失败');
          }
        })
    }

    const columns = [
      {
        title: '',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record, index) => {
          // console.log('狩猎:', text, record, index);
          //record:
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }} >
              <Popconfirm title="Sure to delete?" onConfirm={() => _del(record.historyId, record)}>
                <img src={del} alt="" style={{ marginRight: '8px' }} />
              </Popconfirm>
            </div>
          )

        }
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (text, record, index) => {

          return (
            <p style={{ textAlign: 'center' }}>{text}</p>
          )

        }
      },
      {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        render: (text, record, index) => {

          return (
            <p style={{ textAlign: 'center' }}>{text}</p>
          )

        }
      },
      // {
      //   // title: `Temp(${this.state.units})`,
      //   title: `Temp(℉)`,
      //   key: 'temp',
      //   dataIndex: 'temp',
      //   render: (text, record, index) => {
      //     // console.log(text, record);
      //     /**
      //      * bag：温度数值前的圆圈的背景颜色
      //      * tem：展示的温度
      //      * endvalue:将从后台得到的数据全部转化成华氏度
      //      * min：猫的正常体温的左区间,单位℉，后期要做的猫狗都行，这需要告诉我此宠物是猫还是狗
      //      * max：猫的正常体温的右区间,单位℉，后期要做的猫狗都行，这需要告诉我此宠物是猫还是狗
      //      * 
      //      */

      //     let bag = '', tem = ''

      //     let endValue = text > 55 ? text : parseInt((text * 1.8 + 32) * 10) / 10
      //     let min = 100.4, max = 102.56






      //     if (endValue > max) {
      //       bag = '#E1206D'
      //     } else if (endValue < min) {
      //       bag = '#98DA86'
      //     } else {
      //       bag = '#58BDE6'
      //     }

      //     if (this.state.units === '℃') {
      //       if (text) {
      //         tem = `${text}${this.state.units}`
      //       }
      //     } else {
      //       if (text) {
      //         if (text > 55) {
      //           tem = `${text}${this.state.units}`
      //         } else {
      //           tem = `${parseInt((text * 1.8 + 32) * 10) / 10}${this.state.units}`
      //         }

      //       }
      //     }
      //     return (
      //       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      //         {tem ? <div style={{ width: '8px', height: '8px', borderRadius: '8px', backgroundColor: bag, marginRight: '3px' }} /> : null}
      //         <p style={{ margin: 0, padding: 0 }}>{tem}</p>
      //       </div>
      //     )

      //   }
      // },

      {

        title: ' Pet Description',
        dataIndex: 'description',
        key: 'description',
        render: (text, record, index) => {

          return (
            <p style={{ width: '70px' }}>{text}</p>
          )

        }
      },
      // Species

      {
        title: 'Species',
        dataIndex: 'species',
        key: 'species',
        render: (text, record, index) => {

          return (
            <p style={{ width: '70px' }}>{text}</p>
          )

        }
      },




      {
        title: 'Note',
        dataIndex: 'note',
        key: 'note',
        render: (text, record, index) => {

          return (
            <p style={{ width: '70px' }}>{text}</p>
          )

        }
      },


      {
        title: '',
        dataIndex: 'assign',
        key: 'assign',
        render: (text, record, index) => {

          return (
            <div className="assign" onClick={() => {
              console.log(text, record, index);
              this.setState({
                visible: true,
                seleceEmergencies: record
              })
            }}>Assign</div>

          )

        }
      },

    ];


    return (
      <div id="unassigned">
        <Heard />

        <div className="body">
          <div className="title">Unassigned Measurements </div>
          <div className="input">
            <input
              type="text"
              class="iconfont search"
              placeholder="&#xe628; Search Pet Name or Description"
              value={this.state.searchText}
              onChange={e => {
                this.setState({
                  searchText: e.target.value
                })
              }}
              onKeyUp={(e) => {
                // console.log(e);
                if (e.keyCode === 13) {
                  this._search()
                }
                if (e.keyCode === 27) {
                  this.setState({
                    searchText: ''
                  })

                }
              }}

            />
            <div className="searchBtn"
              onClick={this._search}

            >Search</div>
          </div>

          <div className="table">
            <Table
              columns={columns}
              dataSource={this.state.historyData}
              rowKey={columns => columns.historyId}
              pagination={{ pageSize: 8, showSizeChanger: false, showQuickJumper: true }}
            />
          </div>


          {this._modal()}


        </div>
      </div>
    )
  }
}