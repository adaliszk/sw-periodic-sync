
/**
 * Syncronizations
 *
 * this is a basic serviceWorker syncronization example
 *
 * @author Ádám Liszkai <contact@liszkaiadam.hu>
 * @category serviceWorker
 */
self.addEventListener('sync', function(event)
{
	//console.debug('serviceWorker::sync:event', event);
	event.waitUntil( debugConsole( event.tag ) );
});

function debugConsole( tagName )
{
	console.log(tagName+" fired in serviceWorker...");
	return true;
}
