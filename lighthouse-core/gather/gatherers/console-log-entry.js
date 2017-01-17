/**
 * @license
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Gathers console deprecation and intervention warnings logged by Chrome.
 */

'use strict';

const Gatherer = require('./gatherer');

class ConsoleLogEntry extends Gatherer {

  constructor() {
    super();
    this._logEntries = [];
    this._onConsoleEntryAdded = this.onConsoleEntry.bind(this);
  }

  onConsoleEntry(entry) {
    this._logEntries.push(entry);
  }

  beginConsoleMessageCollect(driver) {
    driver.on('Log.entryAdded', this._onConsoleEntryAdded);
    return driver.sendCommand('Log.enable');
  }

  endConsoleMessageCollect(driver) {
    driver.off('Log.entryAdded', this._onConsoleEntryAdded);
    return driver.sendCommand('Log.disable').then(_ => this._logEntries);
  }

  beforePass(options) {
    return this.beginConsoleMessageCollect(options.driver);
  }

  afterPass(options) {
    return this.endConsoleMessageCollect(options.driver).catch(err => {
      return {
        rawValue: -1,
        debugString: err.message
      };
    });
  }
}

module.exports = ConsoleLogEntry;
