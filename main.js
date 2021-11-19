/**
 *  path.join(__dirname, '')    C:\Users\nonagon\AppData\Local\Programs\mella\resources\app.asar
 * 
 * 
 */
 const Store  =require("electron-store") ;
 Store.initRenderer()
 
const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');

const dialog = require('electron').dialog;
let remote = require('electron').remote
const path = require('path')
const SerialPort = require('serialport');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater')





let mainWindow = null;
var port = null
let isOpening = false, portPath = null


app.allowRendererProcessReuse = false
const ex = process.execPath;  //自启动的参数
const fs = require("fs")
let device = null,          //usb所在的设备
 file = '',                 //给底座进行升级的文件地址
 upload = false,             //是否正在给底座进行升级
 deviceUSB = {productId:-1,vendorId:-1}
let HID = require('node-hid');

let windowOpen= true

/**
 * 检测usb的插拔，
 * {
        locationId: 0,
        vendorId: 5824,
        productId: 1155,
        deviceName: 'Teensy USB Serial (COM3)',
        manufacturer: 'PJRC.COM, LLC.',
        serialNumber: '',
        deviceAddress: 11
    }
    对比vid与pid来确认拔的是不是底座设备
 */
let usbDetect = require('usb-detection');
usbDetect.startMonitoring();
usbDetect.on('add', function(device) { 
    console.log('add', device); 
    mainWindow.webContents.send('usbDetect',true)
});
usbDetect.on('remove', function(device) { 
    console.log('remove', device);
    mainWindow.webContents.send('usbDetect',false)

    if(device.vendorId === deviceUSB.vendorId && device.productId === deviceUSB.productId){
        console.log('拔出来的设备是底座，要去搜索设备了');

        openUsb()
    }
 });


/**
 * openUsb  搜索底座是否存在
 * 
 */
function openUsb () {   //搜索底座存不存在，不存在就去展示
    let flog = false,
    path = ''       //usb所在的接口路径
    let devices = HID.devices();
    device = null           //这里一定要清理一下，不然退出的话会有异常
    for (let i = 0; i < devices.length; i++) {
        if (devices[i].manufacturer === 'wch.cn') {
            flog = true
            path = devices[i].path
            deviceUSB.vendorId = devices[i].vendorId
            deviceUSB.productId = devices[i].productId
            break;
        }

    }
    if(windowOpen){     //如果没有点击退出
        if (!flog) {
            
                console.log('没找到设备');
                deviceUSB = {productId:-1,vendorId:-1}
                const timer = setTimeout(() => {
                    openUsb()
                    clearTimeout(timer)
                }, 2000);
                mainWindow.webContents.send('noUSB',true)
            
        }else{
            console.log('找到了设备',deviceUSB);
            device = new HID.HID(path);
            device.on("data", (data) => {
                let hex = data.toString('hex')
                console.log(hex);
                let str = '',dataArr = []
                for (let i = 0; i < hex.length; i = i + 2) {
                    str += `${hex[i]}${hex[i + 1]} `
                    dataArr.push( `${hex[i]}${hex[i + 1]}`)
                }
                // console.log('接受的数据位：', str,dataArr);
                let processedData =  processed_data(dataArr)
                // console.log('装换的数据：',processedData);
                for (let i = 0; i < processedData.length; i++) {
                    const element = processedData[i];
                   mainWindow.webContents.send('sned',element)
                }
                // mainWindow.webContents.send('usbData', `返回数据${str}`)
                if (upload) {
                    // const timer = setTimeout(() => {
                    //     sendUpload()
                    //     clearTimeout(timer)
                    // }, 30);

                }
            });
            device.on("error", function (err) {
                console.log('----err', err,`${err}`,`${err}`==='Error: could not read from HID device'); 
                if(`${err}`==='Error: could not read from HID device'){
                    console.log('两种可能，一种是usb被拔出了，一种是点击了重新切换的按钮');
                    //想个法子看是那种情况
                }
            });
            open_USB_Communication()
            mainWindow.webContents.send('noUSB',false)

        }
    }
}

/**
 * 打开底座usb的蓝牙通信
 */
function open_USB_Communication() {
    device.write([0x00,0xAA,0x04,0x36,0x11,0x23,0x55])
}
/**
 * 关闭底座usb的蓝牙通信
 */
 function close_USB_Communication() {
    device && device.write([0x00,0xAA,0x04,0x36,0x00,0x32,0x55])
}
/**
 * 对接收的数据进行处理 
 */
