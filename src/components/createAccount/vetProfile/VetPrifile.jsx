import React, { Component, } from 'react'
import {
  Button,

  Modal,
  message
} from 'antd';
import Draggable from "react-draggable";
import { createFromIconfontCN, CaretDownFilled } from '@ant-design/icons';
import 'antd/dist/antd.css';

import './vetProfile.less'
import imgArray from './../../../utils/areaCode/imgArray'
import MaxMin from './../../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest2 } from './../../../utils/FetchUtil2'
import { fetchRequest } from './../../../utils/FetchUtil1'
import countryList from './../../../utils/areaCode/country';
import moment from 'moment';
import temporaryStorage from '../../../utils/temporaryStorage'

const options = [
  { label: 'Dogs', value: 'Dogs' },
  { label: 'Cats', value: 'Cats' },
  { label: 'Small Pets', value: 'Small Pets' },
  { label: 'Nutrition', value: 'Nutrition' },
  { label: 'Surgery', value: 'Surgery' },
  { label: 'Zoo', value: 'Zoo' },
  { label: 'Wildlife', value: 'Wildlife' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Neurology', value: 'Neurology' },
  { label: 'Anaesthesia', value: 'Anaesthesia' },
  { label: 'Other', value: 'Other' },
]
export default class VetPrifile extends Component {

  state = {
    code: 1,
    imgArrayIndex: 0,
    otherText: '',
    name: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: moment(),
    password: '',
    password1: '',
    checboxtValue: [],
    expertise: '00000000000',       //专业领域，勾选某一项，则这一项为1，反之为0    01011111101

    visible: false,       //nodel框是否显示
    disabled: true,       //model是否可拖拽
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },
  }

  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('middle')
    console.log(temporaryStorage.logupVetInfo);
    if (temporaryStorage.logupVetInfo && temporaryStorage.logupVetInfo.email) {
      console.log('进来了');
      let { firstName, lastName, email, hash, domain, code, initPhone, birthday, imgArrayIndex } = temporaryStorage.logupVetInfo
      this.setState({
        name: `${lastName} ${firstName}`,
        email,
        password: hash,
        password1: hash,
        code,
        phone: initPhone,
        imgArrayIndex
      })
      if (birthday) {
        console.log('有日期：', moment(birthday));
        this.setState({
          birthday: moment(birthday)
        })
      }
      let domainArr = domain.split(',')
      let checboxtValue = []
      for (let i = 0; i < domainArr[0].length; i++) {
        if (domainArr[0][i] === '1') {
          checboxtValue.push(options[i].label)
        }
      }
      if (domainArr.length > 1) {
        this.setState({
          checboxtValue,
          otherText: domainArr[1]
        })
      } else {
        this.setState({
          checboxtValue
        })
      }

    }

  }


  _next = () => {
    let { name, lastName, email, code, phone, password1, password, } = this.state

    console.log({ name, email, code, phone, password1, password, });
    email = email.toLocaleLowerCase()
    if (name.length <= 0) {
      message.error('Please enter your first name', 3)
      return
    }
    if (lastName.length <= 0) {
      message.error('Please enter your last name', 3)
      return
    }
    if (!email) {
      message.error('Please enter the mailbox number', 3)
      return
    } else {
      if (email.indexOf('@') === -1 || email.indexOf('@') === 0 || email.indexOf('@') === email.length - 1) {
        message.error('E-mail format is incorrect', 3)
        return
      }
    }
    if (!phone) {
      message.error('Please enter the phone number', 3)
      return
    }
    if (password.length <= 0 || password1.length <= 0) {
      message.error('Please enter the password', 3)
      return
    }

    if (password !== password1) {
      message.error('The password entered twice is incorrect, please re-enter', 3)
      return
    }




    fetchRequest(`/user/checkUser/${email}`, 'GET', '')
      .then(res => {
        console.log(res);
        if (!res.flag) {
          console.log('邮箱号以被注册，是否忘记密码');
          this.setState({
            visible: true
          })
        }
        else {
          console.log('邮箱号可以使用');

          let params = {
            firstName: name,
            lastName,
            email,
            phone: `+${code}${phone}`,
            hash: password,

          }
          console.log('注册接口的入参：', params);
          fetchRequest2('/user/deskRegistAWSSNS', "POST", params)
            .then(res => {
              console.log('注册接口返回数据：', res);
              if (res.flag) {
                console.log('注册成功了，去验证验证码');
                temporaryStorage.logupEmailCode = res.data
                params.code = code
                params.initPhone = phone
                params.imgArrayIndex = this.state.imgArrayIndex
                temporaryStorage.logupVetInfo = params
                this.props.history.push('/uesr/logUp/VerifyEmail')
              } else {
                message.error('registration failed', 3)
              }
            })
            .catch(err => {
              message.error(`Error:${err.message}`)
              console.log('注册接口抛出错误：', err);
            })
        }
      })
      .catch(err => {
        message.error(`Error:${err.message}`)
        console.log('检测邮箱号的接口出错了', err);
      })
  }
  _signIn = (e) => {
    e.preventDefault();
    this.props.history.push('/page11')
  }



  render () {

    let { lastName, disabled, bounds, name, email, phone, password, password1, visible } = this.state
    return (
      <div id="vetPrifile" >
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push('/')}
        />
        <div className="text">
          Let’s start by creating your account
        </div>
        <div className="form">
          <div className="item">
            <div className="l">
              <input
                type="text"
                value={name}
                placeholder="First Name"
                onChange={(value) => {
                  let data = value.target.value

                  this.setState({
                    name: data
                  })
                }}
              />

            </div>
            <div className="l">
              <input
                type="text"
                value={lastName}
                placeholder="Last Name"
                onChange={(value) => {
                  let data = value.target.value

                  this.setState({
                    lastName: data
                  })
                }}
              />

            </div>
          </div>

          <div className="item">
            <div className="l">
              <input
                type="Email"
                value={email}
                placeholder="Email Address*"
                onChange={(value) => {
                  let data = value.target.value
                  this.setState({
                    email: data
                  })
                }}
              />
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


              <div className='phone'>
                <div
                  style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'absolute', left: '10px' }}
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
                  placeholder="Phone Number"
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
              <input
                type="Password"
                value={password}
                placeholder="Create Password"
                onChange={(value) => {
                  let data = value.target.value
                  this.setState({
                    password: data
                  })
                }}
              />
            </div>
            <div className="l">
              <input
                type="Password"
                value={password1}
                placeholder="Confirm  Password"
                onChange={(value) => {
                  let data = value.target.value
                  this.setState({
                    password1: data
                  })
                }}
              />
            </div>
          </div>
          <div className="footText">Already have an accoun? <a href="#" onClick={this._signIn}> Sign In</a></div>

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

          visible={visible}
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
            <div className="title">Email Already Exists</div>

            <div className='text'>Please sign up with your Mella<br />account and create a new<br />workspace from the<br />Settings menu.</div>

            <div className="btn">

              <button
                onClick={() => {
                  this.setState({
                    visible: false,
                    email: ''
                  })
                }}
              >Try Again</button>
              <button
                onClick={() => {
                  this.setState({
                    visible: false
                  })
                  this.props.history.replace('/page11')
                }}
              >Sign Up</button>

            </div>
          </div>

        </Modal>
      </div>


    )
  }
}




