
/*
* Copyright 2013 Research In Motion Limited.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin for connection
///////////////////////////////////////////////////////////////////

var barcodescanner,
callbackMap = {},
nativeMapEvents = {
	"community.barcodescanner.codefound.native" : "barcodeready",
	"community.barcodescanner.frameavailable.native" : "frameavailable"
};

JNEXT.BarcodeScanner = function () {
	var self = this,
		hasInstance = false;

	self.getId = function () {
		return self.m_id;
	};

	self.init = function () {
		if (!JNEXT.require("libBarcodeScanner")) {
			alert('could not load');
			return false;
		}

		self.m_id = JNEXT.createObject("libBarcodeScanner.BarcodeScannerJS");

		if (self.m_id === "") {
			return false;
		}

		JNEXT.registerEvents(self);
	};

	// ************************
	// Enter your methods here
	// ************************
	self.setCallback = function(eventname, callback) {
		callbackMap[eventname] = callback;
	};

	self.unsetCallback = function(eventname) {
		delete callbackMap[eventname];
	};

	self.startRead = function () {
		return JNEXT.invoke(self.m_id, "startRead");
	};
	self.stopRead = function () {
		return JNEXT.invoke(self.m_id, "stopRead");
	};
	self.pauRead = function() {
		JNEXT.invoke(self.m_id, "pauseRead");
	};
	self.resumeRead = function() {
		JNEXT.invoke(self.m_id, "resumeRead");
	};
	// Fired by the Event framework (used by asynchronous callbacks)
	self.onEvent = function (strData) {
		var arData = strData.split(" "),
            strEventDesc = arData[0],
            jsonData;

        if (callbackMap[nativeMapEvents[strEventDesc]]) {
            jsonData = arData.slice(1, arData.length).join(" ");
            callbackMap[nativeMapEvents[strEventDesc]](JSON.parse(jsonData));
        }
	};

	// ************************
	// End of methods to edit
	// ************************
	self.m_id = "";

	self.getInstance = function () {
		if (!hasInstance) {
			hasInstance = true;
			self.init();
		}
		return self;
	};

};

barcodescanner = new JNEXT.BarcodeScanner();

module.exports = {
	barcodescanner: barcodescanner
};