function processed_data(arr) {
    let j , newArr = [] , trueArr = [],length = arr.length

    for (let i = 0; i < length; i++) {
       if(arr[i] === 'aa'){
            j = i 
            let dataLength = parseInt(arr[j+1],16)
            if(arr[dataLength+1] === '55'){
                for (; j <= dataLength+1+i; j++) {
                    newArr.push(parseInt(arr[j],16))
                }
                // console.log(newArr,check(newArr),newArr[newArr.length-2]);
                if(check(newArr) === newArr[newArr.length-2]){
                    trueArr.push(newArr);
                    newArr = []
                }else{
                    newArr = []
                }
                

            }
       }
        
    }
    return trueArr
}
//校验数据是否有误
function check(arr) {
    if (arr.length < 3) {
        return
    }
    let i
    let checkFloag = arr[1];

    for (i = 2; i < arr.length - 2; i++) {
        checkFloag = checkFloag ^ arr[i];
    }
    return checkFloag;
}







/**
 * USB端口发生错误，并把错误传给渲染端
 * portErr(params)
 * params:{}
 * 
 */
function portErr (params = '') {
    mainWindow.webContents.send('portErr', params)
}






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
                        }
                    })
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
                console.log('第一种方法');
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

                    }

                })
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

            } else if (portPath === null) {
                console.log('第2种方法');
                list()
            } else if (flag === true && ports[index].path !== portPath) {
                console.log('第3种方法');
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

                    }
                })
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
            console.log('---------端口号为：', portPath);
            isHaveSerialported = flag
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
    console.log(parseInt(length, 16),parseInt(command, 16),parseInt(length, 16) ^ parseInt(command, 16));
    let Check =length ^ parseInt(command, 16)
    for (let i = 0; i < arr.length; i++) {
        console.log(Check, parseInt(arr[i].toString(16), 16));
        Check = Check ^ parseInt(arr[i].toString(16), 16)
    }
    console.log('------------', Check);
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


// //校验函数
// function check (arr) {
//     if (arr.length < 3) {
//         return
//     }
//     for (let i = 0; i < arr.length; i++) {
//         arr[i] = parseInt(arr[i], 16)
//     }
//     let i
//     let checkFloag = arr[1];