// import React, { Component, } from 'react'
// import {
//   Button,
//   Input,
//   Form,
//   Select,
//   DatePicker,
//   Space,
//   Modal,
//   Checkbox,
//   Row,
//   Col,
//   message
// } from 'antd';
// import Draggable from "react-draggable";
// import { createFromIconfontCN, CaretDownFilled } from '@ant-design/icons';
// import 'antd/dist/antd.css';

// import './vetProfile.less'
// import imgArray from './../../../utils/areaCode/imgArray'
// import MaxMin from './../../../utils/maxminreturn/MaxMinReturn'
// import { fetchRequest2 } from './../../../utils/FetchUtil2'
// import { fetchRequest } from './../../../utils/FetchUtil1'
// import countryList from './../../../utils/areaCode/country';
// import moment from 'moment';
// import temporaryStorage from '../../../utils/temporaryStorage'

// const options = [
//   { label: 'Dogs', value: 'Dogs' },
//   { label: 'Cats', value: 'Cats' },
//   { label: 'Small Pets', value: 'Small Pets' },
//   { label: 'Nutrition', value: 'Nutrition' },
//   { label: 'Surgery', value: 'Surgery' },
//   { label: 'Zoo', value: 'Zoo' },
//   { label: 'Wildlife', value: 'Wildlife' },
//   { label: 'Cardiology', value: 'Cardiology' },
//   { label: 'Neurology', value: 'Neurology' },
//   { label: 'Anaesthesia', value: 'Anaesthesia' },
//   { label: 'Other', value: 'Other' },
// ]
// export default class VetPrifile extends Component {

