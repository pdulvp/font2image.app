/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/
const fs = require('fs');
const fsq = require('./fsq');
const httpq = require('./httpq');

var cacheq = {
  
    fetchFile: function (host, url, cache) {
        if (!fsq.fileExists(cache)) {
            return httpq.downloadFile(host, url, cache);
        }
        return Promise.resolve(cache);
    }
}

module.exports = cacheq;
