import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import {
  Button,
} from 'antd';
import 'antd/dist/antd.css';

import PropTypes from 'prop-types';

import './index.less'
import pms from './../../../assets/images/pms.png'
import MaxMin from '../../../utils/maxminreturn/MaxMinReturn'



const IsHavePMS = ({ }) => {

  let history = useHistory();
  useEffect(() => {
    console.log('hooks模拟componentDidMount');
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('big')
  }, [])


  return (
    <div id="isHavePMS">
      <MaxMin
        onClick={() => { history.push('/') }}
        onClick1={() => history.goBack()}
      />

      <div className="body">
        <div className="title">Do you have PMS?</div>
        <div className="text">Practices with a PMS are strongly
        </div>
        <div className="text">encouraged to connect it.</div>

        <img src={pms} alt="" style={{ width: '100px' }} />

        <div className="buttons">
          <Button

            type="primary"
            shape="round"
            size='large'
          // onClick={() => { this.props.history.push('/page11') }}
          >
            Continue with email
          </Button>

          <Button

            type="primary"
            shape="round"
            size='large'
          // onClick={() => { this.props.history.push('/page11') }}
          >
            Connect PMS
          </Button>
        </div>
      </div>

    </div>
  )
}

IsHavePMS.propTypes = {

}
IsHavePMS.defaultProps = {

}
export default IsHavePMS