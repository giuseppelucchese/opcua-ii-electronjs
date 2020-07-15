// Modules to control application life and create native browser window
const {app, BrowserWindow,dialog} = require('electron');
const ipcMain = require('electron').ipcMain;

const opcua = require("node-opcua");
const async = require("async");

const MessageSecurityMode = require("node-opcua-types").MessageSecurityMode

//variabili
var theSession = null;
var subscriptionsInfo = []
var browseNode = "RootFolder";

var endpointsPromise
var endpointsList=[]
var sessionInfo=[]
var subscriptionList=[]
var browseRes = []
var monitoredItems = new Map()
var monitoredItemsInfo = new Map()

var subscriptionToMonitor
var miID
// variabili shared SET


ipcMain.on('set-browseNode', (event, arg) => {
  browseNode = arg;
})

ipcMain.on('set-subscriptionToMonitor', (event, arg) => {
  subscriptionToMonitor= arg
})
ipcMain.on('set-miID', (event, arg) => {
  miID = arg
})



// variabili shared GET

ipcMain.on("get-subscriptionToMonitor",(event, arg)=>{
  event.reply("get-subscriptionToMonitor-reply",subscriptionToMonitor)

});

ipcMain.on("get-miID",(event, arg)=>{
  event.reply("get-miID-reply",miID)
});


ipcMain.on("get-endpointsList",(event, arg)=>{
  event.reply("get-endpointsList-reply",endpointsList)
});

ipcMain.on('get-sessionInfo', (event, arg) => {
    event.reply('get-sessionInfo-reply',sessionInfo)
})

ipcMain.on('get-subscriptionList', (event, arg) => {
  event.reply('get-subscriptionList-reply',subscriptionsInfo)
})

ipcMain.on('get-subscriptionListWithMI', (event, arg) => {
  var si = []
  for(i=0; i<subscriptionsInfo.length;i++){
    if (monitoredItems.has(subscriptionsInfo[i][0])){
      si.push(subscriptionsInfo[i])
      
    }
  }
  event.reply('get-subscriptionListWithMI-reply',si)
})

ipcMain.on('get-monitoredItems', (event, arg) => {
  console.log(arg)
  var mi = monitoredItems.get(arg)
  event.reply('get-monitoredItems-reply',mi)

})
ipcMain.on('get-monitoredItemsInfo', (event, arg) => {
  event.reply('get-monitoredItemsInfo-reply',monitoredItemsInfo)
})

// Crea la finestra di avvio

function createMainWindow () {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 200,
    webPreferences: {
      nodeIntegration : true,
      enableRemoteModule : true
    }
  })

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setResizable(false)
  mainWindow.loadFile('index.html');
  //mainWindow.webContents.openDevTools()
  mainWindow.on('closed',()=>{
    app.quit();
  });
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  createMainWindow()
 
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.







//////////////////////   OPCUA OPS ///////////////////


////////////////////// ISTANZA DEL CLIENT////////////////////////////////////

const client = opcua.OPCUAClient.create({
    endpoint_must_exist: false
});

///////////////////////////////////CONNECT E DISCOVERYENDPOINTS////////////////////////////////////////

ipcMain.on("discoveryEndpoints", (event, server) => {
  let elem; 
  try{   
    client.connect(server, function () {    
      endpointsPromise = client.getEndpoints({server});
      endpointsPromise.then(function(result){
        for (var i=0; i< result.length; i++){
          var protocol = result[i]["endpointUrl"].substr(0,3)
          if(protocol == "opc"){
            elem = [result[i]["endpointUrl"],result[i]["securityLevel"], MessageSecurityMode[result[i]["securityMode"]]]
            endpointsList.push(elem);
          }
        }
        event.reply('discoveryEndpoints-reply',"ok")
        client.disconnect()
      }).catch(function(err){
        event.reply('discoveryEndpoints-reply',"err")
        dialog.showErrorBox("Errore", err.toString())
      });
      
    });

  } catch (err) {
    event.reply('discoveryEndpoints-reply',"err")
    dialog.showErrorBox("Errore", err.toString())
  }
})

///////////////////////////////////CONNECT E SESSION////////////////////////////////////////

ipcMain.on("connectEndpoint", (event, endpointUrl,securityMode,securityLevel) => {
  
  client.on("backoff", (retry, delay) => 
    console.log("still trying to connect to ", endpointUrl ,": retry =", retry, "next attempt in ", delay/1000, "seconds" )
  );

  async.series([
     //  connect 
     function(callback) {
      client.connect(endpointUrl, function(err) {
          if (err) {
              event.reply("connect-reply","err")
          } 
          callback(err);
      });
  },
  // createSession
  function(callback) {
      client.createSession(function(err, session) {
          if (!err) {
              theSession = session;
              event.reply("connectEndpoint-reply","OK")
              sessionInfo.push(endpointUrl,theSession.sessionId["value"],securityMode,securityLevel)
          }
          callback(err);
      });
  }
  ]);
})


////////////////////// BROWSE /////////////////////////

ipcMain.on('browse', (event, arg) => {
  
  async.series([
  function(callback) {
    theSession.browse(browseNode, function(err, browseResult) {
        if(!err) {
            for(let reference of browseResult.references) {
                browseRes.push([reference.browseName.toString(),reference.nodeId.toString()])
            }
            event.reply('browse-reply',browseRes);
            browseRes =  []
        }
        callback(err);
    });
 }]);
})

