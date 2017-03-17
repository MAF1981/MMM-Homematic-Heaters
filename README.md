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
* <a href="https://github.com/hobbyquaker/XML-API">XML-API addon</a><br/>The XML-API addon must be installed on your Homematic central control unit (CCU1 / CCU2). 
* <a href="https://github.com/jindw/xmldom">xmldom</a><br/>The xmldom DOMParser and XMLSerializer must be installed for node.js

## Installation
In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/MAF1981/MMM-Homematic-Heaters
````

Configure the module in your `config.js` file.

