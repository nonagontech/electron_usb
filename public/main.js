const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
let remote = require('electron').remote
const path = require('path')
const SerialPort = require('serialport');
const isDev = require('electron-is-dev');

let mainWindow = null;
var port = null
let isOpening = false, portPath = null
app.allowRendererProcessReuse = false

/**
 * 
 * isHaveSerialported 用来判断充电桩有没有插入
 * 如果isHaveSerialported为false则下一次就要去初始化一个串口，
 * 如果为true则不去初始化串口
 */
let isHaveSerialported = null
function list () {
    SerialPort.list()
        .then(ports => {
            console.log('port', ports);
            let flog = false    //此变量用来看这次循环里面有没有找到充电桩
            for (let i = 0; i < ports.length; i++) {
                if (ports[i].manufacturer === 'wch.cn') {
                    flog = true
                    portPath = ports[i].path
                    port = new SerialPort(ports[i].path, {
                        baudRate: 115200,
                        dataBits: 8, //数据位

                        parity: 'none', //奇偶校验

                        stopBits: 1, //停止位

                        flowControl: false,
                        autoOpen: false
                    });
                    port.removeAllListeners();

                    port.open((err) => {
                        console.log('oper error :', err);
                        if (err) {
                            console.log('failed to open: ' + err);
                        } else {
                            console.log('open');
                            port.on('data', function (data) {
                                //接受的data值为：<Buffer aa 04 81 04 81 55>

                                //收hex
                                // console.log('getData' + data.toString('hex'));
                                //收字符串
                                // console.log('recv: ' + data.toString('ascii'));


                                let str = data.toString('hex')
                                for (let i = 0; i < str.length;) {
                                    arr.push(`${str[i]}${str[i + 1]}`)
                                    i = i + 2
                                }
                                console.log('------', arr);
                                dataTest(arr)



                                // mainWindow.webContents.send('sned',data.toString('hex'))
                            });
                            // serialPort.write("ls\n", function(err, results) {
                            //   console.log('err ' + err);
                            //   console.log('results ' + results);
                            // });
                            port.on('error', function (err) {
                                console.log('err0r-------------', err);
                            })
                        }
                    })
                    console.log('port is open:', port.isOpen);
                    break;
                }
            }
            console.log('端口号：', portPath);
            isHaveSerialported = flog

        })
        .catch(err => {
            console.log('------------', err);
        })
}
// list()

/**
 * 检测有没有充电桩，如果没有则发送false到渲染层
 * 如果有充电桩则要判断isHaveSerialported是否为false，
 *      如果为false则说明前面都是没有充电桩，要去初始化串口
 *      如果为true则把true发到渲染层。
 */
function isHaveSerialport () {
    console.log('检测有没有底座', isHaveSerialported);
    SerialPort.list()
        .then(ports => {
            console.log('port', ports);
            let flag = false     //此变量用来看这次循环里面有没有找到充电桩
            let index = -1;      //此变量用来记录充电桩所在的串口位置
            for (let i = 0; i < ports.length; i++) {
                if (ports[i].manufacturer === 'wch.cn') {

                    index = i
                    flag = true
                    break;
                }
            }

            if (flag === true && isHaveSerialported === false) {
                // const time = setTimeout(()=>{
                isHaveSerialported = true
                // },)
                port = new SerialPort(ports[index].path, {
                    baudRate: 115200,
                    dataBits: 8, //数据位
                    parity: 'none', //奇偶校验
                    stopBits: 1, //停止位
                    flowControl: false,
                    autoOpen: false
                });
                portPath = ports[index].path
                port.removeAllListeners();
                port.open((err) => {
                    console.log('oper error :', err);
                    if (err) {
                        console.log('failed to open: ' + err);
                    } else {
                        console.log('open');
                        port.on('data', function (data) {
                            //接受的data值为：<Buffer aa 04 81 04 81 55>
                            //收hex
                            // console.log('getData' + data.toString('hex'));
                            let str = data.toString('hex')
                            for (let i = 0; i < str.length;) {
                                arr.push(`${str[i]}${str[i + 1]}`)
                                i = i + 2
                            }
                            console.log('接受的16进制数组：', arr);
                            dataTest(arr)

                        });
                        port.on('error', function (err) {
                            console.log('err0r-------------', err);
                        })
                    }
                })

            } else if (portPath === null) {
                list()




            } else if (flag === true && ports[index].path !== portPath) {
                console.log('++++++++++++++++++++我进来了：');
                isHaveSerialported = true
                // },)
                port = new SerialPort(ports[index].path, {
                    baudRate: 115200,
                    dataBits: 8, //数据位
                    parity: 'none', //奇偶校验
                    stopBits: 1, //停止位
                    flowControl: false,
                    autoOpen: false
                });
                portPath = ports[index].path
                port.removeAllListeners();
                port.open((err) => {
                    console.log('我打开出错oper error :', err);
                    if (err) {
                        console.log('failed to open: ' + err);
                    } else {
                        console.log('没有错误，监听数据了');
                        port.on('data', function (data) {
                            //接受的data值为：<Buffer aa 04 81 04 81 55>
                            //收hex
                            // console.log('getData' + data.toString('hex'));
                            let str = data.toString('hex')
                            for (let i = 0; i < str.length;) {
                                arr.push(`${str[i]}${str[i + 1]}`)
                                i = i + 2
                            }
                            console.log('接受的16进制数组：', arr);
                            dataTest(arr)

                        });
                        port.on('error', function (err) {
                            console.log('err0r-------------', err);
                        })
                    }
                })
            }
            console.log('---------端口号为：', portPath);
            console.log('我做的检测结果：', flag);
            mainWindow.webContents.send('SerialResult', flag)

        })
        .catch(err => {
            console.log('------------', err);
        })
}

