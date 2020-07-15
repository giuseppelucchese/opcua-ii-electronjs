
const mainProcess = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer

window.$ = window.jQuery = require('jquery')

const logout = document.getElementById('logout')
var monitoredItemsInfo

ipcRenderer.send('get-miID')
ipcRenderer.on('get-miID-reply', (event, miID) => {
    ipcRenderer.send('changedMi'+'-'+miID)
    ipcRenderer.on('changedMi'+'-'+miID+'-'+'reply',(event,arg)=>{
        monitoredItemsInfo = arg
    })
})


$(document).ready(function(){
    var table = $('#dataTable').DataTable({
         "data": monitoredItemsInfo
     });
     $('#dataTable tbody').on( 'click', 'tr', function () {
     } );
});



logout.addEventListener('click',function(event){
    ipcRenderer.send('close-session')
});