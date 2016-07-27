var intervals = {};
self.addEventListener('message', function(event)
{
	if( event.data.method == 'register' )
	{
		let options = event.data.options;
		console.debug('periodicSync::message:event.data', event.data);
		
		switch(options.tag)
		{
			case "test":
				let callback = syncData('syncFeladatok','feladatok','id_feladat');
				break;
		}
			
		if( typeof callback == 'function' )
		{
			// If already registered then override the old registration
			if(typeof intervals[options.tag] != 'undefined') clearInterval(intervals[options.tag]);
				
			// Creating an interval for simulating the backgorund sync
			intervals[options.tag] = setInterval(callback, options.minPeriod);
				
			//callback(); // Calling the function for the first time
				
			// Sending the success message
			self.postMessage({type:'register',tag:options.tag,success:true});
		}
		else
		{
			// Sending the failure
			self.postMessage({type:'register',tag:options.tag,success:false,error:'Empty syncronize Function'});
		}
	}
});

