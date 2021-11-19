
import React, { useState } from 'react'
import PropTypes from 'prop-types';

import './uploadImg.less'
import selectphoto from './../../assets/images/sel.png'

const UploadImg = ({ imgWidth, text, getImg, imgUrl, disable }) => {

  const url = 'http://ec2-3-214-224-72.compute-1.amazonaws.com:8080/mellaserver'
  let backgroundImage = imgUrl ? `url(${imgUrl})` : `url(${selectphoto})`
  let cursor = !disable ? 'default' : 'no-drop'
  return (

    <div id="uploadImg">
      <div className="ciral"
        onClick={() => {
          if (disable) {
            return
          }
          let file = document.getElementById('img')
          file.click();
        }}
        style={{
          width: imgWidth,
          height: imgWidth,
          borderRadius: imgWidth,
          backgroundImage: backgroundImage,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: `auto ${imgWidth}`,
          cursor: cursor

        }}
      >

        <input type="file"
          accept="image/gif,image/jpeg,image/jpg,image/png,image/svg"
          className="uploadImg"
          id="img"
          style={{ display: 'none' }}
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
              console.dir(document.getElementsByClassName('ciral')[0]);
              document.getElementsByClassName('ciral')[0].style.backgroundImage = `url(${res.result})`
              // document.getElementById('touxiang').src = res.result


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
                  console.log('上传的结果', res);
                  if (res.flag === true) {
                    getImg(res.data)
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }

          }} />
        <p>{text}</p>
      </div>

    </div>
  )
}
UploadImg.propTypes = {
  imgWidth: PropTypes.string,
  text: PropTypes.string,
  getImg: PropTypes.func,
  imgUrl: PropTypes.string,
  disable: PropTypes.bool
}
UploadImg.defaultProps = {
  imgWidth: '120px',
  text: 'Add Photo',
  disable: false
  // imgUrl: 'http://ec2-3-214-224-72.compute-1.amazonaws.com:18886/group1/image/0_email.png'
}
export default UploadImg