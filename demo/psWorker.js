
var battery = null;
var network = null;

var intervals = {};
var pauseOnBattery = [];

/**
 * Handling messages
 * 
 * its handling messages from the main thread which is some time asking the battery information and adjusting the
 * intervals when it's needed
 * 
 * @project serviceWorker-PeriodicSync
 * @package adamos42/serviceWorker-PeriodicSync
 * @author Ádám Liszkai <contact@liszkaiadam.hu>
 * @category serviceWorker
 */
self.addEventListener('message', function(event)
{
	// If we received a request
	if( typeof event.data.method != 'undefined' )
	{
		// If need to register something we handle it
		if( event.data.method == 'register' )
		{
			let options = event.data.options;
			//console.debug('periodicSync::message:event.data', event.data);
		
			// If already registered then override the old registration
			if( typeof intervals[options.tag] != 'undefined' ) clearInterval(intervals[options.tag]);
			if( pauseOnBattery.indexOf(options.tag) != -1 ) delete pauseOnBattery[options.tag];
			
			// Creating an interval for simulating the backgorund sync
			intervals[options.tag] = setInterval(function() {
			
				var syncEvent = new CustomEvent('sync', {'detail': options});
				self.dispatchEvent(syncEvent);
			
				self.postMessage({type:'dispatchEvent',tag:options.tag});
			},
			options.minPeriod);
			
			// Adding pause if it is not allowed on battery mode
			if( options.allowOnBattery == false ) pauseOnBattery.push(options.tag);
			
			// Respoding the request
			self.postMessage({type:'register',tag:options.tag,success:true});
		}
		
		// If need to unregister something we simple delete the interval
		if( event.data.method == 'unregister' )
		{
			if(typeof intervals[event.data.tag] != 'undefined')
			{
				clearInterval(intervals[event.data.tag]);
				if( pauseOnBattery.indexOf(event.data.tag) != -1 ) delete pauseOnBattery[event.data.tag];
				delete intervals[event.data.tag];
			
				// Respoding the request
				self.postMessage({type:'unregister',tag:event.data.tag,success:true});
			}
		}
	}
	
	// If we received battery information
	if( typeof event.data.battery != 'undefined' )
	{
		if( battery == null )
		{
			// @todo: initialize battery timers
		}
		
		if( event.data.battery.charging == false )
		{
			for(let idx in pauseOnBattery)
			{
				let tag = pauseOnBattery[idx];
				if( typeof intervals[tag] != 'undefined' ) clearInterval(intervals[tag]);
			}
		}
		
		battery = event.data.battery;
	}
});
/* ----------------------------------------------------------------------------------------------------------------- */

/**
 * Internal syncronization
 * 
 * it works almost the same way as the serviceWorker syncronization method, only the sync event is just a CustomEvent
 * use it if you want bypass to the https security with untrusted origin. (for example private network api server)
 * 
 * @project serviceWorker-PeriodicSync
 * @package adamos42/serviceWorker-PeriodicSync
 * @author Ádám Liszkai <contact@liszkaiadam.hu>
 * @category serviceWorker
 */
self.addEventListener('sync', function(event)
{
	//console.debug('periodicSync::sync:event', event);
	switch(event.detail.tag)
	{
		case "test1":
			console.log("test1 fired in psWorker...");
			break;
			
		case "test2":
			console.log("test2 fired in psWorker...");
			break;
			
		case "test3":
			console.log("test3 fired in psWorker...");
			break;
			
		case "test4":
			console.log("test3 fired in psWorker...");
			break;
	}
});
/* ----------------------------------------------------------------------------------------------------------------- */

/**
 * Adding an internal interval to check the battery state
 *
 */
intervals['battery-info'] = setInterval(function()
{
	self.postMessage({type:'requestBatteryInformation'});
},
600000);

// Requesting first battery information if possible
self.postMessage({type:'requestBatteryInformation'});
/* ----------------------------------------------------------------------------------------------------------------- */
/* End of file: psWorker.js */
