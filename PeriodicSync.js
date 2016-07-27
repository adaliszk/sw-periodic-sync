
if(typeof ServiceWorkerRegistration.prototype.periodicSync == 'undefined')
{
	/**
	 * SyncManager object
	 *
	 * Using a dedicated worker for the periodic syncronizations
	 *
	 * @author: Adam Liszkai <contact@liszkaiadam.hu>
	 * @url: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncManager
	 */
	class PeriodicSyncManager
	{
		constructor()
		{
			this.minPossiblePeriod = 250;
			
			window.periodicSyncManager = {};
			
			window.periodicSyncManager.events = {};
			window.periodicSyncManager.syncs = {};
			
			window.periodicSyncManager.worker = new Worker('PeriodicSyncWorker.js');
			window.periodicSyncManager.worker.addEventListener('message', this._onMessage);
		}
		
		_onMessage( event )
		{
			if( event.data.type == 'dispatchEvent' )
				document.dispatchEvent(window.periodicSyncManager.events[event.data.tag]);
		}
		
		register( registerOptions )
		{
			let options = {};
			
			options.tag = registerOptions.tag || registerOptions;
			options.minPeriod = registerOptions.minPeriod || this.minPossiblePeriod;
			options.networkState = registerOptions.networkState || 'online';
			options.powerState = registerOptions.powerState || 'auto';
			
			return new Promise(function PeriodicSyncManagerRegistration(resolve, reject)
			{
				window.periodicSyncManager.worker.postMessage({method: 'register', options: options});
				window.periodicSyncManager.worker.addEventListener('message', function(event)
				{
					if( event.data.type == 'register' )
					{
						if( event.data.tag === options.tag )
						{
							if( event.data.success == false ) reject( event.data.error );
							else
							{
								let registration = new PeriodicSyncRegistration( options );
							
								window.periodicSyncManager.syncs[options.tag] = registration;
								window.periodicSyncManager.events[options.tag] = new CustomEvent( 'sync-'+options.tag, registration );
								
								resolve( window.periodicSyncManager.syncs[options.tag] );
							}
							
							//event.target.removeEventListener(event.type, arguments.callee);
						}
					}
				});
			});
		}
		
		_unregister( tagName )
		{
			return new Promise(function PeriodicSyncManagerUnRegistration(resolve, reject)
			{
				window.periodicSyncManager.worker.postMessage({method: 'unregister', tag: tagName});
				window.periodicSyncManager.worker.addEventListener('message', function(event)
				{
					if( event.data.type == 'unregister' )
					{
						if( event.data.tag === tagName )
						{
							if( event.data.success == false ) reject( '@todo' );
							else resolve();
							
							//event.target.removeEventListener(event.type, PeriodicSyncManagerUnRegistration);
						}
					}
				});
			});
		}
		
		getRegistration( tagName )
		{
			return new Promise(function PeriodicSyncManagerGetRegistration(resolve, reject)
			{
				let registration = window.periodicSyncManager.syncs[tagName];
				resolve( registration );
			});
		}
		
		getRegistrations()
		{
			return new Promise(function PeriodicSyncManagerGetRegistrations(resolve, reject)
			{
				resolve( window.periodicSyncManager.syncs );
			});
		}
		
		permissionState()
		{
			return new Promise(function PeriodicSyncManagerPermissionState(resolve, reject)
			{
				resolve( false )
			});
		}
	}
	
	/**
	 * Registration object
	 *
	 * @author: Adam Liszkai <contact@liszkaiadam.hu>
	 * @url: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncRegistration
	 */
	class PeriodicSyncRegistration
	{
		constructor( options )
		{
			this.tag = options.tag;
			this.minPeriod = options.minPeriod;
			this.networkState = options.networkState;
			this.powerState = options.powerState;
		}
		
		unregister()
		{
			let $this = this;
			return navigator.serviceWorker.ready.then(function(swRegistration)
			{
				return swRegistration.periodicSync._unregister( $this.tag );
			});
		}
	}
	
	ServiceWorkerRegistration.prototype.periodicSync = new PeriodicSyncManager();
}
