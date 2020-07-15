
const mainProcess = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

const logout = document.getElementById('logout')
const okButton = document.getElementById('okButton')

const ns = document.getElementById('ns')
const ni = document.getElementById('ni')
const samplingInterval = document.getElementById('samplingInterval')
const queueSize =  document.getElementById('queueSize')
const discardOldest = document.getElementById('discardOldest')

const publishInterval = document.getElementById('publishInterval')
const maxKeepAliveCount = document.getElementById('maxKeepAliveCount')
const lifetimeCount = document.getElementById('lifetimeCount')
const maxNotifications = document.getElementById('maxNotifications')
const priority = document.getElementById('priority')
const deleteButton = document.getElementById('deleteButton')



const createMI = document.getElementById('createMIButton')

window.$ = window.jQuery = require('jquery');


const subscriptionOptions = {
    maxNotificationsPerPublish :  null,
    priority : null,
    requestedLifetimeCount : null,
    requestedMaxKeepAliveCount : null,
    requestedPublishingInterval :  null,
    publishingEnabled : null
}


const monitorOptions = {
    ns : null,
    ni : null,
    samplingInterval : null,
    queueSize : null,
    discardOldest : null
}


var subscriptionID
var subscriptionList



ipcRenderer.send('get-subscriptionList')

ipcRenderer.on('get-subscriptionList-reply', (event, arg) => {
   subscriptionList = arg
})



$(document).ready(function(){
    var table = $('#dataTable').DataTable({
         "data": subscriptionList,
         "columnDefs": [
             {
               "defaultContent": '<button type="button" id="deleteSubscription" data-toggle="modal" data-target="#deleteModal" class="btn btn-primary mb-2">  Delete  </button> <button type="button" id="cMI" data-toggle="modal" data-target="#monitoredModal" class="btn btn-secondary mb-2"> CreateMI </button>',
               "targets": -1
             }
           ]
     });
 
    
     $('#dataTable tbody').on( 'click', 'tr', function () {
        var data = table.row(this).data();
        subscriptionID = data[0]  
     } );
});

okButton.addEventListener('click',function(event){
    if(publishInterval.value == "" || maxKeepAliveCount.value == "" || lifetimeCount.value == "" || maxNotifications.value =="" || priority.value =="" ){
        mainProcess.dialog.showErrorBox("Errore", "inserisci tutti i campi")
    } else {
        
        subscriptionOptions.maxNotificationsPerPublish =  maxNotifications.value
        subscriptionOptions.priority = priority.value
        subscriptionOptions.requestedLifetimeCount= lifetimeCount.value
        subscriptionOptions.requestedMaxKeepAliveCount= maxKeepAliveCount.value
        subscriptionOptions.requestedPublishingInterval= publishInterval.value
        subscriptionOptions.publishingEnabled = true

        
        ipcRenderer.send('subscribe',subscriptionOptions)
        ipcRenderer.on('subscribe-reply', (event, arg) => {
            subscriptionList = arg  
        })
        
        location.reload()
    }
    
});

createMI.addEventListener('click',function(event){
    if(ns.value == "" || ni.value == "" || samplingInterval.value == "" || queueSize.value ==""){
        mainProcess.dialog.showErrorBox("Errore", "inserisci tutti i campi")
    } else {
        
        monitorOptions.ns = ns.value
        monitorOptions.ni = ni.value
        monitorOptions.samplingInterval = samplingInterval.value
        monitorOptions.queueSize = queueSize.value
        monitorOptions.discardOldest = discardOldest.value
       
        ipcRenderer.send('monitor',monitorOptions,subscriptionID)
        location.reload()
    }
    
});

deleteButton.addEventListener('click',function(event){
    ipcRenderer.send('delete-subscription',subscriptionID)
    location.reload()
});


logout.addEventListener('click',function(event){
    ipcRenderer.send('close-session')
});