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

var barcodescanner = require("./barcodescannerJNEXT").barcodescanner,
    _utils = require("../../lib/utils"),
    _deviceEvents = require("./deviceEvents"),
    _actionMap = {
        barcodeready: {
            context: _deviceEvents,
            event: "barcodeready",
            triggerEvent: "barcodeready",
            trigger: function (pluginResult, obj) {
                pluginResult.callbackOk(obj, true);
            }
        },
        frameavailable: {
          context: _deviceEvents,
          event: "frameavailable",
          triggerEvent: "frameavailable",
          trigger: function (pluginResult, obj) {
              pluginResult.callbackOk(obj, true);
          }  
        }
    },
    _listeners = {};

module.exports = {

	// methods to start and stop scanning
	startRead: function (success, fail, args, env) {
		var result = new PluginResult(args, env);
		var fresult = parseInt(barcodescanner.getInstance().startRead());
		
        if (fresult === 0) {
            result.ok(fresult, false);
        } else {
            result.error(fresult, false);
        }
	},
	stopRead: function (success, fail, args, env) {
		var result = new PluginResult(args, env);
		var fresult = parseInt(barcodescanner.getInstance().stopRead());
		
        if (fresult === 0) {
            result.ok(fresult, false);
        } else {
            result.error(fresult, false);
        }
	},
	startEvent: function (success, fail, args, env) {
        var result = new PluginResult(args, env),
            eventName = JSON.parse(decodeURIComponent(args.eventName)),
            context = _actionMap[eventName].context,
            systemEvent = _actionMap[eventName].event,
            listener = _actionMap[eventName].trigger.bind(null, result);
        if (!_listeners[eventName]) {
            _listeners[eventName] = {};
        }
        if (_listeners[eventName][env.webview.id]) {
            result.error("Underlying listener for " + eventName + " already running for webview " + env.webview.id);
        } else {
            context.addEventListener(systemEvent, listener);
            _listeners[eventName][env.webview.id] = listener;
            result.noResult(true);
        }
        },
    stopEvent: function (success, fail, args, env) {
        var result = new PluginResult(args, env),
            eventName = JSON.parse(decodeURIComponent(args.eventName)),
            listener = _listeners[eventName][env.webview.id],
            context = _actionMap[eventName].context,
            systemEvent = _actionMap[eventName].event;

        if (!listener) {
            result.error("Underlying listener for " + eventName + " never started for webview " + env.webview.id);
        } else {
            context.removeEventListener(systemEvent, listener);
            delete _listeners[eventName][env.webview.id];
            result.noResult(false);
        }
    },
    pauseRead: function(success, fail, args, env) {
        barcodescanner.getInstance().pauseRead();
        result.ok(0, false);
    },
    resumeRead: function(success, fail, args, env) {
        barcodescanner.getInstance().resumeRead();
        result.ok(0, false);
    }
};