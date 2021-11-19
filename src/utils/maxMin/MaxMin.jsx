import React, {Component} from 'react'
import './maxmin.less'

export default class MaxMin extends Component{
    state = {
        closebgc:'',
        minbgc:'',
        closeColor:'',
    }
    _close = () => {
        let ipcRenderer =  window.electron.ipcRenderer
        console.log('关闭程序');
        ipcRenderer.send('window-close')
    }
    _min = () => {
        let ipcRenderer =  window.electron.ipcRenderer
        console.log('最小化程序');
        ipcRenderer.send('window-min')
        this.setState({
            minbgc:'',
        })
    }
    _minMove = () => {
        
        this.setState({
            minbgc:'rgb(229,229,229)'
        })
    }
    _minLeave = () => {
        this.setState({
            minbgc:''
        })
    }
    _closeMove = () => {
        this.setState({
            closeColor:'red',
            closebgc:'#fff'
        })
    }
    _closeLeave = () => {
        this.setState({
            closeColor:' rgb(245, 145, 145)',
            closebgc:''
        })
    }
    _home = () => {
        console.log(this.props);
        // this.props.history.push('/')
    }

    render(){
        const {closeColor,closebgc,minbgc} = this.state
        return(
            <div>
                <div className="close">
                    <div className="home iconfont icon-zhuye3"
                        onClick = {this.props.onClick}
                    
                    />
                    <div 
                        className="min iconfont icon-64" 
                        onClick= {this._min}
                        onMouseEnter  = {this._minMove}
                        onMouseLeave  = {this._minLeave}
                        style = {{backgroundColor:minbgc}}
                    ></div>
                    
                    <div 
                        className="max iconfont icon-guanbi2" 
                        onClick= {this._close}
                        onMouseEnter  = {this._closeMove}
                        onMouseLeave  = {this._closeLeave}
                        style = {{backgroundColor:closebgc,color:closeColor}}
                    ></div>
                </div>
            </div>
        )
     }
}