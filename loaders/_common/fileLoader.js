/** different from the loader that
 * it exports the files in object not an array */

const path = require("path");
const glob = require("glob");

/**
 * load any file that match the pattern of function file and require them
 * @return an array of the required functions
 */
module.exports = (pattern) => {
  let files = glob.sync(pattern);
  const modules = {}; /** <--- not array */
  files.forEach((p) => {
    let key = p.split("/").pop().split(".").shift();
    key = key.charAt(0).toLowerCase() + key.slice(1);
    modules[key] = require(path.resolve(p));
  });
  return modules;
};
