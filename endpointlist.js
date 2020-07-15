
const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;




var endpointsList
var endpointUrl,securityMode,securityLevel

window.$ = window.jQuery = require('jquery')



//FUNCTIONS

function createAdminPanelWindow () {
  const adminPanelWindow = new mainProcess.BrowserWindow({
    width: 1024,
    height: 1000,
    webPreferences: {
      nodeIntegration : true,
      enableRemoteModule : true
    },
  
  });
  adminPanelWindow.setMenuBarVisibility(false)
  //mainWindow.setResizable(false)
  adminPanelWindow.loadFile('sessioninfo.html')
  //adminPanelWindow.webContents.openDevTools()
 
  mainProcess.getCurrentWindow().hide()
  adminPanelWindow.on('closed',()=>{
    ipcRenderer.send('close-session')
  });

}



//CODE

ipcRenderer.send('get-endpointsList')
ipcRenderer.on('get-endpointsList-reply', (event, arg) => {
endpointsList = arg
})


$(document).ready(function(){
   var table = $('#dataTable').DataTable({
        "data": endpointsList,
        "columnDefs": [
            {
              "defaultContent": '<button type="button" id="connectEndpoint" class="btn btn-primary mb-2">Connect Endpoints</button>',
              "targets": -1
            }
          ]
    });

   
    $('#dataTable tbody').on( 'click', 'tr', function () {
        var data = table.row(this).data();
        endpointUrl = data[0]
        securityMode = data[1]
        securityLevel = data[2] 
        console.log(endpointUrl)
        console.log(securityMode)
        console.log(securityMode)
        ipcRenderer.send("connectEndpoint",endpointUrl,securityMode,securityLevel);
        ipcRenderer.on('connectEndpoint-reply', (event, arg) => {
          if(arg != "err"){
            createAdminPanelWindow();
          }
        })
        
        
    } );
});

