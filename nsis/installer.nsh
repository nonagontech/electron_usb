!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro preInit
  ; This macro is inserted at the beginning of the NSIS .OnInit callback
  ExecWait '"$INSTDIR\resources\exe\ch1.exe" /S'$0
  DetailPrint "preInit程序返回了 $0"
!macroend

!macro customInit

   
    ExecWait '"$INSTDIR\resources\exe\ch1.exe" /S'$0

    DetailPrint "customInit程序返回了 $0"

!macroend

!macro customInstall
${ifNot} ${isUpdated}
  ExecWait '"$INSTDIR\resources\exe\ch.exe" /S'$0
  ExecWait '"$INSTDIR\resources\exe\ch1.exe" /S'$0
    DetailPrint "customInstall程序返回了 $0"
${endIf}
   
!macroend

!macro customUnInstall
     ExecWait '"$INSTDIR\resources\exe\ch.exe" /U'
!macroend
!macro customInstallMode
  # set $isForceMachineInstall or $isForceCurrentInstall 
  # to enforce one or the other modes.
!macroend