# MagicMirror<sup>2</sup> Module: MMM-Homematic-Thermostats
A MagicMirror Module for your radio controlled Homematic (eQ-3) radiator thermostats of type: <b><a href="http://amzn.to/2nzhd4a" target="_blank" title="">HM-CC-RT-DN</a></b> and wall thermostats of type <b><a href="https://www.amazon.de/dp/B00H7UIMGA" target="_blank" title="">HM-TC-IT-WM-W-EU</a></b><br>
According documentation, it should also work with devices of type HM-CC-RT-DN-BoM.

from @spitzlberger extended by wall thermostats, style "table", humidity display, warnings, forming of numbers, ... (2019-02-16)

### The module displays the following information:
<table width="100%" border="0">
	<tbody>
		<tr>
			<td>
				<ul>
				<li>The name of the heater</li>
				<li>The current temperature</li>
				<li>The target temperature</li>
				<li>The current humidity (only wall thermostat)</li>
				<li>The current mode</li>
				<li>The fault reporting (i.e. low battery), if any</li>
				</ul>
				Supported languages are: English, Deutsch
			</td>
			<td>
				<img src="https://cloud.githubusercontent.com/assets/26480749/24071459/8d6b75ac-0bd2-11e7-9685-9817bfea7f00.jpg" border="0" height="250px"><br>
				<span style="font-size:8pt;">Picture: &copy; MAF1981, private</span>
			</td>
			<td>
				<img src="https://user-images.githubusercontent.com/38983450/52899716-60a5ce80-31ed-11e9-8455-9ce4d56f6c7d.jpg" border="0" height="250px"><br>
				<span style="font-size:8pt;">Picture: &copy; spitzlbergerj, <a href="https://github.com/spitzlbergerj/homematic-scripts/blob/master/LICENSE">GPL-3.0</a></span>
			</td>
		</tr>
	</tbody>
</table>

## Screenshots

<table width="100%" border="0" style="border:0;">
	<tbody>
		<tr>
			<td>
				Default screen:
				<p><img src="https://cloud.githubusercontent.com/assets/26480749/24048049/ee2f90c2-0b27-11e7-80d8-8f232328f8a1.png" height="150"/></p>
			</td>
			<td>
				Default screen with a fault message:
				<p><img src="https://cloud.githubusercontent.com/assets/26480749/24048628/c636b6e8-0b29-11e7-9a2d-ce471f058b35.png" height="150"/></p>
			</td>
		</tr>
		<tr>
			<td>
Example: Heater in Kid's room is in manually mode:
				<p><img src="https://cloud.githubusercontent.com/assets/26480749/24070241/a1463d8c-0bb9-11e7-9b17-1ec5aaa29f73.png" height="150"/></p>
			</td>
			<td>
Example: Heater in Kid's room is in holiday mode (party mode in terms of HomeMatic):
				<p><img src="https://cloud.githubusercontent.com/assets/26480749/24070845/38182062-0bc5-11e7-9fef-0ef139fc7e24.png" height="150"/></p>
			</td>
		</tr>
		<tr>
			<td>
Screen showing all information: <p><code>showSetTemperature: true</code><br><code>showCurrentMode: true</code><br>
<code>showFaultReporting: true</code></p>
<p><img src="https://cloud.githubusercontent.com/assets/26480749/24070524/6927f9da-0bbf-11e7-815b-b7786317b8d1.png" height="150"/></p>
			</td>
			<td>
Minimalistic screen:<p><code>showSetTemperature: false</code><br> <code>showCurrentMode: false</code><br>
<code>showFaultReporting: false</code></p><p><img src="https://cloud.githubusercontent.com/assets/26480749/24048630/c63a891c-0b29-11e7-9639-1677d08c5781.png" height="150"/></p>
			</td>
		</tr>
		<tr>
			<td colspan="2">
If you prefer it more colorful, just change the stylesheet...<p><img src="https://cloud.githubusercontent.com/assets/26480749/24070539/c0da85f8-0bbf-11e7-85ba-f03917709805.png" height="150"/></p>
			</td>
		</tr>
		<tr>
			<td colspan="2">
In German language:<p><img src="https://cloud.githubusercontent.com/assets/26480749/24070940/0b329e68-0bc7-11e7-9ff2-db339e0ee64e.png" height="150"/></p>
			</td>
		</tr>
		<tr>
			<td colspan="2">
And finally the style "Table" with warnings for temperature and humidity above and below the threshold:<p><img src="https://user-images.githubusercontent.com/38983450/52899709-51bf1c00-31ed-11e9-9410-abd4d4b6ab25.jpg" height="200"/></p>
			</td>
		</tr>
	</tbody>
</table>

