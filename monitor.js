
const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

var monitoredItems

window.$ = window.jQuery = require('jquery');

function createViewMIWindow () {
    const viewMIWindow = new mainProcess.BrowserWindow({
      width: 1024,
      height: 1000,
      webPreferences: {
        nodeIntegration : true,
        enableRemoteModule : true
      }
    })
  
    viewMIWindow.setMenuBarVisibility(false);
    viewMIWindow.loadFile('viewMI.html');
    viewMIWindow.webContents.openDevTools()   
}


ipcRenderer.send('get-subscriptionToMonitor')
ipcRenderer.on('get-subscriptionToMonitor-reply', (event, arg) => {
    ipcRenderer.send('get-monitoredItems',arg)
    ipcRenderer.on('get-monitoredItems-reply', (event, arg) => {
        monitoredItems = arg
    })
})
 
// getMonitoredItems passando subscriptionId e riempio la table


$(document).ready(function(){
    var table = $('#dataTable').DataTable({
         "data": monitoredItems,
         "columnDefs": [
             {
               "defaultContent": '<button type="button" id="viewButton"  class="btn btn-primary mb-2">viewMI</button>',
               "targets": -1
             }
           ]
     });
 
    
     $('#dataTable tbody').on( 'click', 'tr', function () {
        var data = table.row(this).data();
        miID = data[0]
        ipcRenderer.send('set-miID', miID)
        createViewMIWindow()
     } );
});


 