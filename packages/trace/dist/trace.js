// trace.ts
var NUMBER_OF_MILLISECONDS_IN_A_NANOSECOND = BigInt(1e6);
var count = 0;
function getId() {
  count += 1;
  return count;
}
var Span = class {
  name;
  id;
  parentId;
  duration;
  attributes;
  status;
  _start;
  constructor({ name, parentId, attributes = {}, startTime }) {
    this.name = name;
    this.parentId = parentId;
    this.duration = null;
    this.attributes = attributes;
    this.status = "Started" /* Started */;
    this.id = getId();
    this._start = startTime ?? process.hrtime.bigint();
  }
  stop(stopTime) {
    const end = stopTime ?? process.hrtime.bigint();
    const duration = (end - this._start) / NUMBER_OF_MILLISECONDS_IN_A_NANOSECOND;
    this.status = "Stopped" /* Stopped */;
    console.log(this.name + " - " + duration + " ms");
  }
  traceChild(name, attributes) {
    return new Span({ "name": name, "parentId": this.id, "attributes": attributes });
  }
  manualTraceChild(name, startTime, stopTime, attributes) {
    const span = new Span({ "name": name, "parentId": this.id, "attributes": attributes, "startTime": startTime });
    span.stop(stopTime);
  }
  setAttribute(key, value) {
    this.attributes[key] = String(value);
  }
  traceFunction(fn) {
    try {
      return fn();
    } finally {
      this.stop();
    }
  }
  async traceAsyncFunction(fn) {
    try {
      return await fn();
    } finally {
      this.stop();
    }
  }
};
function trace(name, parentId, attributes) {
  return new Span({ "name": name, "parentId": parentId, "attributes": attributes });
}
export {
  trace
};