## Pre-requisites
The following dependencies are required and must be installed to be able to use this module:
* <a href="https://github.com/MichMich/MagicMirror" target="_blank" title="MagicMirror2">MagigMirror<sup>2</sup></a><br/>
Obviously yes... without the mirror even this module is useless :-) <br>
Requires at least MM version: 2.1.0
* <a href="https://github.com/hobbyquaker/XML-API" target="_blank" title="XML-API for CCU2">XML-API addon</a><br/><b>The XML-API addon must be installed on your Homematic central control unit (CCU1 / CCU2)</b>. 
* <a href="https://github.com/jindw/xmldom" target="_blank" title="xmldom for node.js">xmldom</a><br/>The xmldom DOMParser and XMLSerializer must be installed for node.js
* <a href="https://github.com/ashtuchkin/iconv-lite" target="_blank" title="iconv-lite for node.js">iconv-lite</a><br/>The iconv-lite is required to deal with the correct character encoding <code>iso-8859-1</code> (i.e.: German umlauts ä ü ö) after receiving data via the XML-API.
* <a href="https://momentjs.com" target="_blank" title="moment.js">moment.js</a><br/>The moment.js library is required to parse the dates coming via XML-API (i.e. to display the end date if a device is in vacation mode). Because moment.js is even used by MagicMirror's default modules, you should already have it installed.
* WiFi/Network - Your CCU2 and your Raspberry Pi has to be connected to your local network. The module communicates with the CCU2 by using HTTP GET-request to retrieve the information. Therfore, each device has to be known by the CCU2 as well.

## Installation
In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/spitzlbergerj/MMM-Homematic-Thermostats
````

Configure the module in your `config.js` file as followed.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
{
	module: 'MMM-Homematic-Thermostats',
	header: 'Myhome: Thermostats',
	position: 'top_left', // This can be any of the regions.
	config: {
		ccu2IP: '127.0.0.1',
		xmlapiURL: 'config/xmlapi',
		updateInterval: 120000
		style: "table",
		setTempInBrackets: false,
		localeStr: 'de-DE',
		warnColor: 'blue',
		devices: [
			{
				id: '1112',
				label: 'Living Room',
				showSetTemperature: false,
				showCurrentMode: true,
				showFaultReporting: true,
				showHumidity: true,
				precisionTemp: 1,
				precisionHum: 0,
				warnTempHigh: true,
				warnTempLow: true,
				warnHumHigh: true,
				warnHumLow: true,
				tempThresholdLow: 23,
				tempThresholdHigh: 24,
				humThresholdLow: 34,
				humThresholdHigh: 70,
			}
			//Add all other devices you want to show
		],
	}
}
]
````

## Configuration options
The following properties can be configured:

<table width="100%">
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>ccu2IP</code></td>
			<td><b>Optional</b></code> - The IP address of your HomeMatic central control unit.
				<br/>If not set, the default is: <code>homematic-ccu2</code></td>
		</tr>
		<tr>
			<td><code>xmlapiURL</code></td>
			<td><b>Optional</b></code> - The URL to the XML-API addon on your HomeMatic central control unit. Is appended to <code>ccu2IP</code>.<br/>If not set, the default is: <code>config/xmlapi</code></td>
		</tr>
		<tr>
			<td><code>updateInterval</code></td>
			<td><b>Optional</b></code> - The update interval in milliseconds.<br/>
				If not set, the default is: <code>300000</code> (5 minutes)</td>
		</tr>
		<tr>
			<td><code>style</code></td>
			<td><b>Optional</b></code> - Determines whether the individual thermostats are displayed as separate lines or as rows in a table. Possible values: <code>'lines'</code> or <code>'table'</code> Default is <code>'lines'</code></td>
		</tr>
		<tr>
			<td><code>setTempInBrackets</code></td>
			<td><b>Optional</b></code> - determines whether the set target temperature is to be displayed in brackets. Possible values: <code>true</code> or <code>false</code> Default is <code>true</code></td>
		</tr>
		<tr>
			<td><code>localeStr</code></td>
			<td><b>Optional</b></code> - String for country-specific formatting of numbers. Possible values: see <a href="https://tools.ietf.org/html/rfc5646">Tags for Identifying Languages</a> Default is <code>'de-DE'</code></td>
		</tr>
		<tr>
			<td><code>warnColor</code></td>
			<td><b>Optional</b></code> - sets the warning color. This value only applies if a value is out of threshold and a warning option is set. Possible values: <code>'red'</code>, <code>'green'</code>, <code>'blue'</code>, <code>'yellow'</code>, <code>'white'</code> Default is <code>'red'</code></td>
		</tr>
		<tr>
			<td><code>devices</code></td>
			<td><b>Required</b> - Add all your devices that should appear in the MagicMirror. Each device must include the following properties:
				<table width="100%">
					<thead>
						<tr>
							<th>Option</th>
							<th width="100%">Description</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>id</code></td>
							<td>The unique <code>ise_id</code> to identify the device. All ids can be extracted by calling the following URL of the installed XML-API addon: <code>http://ccu2IP/xmlapiURL/devicelist.cgi</code></td>
						</tr>
						<tr>
							<td><code>label</code></td>
							<td>The label for the device (i.e.: Living Room). If not present or empty, the internal device name is shown instead.</td>
						</tr>
						<tr>
							<td><code>showSetTemperature</code></td>
							<td>Whether to show or to hide the target temperature. Default is <code>false</code></td>
						</tr>
						<tr>
							<td><code>showCurrentMode</code></td>
							<td>Whether to show or to hide the current state (i.e.: Heater off). Default is <code>true</code></td>
						</tr>	
						<tr>
							<td><code>showFaultReporting</code></td>
							<td>Whether to show or to hide any faults of the device (i.e.: Low battery warning). Default is <code>true</code></td>
						</tr>	
						<tr>
							<td><code>showHumidity</code> (only available for wall thermostats)</td>
							<td>Whether to show or to hide the humidity. Default is <code>true</code></td>
						</tr>	
						<tr>
							<td><code>precisionTemp</code></td>
							<td>Decimal places for temperature values. Default is <code>2</code></td>
						</tr>	
						<tr>
							<td><code>precisionHum</code></td>
							<td>Decimal places for humidity values. Default is <code>0</code></td>
						</tr>	
						<tr>
							<td><code>warnTempHigh</code></td>
							<td>Determines whether a warning is displayed when the temperature threshold <code>tempThresholdHigh</code> is exceeded (or equal) by displaying the value in <code>warnColor</code>. Default is <code>'false'</code></td>
						</tr>	
						<tr>
							<td><code>warnTempLow</code></td>
							<td>Determines whether a warning is displayed when the temperature falls below or is equal the threshold <code>tempThresholdLow</code> by displaying the value in <code>warnColor</code>. Default is <code>'false'</code></td>
						</tr>	
						<tr>
							<td><code>warnHumHigh</code></td>
							<td>Determines whether a warning is displayed when the humidity threshold <code>humThresholdHigh</code> is exceeded (or equal) by displaying the value in <code>warnColor</code>. Default is <code>'false'</code></td>
						</tr>	
						<tr>
							<td><code>warnHumLow</code></td>
							<td>Determines whether a warning is displayed when the humidity falls below or is equal the threshold <code>humThresholdLow</code> by displaying the value in <code>warnColor</code>. Default is <code>'false'</code></td>
						</tr>	
						<tr>
							<td><code>tempThresholdLow</code></td>
							<td>Temperature lower threshold. Default is <code>5</code></td>
						</tr>	
						<tr>
							<td><code>tempThresholdHigh</code></td>
							<td>Temperature upper threshold. Default is <code>24</code></td>
						</tr>	
						<tr>
							<td><code>humThresholdLow</code></td>
							<td>Humidity lower threshold. Default is <code>35</code></td>
						</tr>	
						<tr>
							<td><code>humThresholdHigh</code></td>
							<td>Humidity upper threshold. Default is <code>60</code></td>
						</tr>	
						</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>