//   state = {
//     code: 1,
//     imgArrayIndex: 0,
//     otherText: '',
//     name: '',
//     email: '',
//     phone: '',
//     birthday: moment(),
//     password: '',
//     password1: '',
//     checboxtValue: [],
//     expertise: '00000000000',       //专业领域，勾选某一项，则这一项为1，反之为0    01011111101

//     visible: false,       //nodel框是否显示
//     disabled: true,       //model是否可拖拽
//     bounds: { left: 0, top: 0, bottom: 0, right: 0 },
//   }

//   componentDidMount () {
//     let ipcRenderer = window.electron.ipcRenderer
//     ipcRenderer.send('middle')
//     console.log(temporaryStorage.logupVetInfo);
//     if (temporaryStorage.logupVetInfo && temporaryStorage.logupVetInfo.email) {
//       console.log('进来了');
//       let { firstName, lastName, email, hash, domain, code, initPhone, birthday, imgArrayIndex } = temporaryStorage.logupVetInfo
//       this.setState({
//         name: `${lastName} ${firstName}`,
//         email,
//         password: hash,
//         password1: hash,
//         code,
//         phone: initPhone,
//         imgArrayIndex
//       })
//       if (birthday) {
//         console.log('有日期：', moment(birthday));
//         this.setState({
//           birthday: moment(birthday)
//         })
//       }
//       let domainArr = domain.split(',')
//       let checboxtValue = []
//       for (let i = 0; i < domainArr[0].length; i++) {
//         if (domainArr[0][i] === '1') {
//           checboxtValue.push(options[i].label)
//         }
//       }
//       if (domainArr.length > 1) {
//         this.setState({
//           checboxtValue,
//           otherText: domainArr[1]
//         })
//       } else {
//         this.setState({
//           checboxtValue
//         })
//       }

//     }

//   }
//   componentWillMount () {

//   }
//   _dateOnChange = (date, dateString) => {
//     console.log(date, dateString);
//     this.setState({
//       birthday: date,
//       birthdayStr: dateString
//     })
//   }
//   onChange = (val) => {
//     console.log('选中的;', val);
//     if (val.indexOf('Other') === -1) {
//       this.setState({
//         disabled: true,
//         otherText: ''
//       })
//     } else {
//       this.setState({
//         disabled: false
//       })
//     }
//     let str = ''
//     for (let i = 0; i < options.length; i++) {
//       if (val.indexOf(options[i].label) === -1) {
//         str += '0'
//       } else {
//         str += '1'
//       }

//     }
//     console.log(str);
//     this.setState({
//       expertise: str,
//       checboxtValue: val
//     })
//   }

//   onStart = (event, uiData) => {
//     const { clientWidth, clientHeight } = window?.document?.documentElement;
//     const targetRect = this.draggleRef?.current?.getBoundingClientRect();
//     this.setState({
//       bounds: {
//         left: -targetRect?.left + uiData?.x,
//         right: clientWidth - (targetRect?.right - uiData?.x),
//         top: -targetRect?.top + uiData?.y,
//         bottom: clientHeight - (targetRect?.bottom - uiData?.y)
//       }
//     });
//   };

//   _next = () => {
//     let { name, email, code, phone, birthday, password1, password, expertise, otherText, birthdayStr } = this.state

//     console.log({ name, email, code, phone, birthday, password1, password, expertise });
//     email = email.toLocaleLowerCase()
//     if (name.length <= 0) {
//       message.error('Please enter the name of the vet', 3)
//       return
//     }
//     if (!email) {
//       message.error('Please enter the mailbox number', 3)
//       return
//     } else {
//       if (email.indexOf('@') === -1 || email.indexOf('@') === 0 || email.indexOf('@') === email.length - 1) {
//         message.error('E-mail format is incorrect', 3)
//         return
//       }
//     }
//     if (!phone) {
//       message.error('Please enter the phone number', 3)
//       return
//     }
//     if (password.length <= 0 || password1.length <= 0) {
//       message.error('Please enter the password', 3)
//       return
//     }

