import React, { Component } from 'react'
import { Input, Button, Menu, message, Select, Calendar, Col, Row, } from 'antd';
import Draggable from "react-draggable";
import moment from 'moment'
import 'antd/dist/antd.css';
import { createFromIconfontCN, SyncOutlined } from '@ant-design/icons';
import { fetchRequest } from './../../utils/FetchUtil1'
import dog from './../../assets/images/dog.png'
import cat from './../../assets/images/cat.png'
import horse from './../../assets/images/horse.png'
import rabbit from './../../assets/images/rabbit.png'
import selectphoto from './../../assets/images/sel.png'
import dui from './../../assets/images/dui.png'
import female from './../../assets/images/female.png'
import male from './../../assets/images/male.png'
import './editPetInfo.less'
const { SubMenu } = Menu;
const { Option } = Select;
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})
let storage = window.localStorage;
let url = 'http://ec2-3-214-224-72.compute-1.amazonaws.com:8080/mellaserver'
// let url = 'http://192.168.0.36:8080/mellaserver'
export default class EditPetInfo extends Component {
  state = {
    closebgc: '',
    minbgc: '',
    closeColor: '',
    api: '',
    id: '',
    seleceID: '',//医生id
    petSpecies: 0,
    unit: 1,
    gender: 0,
    isMix: false,
    imageId: -1,
    imgurl: '',
    breedArr: [],
    petSpeciesBreedId: '',
    dogData: [],
    birthday: moment(new Date()).format('MMMM D, YYYY'),
    patientId: '',
    petName: '',

    petId: '',
    lastName: '',
    firstName: '',
    breedName: '',

    initpetName: '',
    initpetId: '',
    initlastName: '',
    initfirstName: '',
    initbreedName: '',


  }

  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('big')
    if (this.props.location.participate) {
      let props = this.props.location.participate
      console.log(props);
      this.setState({
        patientId: props.patientId,
        petId: props.petId
      }, () => {
        this._getPetInfo()
      })
      console.log(props);


      this._getData()
    }
  }
  componentWillUnmount () {

  }
  _getData = (val, clearBreed = true) => {
    this.setState({
      petSpecies: val,

    })
    if (clearBreed) {
      this.setState({
        breedName: ''
      })
    }
    let data = {
      speciesId: val
    }
    fetchRequest(`/pet/selectBreedBySpeciesId`, 'POST', data)
      .then(res => {
        console.log('---', res);
        if (res.code === 0) {
          let arr = []
          res.petlist.map((item, index) => {
            let data = {
              petSpeciesBreedId: item.petSpeciesBreedId,
              breedName: item.breedName
            }
            arr.push(data)
          })
          this.setState({
            breedArr: arr
          })
        }
      })
      .catch(err => {
        console.log(err);
      })

  }
  _getPetInfo = () => {
    let datas = {
      patientId: this.state.patientId,
      doctorId: storage.userId,
    }
    if (storage.lastWorkplaceId) {
      datas.workplaceId = storage.lastWorkplaceId
    }



    console.log('入参：', datas);
    fetchRequest('/pet/getPetInfoByPatientIdAndPetId', 'POST', datas)
      .then(res => {
        console.log('>>>>>>>>>>>>>>', res);
        if (res.flag === true) {
          //有宠物，进入1
          let datas = []
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].petId === this.state.petId) {
              datas = res.data[i]
              break
            }

          }
          console.log('datas', datas);
          let { petId, petName, lastName, firstName, breedName, isMix, birthday, weight, url, gender, speciesId } = datas

          if (isMix !== true) {
            isMix = false
          }
          petName = isNull(petName)
          lastName = isNull(lastName)
          firstName = isNull(firstName)
          breedName = isNull(breedName)
          url = isNull(url)
          if (birthday != null) {
            birthday = moment(birthday).format('MMMM D, YYYY')
          }
          else {
            birthday = ''
          }
          if (gender === null || gender === NaN || `${gender}` === 'null' || `${gender}` === 'NaN') {
            gender = 0
          }
          if (weight) {
            weight = (weight * 2.2046).toFixed(1)
          } else {
            weight = ''
          }

          this.setState({
            petId,
            petName,
            lastName,
            firstName,
            breedName,
            isMix,
            birthday,
            weight,
            imgurl: url,
            gender,
            petSpecies: speciesId,


            initpetName: petName,
            initlastName: lastName,
            initfirstName: firstName,
          }, () => {
            this._getData(speciesId, false)
          })

        }
      })
      .catch(err => {

        console.log(err);
      })
    const isNull = (value) => {
      if (value === null || value === NaN || `${value}` === 'null' || `${value}` === 'NaN') {
        return ''
      } else {
        return value
      }
    }

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
    const { api, id, seleceID } = this.state
    if (e.key === '1') {
      // this.props.history.push({ pathname: '/page6', query: { api, id, seleceID } })
      this.props.history.goBack()
    }
    if (e.key === '2') {
      this.props.history.push('/')
    }

  };
  /**------------------顶部end------------------------ */
  _petSpecies = () => {
    let { petSpecies } = this.state
    let dogbgc = '', catbgc = '', hoursebgc = '', rabbitbgc = '';
    switch (petSpecies) {
      case 2: dogbgc = '#E1206D'; catbgc = '#F08FB6'; hoursebgc = '#F08FB6'; rabbitbgc = '#F08FB6'; break;
      case 1: dogbgc = '#F08FB6'; catbgc = '#E1206D'; hoursebgc = '#F08FB6'; rabbitbgc = '#F08FB6'; break;
      case 3: dogbgc = '#F08FB6'; catbgc = '#F08FB6'; hoursebgc = '#E1206D'; rabbitbgc = '#F08FB6'; break;
      case 4: dogbgc = '#F08FB6'; catbgc = '#F08FB6'; hoursebgc = '#F08FB6'; rabbitbgc = '#E1206D'; break;
      default: dogbgc = '#F08FB6'; catbgc = '#F08FB6'; hoursebgc = '#F08FB6'; rabbitbgc = '#F08FB6'; break;
    }
    this.avatar = selectphoto
    return (
      <div className="petSpecies">
        <div className="l">
          <p style={{ color: '#A0A0A0', fontSize: '16px' }}>Pet Species</p>
          <div className="selectSpecies">
            <ul>
              <li >
                <div className='speciesChild' >
                  <div className='dog' onClick={() => { this._getData(2) }} style={{ backgroundColor: dogbgc }}>
                    <img src={dog} alt="" style={{ width: '25px' }} />
                  </div>
                  Dog
                </div>
              </li>
              <li >
                <div className='speciesChild' >
                  <div className='dog' onClick={() => { this._getData(1) }} style={{ backgroundColor: catbgc }} >
                    <img src={cat} alt="" style={{ width: '29px' }} />
                  </div>
                  Cat
                </div>
              </li>
              <li >
                <div className='speciesChild' >
                  <div className='dog' onClick={() => { this._getData(3) }} style={{ backgroundColor: hoursebgc }}>
                    <img src={horse} alt="" style={{ height: '30px', color: '#FFF' }} />
                  </div>
                  Horse
                </div>
              </li>
              <li >
                <div className='speciesChild' >
                  <div className='dog' onClick={() => { this._getData(4) }} style={{ backgroundColor: rabbitbgc }}>
                    <img src={rabbit} alt="" style={{ height: '28px', color: '#FFF', }} />
                  </div>
                  Rabbit
                </div>
              </li>
            </ul>
          </div>



        </div>
        <div className="r">
          <div className="img">
            <div className="ciral" onClick={() => {
              let file = document.getElementById('f')
              file.click();
            }}>
              {(this.state.imgurl) ? (<img src={this.state.imgurl} alt="" id="touxiang" height="280px" />) : (
                <img src={this.avatar} alt="" id="touxiang" height="280px" />
              )}

              <input type="file"
                accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
                className="uploadImg"
                id="f"
                onChange={(e) => {
                  console.log(e);
                  let $target = e.target || e.srcElement
                  if ($target.files.length === 0) {
                    return;
                  }
                  let file = $target.files[0]
                  var reader = new FileReader()                   //创建文件阅读器实例
                  reader.readAsDataURL(file)
                  reader.onload = (data) => {
                    let res = data.target || data.srcElement
                    console.dir(document.getElementById('touxiang'));
                    document.getElementById('touxiang').src = res.result


                    const formData = new FormData();
                    formData.append('img', file);
                    fetch(`${url}/image/uploadImage`, {
                      method: 'POST',
                      headers: {
                      },
                      body: formData
                    })
                      .then((response) => response.json())
                      .then((res) => {
                        console.log(res);
                        if (res.flag === true) {
                          this.setState({
                            imageId: res.data.imageId,
                            imgurl: res.data.url
                          })
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }

                }} />
              <p>Upload Photo</p>
            </div>
          </div>
        </div>
      </div>

    )
  }
  _petName = () => {

    const onPanelChange = (value, mode) => {
      console.log('-----', value, mode);
    }
    let birthday = this.state.birthday
    return (
      <div className="petName">
        <div className="l">
          <p >Pet Name</p>
          <div className="infoInput">
            <Input
              bordered={false}
              value={this.state.initpetName}
              onChange={(item) => {

                this.setState({
                  petName: item.target.value.replace(/(^\s*)|(\s*$)/g, ""),
                  initpetName: item.target.value
                })
              }}
            />
          </div>
        </div>

        <div className="r">
          <p >Pet Birthday</p>
          <div className="infoInput" >
            <p style={{ weight: '60px', height: '27px', padding: 0, margin: 0 }} onClick={() => {
              document.getElementById('calendar').style.display = 'block'
            }}>{this.state.birthday}</p>
            <div className="calendar" id="calendar">
              <Calendar
                fullscreen={false}
                headerRender={({ value, type, onChange, onTypeChange }) => {
                  const start = 0;
                  const end = 12;
                  const monthOptions = [];

                  const current = value.clone();
                  const localeData = value.localeData();
                  const months = [];
                  for (let i = 0; i < 12; i++) {
                    current.month(i);
                    months.push(localeData.monthsShort(current));
                  }

                  for (let index = start; index < end; index++) {
                    monthOptions.push(
                      <Select.Option className="month-item" key={`${index}`}>
                        {months[index]}
                      </Select.Option>
                    );
                  }
                  const month = value.month();

                  const year = value.year();
                  const options = [];
                  for (let i = year - 10; i < year + 10; i += 1) {
                    options.push(
                      <Select.Option key={i} value={i} className="year-item">
                        {i}
                      </Select.Option>
                    );
                  }
                  return (
                    <div style={{ padding: 8 }}>
                      <Row gutter={8}>
                        <Col>
                          <Select
                            size="small"
                            dropdownMatchSelectWidth={false}
                            className="my-year-select"
                            onChange={(newYear) => {
                              const now = value.clone().year(newYear);
                              onChange(now);
                            }}
                            value={String(year)}
                          >
                            {options}
                          </Select>
                        </Col>
                        <Col>
                          <Select
                            size="small"
                            dropdownMatchSelectWidth={false}
                            value={String(month)}
                            onChange={(selectedMonth) => {
                              const newValue = value.clone();
                              newValue.month(parseInt(selectedMonth, 10));
                              onChange(newValue);
                            }}
                          >
                            {monthOptions}
                          </Select>
                        </Col>
                        <Col>
                          <div className="btn" onClick={() => {
                            document.getElementById('calendar').style.display = 'none'
                          }}>
                            Choose this date
                          </div>

                        </Col>
                      </Row>
                    </div>
                  );
                }}
                onSelect={(value) => {
                  console.log(value);
                  this.setState({
                    birthday: moment(value).format('MMMM D, YYYY')
                  })
                }}
              />
            </div>
          </div>
        </div>
      </div>

    )
  }
  _ownName = () => {

    return (
      <div className="petName">
        <div className="l">
          <p >Owner First Name</p>
          <div className="infoInput">
            <Input bordered={false}
              value={this.state.initfirstName}
              onChange={(item) => {

                this.setState({
                  firstName: item.target.value.replace(/(^\s*)|(\s*$)/g, ""),
                  initfirstName: item.target.value
                })
              }}

            />
          </div>
        </div>

        <div className="r">
          <p >Owner Last Name</p>
          <div className="infoInput">
            <Input bordered={false}
              value={this.state.initlastName}
              onChange={(item) => {

                this.setState({
                  lastName: item.target.value.replace(/(^\s*)|(\s*$)/g, ""),
                  initlastName: item.target.value
                })
              }}
            />
          </div>
        </div>
      </div>

    )
  }
  _select = (value, data) => {
    console.log(value, data);  //value的值为id
    this.setState({
      petSpeciesBreedId: value,
      breedName: data.children
    })
  }
  _primaryBreed = () => {
    let options = null
    options = this.state.breedArr.map(d => <Option key={d.petSpeciesBreedId}>{d.breedName}</Option>);
    let { breedName } = this.state
    // console.log('-----breedName:', breedName);

    return (
      <div className="petName">
        <div className="l">
          <p >Primary Breed</p>
          <div className="infoInput">
            {/* <Input bordered={false} /> */}
            <Select
              showSearch
              style={{ width: '100%' }}
              bordered={false}
              value={breedName}
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



        <div className="r" style={{ paddingTop: '80px' }}>
          <div className="max">
            Mix?
            <div className="selected"
              onClick={() => this.setState({
                isMix: !this.state.isMix
              })}
            >
              {(this.state.isMix) ? (<img src={dui} alt="" width='20px' />) : (null)}

            </div>
          </div>

        </div>
      </div>

    )
  }
  _weight = () => {
    let ibBgcColor = '', ibCor = '', kgBgcColor = '', kgCor = '', femaleBgc = '', maleBgc = '';
    switch (this.state.unit) {
      case 1: ibBgcColor = '#E1206D'; ibCor = '#fff'; kgBgcColor = '#fff'; kgCor = '#E1206D'; break;
      case 2: ibBgcColor = '#fff'; ibCor = '#E1206D'; kgBgcColor = '#E1206D'; kgCor = '#fff'; break;
    }

    switch (this.state.gender) {
      case 0: femaleBgc = '#E1206D'; maleBgc = '#F08FB6'; break;
      case 1: femaleBgc = '#F08FB6'; maleBgc = '#E1206D'; break;
    }

    return (
      <div className="petName">
        <div className="l">
          <p >Pet Weight</p>
          <div className="infoInput">
            <Input bordered={false}
              value={this.state.weight}
              onChange={(item) => {

                item = item.target.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符  
                item = item.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的  
                item = item.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
                item = item.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数  
                if (item.indexOf(".") < 0 && item != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
                  item = parseFloat(item);
                }

                this.setState({
                  weight: item
                })
              }}

            />
            <div className="ibKg">
              <div className="ibs"
                style={{ backgroundColor: ibBgcColor, color: ibCor }}
                onClick={() => {
                  console.log(this.state.unit);
                  if (this.state.unit === 2) {

                    this.setState({
                      unit: 1,
                    })
                  }
                }}
              >Ibs</div>
              <div className="kgs"
                style={{ backgroundColor: kgBgcColor, color: kgCor }}
                onClick={() => {
                  console.log(this.state.unit);
                  if (this.state.unit === 1) {
                    this.setState({
                      unit: 2,
                    })
                  }
                }}
              >kgs</div>

            </div>

          </div>
        </div>

        <div className="r">
          <p style={{ color: '#4a4a4a', fontSize: '17px', marginTop: '20px' }}>Pet Gender</p>
          <div className="gender">
            <div className="selectGender">
              <div className="female">
                <div className="femaleCiral"
                  style={{ backgroundColor: femaleBgc }}
                  onClick={() => this.setState({ gender: 0 })}
                >
                  <img src={female} alt="" />
                </div>
                Female
              </div>
              <div className="male">
                <div className="maleCiral"
                  style={{ backgroundColor: maleBgc }}
                  onClick={() => this.setState({ gender: 1 })}
                >
                  <img src={male} alt="" />
                </div>
                Male
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }

  render () {
    const { closeColor, closebgc, minbgc } = this.state

    return (
      <div id="editPetInfo">
        {/* 头部 */}
        <div className="close1">
          {/* 菜单 */}
          <div className="menu">

            <MyIcon type='icon-fanhui4' className="icon" onClick={() => {
              // this.props.history.push({ pathname: '/page8', participate: { patientId: this.state.patientId } })
              this.props.history.goBack()
            }} />
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
        <div className="editPetInfo_top">
          <div className="title">{`${this.state.patientId}, ${this.state.petName}`}</div>
          {this._petSpecies()}
          {this._petName()}
          {this._ownName()}
          {this._primaryBreed()}
          {this._weight()}
        </div>
        <div className="editPetInfo_foot">
          <div className="save"
            onClick={() => {
              let { petName, birthday, firstName, lastName, petSpeciesBreedId, isMix, weight, gender, unit, imageId, breedName, petId } = this.state
              console.log('生日：', birthday);
              if (unit === 1) {
                weight = (0.45359 * weight).toFixed(2)
              }

              console.log('petName:', petName, '------------birthday:', birthday, '--------firstName', firstName, '---------------lastName',
                lastName, '-------------petSpeciesBreedId', petSpeciesBreedId, '---isMix:', isMix, '----weight:', weight, '----gender', gender);
              let data = {
                petName,
                weight: parseFloat(weight),
                gender,
                firstName,
                lastName
              }
              if (birthday) {
                data.birthday = moment(birthday).format('YYYY-MM-DD')
              }
              if (imageId !== -1) {
                data.imageId = imageId
              }
              if (breedName) {
                data.breedName = breedName
              }

              console.log(data);
              fetchRequest(`/pet/updatePetInfo/1/${petId}`, 'POST', data)
                .then(res => {
                  console.log(res);
                  if (res.flag === true) {
                    console.log('tiaozhhuan');
                    this.props.history.push({ pathname: 'page8', participate: { patientId: this.state.patientId } })
                  } else {
                    message.error('Update failed')
                  }
                })
                .catch(err => {
                  console.log(err);
                })
            }}

          >Save Changes</div>

        </div>
      </div>
    )
  }
}