Module.register("MMM-Homematic-Heaters",{

    // Default module config.
    defaults: {
		devices: [], 
        ccu2IP: "homematic-ccu2",
		xmlapiURL: "config/xmlapi",
		updateInterval: 120000
    },
	
	homematicUrl: "",
	moduleDisplay: "",
	configurationSettings:[],
	
    // Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
        wrapper.innerHTML = this.moduleDisplay;
        return wrapper;
	},

	// Define start sequence.
	start: function() {
		var self = this;
		self.homematicUrl = this.config.ccu2IP + "/" + this.config.xmlapiURL;
		self.configurationSettings = self.readConfiguration(this.config.devices);
		setInterval(function() {
			self.getDataFromCCU2();
			self.updateDom();
		}, this.config.updateInterval);
		moment.locale(this.config.language);
		self.getDataFromCCU2();
		Log.info("Starting module: " + this.name + "accessing URL " + self.homematicUrl);
	},
	
	/**
	 * Send the notification request to the node_helper to get 
	 * all settings of all requested devices
	 */
	getDataFromCCU2: function() {
		var self = this; 
		this.sendSocketNotification(
			'MMM_CCU2_REQUEST',
			{
				deviceList: self.createPayloadForRequest(),
				url: self.homematicUrl,
			}
		);
	},	

	/** 
	 * Prepare the settings specified in the config.js
	 * and do some basic checks to prevent common errors
	 */
	readConfiguration : function(configSettings) {
		var item = {};
		for (var dev in configSettings) { 
			var settings = {};
			var device = configSettings[dev];
			var devId = device.id;
			var devLabel = "";
			var devSetTemp = false;
			var devMode = false;
			var devFaults = false;
			
			if(device.label) { devLabel = device.label; }
			if(device.showSetTemperature) { devSetTemp = device.showSetTemperature; }
			if(device.showCurrentMode) { devMode = device.showCurrentMode; }
			if(device.showFaultReporting) { devFaults = device.showFaultReporting; }
			
			settings["configDeviceId"] = device.id;
			settings["configDeviceLabel"] = devLabel;
			settings["configDeviceShowSetTemperature"] = devSetTemp;
			settings["configDeviceShowFaultReport"] = devFaults;
			settings["configDeviceShowMode"] = devMode;
			item[device.id] = settings;
		}
		return item;
	},
	
	/**
	 * Creates the payload for the socket notification
	 */
	createPayloadForRequest : function() {
        var payload = [];
		for (var dev in this.config.devices) { 
			var device = this.config.devices[dev];
			payload.push(JSON.stringify({"deviceId": device.id}));
		}
		return payload;		
	},
	
	/**
	 * Receives the notification with the response from the node_helper
	 */
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'MMM_CCU2_RESPONSE' ) {
            if(payload && payload.content){
				this.prepareOutputForDevices(payload.content);
            }
        }
    },
	
	/**
	 * Prepares the output for displaying the values in the mirror.
	 */
	prepareOutputForDevices: function(response) {
		var deviceName = "";
		for (var device in response) {
			var deviceArray = response[device];
			for(var deviceId in deviceArray){
				var settingsArray = deviceArray[deviceId][0];
				var deviceLabel = settingsArray["deviceName"];
				var faultReport = this.prepareFaultReporting(settingsArray);
				var currentMode = this.prepareControlModeOutput(settingsArray);
				var actualTemperature = this.prepareAttribute("ACTUAL_TEMPERATURE", settingsArray);
				var valveState = this.prepareAttribute("VALVE_STATE", settingsArray);
				var setTemperature = this.prepareAttribute("SET_TEMPERATURE", settingsArray);
				
				//Before displaying the settings double-check against the configurationSettings 
				//(config.js) to drive the desired behavior...
				if(this.configurationSettings[deviceId]["configDeviceLabel"] !== "") {
					deviceLabel = this.configurationSettings[deviceId]["configDeviceLabel"];
				}
				var configDeviceShowFaultReport = "";
				if(this.configurationSettings[deviceId]["configDeviceShowFaultReport"] === true) {
					configDeviceShowFaultReport = faultReport;
				}
				var configDeviceShowMode = "";
				if(this.configurationSettings[deviceId]["configDeviceShowMode"] === true) {
					configDeviceShowMode = "<span class='deviceMode'>&nbsp;("+currentMode+")</span>";
				}		
				var configDeviceShowSetTemperature = "";
				if(this.configurationSettings[deviceId]["configDeviceShowSetTemperature"] === true) {
					//style the divider (slash) with the same style as the label
					configDeviceShowSetTemperature = "<span class='deviceLabel'>&nbsp;/&nbsp;</span><span class='deviceSetTemperature'>" + setTemperature + "</span>";
				}					
				deviceLabel = "<span class='deviceLabel'>" + deviceLabel + ":&nbsp;</span>";
				actualTemperature = "<span class='deviceActualTemperature'>" + actualTemperature + "</span>";
				var newDevice = "<span class='deviceContainer'>" + deviceLabel + actualTemperature + configDeviceShowSetTemperature + configDeviceShowMode +"</span>";
				newDevice  += configDeviceShowFaultReport;
				deviceName += newDevice;
			}
		}
		this.moduleDisplay = deviceName; 
		this.updateDom();		
	},
	
	/**
	 * Prepare the output of the given attribute. Reads the attributeName from the
	 * settingsArray and do further processing on it, i.e. to display the value with the
	 * unit (temperature, valve state) or anything else.
	 * Can be used in the future to prepare any other attributes for output.
	 */
	prepareAttribute: function(attributeName, settingsArray){
		var preparedAttributeValue = "";
		var attributeNameArray = settingsArray[attributeName];
		switch(attributeName){
			//As of now, all attributes below can be handled with the same logic
			case "ACTUAL_TEMPERATURE":
			case "SET_TEMPERATURE":
			case "VALVE_STATE":	
				preparedAttributeValue = Number(parseFloat(attributeNameArray["value"]).toFixed(2)) + attributeNameArray["valueunit"];
				break;
		}
		return preparedAttributeValue;
	}, 
	
	/**
	 * Prepare the control mode of the radiator specified in CONTROL_MODE
	 * parameter. Translate the returning number according to the Homematic
	 * documentation into the available values.
	 */
	prepareControlModeOutput: function(settingsArray) {
		var controlMode = Number(settingsArray["CONTROL_MODE"]["value"]);
		var valveState = Number(settingsArray["VALVE_STATE"]["value"]);
		var valveStateDisplay = valveState + settingsArray["VALVE_STATE"]["valueunit"];
		var translatedMode = this.translate("RADIATOR_OFF");
		var modus = "AUTO"; //default
		switch (controlMode){
			case 0: 
				modus = "AUTO";
				if(valveState !== 0) {
					//Do not show word "auto" in auto mode: this.translate("RADIATOR_MODE_".concat(modus))
					translatedMode = this.translate("HEATS_WITH") + " " + valveStateDisplay;
				}
				break;
			case 1: 
				modus = "MANUAL";
				if(valveState !== 0) {
					translatedMode = this.translate("RADIATOR_MODE_".concat(modus)) + ", " + this.translate("HEATS_WITH") + " " + valveStateDisplay;
				}
				break;
			case 2: 
				modus = "PARTY"; //Urlaubsmodus
				var urlaubsEnde = moment().set({'year': settingsArray["PARTY_STOP_YEAR"], 
														'month': settingsArray["PARTY_STOP_MONTH"], 
														'day': settingsArray["PARTY_STOP_DAY"]});
						translatedMode = this.translate("RADIATOR_MODE_".concat(modus)) + " " + this.translate("HOLIDAY_MODE_UNTIL") + " ";
						translatedMode = translatedMode + urlaubsEnde.format("ddd, MMM Do Y");
				break;
			case 3: 
				modus = "BOOST";
				translatedMode = this.translate("RADIATOR_MODE_".concat(modus));
		}//switch
		return translatedMode;
	},
	
	/**
	 * Translate the values of parameter CONTROL_MODE to their
	 * human readable values that can be used for i18n afterwards
	 * According Homematic documentation for datapoints
	 */
	prepareControlMode: function(controlModeParameter) {
		var controlMode = Number(controlModeParameter["value"]);
		var modus = "AUTO"; //default
		switch (controlMode){
			case 0: 
				modus = "AUTO";
				break;
			case 1: 
				modus = "MANUAL";
				break;
			case 2: 
				modus = "PARTY"; //Urlaubsmodus
				break;
			case 3: 
				modus = "BOOST";
		}//switch
		return modus;
	},
	
	/**
	 * Prepare the error (if any) for the FAULT_REPORTING parameter.
	 * Translate the states into their values (according Homematic documentation) 
	 * to be able to use it in the translation files. Return an empty 
	 * string if everything is fine.
	 */
	prepareFaultReporting: function(settingsArray) { 
		var faultCode =  Number(settingsArray["FAULT_REPORTING"]["value"]);
		var errorMsg = "";
		switch (faultCode){
			case 1: 
				errorMsg = this.translate("VALVE_TIGHT");
				break;
			case 2: 
				errorMsg = this.translate("ADJUSTING_RANGE_TOO_LARGE");
				break;
			case 3: 
				errorMsg = this.translate("ADJUSTING_RANGE_TOO_SMALL");
				break;
			case 4: 
				errorMsg = this.translate("COMMUNICATION_ERROR");
				break;
			case 5: 
				errorMsg = ""; //Not available - no documentation
				break;
			case 6: 
				errorMsg = this.translate("LOWBAT");
				//Append the current battery state
				errorMsg += " " + Number(parseFloat(settingsArray["BATTERY_STATE"]["value"]).toFixed(2)) + settingsArray["BATTERY_STATE"]["valueunit"]
				break;
			case 7:
				errorMsg = this.translate("VALVE_ERROR_POSITION");
		}
		//Return the translated i18n error message - if any
		if(errorMsg !== "") {
			errorMsg = "<span class='faultReporting'>"+ this.translate("WARNING") + errorMsg + "</span>";
		} 
		return errorMsg;
	},
	
	// Define required style-sheet scripts
	getStyles: function() {
		return ["MMM-Homematic-Heaters.css"];
	},

	// Define required dependency scripts
	getScripts: function() {
		return ["moment.js"];
	},
		
	// Define required translation files
	getTranslations: function() {
		return {
				en: "translations/en.json",
				de: "translations/de.json"
		};
	}
});