// /**
//  *  min:滑竿的最小值，默认是0
//  *  max：滑竿的最大值，默认是100
//  *  railWidth：滑轨的宽度，默认值是200px
//  *  railrHeight：滑轨的高度，默认值是2px
//  *  railBackgroundColor：滑轨的背景颜色，默认值是#D8D8D8
//  *  sliderWidth:滑块的宽、高
//  *  sliderBackgroundColor：滑块背景颜色
//  */

import React, { Component } from 'react'
import PropTypes from 'prop-types';
import './slider.less'
class Slider extends Component {

  constructor(props) {
    super(props);
    this.state = {
      translateX: 0,
      translateY: 0,
    };
    this.moving = false;
    this.lastX = null;
    this.lastY = null;
    // window.onmouseup = e => this.onMouseUp(e);
    // window.onmousemove = e => this.onMouseMove(e);
  }
  componentDidMount () {
    console.log(this.props.left, parseInt(this.props.railWidth));
    if (this.props.left) {
      if (this.props.left >= parseInt(this.props.railWidth)) {
        this.setState({
          translateX: parseInt(this.props.railWidth)
        })
      } else if (this.props.left <= 0) {
        this.setState({
          translateX: 0
        })
      } else {
        this.setState({
          translateX: this.props.left
        })
      }

    }

  }
  componentWillReceiveProps(nextProps) {

    if (nextProps.left&&nextProps.left!==this.state.translateX) {
      if (nextProps.left >= parseInt(this.props.railWidth)) {
        this.setState({
          translateX: parseInt(this.props.railWidth)
        })
      } else if (nextProps.left <= 0) {
        this.setState({
          translateX: 0
        })
      } else {
        this.setState({
          translateX: nextProps.left
        })
      }

    }




   }

  onMouseDown (e) {
    console.log('按下');
    e.stopPropagation();
    this.moving = true;
    // console.log('dianji1', this.moving);
    document.onmousemove = e => this.onMouseMove(e);
    document.onmouseup = e => this.onMouseUp(e);
  }

  onMouseUp (e) {
    if (!this.moving) {
      return
    }
    console.log('松手');
    e.stopPropagation();
    this.moving = false;
    let { min, max, railWidth } = this.props
    this.props.getData({
      length: this.state.translateX,
      number: ((this.state.translateX * (max - min) / parseInt(railWidth)) + min).toFixed(0)
    })
    this.lastX = null;
    this.lastY = null;

  }

  onMouseMove (e) {
    this.moving && this.onMove(e);
  }

  onMove (e) {
    // console.log(e);
    if (this.lastX && this.lastY) {
      let dx = e.clientX - this.lastX;
      if (this.state.translateX + dx >= 0 && this.state.translateX + dx <= parseInt(this.props.railWidth)) {
        this.setState({ translateX: this.state.translateX + dx, })
      }

    }
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  render () {

    let { min, max, railWidth, railrHeight, railBackgroundColor, sliderWidth, sliderBackgroundColor } = this.props
    // console.log(railWidth);
    return (
      <div
        id="uerSlider"
        style={{ width: railWidth, height: railrHeight, backgroundColor: railBackgroundColor }}
      >
        <div className="text" style={{ position: 'absolute', top: -parseInt(this.props.sliderWidth) * 2.3, left: this.state.translateX - 30 }}>
          {`${((this.state.translateX * (max - min) / parseInt(railWidth)) + min).toFixed(0)} Secs`}
        </div>
        <div
          className="uerSlider_slider"
          style={{ width: sliderWidth, height: sliderWidth, borderRadius: sliderWidth, backgroundColor: sliderBackgroundColor, left: this.state.translateX - parseInt(this.props.sliderWidth) / 2, top: -parseInt(this.props.sliderWidth) / 2 }}
          onMouseDown={e => this.onMouseDown(e)}
        />


      </div>
    )
  }
}


Slider.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  railWidth: PropTypes.string,
  railrHeight: PropTypes.string,
  railBackgroundColor: PropTypes.string,
  sliderWidth: PropTypes.string,
  sliderBackgroundColor: PropTypes.string,
  left: PropTypes.number
}
Slider.defaultProps = {
  min: 0,
  max: 100,
  railWidth: '185px',
  railrHeight: '2px',
  railBackgroundColor: '#D8D8D8',
  sliderWidth: '15px',
  sliderBackgroundColor: '#E1206d',
  left: 0
}

export default Slider
