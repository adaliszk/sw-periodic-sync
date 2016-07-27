
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
			this._worker = new Worker('PeriodicSyncWorker.js');
			this._syncs = {};
		}
		
		register( registerOptions )
		{
			let $this = this;
			let options = {
				tag: registerOptions.tag || registerOptions,
				minPeriod: registerOptions.minPeriod || this.minPossiblePeriod,
				networkState: registerOptions.networkState || 'online',
				powerState: registerOptions.powerState || 'auto',
			};
			
			return new Promise(function PeriodicSyncManagerRegistration(resolve, reject)
			{
				$this._worker.postMessage({method: 'register', options: options});
				$this._worker.addEventListener('message', function(event)
				{
					if( event.data.type == 'register' )
					{
						if( event.data.tag === options.tag )
						{
							if( event.data.success == false ) reject( event.data.error );
							else
							{
								$this._syncs[options.tag] = new PeriodicSyncRegistration( options );
								resolve( $this._syncs[options.tag] );
							}
							
							//@todo: unregister event listener
							//event.target.removeEventListener(event.type, arguments.callee);
						}
					}
				});
			});
		}
		
		_unregister( tagName )
		{
			let $this = this;
			return new Promise(function PeriodicSyncManagerUnRegistration(resolve, reject)
			{
				$this._worker.postMessage({method: 'unregister', tag: tagName});
				$this._worker.addEventListener('message', function(event)
				{
					if( event.data.type == 'unregister' )
					{
						if( event.data.tag === tagName )
						{
							if( event.data.success == false ) reject( '@todo' );
							else resolve();
							
							//@todo: unregister event listener
							//event.target.removeEventListener(event.type, arguments.callee);
						}
					}
				});
			});
		}
		
		getRegistration( tagName )
		{
			let $this = this;
			
			return new Promise(function PeriodicSyncManagerGetRegistration(resolve, reject)
			{
				resolve( $this._syncs[tagName] );
			});
		}
		
		getRegistrations()
		{
			let $this = this;
			
			return new Promise(function PeriodicSyncManagerGetRegistrations(resolve, reject)
			{
				resolve( $this._syncs );
			});
		}
		
		permissionState()
		{
			let $this = this;
			
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
	
	// @todo: https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncEvent
	
	ServiceWorkerRegistration.prototype.periodicSync = new PeriodicSyncManager();
}
