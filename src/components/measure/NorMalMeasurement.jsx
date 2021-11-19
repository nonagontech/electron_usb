import React, { Component } from 'react'
import { Menu, Table, Popconfirm, Tooltip, message, Select, Progress, Input, Modal } from 'antd';
import Draggable from "react-draggable";
import moment from 'moment'
import 'antd/dist/antd.css';
import { createFromIconfontCN, } from '@ant-design/icons';

import { fetchRequest } from './../../utils/FetchUtil1'
import { fetchRequest1 } from './../../utils/FetchUtil'
import { FetchEszVet } from './../../utils/FetchEszVet'
import ye from './../../assets/images/ye1.png'
import er from './../../assets/images/er3.png'
import gang from './../../assets/images/gang3.png'
import edit from './../../assets/images/edit.png'
import del from './../../assets/images/del.png'

import placement_gang from './../../assets/images/placement_gang.png'
import placement_er from './../../assets/images/placement_er.png'
import palcement_ye from './../../assets/images/palcement_ye.png'
import electronStore from './../../utils/electronStore'


import './normalMeasurement.less'
import { fetchToken } from '../../utils/Fetch_token';
const { SubMenu } = Menu;
const { Option } = Select;
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})
let saveHistoryTime = null, getSerialTime = null
let ipcRenderer = window.electron.ipcRenderer

let detectTimer = null, countdownTimer = null, lastConnectionTime = null;

let storage = window.localStorage;
//用于预测的东西
let clinicalYuce = [], clinicalIndex = 0, endflog = false
let temp15 = ''
let is97Time = null, //为了防抖，因为有时候断开连接和连接成功总是连续的跳出来，展示就会一直闪烁，因此引入时间差大于800ms才展示
  initTime = null
let firstEar = true
let isMeasurement = false //正在测量为true，反之为false
let num07 = 0       //接收到07命令行的次数

export default class NorMalMeasurement extends Component {
  state = {
    closebgc: '',
    minbgc: '',
    closeColor: '',
    value: '',
    api: '',
    id: '',
    dataArr: [],
    seleceID: '',//医生id
    data: { ci: [''], wen: [] },

    temColor: '',
    Temp: '',
    isMeasure: false,
    mearsurePart: 1,
    historyData: [],
    patientId: '',
    spin: false,        //patientId后面的刷新按钮是否旋转
    petName: '',
    addpatient_petName: '',
    addpatient_description: '',
    addpatient_species: 1,
    roomTemperature: '',
    referenceRectalTemperature: '',
    bodyConditionScore: '',
    furLength: '',
    bodyType: '',
    heartRate: '',
    bloodPressure: '',
    respiratoryRate: '',
    visible: false,       //nodel框是否显示
    disabled: true,       //model是否可拖拽
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },
    units: '℉',
    measuerStatus: 'disconnected',
    isconnected: false,
    countdown: 0,
    petVitalTypeId: '01',  //测量部位
    probeID: '',         //探头id
    org: 1,
    err07Visible: false,


    //左侧的宠物信息
    petId: '',
    owner: '',
    breedName: '',
    isMix: false,
    age: '',
    weight: '',
    url: '',

    //圆环的一些信息
    temp_statu: 'Ready',
    progress: 0,
    endMeasure: false,
    initFlog: false,
    isEarMeasure: false,


    //底部的信息
    isNotes: true,
    notes: '',
    petSpeciesBreedId: 0,
    consult_id: '',
    healthStatus: '',


    editId: '',
    memo: '',

