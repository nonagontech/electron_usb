import React, { Component } from 'react'

import Heard from './../../../utils/heard/Heard'
import using from './../../../assets/images/using.png'
import measuring from './../../../assets/images/measuring.png'
import unassigned from './../../../assets/images/unassigned.png'
import adding from './../../../assets/images/adding.png'
import email from './../../../assets/images/email.png'
import phone from './../../../assets/images/phone.png'
import './help.less'

export default class Help extends Component {

  render () {
    let list = [
      {
        img: using,
        title: 'Using the app'
      }, {
        img: measuring,
        title: 'Measuring with Mella'
      }, {
        img: unassigned,
        title: 'Unassigned Readings'
      },
      {
        img: adding,
        title: 'Adding New Users'
      },
    ]
    let num = 150 / list.length
    let mar = num + 'px'
    return (
      <div id="help">
        <Heard

        />
        <div className="body">
          <div className="title">How can we help you?</div>
          <div className="input">
            <input
              type="text"
              placeholder="Describe you issue     &#xe63f;"

            />
          </div>

          <div className="list">
            <ul>
              {list.map((data, index) => (
                <li key={index} style={{ marginLeft: mar, marginRight: mar }}>

                  <>
                    <img src={data.img} alt="" style={{ height: '70px' }} />
                    <p>{data.title}</p>
                  </>
                </li>
              ))}
            </ul>
          </div>

          <div className="popularArticles">
            <div className="text">Popular Articles</div>
            <span className=" iconfont  icon-jiantou3 dropDown" />
          </div>
          <div className="popularArticles tutorials">
            <div className="text">Tutorials</div>
            <span className=" iconfont  icon-jiantou3 dropDown" />
          </div>

          <div className="time">
            <p>Still need help?</p>
            <div className="line"></div>
            <p>Monday - Friday: 9am - 5pm (ET)</p>
          </div>

          <div className="foot">
            <div className="l">
              <img src={email} alt="" />
              <div className="text">Drop us a line</div>
              <a href=" https://www.mella.ai/"
                onClick={(e) => {
                  e.preventDefault();
                  let electron = window.electron
                  electron.shell.openExternal(' https://www.mella.ai/')
                  return false;
                }}
              >support@mella.ai</a>
            </div>

            <div className="l r">
              <img src={phone} alt="" />
              <div className="text">Bark at Us!</div>
              <div className="text">201.977.6411</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}