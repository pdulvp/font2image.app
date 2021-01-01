/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/
var promiseq = {
  
    flat: function (array) {
        return [].concat.apply([], array);
    }
  
  };

  module.exports = promiseq;