    noUSB: false  //是否有usb底座，为true代表没有
  }

  componentDidMount () {
    ipcRenderer.send('big')
    if (storage.identity === '2') {
      let ezyVetSelectHealthstatus = JSON.parse(storage.ezyVetSelectHealthstatus)
      console.log(ezyVetSelectHealthstatus);
      let { age, animal_id, breed, consult_id, gender, key, owner, petName, weight } = ezyVetSelectHealthstatus
      let petAge = null
      if (`${age}` === '' || `${age}` === 'null') {
        petAge = 0
      } else {
        petAge = age
      }
      this.setState({
        petName,
        owner,
        breedName: breed,
        weight,
        age: petAge,
        consult_id,
        healthStatus: key,
        patientId: animal_id,
        org: 4
      }, () => {
        this._getPetInfo('ezyVet')
      })
    } else if (storage.identity === '1') {
      this.setState({
        petName: storage.selectPetName,
        owner: storage.selectOwner,
        breedName: storage.selectBreed,
        weight: storage.selectWeight,
        age: storage.selectAge,
        patientId: storage.selectPatientId,
        org: 1
      }, () => {
        this._getPetInfo('vetspire')
      })
    } else {
      console.log(storage.doctorExam);
      console.log(JSON.parse(storage.doctorExam));
      let data = JSON.parse(storage.doctorExam)
      console.log('从列表里面传过来的数据', data);
      let weight = data.weight
      console.log('传过来的数据：', weight);
      if (weight && weight !== 'unknown') {
        weight = parseFloat(weight).toFixed(1)
      }
      console.log('-----------', weight);
      this.setState({
        petName: data.petName,
        owner: data.owner,
        breedName: data.breed,
        weight,
        age: data.age,
        patientId: data.patientId,
        petId: data.petId
      }, () => {
        this._getHistory()
      })
    }

    let hardSet = electronStore.get('hardwareConfiguration')

    if (!hardSet) {
      let settings = {
        isHua: true,
        is15: true,
        self_tarting: false,
        isBacklight: true,
        isBeep: true,
        backlightTimer: { length: 140, number: '20' },
        autoOff: { length: 0, number: '30' },
      }
      electronStore.set('hardwareConfiguration', settings)
      this.setState({
        units: '℉'
      })
    } else {
      let units = hardSet.isHua ? '℉' : '℃'
      this.setState({
        units
      })
    }
    // electronStore.delete('hardwareConfiguration')
    // console.log(electronStore.get('hardwareConfiguration'));



    //这里做了个监听，当有数据发过来的时候直接在这里接收
    ipcRenderer.on('sned', this._send)
    ipcRenderer.on('usbDetect', this.usbDetect)
    ipcRenderer.on('noUSB', this._noUSB)
    this._whether_to_connect_to_mella()
    //刚进入测量界面需要获取以前的历史数据，测量一次就添加一个记录
    // this._getHistory()


  }
  componentWillUnmount () {
    ipcRenderer.removeListener('sned', this._send)
    ipcRenderer.removeListener('usbDetect', this.usbDetect)
    ipcRenderer.removeListener('noUSB', this._noUSB)

    clearInterval(detectTimer)
    detectTimer && clearInterval(detectTimer)
    countdownTimer && clearInterval(countdownTimer)
    getSerialTime && clearTimeout(getSerialTime)
    this.detectTimer && clearInterval(this.detectTimer)
    lastConnectionTime = null;
    clinicalYuce = []
    clinicalIndex = 0
    message.destroy()


  }
  _noUSB = (e, data) => {
    console.log('没有USB设备：', data);
    if (data === false) {
      message.destroy()
      this.setState({
        noUSB: false
      })
    } else {
      if (!this.state.noUSB) {
        message.error('The base is not detected. Please insert the base', 0)
        this.setState({
          noUSB: true
        })
      }

    }
  }

  _send = (event, data) => {
    //data就是测量的数据，是十进制的数字
    console.log(data);
    this.command(data)()
  }
  usbDetect = (event, data) => {
    if (data === true) {
      this._whether_to_connect_to_mella()
    } else {
      this.detectTimer && clearInterval(this.detectTimer)
      num07 = 0
    }
  }
  _whether_to_connect_to_mella = () => {
    message.destroy()
    this.detectTimer = setInterval(() => {
      if (isMeasurement) {
        return
      }
      if (!initTime) {
        console.log('断开连接');

        firstEar = true
        this.setState({
          measuerStatus: 'disconnected',
          countdown: 0,
          isMeasure: false,
          isconnected: false,
          isEarMeasure: false
        })
        initTime = new Date()
      } else {
        ipcRenderer.send('usbdata', { command: '07', arr: [] })
        if (new Date() - initTime < 5000) {
          console.log('连接成功');

        } else {
          console.log('2断开连接');
          firstEar = true
          this.setState({
            measuerStatus: 'disconnected',
            countdown: 0,
            isMeasure: false,
            isconnected: false,
            isEarMeasure: false
          })
        }
      }
    }, 2000);



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
      case '1':
        switch (storage.identity) {
          case '2': this.props.history.push({ pathname: '/EzyVetSelectExam', listDate: storage.ezyVetList, defaultCurrent: storage.defaultCurrent })

            break;
          case '1': this.props.history.push('/page5')

            break;
          case '3': this.props.history.push({ pathname: '/uesr/selectExam', listDate: storage.doctorList, defaultCurrent: storage.defaultCurrent })

            break;

          default:
            break;
        }

        break;

      case '2': this.props.history.push('/'); break;
      case '3': this.props.history.push({ pathname: '/page8', identity: storage.identity, patientId: this.state.patientId }); break;
      case '4': this.props.history.push('/page12'); break;
      default:
        break;
    }

  };
  command = (newArr) => {
    const instruction = [209, 193, 192, 129, 135, 238, 98, 97, 130, 208, 177, 194, 7]
    if (newArr[2] !== 7) {
      initTime = new Date()
      num07 = 0
    } else {
      num07++
    }
    let dataArr1 = newArr.map(item => {
      if (item.toString(16).length < 2) {
        return '0' + item.toString(16)
      } else {
        return item.toString(16)
      }
    })
    isMeasurement = false
    const commandArr = {
      209: () => {  //腋温
        if (firstEar) {
          firstEar = false
          console.log('去获取探头id');
          ipcRenderer.send('usbdata', { command: '31', arr: [] })
        }
        isMeasurement = true
        let temp1 = parseFloat(`${dataArr1[3]}.${(dataArr1[4])}`)
        let temp0 = parseFloat(`${dataArr1[5]}.${(dataArr1[6])}`)
        // let Temp = parseFloat(temp0.toFixed(1))
        let Temp = temp0
        console.log(Temp);
        if (Temp === 24.7 || Temp === 0 || Temp === null || Temp === undefined) {
          return
        }


        if (this.state.isMeasure === false) {

          if (countdownTimer) {
            this.setState({
              countdown: 0
            })
          }

          countdownTimer = setInterval(() => {
            let { countdown, isconnected } = this.state
            this.setState({
              countdown: countdown + 1

            })
            if (countdown === 1) {
              ipcRenderer.send('usbdata', { command: '31', arr: [] })
            }
            if (countdown === 29) {
              console.log('去调用预测接口');
              this._prediction()
            }
            if (countdown === 15) {
              console.log('调用15秒的接口');
              this._time15()
            }
            if (countdown >= 29) {
              console.log('我要去清除');
              countdownTimer && clearInterval(countdownTimer)
              this.setState({
                countdown: 0
              })
              ipcRenderer.send('usbdata', { command: '41', arr: [] })


            }
            if (isconnected === false) {
              countdownTimer && clearInterval(countdownTimer)
              // this.setState({
              //   countdown: 0
              // })
            }
          }, 1000);
        }
        lastConnectionTime = new Date();



        let progress = (Temp - 25) * 5
        let dataS = {
          sample: clinicalIndex++,
          data0: temp0,
          data1: temp1
        }
        clinicalYuce.push(dataS)
        if (clinicalIndex < 10) {
          clinicalYuce.push({
            sample: clinicalIndex++,
            data0: temp0,
            data1: temp1
          })
        }
        this.setState({
          Temp,
          isMeasure: true,
          // mearsurePart: 1,
          measuerStatus: 'connented',
          isconnected: true,
          progress,
          endMeasure: false,
          initFlog: true,
          isEarMeasure: false
        })

      },
      208: () => {  //耳温

        lastConnectionTime = new Date();
        isMeasurement = true
        if (firstEar) {
          firstEar = false
          console.log('去获取探头id');
          ipcRenderer.send('usbdata', { command: '31', arr: [] })
        }
        //现在探头0可能不存在，所以把探头0改为探头1
        let temp0 = parseFloat(`${dataArr1[7]}.${(dataArr1[8])}`)
        let Temp = temp0

        console.log(Temp, temp0);
        let progress = (Temp - 25) * 5
        this.setState({
          Temp,
          isMeasure: false,
          mearsurePart: 3,
          measuerStatus: '测量中',
          isconnected: true,
          progress,
          endMeasure: false,
          initFlog: true,
          isEarMeasure: true,
          petVitalTypeId: '03'
        })

      },
      193: () => {  //硬件发送结束命令
        const time = setTimeout(() => {
          endflog = true
          countdownTimer && clearInterval(countdownTimer)
          this.setState({
            isMeasure: false,
            endMeasure: true,
            isEarMeasure: false
          })
          lastConnectionTime = new Date();
          if (saveHistoryTime != null) {
            clearTimeout(saveHistoryTime)
          }

          clinicalYuce = []
          clinicalIndex = 0
          firstEar = true
          clearTimeout(time)
        }, 1000);


      },
      194: () => {       //硬件收到机器学习结果并停止测量，通知我们一声
        endflog = true
        countdownTimer && clearInterval(countdownTimer)
        this.setState({
          isMeasure: false,
          endMeasure: true,
          isEarMeasure: false
        })
        lastConnectionTime = new Date();
        if (saveHistoryTime != null) {
          clearTimeout(saveHistoryTime)
        }

        clinicalYuce = []
        clinicalIndex = 0
        isMeasurement = false
      },

      192: () => {   //开始测量返回结果
        switch (newArr[3]) {
          case 90: console.log('有探头，开始测量的返回指令·'); break;
          case 11: console.log('没有探头，开始测量的返回值'); break;

        }
      },
      129: () => {      //返回硬件版本号
        console.log(`返回的版本号为${newArr[3]}`);
        lastConnectionTime = new Date();
        this.setState({
          measuerStatus: 'connented',
          isconnected: true,
          isEarMeasure: false

        })
      },
      135: () => {          //硬件的一些基本信息
        /**
         * ______________新版、旧版没法控制温度计__________________
         * newArr[3]、newArr[4]、newArr[5]、newArr[6]是蓝牙温度计的修正系数
         * newArr[7] 无操作关机时间
         * newArr[8] 背光时间
         * newArr[9] 是否提示音    ：00代表无提示音，11代表有提示音
         * newArr[10] 测量单位    01代表℃，00代表℉
         */
        let hardSet = electronStore.get('hardwareConfiguration')
        let beep = hardSet.isBeep ? '11' : '00'
        let unit = hardSet.isHua ? '00' : '01'

        if (dataArr1[7] === hardSet.autoOff.number && dataArr1[8] === hardSet.backlightTimer.number &&
          dataArr1[9] === beep && dataArr1[10] === unit) {
        } else {
          console.log('不相同，去发送命令');
          let setArr = ['03', 'ed', '07', 'dd', hardSet.autoOff.number, hardSet.isBacklight ? hardSet.backlightTimer.number : '00', hardSet.isBeep ? '11' : '00', hardSet.isHua ? '00' : '01']
          ipcRenderer.send('usbdata', { command: '21', arr: setArr })
        }
        this.setState({
          measuerStatus: 'connented',
          isconnected: true
        })

      },
      238: () => {     //探头松动
        console.log('探头松动');
        this.setState({
          isMeasure: false,
          endMeasure: true
        })
        message.error('The probe is loose, please re-install and measure again', 5)
        clinicalYuce = []
        clinicalIndex = 0
        countdownTimer && clearInterval(countdownTimer)
      },
      194: () => {       //硬件收到了机器学习预测的温度
        this.setState({
          isMeasure: false,
          endMeasure: true,
          APIFlog: true,
          isEarMeasure: false
        })
        clinicalYuce = []
        clinicalIndex = 0
        endflog = true


        countdownTimer && clearInterval(countdownTimer)


      },
      98: () => { //蓝牙连接断开
        console.log('断开连接---断开连接---断开连接---断开连接---断开连接---断开连接');
        firstEar = true
        console.log(new Date() - is97Time);
        if (new Date() - is97Time < 800) {
          return
        }

        this.setState({
          measuerStatus: 'disconnected',
          countdown: 0,
          isMeasure: false,
          isconnected: false,
          isEarMeasure: false
        })








      },
      97: () => {       //蓝牙连接
        console.log('连接成功---连接成功---连接成功---连接成功---连接成功---连接成功');
        // disconnectedNum = 0
        // lastConnectionTime = new Date();
        //  disconnectedNum = 0
        // lastConnectionTime = new Date();
        this.setState({
          measuerStatus: 'connented',
          isconnected: true,
          isEarMeasure: false

        })
        is97Time = new Date()
      },
      177: () => {         //探头id
        let dataArr1 = newArr.map(item => {
          if (item.toString(16).length < 2) {
            return '0' + item.toString(16)
          } else {
            return item.toString(16)
          }
        })


        let id = ''
        for (let i = 3; i < dataArr1.length - 2; i++) {
          id += dataArr1[i]

        }
        console.log(id, dataArr1[7]);

        this.setState({
          probeID: id,
          petVitalTypeId: dataArr1[7]
        })
        if (dataArr1[7] === '01') {
          this.setState({
            mearsurePart: 1
          })
        } else if (dataArr1[7] === '02') {
          this.setState({
            mearsurePart: 2
          })
        } else if (dataArr1[7] === '03') {
          this.setState({
            mearsurePart: 3
          })
        }



      },
      7: () => {  //发什么收什么，需要去重新插拔底座
        console.log('重新插拔底座');
        if (num07 === 3 && this.state.err07Visible === false) {
          this.setState({
            err07Visible: true
          })
        }
      }

    }
    if (instruction.indexOf(newArr[2]) !== -1) {
      return commandArr[newArr[2]]
    } else {
      return () => {
        console.log('没有控制命令', commandArr);
      }
    }
  }
  //15秒的预测程序
  _time15 = (val) => {

    let isDog = true
    let { petSpeciesBreedId } = this.state
    if (petSpeciesBreedId < 136) {
      isDog = false
    }
    let parame = {
      ambient_temperature: 25,
      data: clinicalYuce,
      deviceId: '11111111111111111111111111',

      sampling_rate: '104ms'
    }

    console.log('预测传入数据', parame);

    let url = !isDog ? '/clinical/dogPredict' : '/clinical/catPredict'
    console.log(url)
    console.log('预测发送只', parame);

    fetchRequest(url, 'POST', parame)
      .then((res) => {
        // predictionFlog = false
        if (res.message === 'Success') {
          console.log('预测返回值：', res);

          let prediction = res.result.prediction.toFixed(2)
          temp15 = parseFloat(prediction)

        } else {
          console.log('system error')
        }


      })
      .catch((err) => {
        console.log(`:${err}`)

      })



  }
  //预测程序
  _prediction = (val) => {

    let isDog = true
    let { petSpeciesBreedId } = this.state
    if (petSpeciesBreedId < 136) {
      isDog = false
    }
    let parame = {
      // ambient_temperature: this.state.huanwen,
      ambient_temperature: 17,

      data: clinicalYuce,
      // deviceId: `${this.state.probeId}`,
      deviceId: '11111111111111111111111111',

      sampling_rate: '104ms'
    }

    console.log('预测传入数据', parame);

    clinicalYuce = []
    clinicalIndex = 0

    let url = isDog ? '/clinical/dogPredict' : '/clinical/catPredict'
    console.log(url, petSpeciesBreedId)
    console.log('预测发送只', parame);

    fetchRequest(url, 'POST', parame)
      .then((res) => {
        console.log('预测结果：', res);
        // predictionFlog = false
        if (res.message === 'Success') {
          console.log('预测返回值：', res);

          let prediction = res.result.prediction.toFixed(2)
          console.log(prediction);


          let tempArr = prediction.split('.')
          let intNum = tempArr[0]
          let flotNum = tempArr[1]
          if (intNum.length < 2) {
            intNum = '0' + intNum
          }
          if (flotNum.length < 2) {
            flotNum = '0' + flotNum
          }
          endflog = false


          //1.这里先注释掉,后面忘了取消注释
          const timeID1 = setInterval(() => {
            if (endflog) {
              let Temp = parseFloat(prediction)
              let progress = (Temp - 25) * 5
              this.setState({
                Temp,
                progress
              })
              endflog = false

              timeID1 && clearInterval(timeID1)
            } else {
              const timeID = setTimeout(() => {
                ipcRenderer.send('usbdata', { command: '42', arr: [intNum, flotNum] })
                timeID && clearTimeout(timeID)
              }, 10)

            }
          }, 200)



        } else {
          console.log('system error')
        }


      })
      .catch((err) => {
        // predictionFlog = false
        console.log(err);
        const timeID = setTimeout(() => {
          // this.sendData('41', [])
          ipcRenderer.send('usbdata', { command: '41', arr: [] })

          clearTimeout(timeID)
        }, 10)
        console.log(`:${err}`)

      })



  }
  _mearsurePort = () => {
    switch (this.state.mearsurePart) {
      case 1: return (
        <div >
          <div className='part'>
            Axillary
            <img src={ye} alt="" width="50px" />

          </div>
        </div>
      );
      case 2: return (
        <div >
          <div className='part'>
            Rectal
            <img src={gang} alt="" width="50px" />

          </div>
        </div>
      );
      default: return (
        <div >
          <div className='part'>
            Ear
            <img src={er} alt="" width="50px" />

          </div>
        </div>
      );
    }
  }
  _getHistory = () => {
    let historys = []
    fetchRequest(`/pet/getPetExamByPetId/${this.state.petId}`, 'GET', '')  //userID要自动的
      .then(res => {
        console.log(res);
        if (res.flag === true) {
          let datas = res.data
          console.log('-------', datas);
          for (let i = datas.length - 1; i >= 0; i--) {
            let data = datas[i]
            let { petId, examId, userId, petVitalTypeId, temperature, roomTemperature, bloodPressure, memo,
              bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, createTime, modifiedTime } = data
            // console.log(createTime);
            let time = null
            if (storage.vetspireOrEzyvet === '2') {
              time = modifiedTime
              if (modifiedTime === '' || modifiedTime === null) {
                time = createTime
              }
            } else {
              time = createTime
            }
            let json = {
              time,
              Temp: temperature,
              placement: petVitalTypeId,
              note: memo,
              historyId: examId,
              bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId
            }
            // console.log(json);
            historys.push(json)


          }
          console.log('---', historys);
          let historyData = []
          for (let i = 0; i < historys.length; i++) {
            let history = historys[i]
            let { bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId, examId, time } = history
            let placement = history.placement
            if (placement === null || placement === '') {
              placement = 1
            }
            let str = {
              date: moment(time).format('MMM DD'),
              time: moment(time).format('hh:mm A'),
              temp: history.Temp,
              placement,
              note: history.note,
              historyId: history.historyId,
              bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId,
              key: examId
            }
            historyData.push(str)
          }
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



  _getPetInfo = (value) => {
    let datas = null

    datas = {
      patientId: this.state.patientId,
      org: this.state.org
    }



    console.log('入参：', datas);
    fetchRequest('/pet/getPetInfoByPatientIdAndPetId', 'POST', datas)
      .then(res => {
        console.log('宠物信息', res);
        this.setState({
          spin: false
        })
        if (res.flag === true) {
          //有宠物，进入1
          let { petId, petSpeciesBreedId } = res.data[0]
          console.log('------------', petId);
          this.setState({
            petId,
            petSpeciesBreedId
          }, () => {
            console.log('去获取历史记录');
            this._getHistory()
          })
        } else {
          //没有宠物，进入2

        }
      })
      .catch(err => {
        this.setState({
          spin: false
        })
        console.log(err);
      })

  }

  draggleRef = React.createRef();

  showModal = () => {
    this.setState({
      visible: true
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

  _topLeft = () => {
    let { patientId, breedName, isMix, age, petName, owner, weight, } = this.state
    if (breedName === null) {
      breedName = ''
    }
    let mix = ''
    if (isMix === true) {
      mix = 'Mix'
    }
    let title = ''
    if (petName && `${petName}`.toLowerCase() !== 'unknown') {
      title += `${petName}`
    }
    if (petName && `${petName}`.toLowerCase() !== 'unknown' && patientId && `${patientId}`.toLowerCase() !== 'unknown') {
      title += `, \xa0 `
    }
    if (patientId && `${patientId}`.toLowerCase() !== 'unknown') {
      title += `ID:${patientId}`
    }

    let wei = (weight && `${weight}`.toLowerCase() !== 'unknown') ? `${weight}` : ''
    if (wei && wei.indexOf(`kg`) === -1) {
      wei += 'kg'
    }

    return (
      <div className="l">
        <div className="petinfo">
          <div className="heard">
            <Tooltip placement='bottom' title='Switch Exam'>
              <MyIcon
                type='icon-qiehuanchengshi'
                className="icon"
                style={{ marginRight: '30px' }}
                onClick={() => {

                  switch (storage.identity) {
                    case '2': this.props.history.push({ pathname: '/EzyVetSelectExam', listDate: storage.ezyVetList, defaultCurrent: storage.defaultCurrent })

                      break;
                    case '1': this.props.history.push('/page5')

                      break;
                    case '3': this.props.history.push({ pathname: '/uesr/selectExam', listDate: storage.doctorList, defaultCurrent: storage.defaultCurrent })
                      break;

                    default:
                      break;
                  }

                }} />
            </Tooltip>


            {title} &nbsp;
          </div>

          <div className="info">
            Owner: {(owner && `${owner}`.toLowerCase() !== 'unknown') ? `${owner}` : ''} <br />
            Breed: {(breedName && `${breedName}`.toLowerCase() !== 'unknown') ? `${breedName}  ${mix}` : ''}<br />
            Age: {((age && `${age}`.toLowerCase() !== 'unknown') || age === 0) ? `${age} yrs` : ''} <br />
            Weight: {wei}<br />
          </div>
        </div>
        <div className="deviceInfo">
          <div className="heard1">
            <span>Device Info</span>
            {/* <MyIcon type='icon-jiantou' className="icon" /> */}
          </div>
          <div className="devicesBody">
            <div className="devices">
              <p>Device:</p>
              <Select defaultValue="Mella001" style={{ width: 120 }} size={'small'}
              // onChange={handleChange}
              >
                <Option value="device1">Mella001</Option>
                <Option value="device2">Mella002</Option>
                <Option value="device3"> Mella003</Option>
              </Select>
            </div>
            {this._mearsurePort()}
          </div>

        </div>
      </div>
    )



  }
  handleChange = index => {
    console.log('---------', index);
    this.setState({
      furLength: index
    })
  };
  handleChange1 = index => {
    console.log('---------', index);
    this.setState({
      bodyType: index
    })
  };

  _foot = () => {

    // console.log('所有的历史记录：', historyData);
    const _del = (key, record) => {
      console.log('删除', key, record);


      /**------------这里还要删除后台的数据------------ */
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
    const _edit = (key, record) => {
      console.log('编辑', key, record);
      this.setState({
        visible: true,
        editId: key,
        memo: record.note
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
            <div style={{ width: '60px' }}>
              <Popconfirm title="Sure to delete?" onConfirm={() => _del(record.historyId, record)}>
                <img src={del} alt="" style={{ marginRight: '8px' }} />
              </Popconfirm>
              <img src={edit} alt=""
                onClick={() => _edit(record.historyId, record)}
              />
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
      {
        title: `Temp(${this.state.units})`,
        key: 'temp',
        dataIndex: 'temp',
        render: (text, record, index) => {
          // console.log(text, record);


          /**
          * bag：温度数值前的圆圈的背景颜色
          * tem：展示的温度
          * endvalue:将从后台得到的数据全部转化成华氏度
          * min：猫的正常体温的左区间,单位℉，后期要做的猫狗都行，这需要告诉我此宠物是猫还是狗
          * max：猫的正常体温的右区间,单位℉，后期要做的猫狗都行，这需要告诉我此宠物是猫还是狗
          * 
          */

          let bag = '', tem = ''

          let endValue = text > 55 ? text : parseInt((text * 1.8 + 32) * 10) / 10
          let min = 100.4, max = 102.56






          if (endValue > max) {
            bag = '#E1206D'
          } else if (endValue < min) {
            bag = '#98DA86'
          } else {
            bag = '#58BDE6'
          }



          if (this.state.units === '℃') {
            if (text) {
              tem = `${text.toFixed(1)}${this.state.units}`
            }
          } else {
            if (text) {
              if (text > 55) {
                tem = `${text}${this.state.units}`
              } else {
                tem = `${parseInt((text * 1.8 + 32) * 10) / 10}${this.state.units}`
              }

            }
          }
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {tem ? <div style={{ width: '8px', height: '8px', borderRadius: '8px', backgroundColor: bag, marginRight: '3px' }} /> : null}
              <p style={{ margin: 0, padding: 0 }}>{tem}</p>
            </div>
          )

        }
      },
      {
        title: 'Placement',
        dataIndex: 'placement',
        key: 'placement',
        align: 'center',
        render: (text, record, index) => {
          // console.log(text, record, index);
          /**
           * old:   1:腋温  2：肛温 3：耳温
           * new:   1.腋温  2：大腿温度 3.肛温  4：耳温
           */
          switch (record.placement) {
            case 0: return (    //腋温
              <div>
                <img src={placement_er} alt="" />
              </div>
            )
            case 1: return (    //腋温
              <div>
                <img src={palcement_ye} alt="" />
              </div>
            )
            case 3: return (     //肛温
              <div>
                <img src={placement_gang} alt="" />
              </div>
            )
            case 2: return (     //肛温
              <div>
                <img src={placement_gang} alt="" />
              </div>
            )
            case 4: return (    //耳温
              <div>
                <img src={placement_er} alt="" />
              </div>
            )
            default: break;
          }
          return (
            <p style={{ textAlign: 'center' }}>{text}</p>
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
    ];



    let lbgc = '', rbgc = ''
    if (this.state.isNotes) {
      lbgc = 'rgba(25,173,228,0.5)'; rbgc = 'rgba(105,201,237,1)'
    } else {
      lbgc = 'rgba(105,201,237,1)'; rbgc = 'rgba(25,173,228,0.5)'
    }

    return (
      <div className="clinical_foot">
        <div className="top">
          <div className="foot_l" style={{ backgroundColor: lbgc }} onClick={() => this.setState({ isNotes: true })}>
            Notes
          </div>
          <div className="foot_l" style={{ backgroundColor: rbgc }} onClick={() => this.setState({ isNotes: false })}>
            History
          </div>
        </div>
        {(this.state.isNotes) ? (
          <div className="note">
            <textarea
              rows="10"
              cols="30"
              value={this.state.notes}
              onChange={(val) => {
                console.log(val);
                this.setState({
                  notes: val.target.value
                })
              }}

            >
            </textarea>
          </div>
        ) : (<Table
          columns={columns}
          dataSource={this.state.historyData}
          rowKey={columns => columns.historyId}
          pagination={{ pageSize: 2, showSizeChanger: false, showQuickJumper: true }}
        />)}

      </div >
    )
  }

  _ciral = () => {


    // let { units, Temp, isconnected } = this.state
    // let text = '', unit = '', temColor = ''
    // Temp = parseFloat(Temp)
    // if (isconnected === false) {
    //   Temp = ''
    //   text = 'disconnected'
    //   temColor = '#3B3A3A'
    // } else {
    //   text = 'connected'
    //   temColor = '#3B3A3A'
    //   if (Temp > 15) {
    //     unit = units
    //     if (Temp > 39) {
    //       text = 'High'
    //       temColor = '#E1206D'
    //     } else if (Temp < 31) {
    //       text = 'Low'
    //       temColor = '#47C2ED'

    //     } else {
    //       text = 'Normal'
    //       temColor = '#78D35D'
    //     }
    //   }
    // }

    // let temp = ''

    // if (`${Temp}` === 'NaN' || Temp === '' || Temp === 0) {
    //   temp = ''
    // } else {
    //   temp = Temp
    //   if (units === '℉') {
    //     temp = parseInt((Temp * 1.8 + 32) * 10) / 10
    //   }
    // }

    return (
      <div className="crial" style={{ color: 'pink' }}>
        <Progress

          type="dashboard"
          strokeColor={{
            "100%": "#108ee9",
            "30%": "#87d068"
          }}
          format={() => ``}
          percent={this.state.progress}
          gapDegree={30}
          width={300}
          strokeWidth={10}
          success={{ strokeColor: 'red' }}

        />
        <div className="crialtext" >
          {this._crialText()}
        </div>

        {this._btnEndTime()}
      </div>
    )
  }
  _save = () => {
    console.log(storage.vetspireOrEzyvet);
    if (storage.identity === '2') {
      let parames = {
        consult_id: this.state.consult_id,
        temperature: this.state.Temp
      }
      console.log(parames, storage.ezyVetToken);
      //petVitalId是宠物测量部位
      let petVitalId = null
      switch (this.state.petVitalTypeId) {
        case '01': petVitalId = 1; break;
        case '02': petVitalId = 3; break;
        case '03': petVitalId = 4; break;
        default: petVitalId = 1; break;
      }
      console.log('请求地址：', `/EzyVet/healthstatus/${this.state.healthStatus}/${this.state.probeID}/${this.state.petVitalTypeId}/${petVitalId}`);
      fetchToken(`/EzyVet/healthstatus/${this.state.healthStatus}/${this.state.probeID}/${this.state.petVitalTypeId}/${petVitalId}`, 'PATCH', parames, `Bearer ${storage.ezyVetToken}`)
        .then(res => {
          console.log(res);
          if (res.msg === 'success') {
            console.log('成功');
            message.success('Saved successfully')

            this.setState({
              initFlog: false,
              endMeasure: false,
              Temp: 0,
              progress: 0,
              countdown: 0,
            })
            temp15 = 0
            this._getHistory()

          }
        })
        .catch(err => {
          console.log(err);
        })
      return
    } else if (storage.identity === '1') {
      //这是vetspire的保存测量记录
      let parames = {
        APIkey: storage.API,
        vitalId: storage.selectExamId,
        temp: parseInt((this.state.Temp * 1.8 + 32) * 10) / 10


      }

      console.log('------------------', parames);
      fetchRequest1('/VetSpire/updateVitalsTemperatureByVitalId', 'POST', parames)
        .then(res => {
          console.log(res);
          if (res.flag === true) {
            if (res.data.updateVitals !== null) {
              message.success('Saved successfully')
            } else {
              message.error('Save failed')
            }
            let sendData = {
              petId: this.state.petId,
              temperature: this.state.Temp,
              memo: this.state.notes,
              petVitalTypeId: this.state.petVitalTypeId
            }
            console.log('send', sendData);
            fetchRequest('/pet/savePetExam', 'POST', sendData)
              .then(res => {
                console.log(res);
                if (res.flag === true) {
                  this.setState({
                    initFlog: false,
                    endMeasure: false,
                    Temp: 0,
                    progress: 0,
                    countdown: 0,
                  })
                  temp15 = 0
                  this._getHistory()
                }
              })
              .catch(err => {
                console.log(err);
              })
          } else {
            message.error('Save failed')
          }
        })
        .catch(err => {
          console.log(err);
        })
    } else {
      console.log('我是普通医生，不带集成的');
      let petVitalId = null
      switch (this.state.petVitalTypeId) {
        case '01': petVitalId = 1; break;
        case '02': petVitalId = 3; break;
        case '03': petVitalId = 4; break;
        default: petVitalId = 1; break;
      }
      let params = {
        petId: this.state.petId,
        doctorId: storage.userId,
        temperature: this.state.Temp,
        petVitalTypeId: petVitalId,
        memo: this.state.notes
      }

      fetchRequest('/exam/addClamantPetExam', 'POST', params)
        .then(res => {
          console.log('res', res);
          if (res.flag === true) {
            message.success('Saved successfully')
            this.setState({
              initFlog: false,
              endMeasure: false,
              Temp: 0,
              progress: 0,
              countdown: 0,
            })
            temp15 = 0
            this._getHistory()
          }
        })
        .catch(err => {
          console.log(err);
        })
    }




  }
  _btnEndTime = () => {
    let { endMeasure, isconnected, initFlog } = this.state
    if (initFlog === false) {
      return
    }

    if (endMeasure === true) {
      // if (isconnected === true) {
      return (
        <>
          <div className="btn">
            <div className="btn1"
              onClick={() => {
                console.log('点击了Discard');
                this.setState({
                  endMeasure: false,
                  Temp: 0,
                  progress: 0,
                  countdown: 0,
                  initFlog: false
                })
                temp15 = 0
              }}
            >
              Discard
            </div>

            <div className="btn1"
              onClick={() => {
                this.timer && clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                  this._save()
                  clearTimeout(this.timer)
                }, 500);
              }}>
              Save
            </div>
          </div>
          {isconnected === true ? null : <p style={{ fontSize: '30px', color: '#3B3A3A', marginTop: '10px' }}> disconnected</p>}
        </>
      )
    } else {
      if (isconnected === true) {
        if (this.state.isEarMeasure) {
          return
        }
        return (
          <div className="time">
            <p>{`Measuring time  ${this.state.countdown}  s`}</p>
          </div>
        )
      } else {
        return (
          null
        )
      }
    }
  }
  _crialText = () => {
    let { endMeasure, isMeasure, isconnected, Temp } = this.state
    Temp = parseFloat(Temp)

    let temp = this.state.units === '℉' ? parseInt((Temp * 1.8 + 32) * 10) / 10 : Temp.toFixed(1)
    let text = '', temColor = ''
    if (Temp > 15) {
      if (Temp > 39) {
        text = 'High'
        temColor = '#E1206D'
      } else if (Temp < 31) {
        text = 'Low'
        temColor = '#47C2ED'

      } else {
        text = 'Normal'
        temColor = '#78D35D'
      }
    }
    if (endMeasure === true) {
      if (`${Temp}` === 'NaN' || `${Temp}` === '0') {
        if (isconnected === true) {

          return (
            <p style={{ fontSize: '30px', color: '#3B3A3A' }}>connected</p>
          )
        }
        else {
          return (
            <p style={{ fontSize: '30px', color: '#3B3A3A' }}>disconnected</p>
          )
        }
      } else {


        return (
          <div style={{ color: temColor }}>
            <span >{temp} <sup style={{ fontSize: '18px' }}>{this.state.units}</sup></span>
            <span style={{ fontSize: '22px' }}>{text}</span>
          </div>
        )
      }
    } else {
      if (isMeasure === true) {
        return (
          <>
            <span style={{ fontSize: '36px', color: temColor, display: 'flex', alignItems: 'center' }}>
              {temp} <sup style={{ fontSize: '18px' }}>{this.state.units}</sup></span>
          </>
        )
      } else {
        if (this.state.isEarMeasure) {
          return (
            <p style={{ fontSize: '30px', color: '#3B3A3A' }}>Measureing</p>
          )
        } else {
          if (isconnected === true) {

            return (
              <p style={{ fontSize: '30px', color: '#3B3A3A' }}>connected</p>
            )
          }
          else {
            return (
              <p style={{ fontSize: '30px', color: '#3B3A3A' }}>disconnected</p>
            )
          }
        }

      }
    }

  }

  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
      emerPatientID: ''
    });
  };
  _modal = () => {
    let that = this

    function save () {
      let datas = {
        memo: that.state.memo
      }

      console.log('入参：', datas, that.state.editId);
      fetchRequest(`/pet/updatePetExam/${that.state.editId}`, 'POST', datas)
        .then(res => {
          console.log(res);
          that.setState({
            visible: false,
          })
          that._getHistory()

        })
        .catch(err => {
          that.setState({
            spin: false
          })
          console.log(err);
        })

    }


    let { disabled, bounds, visible } = this.state
    return (
      <Modal
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
              height: '20px',
              textAlign: 'center'
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
            Modification history information
          </div>
        }
        visible={visible}
        // visible={true}
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
        footer={
          [] // 设置footer为空，去掉 取消 确定默认按钮
        }
        destroyOnClose={true}
      >
        <div id="selectEmergenciesModal">
          <div className="selectEmergenciesModal">
            <p style={{ width: '80px' }}>Notes</p>
            {/* <Input
              style={{ border: 'none', outline: 'medium' }}
              bordered={false}
              onChange={(item) => {
              }}
             
            /> */}
            <textarea
              rows="5"
              cols="40"
              style={{ textIndent: '10px' }}
              value={that.state.memo}
              onChange={(val) => {
                that.setState({
                  memo: val.target.value
                })
              }}

            >
            </textarea>
          </div>
          <div className="btn" onClick={save}>Edit</div>
        </div>

      </Modal>

    )

  }


  render () {
    const { closeColor, closebgc, minbgc } = this.state
    return (
      <div id="clinicalMeasure">
        {/* 头部 */}
        <div className="close1">
          {/* 菜单 */}
          <div className="menu">
            <Menu
              onClick={this.handleClick}
              selectedKeys={['menu']}
              mode="horizontal"
              theme={'drak'}
              subMenuCloseDelay={1}
            >

              <SubMenu key="SubMenu"
                popupOffset={[0, -8]}
                icon={<MyIcon type='icon-ic_menu_px' className="icon" />}
              >
                <Menu.Item key="1">Return</Menu.Item>
                <Menu.Item key="2">Home</Menu.Item>
                <Menu.Item key="4">Workplace</Menu.Item>
                <Menu.Item key='3'>Clinical Study Mode</Menu.Item>

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


        {/* 宠物信息与圆环部分部分 */}
        <div className='clinical_top'>
          {this._topLeft()}
          <div className="r" >
            {this._ciral()}
          </div>
        </div>


        {/* 底部宠物信息 */}
        {this._foot()}
        {this._modal()}
        {/* {this._table()} */}

        <Modal

          visible={this.state.err07Visible}
          // visible={true}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={330}
          closable={false}
          footer={[

          ]}
          destroyOnClose={true}
          wrapClassName="vetPrifileModal"
        >
          <div id='vetPrifileModal'>
            <div className="title">prompt
            </div>

            <div className='text'>Please re-plug the base device</div>


            <div className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}>

              <button
                onClick={() => {
                  this.setState({
                    err07Visible: false,

                  })
                  num07 = 0
                }}
              >OK</button>


            </div>
          </div>

        </Modal>
      </div>
    )
  }
}