//向蓝牙发送的数据进行转换，
//入参 十六进制的控制命令字符串、数据位数组，数组的内容也是十六进制字符串
//返回值：返回要发送的数组，数组里的每一位都是十进制的数字
function sendData (command, arr) {
    //帧长,如果帧长是一位,前面加0
    let sendArr = []

    let length = arr.length + 3

    //开始生成校验位
    let Check = (parseInt(length, 16) ^ parseInt(command, 16))
    for (let i = 0; i < arr.length; i++) {
        Check = Check ^ parseInt(arr[i].toString(16), 16)
    }
    // console.log('------------', Check);
    sendArr[0] = 170
    sendArr[1] = length
    sendArr[2] = parseInt(command, 16)
    for (let i = 0; i < arr.length; i++) {
        sendArr.push(parseInt(arr[i], 16))
    }
    sendArr.push(Check)
    sendArr.push(parseInt(`55`, 16))
    console.log(sendArr);
    return sendArr

}



//读取的数据是间断的，这里要做好处理后在发过去
let arr = []


//校验函数
function check (arr) {
    if (arr.length < 3) {
        return
    }
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(arr[i], 16)
    }
    let i
    let checkFloag = arr[1];

    for (i = 2; i < arr.length - 2; i++) {
        checkFloag = checkFloag ^ arr[i];
    }
    return checkFloag;
}


function dataTest (arr) {
    let j, newArr = [], trueArr = [], length = arr.length, start, end;
    for (let i = 0; i < length; i++) {
        if (arr[i] === 'aa') {
            start = i
            j = i;
            let dataLength = parseInt(arr[j + 1], 16);
            if (arr[dataLength + 1 + i] === '55') {
                end = dataLength + 1 + i
                for (; j <= dataLength + 1 + i; j++) {
                    newArr.push(arr[j]);
                }
                // console.log('<<<<<<<<<<<<', newArr);

                if (check(newArr) === newArr[newArr.length - 2]) {
                    // console.log('newArr', newArr);
                    trueArr = newArr.concat();
                    newArr = [];
                    arr.splice(start, end + 1)

                } else {
                    newArr = [];
                }
            }
        }
    }
    console.log('温度计发来的数据转化完毕准备发给渲染端', trueArr)
    mainWindow.webContents.send('sned', trueArr)
    trueArr = []

}


//托盘对象
var appTray = null;

function createWindow () {
    const windowOptions = {
        width: 400,       //运行时窗体大小
        height: 800,      //运行时窗体大小
        maxWidth: 600,    //最大宽度
        minWidth: 400,    //最小宽度
        maxHeight: 1200,  //最大高度
        minHeight: 800,   //最小高度
        resizable: true,   //能否改变窗体大小
        frame: false,//为false则是无边框窗口
        webPreferences: {
            nodeIntegration: true, // 是否集成 Nodejs,把之前预加载的js去了，发现也可以运行
            // preload: path.join(__dirname, './public/renderer.js')
        },
        show: false, // newBrowserWindow创建后先隐藏，
        backgroundColor: '#E1206D'
        // icon:path.join(__dirname,'./logo.png'),//任务栏icon图标

    };
    mainWindow = new BrowserWindow(windowOptions);
    const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`
    // 开发
    mainWindow.loadURL(urlLocation);
    // 生产
    // mainWindow.loadURL(`file://${path.join(__dirname, './build/index.html')}`)
    // mainWindow.loadURL(`file://${__dirname}/index.html`);
    //是否打开开发者
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    //系统托盘右键菜单
    let trayMenuTemplate = [
        {
            label: '设置',
            click: function () { } //打开相应页面
        },
        {
            label: '帮助',
            click: function () { }
        },
        {
            label: '关于',
            click: function () { }
        },
        {
            label: '退出',
            click: function () {
                app.quit();
                app.quit();//因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
            }
        }
    ];
    //系统托盘图标目录
    // trayIcon = path.join(__dirname, './');//app是选取的目录

    // appTray = new Tray(path.join(__dirname,'./logo.png'));//app.ico是app目录下的ico文件

    // //图标的上下文菜单
    // const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

    // //设置此托盘图标的悬停提示内容
    // appTray.setToolTip('Mella');

    // //设置此图标的上下文菜单
    // appTray.setContextMenu(contextMenu);
    // //单击右下角小图标显示应用
    // appTray.on('click',function(){
    //   mainWindow.show();
    // })
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    mainWindow.on('ready-to-show', function () {
        mainWindow.show() // 初始化后再显示
    })
}

