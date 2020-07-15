
const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const logout = document.getElementById('logout')


var subscriptionID
var subscriptionList

window.$ = window.jQuery = require('jquery');


function createMonitorWindow () {
    const monitorWindow = new mainProcess.BrowserWindow({
      width: 1024,
      height: 1000,
      webPreferences: {
        nodeIntegration : true,
        enableRemoteModule : true
      }
    })
  
    monitorWindow.setMenuBarVisibility(false);
    monitorWindow.loadFile('monitor.html');
    monitorWindow.webContents.openDevTools()

  }

ipcRenderer.send('get-subscriptionListWithMI')

ipcRenderer.on('get-subscriptionListWithMI-reply', (event, arg) => {
   subscriptionList = arg
   console.log(arg)
})



$(document).ready(function(){
    var table = $('#dataTable').DataTable({
         "data": subscriptionList,
         "columnDefs": [
             {
               "defaultContent": '<button type="button" id="monitorButton"  class="btn btn-primary mb-2">Monitor</button>',
               "targets": -1
             }
           ]
     });
 
    
     $('#dataTable tbody').on( 'click', 'tr', function () {
        var data = table.row(this).data();
        subscriptionID = data[0]
        ipcRenderer.send('set-subscriptionToMonitor', subscriptionID)
        createMonitorWindow()
     } );
});






logout.addEventListener('click',function(event){
    ipcRenderer.send('close-session')
});