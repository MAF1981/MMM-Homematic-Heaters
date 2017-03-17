var NodeHelper = require("node_helper");
var request = require('request');
var iconv = require('iconv-lite'); //http://stackoverflow.com/questions/12040643/nodejs-encoding-using-request

module.exports = NodeHelper.create({
    start: function () {
        console.log(this.name + ' helper started...');
    },

	/**
	 * Receives the socket notitication from the module js. 
	 * @param notification The notification name  
	 * @param payload The array containing all information to process the request
	 */
    socketNotificationReceived: function(notification, payload) {
		//console.log("IN node_helper.js -> socketNotificationReceived: " + notification + " - " + payload);
		var self = this;
        if (notification === 'MMM_CCU2_REQUEST') {
			//console.log(notification +" recieved! ");
			var deviceIds = "";
			for(var deviceObject in payload.deviceList) {
				var device = JSON.parse(payload.deviceList[deviceObject]);
				deviceIds = (deviceIds.length===0)? device.deviceId : deviceIds + "," + device.deviceId;
			}//for 
			//console.log("Requesting information from the following devices: " + deviceIds);
			var ccu2url = payload.url;
			if(ccu2url.substring(0,7) !== "http://") { ccu2url = "http://" + payload.url; }
			if(deviceIds.length !== 0){
				request({
					url: encodeURI(ccu2url + "/state.cgi?device_id=" + deviceIds),
					method: 'GET',
					encoding: null,
				}, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						self.sendSocketNotification('MMM_CCU2_RESPONSE', {
							content: self.processXMLResponse(deviceIds, iconv.decode(body, 'iso-8859-1'))
						});
					}else {
						console.error("Could not get data from <"+ccu2url+">! Error code is " + response.statusCode + ": " + error);
					}
				});
			} else {
				//deviceIds are empty... nothting to request from CCU2
			}

        }
    },

	/**
	 * Process the XML response from the CCU2
	 * !! REQUIRES: sudo npm install -g xmldom --save 
	 */
	processXMLResponse: function(deviceIds, xml) {
		//console.log("IN: processXMLResponse... " + deviceIds);
		var DOMParser = require('xmldom').DOMParser;
		var xmlDocument = new DOMParser().parseFromString(xml, "application/xml");
		var requestedIds = deviceIds.split(",");
		var response = [];
		for(var currentId = 0; currentId < requestedIds.length; currentId++) {
			var currentDeviceId = requestedIds[currentId];
			var currendDevice = xmlDocument.getElementsByTagName("device")[currentId]; 
			//Check the device id given in the config.js
			if(!currendDevice){
				//device id does not exist
				continue;
			}
			var deviceName = currendDevice.getAttribute("name");
			var channels = currendDevice.getElementsByTagName("channel");
			var channelObjects = [];
			//Loop over all existing channels and consider only channels for further processing that has datapoints available
			for (ch = 0; ch < channels.length; ch++) { 
				var channelObject = channels[ch];
				if(channelObject.getElementsByTagName("datapoint").length > 0){
					channelObjects.push(channelObject);
				}
			}//for channels
			var item = {[currentDeviceId]: this.createResponse(channelObjects, deviceName, currentDeviceId)};
			response.push(item);
		}
		//console.log("OUT: processXMLResponse! ");
		return response;
	},
	
	/**
	 * Create the response with all datapoints and available parameters
	 */
	createResponse : function(deviceChannelObjects, deviceName, deviceId) {
		var returnValues = [];
		var deviceArray = {};
		deviceArray["deviceId"] = deviceId;
		deviceArray["deviceName"] = deviceName;
		for(var channelObject in deviceChannelObjects){
			var datapoints = deviceChannelObjects[channelObject].getElementsByTagName("datapoint");
			//Loop over all available datapoints and return a map with all attributes/values of each datapoint
			for (dp = 0; dp < datapoints.length; dp++) { 
				var datapointObject = datapoints[dp];
				var datapointType = datapointObject.getAttribute("type");
				var attributesArray = {};
				for (var i=0; i<datapointObject.attributes.length; i++){
					var key = datapointObject.attributes[i].name;
					attributesArray[key] = datapointObject.attributes[i].value;
				}
				deviceArray[datapointType] = attributesArray;
			}
		}
		returnValues.push(deviceArray);
		return returnValues;
	}
});