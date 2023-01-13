export function sleep(duration) {
	return new Promise<void>(function(resolve, reject) {
		setTimeout(function() {
			resolve();
		}, duration);
	});
}
