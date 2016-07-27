
var intervals = {};
self.addEventListener('message', function(event)
{
	if( event.data.method == 'register' )
	{
		let options = event.data.options;
		//console.debug('periodicSync::message:event.data', event.data);
		
		// If already registered then override the old registration
		if(typeof intervals[options.tag] != 'undefined') clearInterval(intervals[options.tag]);
		
		// Creating an interval for simulating the backgorund sync
		intervals[options.tag] = setInterval(function() {
			
			var syncEvent = new CustomEvent('sync', {'detail': options});
			self.dispatchEvent(syncEvent);
			
			self.postMessage({type:'dispatchEvent',tag:options.tag});
		},
		options.minPeriod);
		
		self.postMessage({type:'register',tag:options.tag,success:true});
	}
	
	if( event.data.method == 'unregister' )
	{
		if(typeof intervals[event.data.tag] != 'undefined')
		{
			clearInterval(intervals[event.data.tag]);
			delete intervals[event.data.tag];
			
			self.postMessage({type:'unregister',tag:event.data.tag,success:true});
		}
	}
});

self.addEventListener('sync', function(event)
{
	//console.debug('periodicSync::sync:event', event);
	switch(event.detail.tag)
	{
		case "test1":
			console.log("test1 fired...");
			break;
			
		case "test2":
			console.log("test2 fired...");
			break;
			
		case "test3":
			console.log("test3 fired...");
			break;
	}
});

