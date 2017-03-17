# MagicMirror Module: MMM-Homematic-Heaters
A MagicMirror Module for your radio controlled Homematic (eQ-3) radiator thermostats: <b>HM-CC-RT-DN</b>

### The module displays the following information:

* The name of the heater
* The current temperature
* The target temperature
* The current mode
* The fault reporting (i.e. low battery), if any

## Pre-requisites
The following additional tools are required and must be installed to be able to display the information:
* <a href="https://github.com/hobbyquaker/XML-API" target="_blank" title="XML-API for CCU2">XML-API addon</a><br/>The XML-API addon must be installed on your Homematic central control unit (CCU1 / CCU2). 
* <a href="https://github.com/jindw/xmldom" target="_blank" title="xmldom for node.js">xmldom</a><br/>The xmldom DOMParser and XMLSerializer must be installed for node.js

## Installation
In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/MAF1981/MMM-Homematic-Heaters
````

Configure the module in your `config.js` file as followed.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
 {
    module: 'MMM-Homematic-Heaters',
    header: 'Myhome: Heaters', //The headline for the section
    position: 'top_left', // This can be any of the regions.
    config: {
      devices: [
        {
         id: '1241',
         label: 'Kid\'s Room',
         showSetTemperature: false,
         showCurrentMode: true,
         showFaultReporting: true
        },
        {
         id: '1342',
         label: 'Living Room',
         showSetTemperature: false,
         showCurrentMode: true,
         showFaultReporting: true
        }
        //Add all your devices you want to show
      ],
      ccu2IP: '127.0.0.1',
      xmlapiURL: 'config/xmlapi',
      updateInterval: 120000
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
      <td><code>devices</code></td>
      <td><b>Required</b> - Add all your devices that should appear in the MagicMirror. Each device must include the following properties:      <table width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th width="100%">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
           <td><code>id</code></td>
           <td>The unique <code>ise_id</code> to identify the device. All ids can be extracted by calling the following URL of the XML-API addon: <code>http://ccu2IP/xmlapiURL/devicelist.cgi</code></td>
          </tr>
          <tr>
           <td><code>label</code></td>
           <td>The label for the device (i.e.: Living Room). If not present or empty the internal device name will shown.</td>
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
        </tbody>
      </table>
      </td>
		</tr>
    <tr>
			<td><code>ccu2IP</code></td>
			<td><b>Optional</b></code> - The IP address of your Homematic central control unit.
<br/>If not set, the default is: <code>homematic-ccu2</code></td>
		</tr>
        <tr>
			<td><code>xmlapiURL</code></td>
			<td><b>Optional</b></code> - The URL to the XML-API addon on your Homematic central control unit. Is appended to <code>ccu2IP</code>.<br/>If not set, the default is: <code>config/xmlapi</code></td>
		</tr>
        <tr>
            <td><code>updateInterval</code></td>
            <td><b>Optional</b></code> - The update interval in milliseconds.<br/>
If not set, the default is: <code>300000</code> (5 minutes)</td>
        </tr>
	</tbody>
</table>
