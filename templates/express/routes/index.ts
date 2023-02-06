export function get(request, response) {
	response.render("pages/index");
}

// Example route with a URL parameter and middleware:
//import { json } from "express";
//
//export function post(path) {
//  return {
//      "path": path + "/:parameter",
//      "middleware": [
//          require("express").json()
//      ],
//      "callback": function(request, response) {
//          response.json({
//              "parameter": request.params["parameter"],
//              ...request.body
//          });
//      }
//  };
//}
