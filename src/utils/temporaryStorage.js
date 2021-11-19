const temporaryStorage = {
  /**
   * 注册时用户输入的个人信息 firstName, lastName, email, phone: `+${code}${phone}`, 
   * hash,domain：如果没勾选other，值为00000000000，勾选了为00000000000,文本
   * code：国家地区码  initPhone：输入的手机号  imgArrayIndex：选中国家图标的位置
   */
  logupVetInfo: {},
  /*注册时选中的组织信息address1 address2 city connectionKey connectionUrl country email integrationMethod 
  integrationParameterEntityList:[] name organizationId owner phone state workplaceId workplaceName workplaceTypeId zipcode
  */
  logupSelectOrganization: {},
  //注册时收到的验证码
  logupEmailCode: '',
  //验证验证码成功后返回的信息： userId    token   emailVcode
  logupSuccessData: {},
  //添加组织后返回的信息address1 address2 city connectionKey connectionUrl country createTime email integrationMethod
  //name organizationId owner: "0eb9ce75-bbfb-4fa9-9a7a-3597f22e159e" phone state zipcode: 115200
  logupOrganization: {},
  isClicleStudy:false,  //是否处于临床测试状态
  forgotPassword_email:'',//忘记密码的邮箱
  forgotUserId:'',  //忘记密码后修改密码需要userId
  QRToken:''  //扫码登录的token
}
export default temporaryStorage