//app主进程的事件和方法
app.on('ready', () => {

    createWindow();

});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        if (port.isOpen) {
            port.close()
        }

        port.removeAllListeners();
        port = null

    }
});
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

//登录窗口最小化
ipcMain.on('window-min', function () {
    mainWindow.minimize();
})
//登录窗口最大化
ipcMain.on('window-max', function () {
    if (mainWindow.isMaximized()) {
        mainWindow.restore();
    } else {
        mainWindow.maximize();
    }
})
ipcMain.on('window-close', function () {
    mainWindow.close();
})
ipcMain.on('big', () => {
    mainWindow.setMaximumSize(800, 900);
    mainWindow.setMinimumSize(800, 900);
    mainWindow.setSize(800, 1000)
})
ipcMain.on('small', () => {
    mainWindow.setMaximumSize(600, 1000);
    mainWindow.setMinimumSize(400, 600);
    mainWindow.setSize(400, 800)
})

ipcMain.on('mesasure', () => {
    mainWindow.setMaximumSize(400, 900)
    mainWindow.setMinimumSize(400, 900)
    mainWindow.setSize(400, 900)
})
ipcMain.on('getSerialPort', () => {
    isHaveSerialport()
})


ipcMain.on('num', (event, data) => {
    /**
     * 监听到要发送的信息
     * 要把接收到的字符串每两位截取并转换成10进制的数并存进数组里
     * 把数组发给蓝牙
     */
    let arr = sendData(data.command, data.arr)
    console.log('渲染端发来的数据并经过转化：', arr);
    port.write(arr, 'hex', function (err) {
        console.log(2);
        if (err) {
            console.log('写渲染端发来的数据Error on write: ', err.message);
        } else {
            console.log('send: ' + arr);
        }
        // port.close()
    });

    let time = setTimeout(() => {
        console.log('port is open:', port.isOpen);
        if (port.isOpen === true) {
            port.write(arr, 'hex', function (err) {
                console.log(2);
                if (err) {
                    console.log('写渲染端发来的数据Error on write: ', err.message);
                } else {
                    console.log('send: ' + arr);
                }
                // port.close()
            });
        } else {
            if (!isOpening) {
                console.log('---------我进来了');
                port.open((err) => {
                    console.log('num函数里oper error :', err, '/n', typeof err, `${err}`);

                    if (err && err != null && `${err}`.indexOf('File not found') !== -1) {
                        console.log('没有插底座');
                        if (port.isOpen) {
                            port.close()
                        }
                        // isHaveSerialported = false
                        return
                    }
                    if (`${err}`.indexOf('Port is opening') !== -1) {
                        isOpening = true
                        const time = setTimeout(() => {
                            isOpening = false
                            clearTimeout(time)
                        }, 10000)


                    }
                    port.write(arr, 'hex', function (err) {
                        console.log(2);
                        if (err) {
                            console.log('写渲染端发来的数据Error on write: ', err.message);
                        } else {
                            console.log('send: ' + arr);
                        }
                    });
                })
            }

        }


        clearTimeout(time)
    }, 400)
})

ipcMain.on('qiehuan', (event, data) => {
    /**
     * 监听到要发送的信息
     * 要把接收到的字符串每两位截取并转换成10进制的数并存进数组里
     * 把数组发给蓝牙
     */
    console.log('进入了点击切换的函数');
    let arr = [0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56]

    let time = setTimeout(() => {
        // console.log('port is open:', port.isOpen);
        if (!port) {
            return
        }
        if (port.isOpen === true) {
            port.write(arr, 'hex', function (err) {
                console.log(2, err);
                if (err) {
                    console.log('切换按钮Error on write: ', err.message);
                } else {
                    console.log('send: ' + arr);
                }
                // port.close()
            });
        } else {

            port.open((err) => {
                console.log('点击切换按钮时oper error :', `${err}`, err.Error);
                if (err && err.Error && err.Error === 'Port is opening') {
                    console.log('我去关闭端口');
                    port.close()
                }
                port.write(arr, 'hex', function (err) {
                    console.log(333333333333);
                    if (err) {
                        console.log('切换按钮Error on write: ', err.message);
                    } else {
                        console.log('send: ' + arr);
                    }
                    // port.close()
                });
            })
        }


        clearTimeout(time)
    }, 400)
})



module.exports = mainWindow;