//     for (i = 2; i < arr.length - 2; i++) {
//         checkFloag = checkFloag ^ arr[i];
//     }
//     return checkFloag;
// }


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
    // mainWindow.webContents.openDevTools()

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
    if (isDev) {
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
        autoUpdater.checkForUpdates()
    } else {
        autoUpdater.checkForUpdatesAndNotify()
    }

    autoUpdater.autoDownload = false

    autoUpdater.checkForUpdatesAndNotify()
    autoUpdater.on('error', (err) => {
        dialog.showErrorBox('Error:', err === null ? 'unknown' : `${err}`)
    })
    autoUpdater.on('update-available', () => {
        console.log('我要开始更新了');
        // autoUpdater.downloadUpdate()
        dialog.showMessageBox({
            type: 'info',
            title: 'App has a new version',
            message: 'A new version is found, do you want to update it in the background?',
            buttons: ['Yes', 'No']
        })
            .then(res => {
                console.log(res);
                if (res.response === 0) {
                    autoUpdater.downloadUpdate()
                }
            })
            .catch(err => {
                console.log(err);
            })
    })
    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Install',
            message: 'Do you want to install the update now?',
            buttons: ['Yes', 'No']
        })
            .then(res => {
                console.log('安装更新', res);
                if (res.response === 0) {
                    setImmediate(() => autoUpdater.quitAndInstall())
                }

            })
            .catch(err => {
                console.log(err);
            })
    })
    autoUpdater.on('download-progress', data => {
        console.log(data.progress, '-----', data.bytesPerSecond, '-----', data.percent, '-----', data.total, '-----', data.transferred);
        mainWindow.setProgressBar(data.percent / 100, { mode: 'normal' })
    })
    autoUpdater.on('update-not-available', () => {
        // dialog.showMessageBox({
        //     title: 'No new version',
        //     message: 'Currently is the latest version'
        // })
    })


    createWindow();

    openUsb()

});
app.on('window-all-closed', () => {
    console.log('关闭USB插拔监控');
    windowOpen = false
    console.log(1);
    usbDetect.stopMonitoring();
    console.log(2);
    close_USB_Communication()
    console.log(3);
    device&&device.close()
    console.log(4);
    if (process.platform !== 'darwin') {
        console.log('退出');
        app.quit()
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
ipcMain.on('middle', () => {
    mainWindow.setMaximumSize(700, 800);
    mainWindow.setMinimumSize(700, 800);
    mainWindow.setSize(700, 800)
})
ipcMain.on('small', () => {
    mainWindow.setMaximumSize(400, 800);
    mainWindow.setMinimumSize(400, 800);
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


    if (port === null) {
        return
    }
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

    // let time = setTimeout(() => {
    //     console.log('port is open:', port.isOpen);
    //     if (port.isOpen === true) {
    //         port.write(arr, 'hex', function (err) {
    //             console.log(2);
    //             if (err) {
    //                 console.log('写渲染端发来的数据Error on write: ', err.message);
    //             } else {
    //                 console.log('send: ' + arr);
    //             }
    //             // port.close()
    //         });
    //     } else {
    //         if (!isOpening) {
    //             console.log('---------我进来了');
    //             port.open((err) => {
    //                 console.log('num函数里oper error :', err, '/n', typeof err, `${err}`);

    //                 if (err && err != null && `${err}`.indexOf('File not found') !== -1) {
    //                     console.log('没有插底座');
    //                     if (port.isOpen) {
    //                         port.close()
    //                     }
    //                     // isHaveSerialported = false
    //                     return
    //                 }
    //                 if (`${err}`.indexOf('Port is opening') !== -1) {
    //                     isOpening = true
    //                     const time = setTimeout(() => {
    //                         isOpening = false
    //                         clearTimeout(time)
    //                     }, 10000)


    //                 }
    //                 port.write(arr, 'hex', function (err) {
    //                     console.log(2);
    //                     if (err) {
    //                         console.log('写渲染端发来的数据Error on write: ', err.message);
    //                     } else {
    //                         console.log('send: ' + arr);
    //                     }
    //                 });
    //             })
    //         }

    //     }


    //     clearTimeout(time)
    // }, 400)
})

// ipcMain.on('qiehuan', (event, data) => {
//     /**
//      * 监听到要发送的信息
//      * 要把接收到的字符串每两位截取并转换成10进制的数并存进数组里
//      * 把数组发给蓝牙
//      */
//     console.log('进入了点击切换的函数');
//     let arr = [0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56]

//     let time = setTimeout(() => {
//         // console.log('port is open:', port.isOpen);
//         if (!port) {
//             return
//         }
//         if (port.isOpen === true) {
//             port.write(arr, 'hex', function (err) {
//                 console.log(2, err);
//                 if (err) {
//                     console.log('切换按钮Error on write: ', err.message);
//                 } else {
//                     console.log('send: ' + arr);
//                 }
//                 // port.close()
//             });
//         } else {

//             port.open((err) => {
//                 console.log('点击切换按钮时oper error :', `${err}`, err.Error);
//                 if (err && err.Error && err.Error === 'Port is opening') {
//                     console.log('我去关闭端口');
//                     port.close()
//                 }
//                 port.write(arr, 'hex', function (err) {
//                     console.log(333333333333);
//                     if (err) {
//                         console.log('切换按钮Error on write: ', err.message);
//                     } else {
//                         console.log('send: ' + arr);
//                     }
//                     // port.close()
//                 });
//             })
//         }


//         clearTimeout(time)
//     }, 400)
// })

// 开启 开机自启动
ipcMain.on('openAutoStart', () => {
    if (!isDev) {
        app.setLoginItemSettings({
            openAtLogin: true,
            path: ex,
            args: []
        });
    }

});
// 关闭 开机自启动
ipcMain.on('closeAutoStart', () => {
    if (!isDev) {
        app.setLoginItemSettings({
            openAtLogin: false,
            path: ex,
            args: []
        });
    }

})


ipcMain.on('usbdata', (event, data) => {
    /**
     * 监听到要发送的信息
     * 要把接收到的字符串每两位截取并转换成10进制的数并存进数组里
     * 把数组发给串口
     */
   

    let arr = sendData(data.command, data.arr)
    console.log('渲染端发来的数据并经过转化：', arr);
    let sendArr = [0x00].concat(arr)
    try {
        device && device.write(sendArr);
    } catch (error) {
        console.log(error);
    }
   
})
ipcMain.on('qiehuan', (event, data) => {
    /**
     * 监听到要发送的信息
     * 要把接收到的字符串每两位截取并转换成10进制的数并存进数组里
     * 把数组发给蓝牙
     */
    console.log('进入了点击切换的函数');
    let sendArr = [0x00,0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56, 0x56]
    device && device.write(sendArr);
    device = null
    
})

module.exports = mainWindow;
