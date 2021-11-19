import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { message } from 'antd'

import MaxMin from '../../../utils/maxminreturn/MaxMinReturn'
import Button from '../../../utils/button/Button'
import temporaryStorage from './../../../utils/temporaryStorage'
import './index.less'
import { fetchRequest2 } from '../../../utils/FetchUtil2'

const VerifyEmail = () => {
  let history = useHistory()
  const [code, setCode] = useState('')
  const [resend, setResend] = useState(60)
  useEffect(() => {
    const timer = setInterval(() => {
      if (resend > 0) {
        setResend(resend - 1)
      }
    }, 1000);
    return () => {
      clearInterval(timer)
    }
  })

  const _resend = (e) => {

    if (resend <= 0) {

      //下面写逻辑代码
      let { domain, email, hash, phone, birthday, firstName, lastName } = temporaryStorage.logupVetInfo
      let params = {
        firstName,
        lastName,
        domain, email, hash, phone,
      }
      if (birthday) {
        params.birthday = birthday
      }
      console.log('重新获取验证码入参', params);
      fetchRequest2(`/user/resendDeskRegistEmail/${temporaryStorage.logupEmailCode}`, 'POST', params)
        .then(res => {
          console.log('重新获取验证码', res);
          if (res.msg === 'success') {
            message.success('The email has been resent, please check', 3)
            temporaryStorage.logupEmailCode = res.data
            setResend(60)
          } else {
            message.error('Failed to send mail', 3)

          }
        })
        .catch(err => {
          console.log('重新获取验证码失败');
        })

    }

    //阻止a链接跳转
    if (e && e.preventDefault)
      e.preventDefault();
    else
      window.event.returnValue = false;
  }
  const _next = () => {
    // console.log(code, '-----', temporaryStorage.logupEmailCode, '----', temporaryStorage.logupVetInfo);
    if (code !== temporaryStorage.logupEmailCode) {
      message.error('Verification code input is incorrect', 3)
      return
    }
    else {
      fetchRequest2(`/user/verifyDeskRegistEmailCode/${temporaryStorage.logupVetInfo.email}/${temporaryStorage.logupEmailCode}`, "GET", '')
        .then(res => {
          console.log('验证码验证返回信息：', res);
          if (res.flag === true) {
            console.log('验证成功');
            temporaryStorage.logupSuccessData = res.data
            temporaryStorage.logupEmailCode = ''
            history.push('/uesr/logUp/JoinOrganizationByOption')
          } else {
            message.error('Verification code verification failed', 3)
          }

        })
        .catch(err => {
          console.log('验证码验证错误：', err);
        })
    }
    // history.push('/uesr/logUp/FindWorkplace')
  }


  return (
    <div id="verifyEmail">
      <MaxMin
        onClick={() => { history.push('/') }}
        onClick1={() => history.goBack()}
      />

      <h1 className="title">Confirm your email</h1>
      <div className="text">{`We have sent a code to <email>.`}</div>
      <div className="text">Please enter it below to confirm your address.</div>
      <div className="inpF">
        <input
          className="inp"
          type="text"
          value={code}
          placeholder="Code"
          onChange={(val) => { setCode(val.target.value) }}
          maxLength={6}
          onKeyUp={(e) => { if (e.keyCode === 13) { _next() } }}
        />
      </div>

      <div className="resend">
        <a href="#" onClick={_resend}>Resend</a>
        {resend > 0 && `(${resend})`}
      </div>

      <div className="btnF">
        <Button
          text={'Verify'}
          onClick={_next}
        />
      </div>



    </div>
  )
}

export default VerifyEmail