//     if (password !== password1) {
//       message.error('The password entered twice is incorrect, please re-enter', 3)
//       return
//     }


//     let nameArr = name.split(' ')
//     let firstName = nameArr[0]
//     let lastName = ''
//     if (nameArr.length > 1) {
//       for (let i = 1; i < nameArr.length; i++) {
//         lastName += nameArr[i]
//       }
//     }
//     console.log(nameArr, firstName, lastName);

//     fetchRequest(`/user/checkUser/${email}`, 'GET', '')
//       .then(res => {
//         console.log(res);
//         if (!res.flag) {
//           console.log('邮箱号以被注册，是否忘记密码');
//           this.setState({
//             visible: true
//           })
//         }
//         else {
//           console.log('邮箱号可以使用');
//           let domain = expertise
//           if (expertise[expertise.length - 1] === '1' && otherText) {
//             domain += `,${otherText}`
//           }
//           let params = {
//             firstName,
//             lastName,
//             email,
//             phone: `+${code}${phone}`,
//             hash: password,
//             domain
//           }
//           if (birthdayStr) {
//             params.birthday = birthdayStr
//           }
//           console.log('注册接口的入参：', params);
//           fetchRequest2('/user/deskRegistAWSSNS', "POST", params)
//             .then(res => {
//               console.log('注册接口返回数据：', res);
//               if (res.flag) {
//                 console.log('注册成功了，去验证验证码');
//                 temporaryStorage.logupEmailCode = res.data
//                 params.code = code
//                 params.initPhone = phone
//                 params.imgArrayIndex = this.state.imgArrayIndex
//                 temporaryStorage.logupVetInfo = params
//                 this.props.history.push('/uesr/logUp/VerifyEmail')
//               } else {
//                 message.error('registration failed', 3)
//               }
//             })
//             .catch(err => {
//               message.error(`Error:${err.message}`)
//               console.log('注册接口抛出错误：', err);
//             })
//         }
//       })
//       .catch(err => {
//         message.error(`Error:${err.message}`)
//         console.log('检测邮箱号的接口出错了', err);
//       })
//   }



//   render () {

//     let { disabled, bounds, name, email, phone, password, password1, visible } = this.state
//     return (
//       <div id="vetPrifile" >
//         {/* 关闭缩小 */}
//         <MaxMin
//           onClick={() => { this.props.history.push('/') }}
//           onClick1={() => this.props.history.push('/')}
//         />
//         <div className="text">
//           Create Vet Profile
//         </div>
//         <div className="form">
//           <div className="item">
//             <div className="l">
//               <p>Vet Name*</p>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(value) => {
//                   let data = value.target.value

//                   this.setState({
//                     name: data
//                   })
//                 }}
//               />

//             </div>
//             <div className="l">
//               <p>Vet Email*</p>
//               <input
//                 type="Email"
//                 value={email}
//                 onChange={(value) => {
//                   let data = value.target.value
//                   this.setState({
//                     email: data
//                   })
//                 }}
//               />
//             </div>
//           </div>

//           <div className="item">
//             <div className="l">
//               <ul id="list">
//                 {countryList.map((item, index) => {
//                   let url = imgArray[item.locale.toLowerCase()] ? imgArray[item.locale.toLowerCase()].default : ''
//                   return (
//                     <li key={index}>
//                       <div key={index}
//                         style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//                         onClick={() => {
//                           console.log(item, index);
//                           this.setState({
//                             code: item.code,
//                             imgArrayIndex: index
//                           })
//                           document.getElementById('list').style.display = "none"
//                         }}
//                       >
//                         <img src={url} alt="" />
//                         <p >{`${item.en}   +${item.code}`}</p>
//                       </div>
//                     </li>
//                   )
//                 })}
//               </ul>

//               <p>Vet Phone Number*</p>
//               <div className='phone'>
//                 <div
//                   style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
//                   onClick={() => {
//                     document.getElementById('list').style.display = "block"
//                   }}
//                 >
//                   <img style={{ zIndex: '888' }}
//                     src={imgArray[countryList[this.state.imgArrayIndex].locale.toLowerCase()].default} alt=""
//                   />
//                   <CaretDownFilled style={{ marginRight: '10px' }} />
//                 </div>


