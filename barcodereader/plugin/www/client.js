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

var _self = {},
	_ID = "community.barcodereader",
	noop = function () {},
	execFunc = cordova.require("cordova/exec"),
	events = ["barcodeready"],
    channels = events.map(function (eventName) {
        var channel = cordova.addDocumentEventHandler(eventName),
            success = function (data) {
                channel.fire(data);
            },
            fail = function (error) {
                console.log("Error initializing " + eventName + " listener: ", error);
            };

        channel.onHasSubscribersChange = function () {
            if (this.numHandlers === 1) {
                execFunc(success, fail, _ID, "startEvent", {eventName: eventName});
            } else if (this.numHandlers === 0) {
                execFunc(noop, noop, _ID, "stopEvent", {eventName: eventName});
            }
        };
        return channel;
    });

	_self.startRead = function (success, fail) {

		if (reading === true) {
			return "Stop Scanning before scanning again";
		}
		blackberry.io.sandbox = false;
		reading = true;
		// Turn on prevent sleep, if it's in the app
		/*if (community.preventsleep) {
			if (!community.preventsleep.isSleepPrevented) {
				community.preventsleep.setPreventSleep(true);
				sleepPrevented = true;
			}
		}*/
		return execFunc(success, fail, _ID, "startRead", null);
	};

	_self.stopRead = function (success, fail) {
		
		reading = false;
		// Return sleep setting to original if changed.
		/*if (community.preventsleep) {
			if (sleepPrevented === true) {
				community.preventsleep.setPreventSleep(false);
				sleepPrevented = false;
			}
		}*/
		return execFunc(success, fail,_ID, "stopRead", null);
	};

	_self.pauseRead = function() {
		execFunc(noop,noop,_ID, "pauseRead", null);
	}

	_self.resumeRead = function() {
		execFunc(noop,noop,_ID, "resumeRead", null);
	}

	Object.defineProperty(_self, "canvas", {
      
      set: function (arg) {
        canvas = document.getElementById(arg);
        if (canvas === null) {
        	execFunc(noop, noop, _ID, "stopEvent", {eventName : 'frameavailable'});
        	displaying = false;
		}
		
		if (canvas !== null && displaying == false) {
			execFunc(function(data) {
			frameAvailable(data);
		}, function(error) {
			console.log("Error initializing frameavailable listener: ", error);
		}, _ID, "startEvent", {eventName : 'frameavailable'});
		}
     },
     get: function() {
     	if (canvas === null) {
     		return null;
     	}
    	return canvas.id;
     }
    });

	var reading, canvas, timeout, fs  = null;
	var fsSize = 1024 * 1024;
	var sleepPrevented = false;
	var displaying = false;
	function readFile(filename) {
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

		window.requestFileSystem(window.TEMPORARY, fsSize,
			function (fs) {
				fs.root.getFile(filename, {create: false},
					function (fileEntry) {
						fileEntry.file(function (file) {
							var reader = new FileReader();
							reader.onloadend = function (e) {
								var ctx = canvas.getContext("2d");
								var img = new Image();
								img.onload = function() {
									ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
									URL.revokeObjectURL(img.src);
									img.src = null;
								};
								img.src = e.target.result;
							};

							reader.readAsDataURL(file);
						}, errorHandler);
					}, errorHandler);
				});
	}

	function errorHandler(e) {
		var msg = '';

		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
			break;
			case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
			break;
			case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
			break;
			case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
			break;
			case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
			break;
			default:
			msg = 'Unknown Error';
			break;
		}

		console.log(msg);
	}

	function frameAvailable(data){
		latestFrame = data.frame;
		timeout = setTimeout(readFile, 4, latestFrame);
	}

module.exports = _self;
