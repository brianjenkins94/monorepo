// sleep.ts
function sleep(duration) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, duration);
  });
}
export {
  sleep
};
