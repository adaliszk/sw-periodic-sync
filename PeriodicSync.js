
if(typeof ServiceWorkerRegistration.prototype.periodicSync == 'undefined')
{
	/**
	 * SyncManager object
	 *
	 * Using a dedicated worker for the periodic syncronizations
	 *
	 * @author: Ádám Liszkai <contact@liszkaiadam.hu>
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
			
			window.periodicSyncManager.worker = new Worker('psWorker.js');
			window.periodicSyncManager.worker.addEventListener('message', this._onMessage.bind(this));
			
			if( typeof navigator.getBattery != 'undefined' )
			{
				navigator.getBattery().then(this._bindBatteryEvents.bind(this));
			}
		}
		
		_onMessage( event )
		{
			// Handing sync events and triggering serviceWorker
			if( event.data.type == 'dispatchEvent' )
			{
				// Dispatching Periodic Sync Event
				document.dispatchEvent(window.periodicSyncManager.events[event.data.tag]);
				
				// Triggering serviceWorker background syncronization
				navigator.serviceWorker.ready.then(function(swRegistration) {
					return swRegistration.sync.register(event.data.tag);
				});
			}
			
			// Responding the battery data if available
			if( event.data.type == 'requestBatteryInformation' )
			{
				this._postBatteryInformation();
			}
		}
		
		_bindBatteryEvents( battery )
		{
			battery.addEventListener('chargingchange', this._onBatteryCargingChange.bind(this));
		}
		
		_onBatteryCargingChange( event )
		{
			this._postBatteryInformation();
		}
		
		_postBatteryInformation()
		{
			if( typeof navigator.getBattery != 'undefined' )
			{
				navigator.getBattery().then(function(battery)
				{
					let batteryInformation = {};
						batteryInformation.charging = battery.charging;
						batteryInformation.chargingTime = battery.chargingTime;
						batteryInformation.dischargingTime = battery.dischargingTime;
						batteryInformation.level = battery.level;
							
					window.periodicSyncManager.worker.postMessage({battery: batteryInformation});
				});
			}
		}
		
		register( registerOptions )
		{
			let options = {};
			
			options.tag = registerOptions.tag || registerOptions;
			options.networkState = registerOptions.networkState || 'online';
			options.powerState = registerOptions.powerState || 'auto';
			options.allowOnBattery = registerOptions.allowOnBattery || true,
			options.idleRequired = options.idleRequired || false,
			options.maxDelay = registerOptions.maxDelay || Infinity;
			options.minDelay = registerOptions.minDelay || this.minPossiblePeriod;
			options.minPeriod = registerOptions.minPeriod || this.minPossiblePeriod;
			
			return new Promise(function PeriodicSyncManagerRegistration(resolve, reject)
			{
				function onRegisterMessage( event )
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
							window.periodicSyncManager.worker.removeEventListener('message', onRegisterMessage);
						}
					}
				}
			
				window.periodicSyncManager.worker.postMessage({method: 'register', options: options});
				window.periodicSyncManager.worker.addEventListener('message', onRegisterMessage);
			});
		}
		
		_unregister( tagName )
		{
			return new Promise(function PeriodicSyncManagerUnRegistration(resolve, reject)
			{
				function onUnregisterMessage( event )
				{
					if( event.data.type == 'unregister' )
					{
						if( event.data.tag === tagName )
						{
							if( event.data.success == false ) reject( '@todo' );
							else resolve();
							
							//event.target.removeEventListener(event.type, PeriodicSyncManagerUnRegistration);
							window.periodicSyncManager.worker.removeEventListener('message', onUnregisterMessage);
						}
					}
				}
			
				window.periodicSyncManager.worker.postMessage({method: 'unregister', tag: tagName});
				window.periodicSyncManager.worker.addEventListener('message', onUnregisterMessage);
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
				resolve( true );
			});
		}
	}
	
	/**
	 * Registration object
	 *
	 * @author: Ádám Liszkai <contact@liszkaiadam.hu>
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
