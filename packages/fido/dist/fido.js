import "./chunk-NIMBE7W3.js";

// fido.ts
import Bottleneck from "bottleneck/light";
import * as util from "util";
var limiter = new Bottleneck({
  "reservoir": 100,
  "reservoirRefreshAmount": 100,
  "reservoirRefreshInterval": 1e5
});
limiter.on("failed", function(error, { retryCount }) {
  if (retryCount < 2) {
    return 2 ** (retryCount + 1) * 1e3;
  }
  return void 0;
});
function flush(buffer, callback) {
  for (let x = 0; x < buffer.length; x++) {
    if (x % 2 === 0) {
      callback("--> " + buffer[x].join("\n--> "));
    } else {
      callback("\n<-- " + buffer[x].join("\n<-- ") + "\n");
    }
  }
}
var SaxesParser;
async function parseXml(xmlString) {
  const parser = new SaxesParser();
  return new Promise(function(resolve, reject) {
    let object;
    let current;
    parser.on("error", function(error) {
      reject(error);
    });
    parser.on("text", function(text) {
      if (current !== void 0) {
        current.value += text;
      }
    });
    parser.on("opentag", function({ name, attributes }) {
      const element = {
        "name": name ?? "",
        "value": "",
        "attributes": attributes
      };
      if (current !== void 0) {
        element["parent"] = current;
        current["children"] ??= [];
        current.children.push(element);
      } else {
        object = element;
      }
      current = element;
    });
    parser.on("closetag", function() {
      if (current.parent !== void 0) {
        const previous = current;
        current = current.parent;
        delete previous.parent;
      }
    });
    parser.on("end", function() {
      resolve(object);
    });
    parser.write(xmlString).close();
  });
}
async function attemptParse(response) {
  let body;
  const contentType = response.headers?.get("Content-Type");
  if (contentType.endsWith("json")) {
    try {
      body = response.json();
    } catch (error) {
    }
  } else if (contentType.startsWith("text") && !contentType.endsWith("xml")) {
    body = response.text();
  } else if (SaxesParser !== null && contentType.endsWith("xml")) {
    try {
      SaxesParser ??= (await import("./saxes-OTTZVDBF.js"))["default"]["SaxesParser"];
      body = parseXml(await response.text());
    } catch (error) {
      SaxesParser = null;
    }
  }
  return body;
}
function extendedFetch(url, options) {
  return new Promise(function retry(resolve, reject) {
    const requestBuffer = [];
    if (options["debug"]) {
      requestBuffer.push(options.method.toUpperCase() + " " + url);
    }
    if (options["headers"]?.["Content-Type"] !== void 0) {
      if (options["debug"]) {
        for (const header of ["Content-Type"]) {
          if (options.headers[header] !== void 0) {
            requestBuffer.push(header + ": " + options.headers[header]);
          }
        }
      }
      if (options["headers"]["Content-Type"].endsWith("json") && typeof options.body === "object") {
        if (options["debug"]) {
          requestBuffer.push(...util.inspect(options.body, { "compact": false }).split("\n"));
        }
        options.body = JSON.stringify(options.body);
      }
    }
    limiter.schedule(function() {
      const responseBuffer = [];
      return fetch(url, options).then(async function(response) {
        if (options["debug"]) {
          responseBuffer.push("HTTP " + String(response.status) + " " + response.statusText);
          for (const header of ["Content-Length", "Content-Type", "Server", "X-Powered-By"]) {
            if (response.headers.has(header)) {
              responseBuffer.push(header + ": " + response.headers.get(header));
            }
          }
        }
        if (response.status >= 400 && response.status < 500 && options.method === "get") {
          responseBuffer.push("Request failed with " + String(response.status) + " " + response.statusText + ". Retrying...");
          throw new Error();
        } else {
          const body = await attemptParse(response);
          if (body !== void 0) {
            responseBuffer.push(...util.inspect(body, { "compact": false }).split("\n"));
          }
          resolve({
            "response": response,
            "body": body
          });
        }
        flush([requestBuffer, responseBuffer], console.log);
      }).catch(function(error) {
        if (options["debug"]) {
          responseBuffer.push(error.toString());
        }
        flush([requestBuffer, responseBuffer], console.log);
        throw new Error(error);
      });
    });
  });
}
var fido = {};
for (const method of ["get", "post", "put", "delete"]) {
  fido[method] = async function(url, query = {}, options = {}) {
    url = new URL(url);
    if (!Object.values(query).every(function(value) {
      return typeof value !== "object";
    })) {
      options = query;
      query = {};
    }
    query = {
      ...Object.fromEntries(new URLSearchParams(url.search)),
      ...query
    };
    if (Object.entries(query).length > 0) {
      url.search = new URLSearchParams(query);
    }
    if (options["body"] !== void 0) {
      if (method === "get") {
        throw new Error("That's illegal.");
      } else if (options["headers"]?.["Content-Type"] === void 0) {
        throw new Error("`Content-Type` is required when providing a payload.");
      }
    }
    const { response, body } = await extendedFetch(new URL(url).toString(), {
      ...options,
      "debug": options["debug"] ?? process.env["NODE_ENV"] !== "production",
      "method": method
    });
    return {
      "response": response,
      "body": body
    };
  };
}
fido.poll = function(url, query = {}, options = {}, condition = async function(response, body) {
  return Promise.resolve(response.ok);
}) {
  url = new URL(url);
  if (typeof query === "function") {
    condition = query;
    query = {};
    options = {};
  } else if (typeof options === "function") {
    condition = options;
    options = {};
  }
  if (!Object.values(query).every(function(value) {
    return typeof value !== "object";
  })) {
    options = query;
    query = {};
  }
  query = {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ...Object.fromEntries(new URLSearchParams(url.search)),
    ...query
  };
  if (Object.entries(query).length > 0) {
    url.search = new URLSearchParams(query);
  }
  if (options["body"] !== void 0) {
    throw new Error("That's illegal.");
  }
  return new Promise(async function(resolve, reject) {
    const { response, body } = await fido.get(new URL(url).toString(), options);
    if (await condition(response, body)) {
      resolve({
        "response": response,
        "body": body
      });
    } else {
      throw new Error();
    }
  });
};
export {
  fido
};
