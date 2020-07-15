
const mainProcess = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
window.$ = window.jQuery = require('jquery')

const namespace= document.getElementById("namespace")
const nodeindex = document.getElementById("nodeindex")
const valueWrite = document.getElementById("valueWrite")
const okButton = document.getElementById("okButton")
const logout = document.getElementById('logout')



var nodeToWrite



okButton.addEventListener('click',function(event){

    if(namespace.value == "" || nodeindex.value == "" || valueWrite.value =="" ){
        mainProcess.dialog.showErrorBox("Attenzione", "riempi tutti i campi")
    } else{
        nodeToWrite = {nodeId: "ns="+namespace.value+";"+"i="+nodeindex.value}
        ipcRenderer.send("write", nodeToWrite,valueWrite.value);
        ipcRenderer.on('write-reply', (event, arg) => {
        console.log(arg)
        })
    }
});

logout.addEventListener('click',function(event){
    ipcRenderer.send('close-session')
});