////////////////////////// READ ///////////////////////

ipcMain.on('read', (event, nodeToRead,maxAge) => {
 async.series([
   function(callback){
      theSession.read(nodeToRead,maxAge,function(err,dataValue){
        if(!err){
          event.reply("read-reply", dataValue)
        } else{
          dialog.showErrorBox("Errore", err)
          return callback(err)
        }
      })

   }
 ])
})

////////////////////////// WRITE ///////////////////////

ipcMain.on('write', (event, nodeToWrite,valueWrite) => {
  async.series([
    function(callback){
       theSession.write(nodeToWrite,valueWrite,function(err,dataValue){
         if(!err){
           event.reply("write-reply", dataValue)
         } else{
           dialog.showErrorBox("Errore", err)
           return callback(err)
         }
       })
 
    }
  ])
 })


// Subscribe
ipcMain.on('subscribe', (event, subscriptionOptions) => {
  async.series([
    function(callback) {
      theSession.createSubscription2(subscriptionOptions, (err, subscription) => {
          if(err) { return callback(err); }
          var subscrId = subscription.subscriptionId
          subscriptionsInfo.push([subscrId,subscription.publishingInterval,subscription.lifetimeCount,subscription.maxKeepAliveCount])
          event.reply('subscribe-reply',subscriptionsInfo)
          subscriptionList.push(subscription)
          dialog.showMessageBox({title:"", message:"Sottoscrizione creata correttamente!"})
          subscription.on("started", () => {
              console.log("subscription started for 2 seconds - subscriptionId=", subscription.subscriptionId);
          }).on("keepalive", function() {
             // console.log("subscription keepalive");
          }).on("terminated", function() {
             console.log("terminated");
          });
          callback();
       });
   }
  ])
})

//delete Subscription
ipcMain.on('delete-subscription', (event, subscriptionid) => {
  async.series([
    function(callback){
      theSession.deleteSubscriptions({subscriptionIds : [subscriptionid]},(err) =>{
        if(!err) {
          for (i=0; i<subscriptionsInfo.length; i++){
            if(subscriptionsInfo[i][0] === subscriptionid){
              subscriptionsInfo.splice(i,1)
            }
          }
        }else{
          dialog.showErrorBox("Errore",err.toString())
        }
        callback(err);
      })
    }
  ])
})

// Monitoring
ipcMain.on('monitor', (event, options, subscriptionId) => {
  //var the_subscription = subscriptionList[0]
  
  for (i=0; i<subscriptionList.length ; i++){
    if(subscriptionList[i].subscriptionId == subscriptionId){
      the_subscription = subscriptionList[i]
    }
  } 

  async.series([
    function(callback) {
      const monitoredItem  = the_subscription.monitor({
              nodeId: opcua.resolveNodeId("ns="+options.ns+";"+"i="+options.ni),
              attributeId: opcua.AttributeIds.Value
          },
          {
              samplingInterval: options.samplingInterval,
              discardOldest: options.discardOldest,
              queueSize: options.queueSize
          },
          opcua.TimestampsToReturn.Both
      );
      monitoredItem.then((result)=>{
        
        if (!monitoredItems.has(subscriptionId)){
          var mi = []
          mi.push([result.monitoredItemId,options.ns,options.ni]) //array che contiene le informazioni sui monitoredItem associati ad una sottoscrizione
          monitoredItems.set(subscriptionId,mi)
        }else{
          var mi = monitoredItems.get(subscriptionId)
          mi.push([result.monitoredItemId,options.ns,options.ni])
          monitoredItems.set(subscriptionId,mi)
        }
        dialog.showMessageBox({title:"", message:"Monitoreditem creato correttamente!"})
        
        result.on("changed", function(dataValue) {
          var miInfo = []
          console.log(monitoredItemsInfo.has(result.monitoredItemId))
          if (!monitoredItemsInfo.has(result.monitoredItemId)){
            miInfo.push([dataValue.value.value,dataValue.value.dataType,dataValue.statusCode._name,dataValue.sourceTimestamp])
            monitoredItemsInfo.set(result.monitoredItemId,miInfo)
          }else{
            miInfo = monitoredItemsInfo.get(result.monitoredItemId)
            miInfo.push([dataValue.value.value,dataValue.value.dataType,dataValue.statusCode._name,dataValue.sourceTimestamp])
            monitoredItemsInfo.set(result.monitoredItemId,miInfo)
          }
          ipcMain.on('changedMi'+'-'+result.monitoredItemId, (event, arg) => {
            event.reply('changedMi'+'-'+result.monitoredItemId+'-'+'reply',monitoredItemsInfo.get(result.monitoredItemId))
          })
          //console.log(monitoredItemsInfo.get(result.monitoredItemId))
        });   
      }) 
   }
  ])
})




// terminate MonitoredItem
ipcMain.on('terminateMI',(event,mId)=>{
  mI.terminate(function(err){
    if(err){
      dialog.showErrorBox('Errore',err)
    }else{

    }
  })
})


// Close 
ipcMain.on('close-session', (event, arg) => {
  async.series([
      function(callback) {
        theSession.close( function(err) {
            if(err) {
                console.log("closing session failed ?");
            }
            callback();
        });
    },
  function(err) {
    if (err) {
        console.log(" failure ",err);
    } else {
        console.log("done!");
    }
    client.disconnect(function(){});
    app.quit()
  }])
})
