
const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const logout = document.getElementById('logout')

var browseNode;
var browseResults;
window.$ = window.jQuery = require('jquery');



function createBrowseWindow () {
    const  browseWindow = new mainProcess.BrowserWindow({
      width: 1024,
      height: 1000,
      webPreferences: {
        nodeIntegration : true,
        enableRemoteModule : true
      }
    });
    browseWindow.setMenuBarVisibility(false)
    //mainWindow.setResizable(false)
    browseWindow.loadFile('browseWindow.html')
    //browseWindow.webContents.openDevTools()
    //mainProcess.getCurrentWindow().close();
  }
  


ipcRenderer.send('browse')

ipcRenderer.on('browse-reply', (event, arg) => {
   browseResults = arg
   console.log(arg)
})

ipcRenderer.send('set-browseNode',"RootFolder")


$(document).ready(function(){
    var table = $('#dataTable').DataTable({
         "data": browseResults,
         "columnDefs": [
             {
               "defaultContent": '<button type="button" id="browseButton" class="btn btn-primary mb-2"> >>> </button>',
               "targets": -1
             }
           ]
     });
 
    
     $('#dataTable tbody').on( 'click', 'tr', function () {
        var data = table.row(this).data();
        browseNode = data[1]
        console.log(browseNode)
        ipcRenderer.send('set-browseNode',browseNode)
        createBrowseWindow()
     } );
});

logout.addEventListener('click',function(event){
  ipcRenderer.send('close-session')
});