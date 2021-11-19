import React, { useState } from 'react'
import { useHistory } from "react-router-dom";
import {
  Menu

} from 'antd';
import PropTypes from 'prop-types';
import { SyncOutlined, createFromIconfontCN } from '@ant-design/icons';
import { SearchOutlined } from '@ant-design/icons';

import 'antd/dist/antd.css';
import './heard.less'
import help from './../../assets/images/help.png'
import message from './../../assets/images/message.png'

const { SubMenu } = Menu;
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})


const Heard = ({ onReturn, onSearch }) => {
  const [minbgc, setMinbgc] = useState('')
  const [minColor, setMinColor] = useState('#660A2F')
  const [closebgc, setClosebgc] = useState('')
  const [closeColor, setCloseColor] = useState('#660A2F')
  const [value, setValue] = useState('')

  let history = useHistory();
  const _min = () => {
    let ipcRenderer = window.electron.ipcRenderer
    console.log('最小化程序');
    ipcRenderer.send('window-min')
    setMinbgc('')
  }
  const _close = () => {
    let ipcRenderer = window.electron.ipcRenderer
    console.log('关闭程序');
    ipcRenderer.send('window-close')
  }
  const _minMove = () => {
    setMinbgc('#FF5D9D')
    setMinColor('#fff')
  }
  const _minLeave = () => {
    setMinbgc('')
    setMinColor('#660A2F')
  }
  const _closeMove = () => {
    // setCloseColor('red')
    // setClosebgc('#FFF')
    setCloseColor('#fff')
    setClosebgc('red')
  }
  const _closeLeave = () => {
    setCloseColor('#660A2F')
    setClosebgc('')
  }
  const handleClick = e => {
    // console.log('click ', e);
    switch (e.key) {
      case "1": history.push('/')
        break;
      case "2":
        console.log('跳转到设备界面');
        // history.push('/')
        break;
      case "3": history.push('/menuOptions/settings')
        break;
      case "4":
        console.log('billing');
        break;
      case "5":
        console.log('帮助');
        break;
      case "6":
        console.log('关于');
        break;
      case "7":
        console.log('退出登录');
        break;

      default:
        break;
    }

    // if (e.key === '3') {
    //   this.props.history.push('/page8')
    // }
  }
  return (
    <div id="heard">
      <div className="menu">
        <Menu
          onClick={handleClick}
          selectedKeys={['menu']}
          mode="horizontal"
          theme={'drak'}
          subMenuCloseDelay={1}
        >
          <SubMenu
            key="SubMenu"
            popupOffset={[-10, -7]}
            icon={<MyIcon type='icon-ic_menu_px' className="icon" />}
          >
            <Menu.Item key="1">Home</Menu.Item>
            <Menu.Item key="2">Devices</Menu.Item>
            <Menu.Item key="3">Settings</Menu.Item>
            <Menu.Item key="4">{'Billing & Subscriptions'}</Menu.Item>
            <Menu.Item key="5">Help</Menu.Item>
            <Menu.Item key="6">About Mella</Menu.Item>
            <Menu.Item key="7">Log Out</Menu.Item>
            {/* <Menu.Item key='3'>Clinical Study Mode</Menu.Item> */}
          </SubMenu>
        </Menu>
      </div>

      <div className="return">
        <div
          className=" iconfont icon-left heard"
          // onClick={() => history.push('/page11')}
          onClick={() => {
            if (onReturn) {
              console.log('传过来的跳转');
              onReturn()
            } else {
              console.log('自带的跳转');
              history.goBack()
            }
          }}
        />
      </div>

      <div className="search">
        <input
          placeholder="Search Pet    &#xe63f;"
          value={value}
          onChange={(text) => { setValue(text.target.value) }}

          onKeyUp={(e) => {
            // console.log(e);
            if (e.keyCode === 13) {
              console.log('回车,去搜索');
            }
            if (e.keyCode === 27) {
              console.log('清空');
              setValue('')
            }
          }}
        />

        <div className="searchIconFa">
          <span className=" iconfont icon-sousuo searchIcon" />
        </div>


      </div>

      <div className="r">
        <div className="message"
          onClick={() => history.push('/menuOptions/unassigned')}
        >
          <img src={message} alt="" style={{ height: '25px' }} />
        </div>
        <div className="help"
          onClick={() => history.push('/menuOptions/help')}
        >
          <img src={help} alt="" style={{ height: '25px' }} />
        </div>
        {/* <div className="avatar"></div> */}

        <div className="min_close">
          <div
            className="min iconfont icon-64"
            onClick={_min}
            onMouseEnter={_minMove}
            onMouseLeave={_minLeave}
            style={{ backgroundColor: minbgc, color: minColor }}
          ></div>

          <div
            className="max iconfont icon-guanbi2"
            onClick={_close}
            onMouseEnter={_closeMove}
            onMouseLeave={_closeLeave}
            style={{ backgroundColor: closebgc, color: closeColor }}
          ></div>
        </div>
      </div>
    </div>
  )
}

Heard.propTypes = {
  onReturn: PropTypes.func
}
Heard.defaultProps = {

}

export default Heard