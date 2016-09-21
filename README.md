# serviceWorker Periodic Syncronization
Just a "polyfill" solution for the serviceWorker periodicSync. This code adding to the ServiceWorkerRegistration object
prototype the periodicSync method if not available.

This code is not complete yet, I just created and tested as a possible solution but I need to add moarh code for true
"polyfill" solution. I accept pull request if you have time and like this until the platform does it a better way!

### Sample usage when registering serviceWorker

```
navigator.serviceWorker.register('serviceWorker.js').then(swRegistration => {
	swRegistration.periodicSync.register({
		tag: 'something',
		powerState: 'auto',
		networkState: 'online',
		allowOnBattery: true,
		idleRequired: false,
		maxDelay: 60000,
		minDelay: 5000,
		minPeriod: 20000
	});
});
```

### Sample usage after registering serviceWorker
```
navigator.serviceWorker.ready.then(swRegistration => {
	swRegistration.periodicSync.register({
		tag: 'something',
		powerState: 'auto',
		networkState: 'online',
		allowOnBattery: true,
		idleRequired: false,
		maxDelay: 60000,
		minDelay: 5000,
		minPeriod: 20000
	});
});
```

### Synchronization event
When the periodicSync is fired the script will trigger a global event which is named after the registered periodic sync
in this format: ``sync-<tag>``
```
document.addEventListener('sync-something', function(event) {
	// do stuff...
});
```

### Unregister a synchronization
```
navigator.serviceWorker.ready.then(swRegistration => {
	swRegistration.periodicSync.getRegistration('something').then(registration => {
		registration.unregister();
	});
});
```

### Change a synchronization
The register will always delete the previnous synchronization settings and use the new one using the tag as a key.

## "Documentation"
* https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncManager
* https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncRegistration
* https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncEvent
