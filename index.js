const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;



const confirmUrlButton = document.getElementById('confirmUrlButton');
const loading = document.getElementById('loading');
const serverUrl = document.getElementById('url');



loading.style.visibility="hidden";


function createEndpointsWindow () {
  const endpointWindow = new mainProcess.BrowserWindow({
    width: 1024,
    height: 500,
    webPreferences: {
      nodeIntegration : true,
      enableRemoteModule : true
    }
  });
  endpointWindow.setMenuBarVisibility(false)
  //mainWindow.setResizable(false)
  endpointWindow.loadFile('endpointlist.html')
  //endpointWindow.webContents.openDevTools()
  endpointWindow.on('closed',()=>{
    mainProcess.app.quit();
  });
  mainProcess.getCurrentWindow().hide()
}




confirmUrlButton.addEventListener('click',function(event){
  loading.style.visibility = "visible";
  if(serverUrl.value === ""){
    mainProcess.dialog.showErrorBox("Errore","Inserisci l'url");
    loading.style.visibility="hidden";
  }else {
    ipcRenderer.send('discoveryEndpoints',serverUrl.value)
    ipcRenderer.on('discoveryEndpoints-reply', (event, arg) => {
      if (arg != "err"){
        createEndpointsWindow()
      }
    })
    loading.style.visibility="hidden";
  }

})


