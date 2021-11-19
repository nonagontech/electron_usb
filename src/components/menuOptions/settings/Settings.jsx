
import React, { Component } from 'react'
import {
  Switch,
  Select,
} from 'antd'




import Heart from '../../../utils/heard/Heard'
import Slider from '../../../utils/slider/Slider'
import Button from './../../../utils/button/Button'
import electronStore from './../../../utils/electronStore'
import temporaryStorage from './../../../utils/temporaryStorage'
import './settings.less'

const { Option } = Select;

export default class Settings extends Component {

  state = {
    self_tarting: false,      //自启动，
    isHua: true,              //为true代表为华氏度，为false代表℃
    is15: true,               //腋温测量时长，为true则是15秒，为false则是35秒
    isClicleStudy: false,     //是否处于临床测试，为true则在处于，false则不处于
    isBacklight: true,        //是否开启背光，为true则是开启背光，为false则是关闭背光
    isBeep: true,             //是否开启蜂鸣器，为true则是开启蜂鸣器，反之则是关闭蜂鸣器
    backlightTimer: { length: 140, number: '20' },//背光时长，长度指的是在滑轨上面的距离，number指的是显示的秒数
    autoOff: { length: 0, number: '30' },  //无操作自动关机，长度指的是在滑轨上面的距离，number指的是关闭的秒数
  }
  componentDidMount () {
    //这里要根据保存的时候存到哪个位置的，然后拿出来更新state
    let hardSet = electronStore.get('hardwareConfiguration')
    console.log('----', hardSet);
    if (hardSet) {
      console.log('不是第一次进来，有设置的');

      let { isHua, is15, isBacklight, isBeep, backlightTimer, autoOff } = hardSet
      this.setState({
        isHua, is15, isBacklight, isBeep, backlightTimer, autoOff,
        isClicleStudy: temporaryStorage.isClicleStudy
      })
    } else {
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
      let { isHua, is15, isBacklight, isBeep, backlightTimer, autoOff } = settings
      this.setState({
        isHua, is15, isBacklight, isBeep, backlightTimer, autoOff,
        isClicleStudy: temporaryStorage.isClicleStudy

      })
    }

  }

