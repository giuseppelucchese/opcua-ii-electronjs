
window.$ = window.jQuery = require('jquery');

const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const endPointUrlText = document.getElementById("endpointUrlText");
const sessionIDText = document.getElementById("sessionIDText");
const securityModeText = document.getElementById("securityModeText");
const securityLevelText = document.getElementById("securityLevelText");
const logout = document.getElementById('logout')




ipcRenderer.send('get-sessionInfo')
ipcRenderer.on('get-sessionInfo-reply', (event, arg) => {
    endPointUrlText.innerHTML = arg[0]
    sessionIDText.innerHTML= arg[1]
    securityModeText.innerHTML=arg[2]
    securityLevelText.innerHTML=arg[3]
    
})


    
logout.addEventListener('click',function(event){
    ipcRenderer.send('close-session')
  });
