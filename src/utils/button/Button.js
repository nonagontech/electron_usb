/**
 * 简单封装了一个常用的按钮，点击有明显的交互
 * text：按钮里面的文本
 * textStyle：按钮里面文本的样式, 
 * textBoxStyle：文字外面部分的样式, 
 * onClick：按钮点击事件
 */

import React from 'react'
import PropTypes from 'prop-types'

import './index.less'

const Button = ({ text, textStyle, textBoxStyle, onClick }) => {

  return (
    <div id="button" style={textBoxStyle}
      onMouseDown={() => {
        let button = document.getElementById('button')
        button.style.opacity = "0.5"
      }}
      onMouseUp={() => {
        let button = document.getElementById('button')
        button.style.opacity = "1"
      }}
      onClick={onClick}
    >

      <p className="btnText" style={textStyle}>{text}</p>
    </div>
  )
}
Button.propTypes = {
  text: PropTypes.string.isRequired,
  textStyle: PropTypes.object,
  textBoxStyle: PropTypes.object,
  onClick: PropTypes.func
}
Button.defaultProps = {

}

export default Button

