
// let COMMON_URL = 'http://192.168.0.24:18080/melladesk';//本地
// let COMMON_URL = 'http://54.85.89.201:8081/melladesk';//AWS
// let COMMON_URL = 'http://8.131.66.177:8081/melladesk';//阿里云
let COMMON_URL = 'http://ec2-3-214-224-72.compute-1.amazonaws.com:18080/melladesk';//企业AWS
let token = '';

//'/v1/appUser/login', 'POST', params
export function fetchRequest1 (url, method, params = '') {

    if (method === 'GET' || method === 'DELETE') {
        let header = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        if (params == '') {
            return new Promise(function (resolve, reject) {
                fetch(COMMON_URL + url, {
                    method: method,
                }).then((Response) => Response.json())
                    .then((responseData) => {
                        resolve(responseData)
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        } else {
            // 定一个空数组
            let paramsArray = [];
            //  拆分对象
            Object.keys(params).forEach(key =>
                paramsArray.push(key + "=" + params[key])
            );
            // 判断是否地址拼接的有没有 ？,当没有的时候，使用 ？拼接第一个参数，如果有参数拼接，则用&符号拼接后边的参数   
            if (url.search(/\?/) === -1) {
                url = url + "?" + paramsArray.join("&");
            } else {
                url = url + "&" + paramsArray.join("&");
            }
            return new Promise(function (resolve, reject) {
                fetch(COMMON_URL + url, {
                    method: method,
                    headers: {
                        "Content-Type": 'text/plain'
                    }
                }).then((response) => response.json())
                    .then((responseData) => {
                        resolve(responseData);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        }
    } else {
        let header = {
            "Content-type": "application/json"
        };
        if (params == '') {
            return new Promise(function (resolve, reject) {
                fetch(COMMON_URL + url, {
                    method: method,
                    headers: header
                }).then((Response) => Response.json())
                    .then((responseData) => {
                        resolve(responseData)
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        } else {
            return new Promise(function (resolve, reject) {
                fetch(COMMON_URL + url, {
                    method: method,
                    // mode: 'cors',
                    headers: header,
                    body: JSON.stringify(params),
                }).then((response) => response.json())
                    .then((responseData) => {
                        resolve(responseData);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        }
    }
}