  _save = () => {
    console.log('点击保存');
    /**
     * 分别两部分保存保存，
     * 本地存储：程序自启动、测量单位、背光、蜂鸣器、背光时间、硬件自动关机时间、腋温测量时间
     * 临时存储：处于临床测试状态
     */
    let { self_tarting, isHua, isClicleStudy, isBacklight, isBeep, backlightTimer, autoOff, is15 } = this.state
    // console.log({ self_tarting, isHua, isClicleStudy, isBacklight, isBeep, backlightTimer, autoOff, is15 });
    let settings = {
      isHua,
      is15,
      self_tarting,
      isBacklight,
      isBeep,
      backlightTimer,
      autoOff,
    }
    electronStore.set('hardwareConfiguration', settings)
    temporaryStorage.isClicleStudy = isClicleStudy
    let ipcRenderer = window.electron.ipcRenderer
    if (self_tarting) {
      ipcRenderer.send('openAutoStart')
    } else {
      ipcRenderer.send('closeAutoStart')
    }
    let setArr = ['03', 'ed', '07', 'dd', autoOff.number, isBacklight ? backlightTimer.number : '00', isBeep ? '11' : '00', isHua ? '00' : '01']
    console.log('setArr', setArr);



    ipcRenderer.send('usbdata', { command: '21', arr: setArr })
    this.props.history.goBack()
  }
  render () {
    let { isClicleStudy, isBacklight, isBeep, backlightTimer } = this.state
    return (
      <div id="settings">
        <Heart

        />
        <div className="body">
          {/* 桌面设计 */}
          <div className="desk">
            <div className="title">Desktop Settings</div>

            <div className="item">
              <div className="l">
                <div className="text">Launch Mella on Computer Startup</div>
                <div className="icon"
                  onClick={() => this.setState({ self_tarting: !this.state.self_tarting })}
                >
                  {(this.state.self_tarting) && <span >&#xe619;</span>}

                </div>

              </div>


              <div className="l">
                <div className="text">Units:</div>
                <div className="unit">


                  <div className="one"
                    onClick={() => { this.setState({ isHua: true }) }}
                  >
                    <div className="check">
                      {(this.state.isHua) && <div className="ciral" />}
                    </div>
                    <div className="unitsText">℉</div>
                  </div>
                  <div className="one"
                    onClick={() => { this.setState({ isHua: false }) }}
                  >
                    <div className="check">
                      {(!this.state.isHua) && <div className="ciral" />}
                    </div>
                    <div className="unitsText">℃</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="item">
              <div className="l">
                <div className="text">Clinical Study Mode</div>
                <div className="switch">
                  <Switch
                    checked={isClicleStudy}
                    onClick={() => this.setState({ isClicleStudy: !isClicleStudy })}
                    size='small'
                  />
                </div>

              </div>


              <div className="l" style={{ height: '50px' }}>

              </div>
            </div>

          </div>

          {/* 用户设计 */}
          <div className="desk">
            <div className="title user">User Admin</div>

            <div className="item">
              <div className="l">
                <div className="text">{`Org & Practice Profiles`}</div>
                <div className="rightIcon">&#xe60c;</div>

              </div>


              <div className="l">
                <div className="text">Invite Your Team</div>
                <div className="rightIcon">&#xe60c;</div>
              </div>
            </div>

            <div className="item">
              <div className="l">
                <div className="text">Vet Profile Management</div>
                <div className="rightIcon">&#xe60c;</div>
              </div>


              <div className="l " style={{ marginTop: '25px', marginBottom: '20px' }}>
                <div className="text">Pet and Parents Profile Management</div>
                <div className="rightIcon">&#xe60c;</div>
              </div>
            </div>

          </div>

          {/* 硬件设置 */}

          <div className="desk">

            <div className="item" style={{ marginTop: '15px' }}>
              <div className="l">
                <div className="hardSetting">{`Hardware Settings`}</div>
              </div>


              <div className="l">
                <div className="text">Device:</div>
                <Select defaultValue="Mella001" style={{ width: 220, borderRadius: '50px' }} onChange={() => { }}>
                  <Option value="Mella001">Mella001</Option>
                  <Option value="Mella002">Mella002</Option>
                  <Option value="Mella003">Mella003</Option>
                </Select>
              </div>
            </div>
            <div className="item" style={{ marginTop: '25px' }}>
              <div className="l">
                <div className="text">Backlight</div>
                <Switch
                  checked={isBacklight}
                  onClick={() => this.setState({ isBacklight: !isBacklight })}
                  size='small'
                />
              </div>


              <div className="l">
                <div className="text">Action Beep</div>
                <Switch
                  checked={isBeep}
                  onClick={() => this.setState({ isBeep: !isBeep })}
                  size='small'
                />
              </div>
            </div>


            <div className="item" style={{ marginTop: '35px' }}>
              <div className="l">
                <div className="backlight">
                  <div className="text">Backlight Timer</div>
                  <div className="solid">
                    5 Secs
                    <div className="slider">
                      <Slider
                        min={5}
                        max={25}
                        getData={(e) => { console.log(e); this.setState({ backlightTimer: e }) }}
                        left={backlightTimer.length}
                      />
                    </div>
                    25 Secs
                  </div>

                </div>
              </div>


              <div className="l" >
                <div className="backlight" >
                  <div className="text">Auto Off After</div>
                  <div className="solid" >
                    30 Secs
                    <div className="slider">
                      <Slider
                        min={30}
                        max={60}
                        getData={(e) => { this.setState({ autoOff: e }) }}
                        left={this.state.autoOff.length}
                      />
                    </div>
                    60 Secs
                  </div>

                </div>
              </div>
            </div>

            <div className="item" style={{ marginTop: '35px' }}>



              <div className="l" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="text">Measurement Time for Axillary Sensor</div>
                <div className="unit">


                  <div className="one"
                    onClick={() => { this.setState({ is15: true }) }}
                  >
                    <div className="check">
                      {(this.state.is15) && <div className="ciral" />}
                    </div>
                    <div className="unitsText">15 Secs</div>
                  </div>
                  <div className="one"
                    onClick={() => { this.setState({ is15: false }) }}
                  >
                    <div className="check">
                      {(!this.state.is15) && <div className="ciral" />}
                    </div>
                    <div className="unitsText">35 Secs</div>
                  </div>
                </div>
              </div>

              <div className="l">
                <div className="text">Vet Profile Management:</div>
                <div className="rightIcon">&#xe60c;</div>
              </div>
            </div>


          </div>

          <div className="btn">
            <Button
              text={'Save Changes'}
              onClick={this._save}
            />
          </div>



        </div>
      </div>
    )
  }
}