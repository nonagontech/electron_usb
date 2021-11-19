import React, { Component } from 'react'
import {
  // Button,
  message,
  Modal,
  Input
} from 'antd';
import Draggable from "react-draggable";
import 'antd/dist/antd.css';
import MaxMin from '../../../utils/maxminreturn/MaxMinReturn'
import { createFromIconfontCN, SyncOutlined } from '@ant-design/icons';
import Button from './../../../utils/button/Button'



import './joinOrganizationByOption.less'
import { fetchRequest } from '../../../utils/FetchUtil1';
import temporaryStorage from '../../../utils/temporaryStorage';

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})
export default class FindWorkplace extends Component {

  state = {
    search: '',
    listData: [],
    searchData: [],
    selectId: {},
    isOrg: false,       //nodel框是否显示
    isWorkplace: false,
    workplaceList: [],
    disabled: true,       //model是否可拖拽
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },
    selectworkplace: {}
  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('middle')
    fetchRequest(`/organization/listAll`, "GET", '')
      .then((res) => {
        console.log(res);
        if (res.msg === 'success') {
          this.setState({
            listData: res.data
          })
        }
      })
      .catch((err) => {
        console.log(err);
      })
    this.setState({
      selectId: temporaryStorage.logupSelectOrganization
    })
    temporaryStorage.logupSelectOrganization = {}
  }
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

  _logIn = () => {

    let storage = window.localStorage;
    let { email, hash } = temporaryStorage.logupVetInfo
    let params = {
      email: email.replace(/(^\s*)/g, ""),
      hash,
      identityTypeId: '1'
    }
    fetchRequest('/user/mellaLogin', 'POST', params)
      .then(res => {
        console.log(res);
        if (res.status && res.status === 404) {
          message.error('system error');
          return
        }
        if (res.code === 10001 && res.msg === '账号错误') {
          message.error('Account error');
          return
        }
        if (res.code === 10002 && res.msg === '密码错误') {
          message.error('wrong password')
          return;
        }
        if (res.code === 0 && res.msg === 'success' && res.success.roleId === 1) {
          message.error('You do not have the authority of a doctor, please contact the administrator or customer service', 10)
          return
        }

        if (res.code === 0 && res.msg === 'success') {
          console.log('账号密码正确，登录进去了');
          storage.userId = ''

          storage.userId = res.success.userId
          storage.roleId = res.success.roleId
          if (res.success.lastWorkplaceId) {
            storage.lastWorkplaceId = res.success.lastWorkplaceId
          } else {
            storage.lastWorkplaceId = ''
          }
          this.setState({
            isOrg: false,
            isWorkplace: false
          })
          this.props.history.push('/uesr/selectExam')
        }
      })
      .catch(err => {
        console.log(err);
      })
  }
  _search = (val) => {
    let search = val.target.value
    let { listData } = this.state
    let searchData = []
    for (let i = 0; i < listData.length; i++) {
      if (listData[i].name.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
        searchData.push(listData[i])
      }
    }
    this.setState({
      search,
      searchData
    })

  }
  _searchworkPlace = (val) => {
    let search = val.target.value
    let listData = this.state.workplaceList
    console.log('----------------', listData);
    let searchData = []
    for (let i = 0; i < listData.length; i++) {
      if (listData[i].workplaceName.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
        searchData.push(listData[i])
      }
    }
    this.setState({
      search,
      searchData
    })

  }

  _list = () => {
    const { search, listData, searchData } = this.state
    let data = (search.length > 0) ? searchData : listData
    let option = data.map((item, index) => {
      return <li key={item.organizationId}
        onClick={() => {
          this.setState({
            selectId: item
          })
          console.log(item);
          temporaryStorage.logupSelectOrganization = item


        }}

      >
        <div className="item"> {item.name}</div>

        {(this.state.selectId.organizationId === item.organizationId ? <span className="search">&#xe614;</span> : null)}
      </li>
    })
    return (
      <ul>
        {option}
      </ul>
    )
  }

  _list1 = () => {
    const { search, workplaceList, searchData } = this.state
    let data = (search.length > 0) ? searchData : workplaceList
    let option = data.map((item, index) => {
      return <li key={item.workplaceId}
        onClick={() => {
          this.setState({
            selectworkplace: item
          })
          console.log(item);

        }}

      >

        {item.workplaceName}
        {(this.state.selectworkplace === item ? <span className="search">&#xe614;</span> : null)}
      </li>

    })
    return (
      <ul>
        {option}
      </ul>
    )
  }

  _goNewOrg = (e) => {
    e.preventDefault();
    this.setState({
      isOrg: false,
      isWorkplace: false
    })
    this.props.history.push('/uesr/logUp/NewOrganization')
  }
  _goNewWorkplace = (e) => {
    e.preventDefault();
    this.setState({
      isOrg: false,
      isWorkplace: false
    })
    this.props.history.push('/uesr/logUp/NewWorkplace')
  }
  _goWorkplace = () => {
    console.log('前往工作场所');
    fetchRequest(`/workplace/listAllWorkplaceByOrganizationId/${temporaryStorage.logupSelectOrganization.organizationId}`, "GET", '')
      .then((res) => {
        console.log(res);
        if (res.msg === 'success') {
          this.setState({
            workplaceList: res.data,
            isOrg: false,

          }, () => {
            this.setState({
              isWorkplace: true
            })
          })
        } else {
          console.log('请求错误');
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
  _addworkplaced = () => {
    let params = {
      userId: temporaryStorage.logupSuccessData.userId,
      roleId: 2,
      workplaceId: this.state.selectworkplace.workplaceId,
      organizationId: this.state.selectworkplace.organizationId
    }
    console.log('入参：', params);
    fetchRequest('/user/updateUserInfo', 'POST', params)
      .then(res => {
        console.log(res);
        if (res.flag === true) {
          message.success('Join successfully', 3)

          console.log('成功',);
          this._logIn()
        }
      })
      .catch(err => {
        console.log(err);
        message.error(err.message, 3)
      })
  }

  render () {
    let { disabled, bounds, isOrg, isWorkplace } = this.state
    return (
      <div id="joinOrganizationByOption">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push('/uesr/logUp/VetPrifile')}
        />

        <div className="text">Join an Organization</div>

        <div className="way">
          <div className="item"
            onClick={() => {
              // this.props.history.push('/uesr/logUp/FindMyOrganization')
              this.setState({
                isOrg: true
              })
              console.log('搜索名称加入');
            }}
          >
            <div className="iconBox">
              <MyIcon type='icon-search' className="icon" />
            </div>
            <div className="r">

              <div className="title">Search organization</div>

              <div className="arrow">
                <MyIcon type='icon-jiantou2' className="icon" />
              </div>
            </div>
          </div>



          <div className="item" onClick={() => {
            console.log('创建');
            this.props.history.push('/uesr/logUp/NewOrganization')
          }}>
            <div className="iconBox">
              <MyIcon type='icon-tianjia4' className="icon" />
            </div>
            <div className="r">
              <div className="listtext">
                <div className="title">Create an organization</div>
              </div>
              <div className="arrow">
                <MyIcon type='icon-jiantou2' className="icon" />
              </div>
            </div>
          </div>

          <div className="item" onClick={() => {
            console.log('搜索id加入');
            let params = {
              userId: temporaryStorage.logupSuccessData.userId,
              roleId: 2,
            }
            fetchRequest('/user/updateUserInfo', 'POST', params)
              .then(res => {
                console.log(res);
                if (res.flag === true) {

                  console.log('成功',);
                  this._logIn()
                }
              })
              .catch(err => {
                console.log(err);
                message.error(err.message, 3)
              })
          }}>
            <div className="iconBox">
              <MyIcon type='icon-guanbi2' className="icon" />
            </div>
            <div className="r">
              <div className="listtext">
                <div className="title">Continue without organization</div>
              </div>
              <div className="arrow">
                <MyIcon type='icon-jiantou2' className="icon" />
              </div>
            </div>
          </div>
        </div>
        {/* 组织的modal框 */}
        <Modal

          visible={isOrg}
          // visible={true}
          onCancel={() => this.setState({ isOrg: false })}
          width={350}
          footer={[]}
          modalRender={(modal) => (
            <Draggable
              disabled={disabled}
              bounds={bounds}
              onStart={(event, uiData) => this.onStart(event, uiData)}
            >
              <div ref={this.draggleRef}>{modal}</div>
            </Draggable>
          )}
          destroyOnClose={true}
          wrapClassName="findOrg"
        >
          <div id='findOrg'>
            <div className="text"
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

            >Find my organization</div>

            <div className="searchBox">

              <Input
                placeholder=" &#xe61b; Search organization"
                bordered={false}
                allowClear={true}
                value={this.state.search}
                onChange={this._search}
              />

            </div>
            <div className="list">
              {this._list()}
            </div>

            <div className="foot">
              <div className="btn">
                <Button
                  text={'Join Organization'}
                  onClick={this._goWorkplace}
                />
              </div>
              <span>{`Don’t see your organization? `}
                <a href="#" onClick={this._goNewOrg}>Create a new organization</a>
              </span>
            </div>

          </div>

        </Modal>
        {/* 工作场所的modal框 */}
        <Modal

          visible={isWorkplace}
          // visible={true}
          onCancel={() => this.setState({ isWorkplace: false })}
          width={350}
          footer={[]}
          modalRender={(modal) => (
            <Draggable
              disabled={disabled}
              bounds={bounds}
              onStart={(event, uiData) => this.onStart(event, uiData)}
            >
              <div ref={this.draggleRef}>{modal}</div>
            </Draggable>
          )}
          destroyOnClose={true}
          wrapClassName="findOrg"
        >
          <div id='findOrg'>
            <div className="text"
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

            >Find my workplace</div>

            <div className="searchBox">

              <div
                className=" iconfont icon-left return"
                onClick={() => { this.setState({ isWorkplace: false, isOrg: true }) }}
              />
              <Input
                placeholder=" &#xe61b; Search workplace"
                bordered={false}
                allowClear={true}
                value={this.state.search}
                onChange={this._searchworkPlace}
              />

            </div>
            <div className="list">
              {this._list1()}
            </div>

            <div className="foot">
              <div className="btn">
                <Button
                  text={'Join Workplace'}
                  onClick={this._addworkplaced}
                />
              </div>
              <span>{`Don’t see your workplace? `}
                <a href="#" onClick={this._goNewWorkplace}>Create a new workplace</a>
              </span>
            </div>

          </div>

        </Modal>
      </div>
    )
  }
}