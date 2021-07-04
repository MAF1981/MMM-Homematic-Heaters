Module.register("MMM-Homematic-Thermostats",{

    // Default module config.
    defaults: {
		devices: [], 
		ccu2IP: "homematic-ccu2",
		xmlapiURL: "config/xmlapi",
		updateInterval: 300000,  //5min
		style: "lines",
		setTempInBrackets: true,
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
		Log.info("Starting module: " + this.name + " accessing URL " + self.homematicUrl);
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
		
		// which table columns have to be displayed 
		var globColActTemp = true;
		var globColSetTemp = false;
		var globColHum = false;
		var globColMode = false;
		var settings = {};
		
		for (var dev in configSettings) { 
			var device = configSettings[dev];
			var devId = device.id;
			
			settings = {};

			// defaults if not set for specific device
			var devLabel = "";
			var devSetTemp = false;
			var devMode = false;
			var devFaults = false;
			var devHumidity = false;
			var devPrecisionTemp = 2;
			var devPrecisionHum = 0;
			var devWarnTempHigh = false;
			var devWarnTempLow = false;
			var devWarnHumHigh = false;
			var devWarnHumLow = false;
			var devTempThresholdHigh = 24;
			var devTempThresholdLow = 5;
			var devHumThresholdHigh = 60;
			var devHumThresholdLow = 35;
			
			// check if default values should be overwritten for this device 
			if(device.label) { devLabel = device.label; }
			if(device.showSetTemperature) { devSetTemp = device.showSetTemperature; globColSetTemp = true; }
			if(device.showCurrentMode) { devMode = device.showCurrentMode; globColMode = true; }
			if(device.showFaultReporting) { devFaults = device.showFaultReporting; }

			// @spitzlbergerj - 20190210: adding parameters for humidity and precision
			if(device.showHumidity) { devHumidity = device.showHumidity; globColHum = true; }
			if(device.precisionTemp) { devPrecisionTemp = device.precisionTemp; }
			if(device.precisionHum) { devPrecisionHum = device.precisionHum; }
			if(device.warnTempHigh) { devWarnTempHigh = device.warnTempHigh; }
			if(device.warnTempLow) { devWarnTempLow = device.warnTempLow; }
			if(device.warnHumHigh) { devWarnHumHigh = device.warnHumHigh; }
			if(device.warnHumLow) { devWarnHumLow = device.warnHumLow; }
			if(device.tempThresholdHigh) { devTempThresholdHigh = device.tempThresholdHigh; }
			if(device.tempThresholdLow) { devTempThresholdLow = device.tempThresholdLow; }
			if(device.humThresholdHigh) { devHumThresholdHigh = device.humThresholdHigh; }
			if(device.humThresholdLow) { devHumThresholdLow = device.humThresholdLow; }

			settings["configDeviceId"] = device.id;
			settings["configDeviceLabel"] = devLabel;
			settings["configDeviceShowSetTemperature"] = devSetTemp;
			settings["configDeviceShowFaultReport"] = devFaults;
			settings["configDeviceShowMode"] = devMode;
			settings["configDeviceShowHumidity"] = devHumidity;
			settings["configDevicePrecisionTemp"] = devPrecisionTemp;
			settings["configDevicePrecisionHum"] = devPrecisionHum;
			settings["configDeviceWarnTempHigh"] = devWarnTempHigh;
			settings["configDeviceWarnTempLow"] = devWarnTempLow;
			settings["configDeviceWarnHumHigh"] = devWarnHumHigh;
			settings["configDeviceWarnHumLow"] = devWarnHumLow;
			settings["configDeviceTempThresholdHigh"] = devTempThresholdHigh;
			settings["configDeviceTempThresholdLow"] = devTempThresholdLow;
			settings["configDeviceHumThresholdHigh"] = devHumThresholdHigh;
			settings["configDeviceHumThresholdLow"] = devHumThresholdLow;
			item[device.id] = settings;
		}
		
		settings = {};
		settings["configColumnActTemp"] = globColActTemp;
		settings["configColumnSetTemp"] = globColSetTemp;
		settings["configColumnHumidity"] = globColHum;
		settings["configColumnMode"] = globColMode;
		item["global"] = settings;

		console.log(item);
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
				// Log.info(payload.content);
				this.prepareOutputForDevices(payload.content);

            }
        }
    },
	
	/**
	 * Prepares the output for displaying the values in the mirror.
	 */
	prepareOutputForDevices: function(response) {
		var deviceName = "";
		// @spitzlbergerj, 20190210: wall thermostat = WT, radiator thermostat = RT
		var deviceType = "RT";
		var warn_color = "red"

		if (this.config.warnColor) {
			warn_color = this.config.warnColor;
		}
		
		if (this.config.style == "table") {
			/**
			 * Display the result as HTML table
			 * create table
			 *
			 * @spitzlbergerj, 20190210
			 **/
			var wrapper = document.createElement("div");
			wrapper.className = 'deviceTable';

			var table = document.createElement("table");
			table.border = 0;
		}

		for (var device in response) {
			var deviceArray = response[device];
			// Log.info(deviceArray);

			for(var deviceId in deviceArray){
				var settingsArray = deviceArray[deviceId][0];
				var deviceLabel = settingsArray["deviceName"];
				var faultReport = this.prepareFaultReporting(settingsArray);
				var currentMode = this.prepareControlModeOutput(settingsArray);
				var actualTemperature = settingsArray["ACTUAL_TEMPERATURE"]["value"];
				var actualTemperatureStr = this.prepareAttribute("ACTUAL_TEMPERATURE", settingsArray, this.configurationSettings[deviceId]["configDevicePrecisionTemp"]);
				var humidityStrForLines = "";
				var classNameStr = "";

				// @spitzlbergerj, 20190210: wall thermostat doesn't contain element VALVE_STATE
				if (settingsArray['VALVE_STATE']) {
					var valveState = this.prepareAttribute("VALVE_STATE", settingsArray,0);
					var actualHumidity = -1;
					var actualHumidityStr = "";
				} else {
					deviceType = "WT";
					var valveState = "";
					var actualHumidity = settingsArray["ACTUAL_HUMIDITY"]["value"];
					var actualHumidityStr = this.prepareAttribute("ACTUAL_HUMIDITY", settingsArray, this.configurationSettings[deviceId]["configDevicePrecisionHum"]);
				}
				var setTemperature = this.prepareAttribute("SET_TEMPERATURE", settingsArray, this.configurationSettings[deviceId]["configDevicePrecisionTemp"]);
				
				//Before displaying the settings double-check against the configurationSettings 
				//(config.js) to drive the desired behavior...
				if(this.configurationSettings[deviceId]["configDeviceLabel"] !== "") {
					deviceLabel = this.configurationSettings[deviceId]["configDeviceLabel"];
				}
				var configDeviceShowFaultReport = "";
				if(this.configurationSettings[deviceId]["configDeviceShowFaultReport"] === true) {
					configDeviceShowFaultReport = faultReport;
				}
				
				classNameStr = "";
				
				if (this.config.style == "lines") {
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

					// @spitzlbergerj warn colors
					classNameStr = 'deviceActualTemperature';
					if(this.configurationSettings[deviceId]["configDeviceWarnTempLow"] && actualTemperature <= this.configurationSettings[deviceId]["configDeviceTempThresholdLow"]) {
						classNameStr = classNameStr + ' bright ' + warn_color;
					}
					if(this.configurationSettings[deviceId]["configDeviceWarnTempHigh"] && actualTemperature >= this.configurationSettings[deviceId]["configDeviceTempThresholdHigh"]) {
						classNameStr = classNameStr + ' bright ' + warn_color;
					}
					actualTemperatureStr = "<span class='" + classNameStr + "'>" + actualTemperatureStr + "</span>";

					// @spitzlbergerj added humidity
					classNameStr = "";
					if(this.configurationSettings[deviceId]["configDeviceShowHumidity"] === true && deviceType == "WT") { 
						if(this.configurationSettings[deviceId]["configDeviceWarnHumLow"] && actualHumidity <= this.configurationSettings[deviceId]["configDeviceHumThresholdLow"]) {
							classNameStr = " class='bright " + warn_color + "'";
						}
						if(this.configurationSettings[deviceId]["configDeviceWarnHumHigh"] && actualHumidity >= this.configurationSettings[deviceId]["configDeviceHumThresholdHigh"]) {
							classNameStr = " class='bright " + warn_color + "'";
						}
						humidityStrForLines = "<span class='deviceHumidity'>&nbsp;(" + this.translate("UNIT_HUM") + ":&nbsp;" + "<span"+ classNameStr + ">" + actualHumidityStr + "</span>)&nbsp;</span>";
					} else {
						humidityStrForLines = "<span class='deviceHumidity'></span>";
					}

					var newDevice = "<span class='deviceContainer'>" + deviceLabel + actualTemperatureStr + configDeviceShowSetTemperature + humidityStrForLines + configDeviceShowMode +"</span>";
					newDevice  += configDeviceShowFaultReport;
					deviceName += newDevice;


				} else if (this.config.style == "table") {
					/**
					 * Display the result as HTML table
					 * create table row
					 * @spitzlbergerj, 20190210
					 **/
					
					var row = document.createElement("tr");
					row.className = 'deviceContainer';
					row.vAlign = 'top';
					
					var rowDevice = document.createElement("td");
					rowDevice.className = 'deviceLabel';
					rowDevice.width = "120px";
					rowDevice.appendChild(document.createTextNode(deviceLabel));
					
					var rowActual = document.createElement("td");
					classNameStr = 'deviceActualTemperature';
					if(this.configurationSettings[deviceId]["configDeviceWarnTempLow"] && actualTemperature <= this.configurationSettings[deviceId]["configDeviceTempThresholdLow"]) {
						classNameStr = classNameStr + ' bright ' + warn_color;
					}
					if(this.configurationSettings[deviceId]["configDeviceWarnTempHigh"] && actualTemperature >= this.configurationSettings[deviceId]["configDeviceTempThresholdHigh"]) {
						classNameStr = classNameStr + ' bright ' + warn_color;
					}
					rowActual.className = classNameStr;
					rowActual.width = "100px";
					rowActual.appendChild(document.createTextNode(actualTemperatureStr));
					
					var rowSet = document.createElement("td");
					rowSet.className = 'deviceSetTemperature';
					rowSet.width = "100px";
					if(this.configurationSettings[deviceId]["configDeviceShowSetTemperature"] === true) {
						if (this.config.setTempInBrackets) {
							rowSet.appendChild(document.createTextNode("("+setTemperature+")"));
						} else {
							rowSet.appendChild(document.createTextNode(setTemperature));
						}
					} else {
						rowHum.appendChild(document.createTextNode(""));
					}
					
					var rowMode = document.createElement("td");
					rowMode.className = 'deviceMode';
					rowMode.width = "100px";
					if(this.configurationSettings[deviceId]["configDeviceShowMode"] === true) {
						rowMode.appendChild(document.createTextNode(currentMode));
					} else {
						rowMode.appendChild(document.createTextNode(""));
					}
					
					var rowFault = document.createElement("td");
					rowFault.className = 'faultReporting';
					rowFault.appendChild(document.createTextNode(faultReport));
					
					if (deviceType == "WT") {
						var rowHum = document.createElement("td");
						classNameStr = 'deviceHumidity';
						if(this.configurationSettings[deviceId]["configDeviceWarnHumLow"] && actualHumidity <= this.configurationSettings[deviceId]["configDeviceHumThresholdLow"]) {
							classNameStr = classNameStr + ' bright ' + warn_color;
						}
						if(this.configurationSettings[deviceId]["configDeviceWarnHumHigh"] && actualHumidity >= this.configurationSettings[deviceId]["configDeviceHumThresholdHigh"]) {
							classNameStr = classNameStr + ' bright ' + warn_color;
						}
						rowHum.className = classNameStr;
						rowHum.width = "100px";
						if(this.configurationSettings[deviceId]["configDeviceShowHumidity"] === true) {
							rowHum.appendChild(document.createTextNode(actualHumidityStr));
						} else {
							rowHum.appendChild(document.createTextNode(""));
						}
					} else if (deviceType == "RT") {
						var rowValve = document.createElement("td");
						rowValve.className = 'deviceValveState';
						rowValve.width = "100px";
						rowValve.appendChild(document.createTextNode(valveState));
					}
					
					// Building of the table row
					var columns = 2;
					row.appendChild(rowDevice);
					row.appendChild(rowActual);
					
					if(this.configurationSettings["global"]["configColumnSetTemp"] === true) {
						columns += 1;
						row.appendChild(rowSet);
					}
					
					if(this.configurationSettings["global"]["configColumnHumidity"] === true) { 
						columns += 1;
						row.appendChild(rowHum);
					}
					
					if(this.configurationSettings["global"]["configColumnMode"] === true) { 
						columns += 1;
						row.appendChild(rowMode);
					}
					
					table.appendChild(row);
					
					if(this.configurationSettings[deviceId]["configDeviceShowFaultReport"] === true) {
						var row2 = document.createElement("tr");
						row2.className = 'faultReportingRow';
						row2.vAlign = 'top';
						var rowFault = document.createElement("td");
						rowFault.className = 'faultReporting';
						rowFault.colSpan=columns;
						rowFault.appendChild(document.createTextNode(configDeviceShowFaultReport));
						if(configDeviceShowFaultReport != "") {
							table.appendChild(row2);
						}
					}
				}
			}
		}

		if (this.config.style == "table") {
			// Log.info(table);
			deviceName = table.outerHTML;
		}
		// Log.info(deviceName);
		this.moduleDisplay = deviceName; 
		this.updateDom();
	},
	
	/**
	 * Prepare the output of the given attribute. Reads the attributeName from the
	 * settingsArray and do further processing on it, i.e. to display the value with the
	 * unit (temperature, valve state) or anything else.
	 * Can be used in the future to prepare any other attributes for output.
	 */
	prepareAttribute: function(attributeName, settingsArray, precision){
		var preparedAttributeValue = "";
		var attributeNameArray = settingsArray[attributeName];
		switch(attributeName){
			//As of now, all attributes below can be handled with the same logic
			case "ACTUAL_TEMPERATURE":
			case "SET_TEMPERATURE":
			case "VALVE_STATE":	
			case "ACTUAL_HUMIDITY":	
				preparedAttributeValue = Number(parseFloat(attributeNameArray["value"])).toLocaleString(this.config.localeStr, {minimumFractionDigits: precision, maximumFractionDigits: precision}) + attributeNameArray["valueunit"];
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
		// @spitzlbergerj, 20190210: wall thermostat doesn't contain element VALVE_STATE
		if (settingsArray['VALVE_STATE']) {
			// @spitzlbergerj, 20190210: Array with element VALVE_STATE, should be radiator thermostat 
			var valveState = Number(settingsArray["VALVE_STATE"]["value"]);
			var valveStateDisplay = valveState + settingsArray["VALVE_STATE"]["valueunit"];
		} else {
			var valveState = -1;
			var valveStateDisplay = "-";
		}
		var translatedMode = this.translate("RADIATOR_OFF");
		var modus = "AUTO"; //default
		switch (controlMode){
			case 0: 
				modus = "AUTO";
				if(valveState > 0) {
					//Do not show word "auto" in auto mode: this.translate("RADIATOR_MODE_".concat(modus))
					translatedMode = this.translate("HEATS_WITH") + " " + valveStateDisplay;
				} else if(valveState < 0) {
					//it's a wall thermostat
					translatedMode = this.translate("RADIATOR_MODE") + " " + this.translate("RADIATOR_MODE_".concat(modus));
				}
				break;
			case 1: 
				modus = "MANUAL";
				if(valveState !== 0) {
					translatedMode = this.translate("RADIATOR_MODE_".concat(modus)) + ", " + this.translate("HEATS_WITH") + " " + valveStateDisplay;
				} else if(valveState < 0) {
					//it's a wall thermostat
					translatedMode = this.translate("RADIATOR_MODE") + " " + this.translate("RADIATOR_MODE_".concat(modus));
				}
				break;
			case 2: 
				modus = "PARTY"; //Urlaubsmodus
				var urlaubsEnde = moment().set({'year': settingsArray["PARTY_STOP_YEAR"]["value"], 
														'month': (settingsArray["PARTY_STOP_MONTH"]["value"] -1), 
														'date': settingsArray["PARTY_STOP_DAY"]["value"]});
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
		var errorMsg = "";
		// @spitzlbergerj, 20190210: wall thermostat doesn't contain element FAULT_REPORTING
		if (settingsArray["FAULT_REPORTING"] >= 0) {
			// @spitzlbergerj, 20190210: Array with element FAULT-REPORTING, should be radiator thermostat 
			var faultCode = Number(settingsArray["FAULT_REPORTING"]["value"]);
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
					//Append the current battery state just for information
					errorMsg += " ";// + Number(parseFloat(settingsArray["BATTERY_STATE"]["value"]).toFixed(2)) + settingsArray["BATTERY_STATE"]["valueunit"]
					break;
				case 7:
					errorMsg = this.translate("VALVE_ERROR_POSITION");
			}
		}
		//Return the translated i18n error message - if any
		if(errorMsg !== "") {
			errorMsg = "<span class='faultReporting'>"+ this.translate("WARNING") + errorMsg + "</span>";
		} 
		return errorMsg;
	},
	
	// Define required style-sheet scripts
	getStyles: function() {
		return ["MMM-Homematic-Thermostats.css"];
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
