import React, { Component } from 'react'
import { BrowserRouter, Switch, Route, HashRouter } from 'react-router-dom'

import Home from './components/home/Home'
import Choose from './components/choose/Choose'
import EzyVetLogin from './components/ezyVetLogin/EzyVetLogin'
import EzyVetSelectTime from './components/ezyVetSelectTime/EzyVetSelectTime'
import SelectMella from './components/selectMella/SelectMella'
import APIkey from './components/apiKey/APIKey'
import VerifyOrganizationInformation from './components/selectLocation/VerifyOrganizationInformation'
import EzyVetSelectExam from './components/ezyVetSelectExam/EzyVetSelectExam'
import DoctorSelectExam from './components/doctorSelectExam/DoctorSelectExam'
import Praviders from './components/praviders/Praviders'
import SelectExam from "./components/selectExam/SelectExam";
import Mesasure from "./components/measure/Mesasure";
import NorMalMeasurement from "./components/measure/NorMalMeasurement";
import MaxMinReturn from './utils/maxminreturn/MaxMinReturn'
import EditPetInfo from './components/editPetInfo/EditPetInfo'
import WorkPlace from './components/workPlace/WorkPlace'

import DoctorAddPet from './components/doctorAddPet/DoctorAddPet'
//登录部分
import SignIn from './components/signIn/SignIn'
import ForgotPassword from './components/signIn/forgotPassword/ForgotPassword'
import ResetPassword from './components/signIn/resetPassword/ResetPassword'

import ScanCodeLogin from './components/signIn/scanCodeLogin/ScanCodeLogin'

//邮箱注册的整体部分
import VetPrifile from './components/createAccount/vetProfile/VetPrifile'
import JoinOrganizationByOption from './components/createAccount/joinOrganizationByOption/JoinOrganizationByOption'
import FindMyOrganization from './components/createAccount/findMyOrganization/FindMyOrganization'
import FindMyWorkplace from './components/createAccount/findMyWorkplace/FindMyWorkplace'
import IsHavePMS from './components/createAccount/ishavePMS/IsHavePMS'
import VerifyEmail from './components/createAccount/verifyEmail/index'
import NewOrganization from './components/createAccount/newOrganization/NewOrganization'
import NewWorkplace from './components/createAccount/newWorkplace/NewWorkplace'

import InviteTeam from './components/createAccount/inviteTeam/InviteTeam'

//options
import Help from './components/menuOptions/help/Help'
import Unassigned from './components/menuOptions/unassigned/Unassigned'
import Settings from './components/menuOptions/settings/Settings'

class App extends Component {
  render () {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/page1" component={Choose} />
          <Route exact path="/ezyVetLogin" component={EzyVetLogin} />
          <Route exact path="/EzyVetSelectTime" component={EzyVetSelectTime} />
          <Route exact path="/EzyVetSelectExam" component={EzyVetSelectExam} />
          <Route exact path="/page2" component={APIkey} />
          <Route exact path="/page3" component={VerifyOrganizationInformation} />
          <Route exact path="/page4" component={SelectMella} />


          {/* <Route exact path="/page5" component={Praviders} /> */}
          <Route exact path="/page5" component={SelectExam} />
          <Route exact path="/page7" component={MaxMinReturn} />

          <Route exact path="/page8" component={Mesasure} />
          <Route exact path="/page9" component={EditPetInfo} />
          <Route exact path="/page10" component={NorMalMeasurement} />
         
          <Route exact path="/page12" component={WorkPlace} />

          <Route exact path="/page11" component={SignIn} />
          <Route exact path="/user/login/forgotPassword" component={ForgotPassword} />
          <Route exact path="/user/login/resetPassword" component={ResetPassword} />
          <Route exact path="/user/login/scanCodeLogin" component={ScanCodeLogin} />

          <Route exact path="/uesr/logUp/FindMyOrganization" component={FindMyOrganization} />
          <Route exact path="/uesr/logUp/FindMyWorkplace" component={FindMyWorkplace} />
          <Route exact path="/uesr/logUp/VetPrifile" component={VetPrifile} />
          <Route exact path="/uesr/logUp/JoinOrganizationByOption" component={JoinOrganizationByOption} />
          <Route exact path="/uesr/logUp/isHavePMS" component={IsHavePMS} />
          <Route exact path="/uesr/logUp/VerifyEmail" component={VerifyEmail} />
          <Route exact path="/uesr/logUp/NewOrganization" component={NewOrganization} />
          <Route exact path="/uesr/logUp/NewWorkplace" component={NewWorkplace} />
          <Route exact path="/uesr/logUp/InviteTeam" component={InviteTeam} />





          <Route exact path="/uesr/selectExam" component={DoctorSelectExam} />





          <Route exact path="/pet/doctorAddPet" component={DoctorAddPet} />

          {/* options */}
          <Route exact path="/menuOptions/help" component={Help} />
          <Route exact path="/menuOptions/unassigned" component={Unassigned} />
          <Route exact path="/menuOptions/settings" component={Settings} />


        </Switch>
      </HashRouter>
    )
  }
}
export default App