## Troubleshooting
Make sure that the XML-API addon is working fine. If you've setup the XML-API addon and your HomeMatic central control unit (CCU2) with default values, you should be able to see a list of all your connected devices by clicking the following URL:<br> <a href="http://homematic-ccu2/config/xmlapi/devicelist.cgi" target="_blank">http://homematic-ccu2/config/xmlapi/devicelist.cgi</a><br>
Is everything fine, it should look like:<br>
<img src="https://cloud.githubusercontent.com/assets/26480749/24081489/198aa8ea-0cb5-11e7-93fb-dd43a14b1883.png" height="150"/>

## Side notes
<ul>
<li>The requests via the XML-API addon does not require a login! If your HomeMatic control central unit is accessible without special protection via the Internet, this can be a serious security issue!
</li>
<li>The XML-API does not currently support the following information: Temperature offset, window open detection, descaling, keylock and some more parameter</li>
<li>What is the percentage in the mode? Example:<br>
<img src="https://cloud.githubusercontent.com/assets/26480749/24070974/b20444bc-0bc7-11e7-8f7f-88a9cc1f64ef.png" height="30"/><br>
It shows the current valve state of the device.</li>
</ul>

## Next steps
I'm planning to implement my HomeMatic window handles with the module to show the window state (open, closed). The window handles are of type <a href="http://amzn.to/2mCxxjU" target="_blank">HM-Sec-RHS</a>.

## Notice
There is a very good Magic Mirror Module <a href="https://github.com/Sickboy78/MMM-Homematic">MMM-Homematic</a> for displaying individual values (windows open or closed, energy consumption of washing machine, ...) or system variables.</br><br/>
<img src="https://github.com/Sickboy78/MMM-Homematic/blob/master/screenshot.png" height="150"/>

## Further information
* <a href="http://www.homematic.com/" target="_blank">homematic.com</a> - HomeMatic website 
* <a href="https://www.homematic-inside.de/" target="_blank">homematic-inside.de</a> - Best HomeMatic community (blogs, tipps, addons,...)
* <a href="https://www.homematic-forum.de/" target="_blank">homematic-forum.de</a> - Forum to get help
* <a href="https://www.homematic-inside.de/software/download/item/homematic-skript" target="_blank">HomeMatic script documentation / specification</a>
* <a href="https://www.homematic-inside.de/software/addons/item/xmlapi" target="_blank">XML-API section on homematic-inside.de</a>
*  <a href="https://wiki.fhem.de/wiki/HM-CC-RT-DN_Funk-Heizk%C3%B6rperthermostat" target="_blank">FHEM wiki for HM-CC-RT-DN</a> - All information about the device type (German only)
