
const mainProcess = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
window.$ = window.jQuery = require('jquery')

const namespace= document.getElementById("namespace")
const nodeindex = document.getElementById("nodeindex")
const maxAge = document.getElementById("maxAge")
const okButton = document.getElementById("okButton")

const valueRead = document.getElementById("valueRead")
const statusCode = document.getElementById("statusCode")
const serverTimestamp = document.getElementById("serverTimestamp")
const logout = document.getElementById('logout')

var nodeToRead



okButton.addEventListener('click',function(event){

    if(namespace.value == "" || nodeindex.value == "" || maxAge.value =="" ){
        mainProcess.dialog.showErrorBox("Attenzione", "riempi tutti i campi")
    } else{
        nodeToRead = {nodeId: "ns="+namespace.value+";"+"i="+nodeindex.value}
        ipcRenderer.send("read", nodeToRead,maxAge.value);
        ipcRenderer.on('read-reply', (event, arg) => {
        valueRead.innerHTML=arg["value"]["value"]
        console.log(arg)
        statusCode.innerHTML=arg["statusCode"]["_name"]
        serverTimestamp.innerHTML=arg["serverTimestamp"]
        })
    }
});

logout.addEventListener('click',function(event){
    ipcRenderer.send('close-session')
});