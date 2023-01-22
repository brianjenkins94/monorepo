export function sleep(ms) {
	return new Promise<void>(function(resolve, reject) {
		setTimeout(function() {
			resolve();
		}, ms);
	});
}
