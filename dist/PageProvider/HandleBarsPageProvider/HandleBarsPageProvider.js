"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _handlebars = _interopRequireDefault(require("handlebars"));
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class HandleBarsSpageProvider {
  async parse({
    file,
    variables
  }) {
    const template = await _fs.default.promises.readFile(file, {
      encoding: "utf-8"
    });
    const parsedTemplate = _handlebars.default.compile(template);
    return parsedTemplate(variables);
  }
}
var _default = HandleBarsSpageProvider;
exports.default = _default;