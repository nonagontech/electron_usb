import React, { Component, } from 'react'
import {
    Tag,
    Input,
    Tooltip,
    message,
    Button
} from 'antd';
import Draggable from "react-draggable";
import { createFromIconfontCN, CaretDownFilled, PlusOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';

import './inviteTeam.less'
import imgArray from './../../../utils/areaCode/imgArray'
import MaxMin from './../../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest } from './../../../utils/FetchUtil1'
import temporaryStorage from '../../../utils/temporaryStorage'
import { fetchRequest2 } from '../../../utils/FetchUtil2';

export default class InviteTeam extends Component {

    state = {

        tags: [],
        inputVisible: false,
        inputValue: '',
        editInputIndex: -1,
        editInputValue: '',
    }

    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('middle')

    }


    handleClose = removedTag => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        console.log(tags);
        this.setState({ tags });
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = e => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.state;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            console.log('输入的内容为：', inputValue);
            message.destroy()
            fetchRequest(`/user/checkUser/${inputValue}`, 'GET', '')
                .then(res => {
                    console.log(res);
                    if (!res.flag) {
                        console.log('邮箱号以被注册，是否忘记密码');
                        tags = [...tags, inputValue];
                        console.log(tags);

                        this.setState({
                            tags,
                            inputVisible: false,
                            inputValue: '',
                        });
                    }
                    else {
                        message.error('This mailbox was not found!', 3)
                        this.setState({
                            inputVisible: false,
                            inputValue: '',
                        });
                    }
                })
                .catch(err => {
                    message.error(`Error:${err.message}`)
                    console.log('检测邮箱号的接口出错了', err);
                })


        }

    };


    saveInputRef = input => {
        this.input = input;
    };

    saveEditInputRef = input => {
        this.editInput = input;
    };

    _next = () => {
        message.destroy()
        let { tags } = this.state
        let { userId } = temporaryStorage.logupSuccessData
        let { organizationId } = temporaryStorage.logupOrganization
        console.log({ tags, userId, organizationId });
        if (tags.length === 0) {
            this._logIn()
        }
        fetchRequest2(`/user/inviteUserByEmail/${userId}/${organizationId}`, "POST", tags)
            .then(res => {
                console.log(res);
                if (res.flag === true) {
                    console.log('成功，跳转');
                    message.success('Invitation successful', 3)
                    this._logIn()
                }

            })
            .catch(err => {
                console.log(err);
                message.error(err.message, 3)
            })
    }
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
                    this.props.history.push('/uesr/selectExam')
                }
            })
            .catch(err => {
                console.log(err);
            })
    }






    render () {
        const { tags, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
        console.log('---', editInputIndex);
        return (
            <div id="inviteTeam" >
                {/* 关闭缩小 */}
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                    onClick1={() => this.props.history.goBack()}
                />
                <div className="text">Invite your Team</div>

                <div className="addF">
                    <p>To:</p>
                    <div className="add">

                        <>
                            {tags.map((tag, index) => {
                                const isLongTag = tag.length > 25;  //标签里面的字符串的长度

                                const tagElem = (
                                    <Tag
                                        className="edit-tag"
                                        key={tag}
                                        closable={true}
                                        onClose={() => this.handleClose(tag)}
                                    >
                                        <span>
                                            {isLongTag ? `${tag.slice(0, 25)}...` : tag}
                                        </span>
                                    </Tag>
                                );
                                return isLongTag ? (
                                    <Tooltip title={tag} key={tag}>
                                        {tagElem}
                                    </Tooltip>
                                ) : (
                                    tagElem
                                );
                            })}
                            {inputVisible && (
                                <Input
                                    ref={this.saveInputRef}
                                    type="text"
                                    size="small"
                                    className="tag-input"
                                    value={inputValue}
                                    onChange={this.handleInputChange}
                                    onBlur={this.handleInputConfirm}
                                    onPressEnter={this.handleInputConfirm}
                                />
                            )}
                            {!inputVisible && (
                                <Tag className="site-tag-plus" onClick={this.showInput}>
                                    <PlusOutlined />Press Enter to add mailbox
                                </Tag>
                            )}
                        </>
                    </div>
                </div>
                <div className="btn">
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                        htmlType="submit"
                        onClick={this._logIn}
                    >
                        Skip
                    </Button>
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                        htmlType="submit"
                        onClick={this._next}
                    >
                        Send
                    </Button>
                </div>

            </div>


        )
    }
}