//                 <input
//                   type="Phone"
//                   value={phone}
//                   onChange={(value) => {
//                     let data = value.target.value
//                     this.setState({
//                       phone: data.replace(/[^\-?\d]/g, '')
//                     })
//                   }}
//                 />
//               </div>

//             </div>
//             <div className="l">
//               <p>Vet Birthday</p>
//               <Space direction="vertical">
//                 <DatePicker
//                   onChange={this._dateOnChange}
//                   bordered={false}
//                   className="date"
//                   showToday={false}
//                   value={this.state.birthday}
//                 />
//               </Space>
//             </div>
//           </div>


//           <div className="item">
//             <div className="l">
//               <p>Login Password*</p>
//               <input
//                 type="Password"
//                 value={password}
//                 onChange={(value) => {
//                   let data = value.target.value
//                   this.setState({
//                     password: data
//                   })
//                 }}
//               />
//             </div>
//             <div className="l">
//               <p>Verify Password*</p>
//               <input
//                 type="Password"
//                 value={password1}
//                 onChange={(value) => {
//                   let data = value.target.value
//                   this.setState({
//                     password1: data
//                   })
//                 }}
//               />
//             </div>
//           </div>
//           <div className="item">
//             <div className="l">
//               <p>Areas of Expertise</p>
//               <Checkbox.Group onChange={this.onChange} value={this.state.checboxtValue}>
//                 <Row>
//                   {options.map((item, index) => {
//                     if (index === options.length - 1) {
//                       return (
//                         <Col span={3} style={{ marginBottom: '18px' }}>
//                           <Checkbox value={item.value}>{item.label}</Checkbox>
//                         </Col>
//                       )

//                     }
//                     return (
//                       <Col span={6} style={{ marginBottom: '18px' }}>
//                         <Checkbox value={item.value} >{item.label}</Checkbox>
//                       </Col>
//                     )
//                   })}
//                   <Col span={6} style={{ marginBottom: '18px' }}>
//                     <input
//                       type="text"
//                       disabled={this.state.disabled}
//                       style={{ background: 'none' }}
//                       value={this.state.otherText}
//                       onChange={val => {
//                         this.setState({ otherText: val.target.value })
//                       }}
//                     />
//                   </Col>

//                 </Row>

//               </Checkbox.Group>
//             </div>

//           </div>
//           {/* 按钮 */}
//           <div className="btn">
//             <Button
//               type="primary"
//               shape="round"
//               size='large'
//               htmlType="submit"
//               onClick={this._next}
//             >
//               Next
//             </Button>
//           </div>

//         </div>

//         <Modal
//           title={
//             <div
//               style={{
//                 width: '100%',
//                 cursor: 'move',
//                 height: '20px',
//                 fontWeight: '700'
//               }}
//               onMouseOver={() => {
//                 if (disabled) {
//                   this.setState({
//                     disabled: false,
//                   });
//                 }
//               }}
//               onMouseOut={() => {
//                 this.setState({
//                   disabled: true,
//                 });
//               }}
//             >
//               remind
//             </div>
//           }
//           visible={visible}
//           // visible={true}
//           onOk={this.handleOk}
//           onCancel={this.handleCancel}
//           width={330}
//           modalRender={(modal) => (
//             <Draggable
//               disabled={disabled}
//               bounds={bounds}
//               onStart={(event, uiData) => this.onStart(event, uiData)}
//             >
//               <div ref={this.draggleRef}>{modal}</div>
//             </Draggable>
//           )}
//           footer={[
//             <button
//               style={{ width: '110px', height: '40px', border: 0, backgroundColor: '#E1206D', color: '#fff', borderRadius: '60px', fontSize: '18px' }}
//               onClick={() => {
//                 this.setState({
//                   visible: false,
//                   email: ''
//                 })
//               }}
//             >Cancel</button>,
//             <button
//               style={{ width: '110px', height: '40px', border: 0, backgroundColor: '#E1206D', color: '#fff', borderRadius: '60px', fontSize: '18px' }}
//               onClick={() => {
//                 this.setState({
//                   visible: false
//                 })
//                 this.props.history.replace('/page11')
//               }}
//             >Log in</button>

//           ]}
//           destroyOnClose={true}
//         >
//           <div id='vetPrifileModal'>

//             <p>The mailbox has been registered, you can log in by entering a password</p>
//           </div>

//         </Modal>
//       </div>


//     )
//   }
// }