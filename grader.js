#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

  + cheerio
    - https://github.com/MatthewMueller/cheerio
    - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
    - http://maxogden.com/scraping-with-node.html

  + commander.js
    - https://github.com/visionmedia/commander.js
    - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

  + JSON
    - http://en.wikipedia.org/wiki/JSON
    - https://developer.mozilla.org/en-US/docs/JSON
    - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var util = require('util');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
	
var assertFileExists = function(infile) {
  var instr = infile.toString();

  if (!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

var loadChecksFile = function(checksFile) {
  return JSON.parse(fs.readFileSync(checksFile));
};

var checkContent = function(cheerioContent, checks) {
  var out = {};

  for (var ii in checks) {
    var present = cheerioContent(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function(fn) {
  // Workaround for commander.js issue
  // http://stackoverflow/a/6772648
  return fn.bind({});
};

var loadFromUrl = function(url, callback) {
  restler.get(url).on('complete', callback);
};

var makeResponseHandler = function(checks) {
  var handleResponse = function(result, response) {
    if (result instanceof Error) {
      console.error('Error: ' + util.format(response.message));
    }
    else {
      handleContent(result, checks);
    }
  };

  return handleResponse;
};

var handleContent = function(htmlString, checks) {
  var cheerioContent = cheerio.load(htmlString);
  var checkJson = checkContent(cheerioContent, checks);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
};


if (require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_path>', 'Url path')
    .parse(process.argv);

  var checks = loadChecksFile(program.checks);

  if (program.url) {
    var responseHandler = makeResponseHandler(checks);
    loadFromUrl(program.url, responseHandler);
  }
  else {    
    handleContent(fs.readFileSync(program.file), checks);
  }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
