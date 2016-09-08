'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A command-line interface for transforming HTML into Markdown.
 *
 * @public
 */
var CLI = function () {
  (0, _createClass3.default)(CLI, null, [{
    key: 'ENCODING',


    /**
     * The character set encoding to be used to read/write files.
     *
     * @return {string} The charset encoding.
     * @public
     * @static
     */
    get: function get() {
      return 'utf8';
    }

    /**
     * Creates an instance of {@link CLI} using the specified <code>europa</code> instance and the <code>input</code> and
     * <code>output</code> streams provided.
     *
     * @param {Europa} europa - the {@link Europa} to be used
     * @param {Readable} input - the <code>Readable</code> from which to read the HTML to be transformed if no files or
     * evaluation string is provided
     * @param {Writable} output - the <code>Writable</code> to which the generated Markdown is to be written if no files
     * or output path is provided
     * @public
     */

  }]);

  function CLI(europa, input, output) {
    (0, _classCallCheck3.default)(this, CLI);

    /**
     * The {@link Europa} instance for this {@link CLI}.
     *
     * @private
     * @type {Europa}
     */
    this._europa = europa;

    /**
     * The input stream for this {@link CLI}.
     *
     * This is used to read the HTML to be transformed if no files or evaluation string is provided.
     *
     * @private
     * @type {Readable}
     */
    this._input = input;

    /**
     * The output stream for this {@link CLI}.
     *
     * This is used to write the generated Markdown if no files or output path is provided.
     *
     * @private
     * @type {Writable}
     */
    this._output = output;

    /**
     * The command for this {@link CLI}.
     *
     * @private
     * @type {Command}
     */
    this._program = _commander2.default.version(_package.version).usage('europa [options] [file ...]').option('-a, --absolute', 'use absolute URLs for anchors/images').option('-b, --base-uri <uri>', 'base URI for anchors/images').option('-e, --eval <html>', 'evaluate HTML string').option('-i, --inline', 'insert anchor/image URLs inline').option('-o, --output <path>', 'output directory (for files) or file (for eval/stdin)');
  }

  /**
   * Parses the specified <code>args</code> and determines what is to be transformed into Markdown and where the
   * generated Markdown is to be output.
   *
   * @param {string[]} args - the command-line arguments to be parsed
   * @return {void}
   * @public
   */


  (0, _createClass3.default)(CLI, [{
    key: 'parse',
    value: function parse() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      this._program.parse(args);

      var options = this._createTransformationOptions();

      if (this._program.eval) {
        this._readString(this._program.eval, options);
      } else if (this._program.args.length) {
        var files = _glob2.default.sync(this._program.args, {
          nodir: true,
          nosort: true
        });

        this._readFiles(files, options);
      } else {
        this._readInput(options);
      }
    }

    /**
     * Creates the options to be used for the transformation process based on the parsed command-line arguments.
     *
     * @return {Transformation~Options} The derived options.
     * @private
     */

  }, {
    key: '_createTransformationOptions',
    value: function _createTransformationOptions() {
      var _program = this._program;
      var absolute = _program.absolute;
      var baseUri = _program.baseUri;
      var inline = _program.inline;

      var options = { absolute: absolute, inline: inline };

      if (baseUri) {
        options.baseUri = baseUri;
      }

      return options;
    }

    /**
     * Transforms the specified HTML <code>files</code> into Markdown files based on the <code>options</code> provided.
     * The generated Markdown file will have the same names as the original <code>files</code> except that the file
     * extension will be <code>.md</code>.
     *
     * If a path has been specified via the <code>output</code> command-line option, then the generated Markdown files
     * will all be written to that directory. Otherwise, each file will be written to the same directory as the original
     * file.
     *
     * @param {string[]} files - the HTML files for which Markdown files are to be generated
     * @param {Transformation~Options} options - the options to be used
     * @return {void}
     * @private
     */

  }, {
    key: '_readFiles',
    value: function _readFiles(files, options) {
      if (!files.length) {
        return;
      }

      var output = this._program.output && _path2.default.normalize(this._program.output);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(files), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;

          var html = _fs2.default.readFileSync(file, CLI.ENCODING);
          var markdown = this._europa.transform(html, options);
          var targetDirectory = output || _path2.default.dirname(file);
          var targetFile = _path2.default.join(targetDirectory, _path2.default.basename(file, _path2.default.extname(file)) + '.md');

          _mkdirp2.default.sync(targetDirectory);

          _fs2.default.writeFileSync(targetFile, markdown, CLI.ENCODING);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Transforms the HTML read from the specified input stream into Markdown based on the <code>options</code> provided.
     *
     * If a path has been specified via the <code>output</code> command-line option, then the generated Markdown will be
     * written to that file. Otherwise, it will be written to the specified output stream.
     *
     * @param {Transformation~Options} options - the options to be used
     * @return {void}
     * @private
     */

  }, {
    key: '_readInput',
    value: function _readInput(options) {
      var _this = this;

      var buffer = [];
      var reader = _readline2.default.createInterface({
        input: this._input,
        output: this._output,
        terminal: false
      });

      reader.on('line', function (line) {
        buffer.push(line);
      });
      reader.on('close', function () {
        if (buffer.length) {
          _this._readString(buffer.join('\n'), options);
        }
      });
    }

    /**
     * Transforms the specified <code>html</code> into Markdown based on the <code>options</code> provided.
     *
     * If a path has been specified via the <code>output</code> command-line option, then the generated Markdown will be
     * written to that file. Otherwise, it will be written to the specified output stream.
     *
     * @param {string} html - the HTML to be transformed into Markdown
     * @param {Transformation~Options} options - the options to be used
     * @return {void}
     * @private
     */

  }, {
    key: '_readString',
    value: function _readString(html, options) {
      var markdown = this._europa.transform(html, options);

      if (this._program.output) {
        var target = _path2.default.normalize(this._program.output);
        var output = _path2.default.dirname(target);

        _mkdirp2.default.sync(output);

        _fs2.default.writeFileSync(target, markdown, CLI.ENCODING);
      } else {
        this._output.end(markdown, CLI.ENCODING);
      }
    }
  }]);
  return CLI;
}(); /*
      * Copyright (C) 2016 Alasdair Mercer, Skelp
      *
      * Permission is hereby granted, free of charge, to any person obtaining a copy
      * of this software and associated documentation files (the "Software"), to deal
      * in the Software without restriction, including without limitation the rights
      * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      * copies of the Software, and to permit persons to whom the Software is
      * furnished to do so, subject to the following conditions:
      *
      * The above copyright notice and this permission notice shall be included in all
      * copies or substantial portions of the Software.
      *
      * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      * SOFTWARE.
      */

exports.default = CLI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGkuanMiXSwibmFtZXMiOlsiQ0xJIiwiZXVyb3BhIiwiaW5wdXQiLCJvdXRwdXQiLCJfZXVyb3BhIiwiX2lucHV0IiwiX291dHB1dCIsIl9wcm9ncmFtIiwidmVyc2lvbiIsInVzYWdlIiwib3B0aW9uIiwiYXJncyIsInBhcnNlIiwib3B0aW9ucyIsIl9jcmVhdGVUcmFuc2Zvcm1hdGlvbk9wdGlvbnMiLCJldmFsIiwiX3JlYWRTdHJpbmciLCJsZW5ndGgiLCJmaWxlcyIsInN5bmMiLCJub2RpciIsIm5vc29ydCIsIl9yZWFkRmlsZXMiLCJfcmVhZElucHV0IiwiYWJzb2x1dGUiLCJiYXNlVXJpIiwiaW5saW5lIiwibm9ybWFsaXplIiwiZmlsZSIsImh0bWwiLCJyZWFkRmlsZVN5bmMiLCJFTkNPRElORyIsIm1hcmtkb3duIiwidHJhbnNmb3JtIiwidGFyZ2V0RGlyZWN0b3J5IiwiZGlybmFtZSIsInRhcmdldEZpbGUiLCJqb2luIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwid3JpdGVGaWxlU3luYyIsImJ1ZmZlciIsInJlYWRlciIsImNyZWF0ZUludGVyZmFjZSIsInRlcm1pbmFsIiwib24iLCJsaW5lIiwicHVzaCIsInRhcmdldCIsImVuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBRUE7Ozs7O0lBS01BLEc7Ozs7O0FBRUo7Ozs7Ozs7d0JBT3NCO0FBQ3BCLGFBQU8sTUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs7OztBQVdBLGVBQVlDLE1BQVosRUFBb0JDLEtBQXBCLEVBQTJCQyxNQUEzQixFQUFtQztBQUFBOztBQUNqQzs7Ozs7O0FBTUEsU0FBS0MsT0FBTCxHQUFlSCxNQUFmOztBQUVBOzs7Ozs7OztBQVFBLFNBQUtJLE1BQUwsR0FBY0gsS0FBZDs7QUFFQTs7Ozs7Ozs7QUFRQSxTQUFLSSxPQUFMLEdBQWVILE1B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IChDKSAyMDE2IEFsYXNkYWlyIE1lcmNlciwgU2tlbHBcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcHJvZ3JhbSBmcm9tICdjb21tYW5kZXInXG5pbXBvcnQgcmVhZGxpbmUgZnJvbSAncmVhZGxpbmUnXG5cbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tICcuLi9wYWNrYWdlLmpzb24nXG5cbi8qKlxuICogQSBjb21tYW5kLWxpbmUgaW50ZXJmYWNlIGZvciB0cmFuc2Zvcm1pbmcgSFRNTCBpbnRvIE1hcmtkb3duLlxuICpcbiAqIEBwdWJsaWNcbiAqL1xuY2xhc3MgQ0xJIHtcblxuICAvKipcbiAgICogVGhlIGNoYXJhY3RlciBzZXQgZW5jb2RpbmcgdG8gYmUgdXNlZCB0byByZWFkL3dyaXRlIGZpbGVzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBjaGFyc2V0IGVuY29kaW5nLlxuICAgKiBAcHVibGljXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHN0YXRpYyBnZXQgRU5DT0RJTkcoKSB7XG4gICAgcmV0dXJuICd1dGY4J1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaW5zdGFuY2Ugb2Yge0BsaW5rIENMSX0gdXNpbmcgdGhlIHNwZWNpZmllZCA8Y29kZT5ldXJvcGE8L2NvZGU+IGluc3RhbmNlIGFuZCB0aGUgPGNvZGU+aW5wdXQ8L2NvZGU+IGFuZFxuICAgKiA8Y29kZT5vdXRwdXQ8L2NvZGU+IHN0cmVhbXMgcHJvdmlkZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7RXVyb3BhfSBldXJvcGEgLSB0aGUge0BsaW5rIEV1cm9wYX0gdG8gYmUgdXNlZFxuICAgKiBAcGFyYW0ge1JlYWRhYmxlfSBpbnB1dCAtIHRoZSA8Y29kZT5SZWFkYWJsZTwvY29kZT4gZnJvbSB3aGljaCB0byByZWFkIHRoZSBIVE1MIHRvIGJlIHRyYW5zZm9ybWVkIGlmIG5vIGZpbGVzIG9yXG4gICAqIGV2YWx1YXRpb24gc3RyaW5nIGlzIHByb3ZpZGVkXG4gICAqIEBwYXJhbSB7V3JpdGFibGV9IG91dHB1dCAtIHRoZSA8Y29kZT5Xcml0YWJsZTwvY29kZT4gdG8gd2hpY2ggdGhlIGdlbmVyYXRlZCBNYXJrZG93biBpcyB0byBiZSB3cml0dGVuIGlmIG5vIGZpbGVzXG4gICAqIG9yIG91dHB1dCBwYXRoIGlzIHByb3ZpZGVkXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNvbnN0cnVjdG9yKGV1cm9wYSwgaW5wdXQsIG91dHB1dCkge1xuICAgIC8qKlxuICAgICAqIFRoZSB7QGxpbmsgRXVyb3BhfSBpbnN0YW5jZSBmb3IgdGhpcyB7QGxpbmsgQ0xJfS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge0V1cm9wYX1cbiAgICAgKi9cbiAgICB0aGlzLl9ldXJvcGEgPSBldXJvcGFcblxuICAgIC8qKlxuICAgICAqIFRoZSBpbnB1dCBzdHJlYW0gZm9yIHRoaXMge0BsaW5rIENMSX0uXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gcmVhZCB0aGUgSFRNTCB0byBiZSB0cmFuc2Zvcm1lZCBpZiBubyBmaWxlcyBvciBldmFsdWF0aW9uIHN0cmluZyBpcyBwcm92aWRlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge1JlYWRhYmxlfVxuICAgICAqL1xuICAgIHRoaXMuX2lucHV0ID0gaW5wdXRcblxuICAgIC8qKlxuICAgICAqIFRoZSBvdXRwdXQgc3RyZWFtIGZvciB0aGlzIHtAbGluayBDTEl9LlxuICAgICAqXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIHdyaXRlIHRoZSBnZW5lcmF0ZWQgTWFya2Rvd24gaWYgbm8gZmlsZXMgb3Igb3V0cHV0IHBhdGggaXMgcHJvdmlkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtXcml0YWJsZX1cbiAgICAgKi9cbiAgICB0aGlzLl9vdXRwdXQgPSBvdXRwdXRcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21tYW5kIGZvciB0aGlzIHtAbGluayBDTEl9LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Q29tbWFuZH1cbiAgICAgKi9cbiAgICB0aGlzLl9wcm9ncmFtID0gcHJvZ3JhbVxuICAgICAgLnZlcnNpb24odmVyc2lvbilcbiAgICAgIC51c2FnZSgnZXVyb3BhIFtvcHRpb25zXSBbZmlsZSAuLi5dJylcbiAgICAgIC5vcHRpb24oJy1hLCAtLWFic29sdXRlJywgJ3VzZSBhYnNvbHV0ZSBVUkxzIGZvciBhbmNob3JzL2ltYWdlcycpXG4gICAgICAub3B0aW9uKCctYiwgLS1iYXNlLXVyaSA8dXJpPicsICdiYXNlIFVSSSBmb3IgYW5jaG9ycy9pbWFnZXMnKVxuICAgICAgLm9wdGlvbignLWUsIC0tZXZhbCA8aHRtbD4nLCAnZXZhbHVhdGUgSFRNTCBzdHJpbmcnKVxuICAgICAgLm9wdGlvbignLWksIC0taW5saW5lJywgJ2luc2VydCBhbmNob3IvaW1hZ2UgVVJMcyBpbmxpbmUnKVxuICAgICAgLm9wdGlvbignLW8sIC0tb3V0cHV0IDxwYXRoPicsICdvdXRwdXQgZGlyZWN0b3J5IChmb3IgZmlsZXMpIG9yIGZpbGUgKGZvciBldmFsL3N0ZGluKScpXG4gIH1cblxuICAvKipcbiAgICogUGFyc2VzIHRoZSBzcGVjaWZpZWQgPGNvZGU+YXJnczwvY29kZT4gYW5kIGRldGVybWluZXMgd2hhdCBpcyB0byBiZSB0cmFuc2Zvcm1lZCBpbnRvIE1hcmtkb3duIGFuZCB3aGVyZSB0aGVcbiAgICogZ2VuZXJhdGVkIE1hcmtkb3duIGlzIHRvIGJlIG91dHB1dC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gYXJncyAtIHRoZSBjb21tYW5kLWxpbmUgYXJndW1lbnRzIHRvIGJlIHBhcnNlZFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBwYXJzZShhcmdzID0gW10pIHtcbiAgICB0aGlzLl9wcm9ncmFtLnBhcnNlKGFyZ3MpXG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fY3JlYXRlVHJhbnNmb3JtYXRpb25PcHRpb25zKClcblxuICAgIGlmICh0aGlzLl9wcm9ncmFtLmV2YWwpIHtcbiAgICAgIHRoaXMuX3JlYWRTdHJpbmcodGhpcy5fcHJvZ3JhbS5ldmFsLCBvcHRpb25zKVxuICAgIH0gZWxzZSBpZiAodGhpcy5fcHJvZ3JhbS5hcmdzLmxlbmd0aCkge1xuICAgICAgY29uc3QgZmlsZXMgPSBnbG9iLnN5bmModGhpcy5fcHJvZ3JhbS5hcmdzLCB7XG4gICAgICAgIG5vZGlyOiB0cnVlLFxuICAgICAgICBub3NvcnQ6IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuX3JlYWRGaWxlcyhmaWxlcywgb3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVhZElucHV0KG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIG9wdGlvbnMgdG8gYmUgdXNlZCBmb3IgdGhlIHRyYW5zZm9ybWF0aW9uIHByb2Nlc3MgYmFzZWQgb24gdGhlIHBhcnNlZCBjb21tYW5kLWxpbmUgYXJndW1lbnRzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUcmFuc2Zvcm1hdGlvbn5PcHRpb25zfSBUaGUgZGVyaXZlZCBvcHRpb25zLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NyZWF0ZVRyYW5zZm9ybWF0aW9uT3B0aW9ucygpIHtcbiAgICBjb25zdCB7IGFic29sdXRlLCBiYXNlVXJpLCBpbmxpbmUgfSA9IHRoaXMuX3Byb2dyYW1cbiAgICBjb25zdCBvcHRpb25zID0geyBhYnNvbHV0ZSwgaW5saW5lIH1cblxuICAgIGlmIChiYXNlVXJpKSB7XG4gICAgICBvcHRpb25zLmJhc2VVcmkgPSBiYXNlVXJpXG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIHRoZSBzcGVjaWZpZWQgSFRNTCA8Y29kZT5maWxlczwvY29kZT4gaW50byBNYXJrZG93biBmaWxlcyBiYXNlZCBvbiB0aGUgPGNvZGU+b3B0aW9uczwvY29kZT4gcHJvdmlkZWQuXG4gICAqIFRoZSBnZW5lcmF0ZWQgTWFya2Rvd24gZmlsZSB3aWxsIGhhdmUgdGhlIHNhbWUgbmFtZXMgYXMgdGhlIG9yaWdpbmFsIDxjb2RlPmZpbGVzPC9jb2RlPiBleGNlcHQgdGhhdCB0aGUgZmlsZVxuICAgKiBleHRlbnNpb24gd2lsbCBiZSA8Y29kZT4ubWQ8L2NvZGU+LlxuICAgKlxuICAgKiBJZiBhIHBhdGggaGFzIGJlZW4gc3BlY2lmaWVkIHZpYSB0aGUgPGNvZGU+b3V0cHV0PC9jb2RlPiBjb21tYW5kLWxpbmUgb3B0aW9uLCB0aGVuIHRoZSBnZW5lcmF0ZWQgTWFya2Rvd24gZmlsZXNcbiAgICogd2lsbCBhbGwgYmUgd3JpdHRlbiB0byB0aGF0IGRpcmVjdG9yeS4gT3RoZXJ3aXNlLCBlYWNoIGZpbGUgd2lsbCBiZSB3cml0dGVuIHRvIHRoZSBzYW1lIGRpcmVjdG9yeSBhcyB0aGUgb3JpZ2luYWxcbiAgICogZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gZmlsZXMgLSB0aGUgSFRNTCBmaWxlcyBmb3Igd2hpY2ggTWFya2Rvd24gZmlsZXMgYXJlIHRvIGJlIGdlbmVyYXRlZFxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybWF0aW9ufk9wdGlvbnN9IG9wdGlvbnMgLSB0aGUgb3B0aW9ucyB0byBiZSB1c2VkXG4gICAqIEByZXR1cm4ge3ZvaWR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVhZEZpbGVzKGZpbGVzLCBvcHRpb25zKSB7XG4gICAgaWYgKCFmaWxlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dCA9IHRoaXMuX3Byb2dyYW0ub3V0cHV0ICYmIHBhdGgubm9ybWFsaXplKHRoaXMuX3Byb2dyYW0ub3V0cHV0KVxuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICBjb25zdCBodG1sID0gZnMucmVhZEZpbGVTeW5jKGZpbGUsIENMSS5FTkNPRElORylcbiAgICAgIGNvbnN0IG1hcmtkb3duID0gdGhpcy5fZXVyb3BhLnRyYW5zZm9ybShodG1sLCBvcHRpb25zKVxuICAgICAgY29uc3QgdGFyZ2V0RGlyZWN0b3J5ID0gb3V0cHV0IHx8IHBhdGguZGlybmFtZShmaWxlKVxuICAgICAgY29uc3QgdGFyZ2V0RmlsZSA9IHBhdGguam9pbih0YXJnZXREaXJlY3RvcnksIGAke3BhdGguYmFzZW5hbWUoZmlsZSwgcGF0aC5leHRuYW1lKGZpbGUpKX0ubWRgKVxuXG4gICAgICBta2RpcnAuc3luYyh0YXJnZXREaXJlY3RvcnkpXG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmModGFyZ2V0RmlsZSwgbWFya2Rvd24sIENMSS5FTkNPRElORylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyB0aGUgSFRNTCByZWFkIGZyb20gdGhlIHNwZWNpZmllZCBpbnB1dCBzdHJlYW0gaW50byBNYXJrZG93biBiYXNlZCBvbiB0aGUgPGNvZGU+b3B0aW9uczwvY29kZT4gcHJvdmlkZWQuXG4gICAqXG4gICAqIElmIGEgcGF0aCBoYXMgYmVlbiBzcGVjaWZpZWQgdmlhIHRoZSA8Y29kZT5vdXRwdXQ8L2NvZGU+IGNvbW1hbmQtbGluZSBvcHRpb24sIHRoZW4gdGhlIGdlbmVyYXRlZCBNYXJrZG93biB3aWxsIGJlXG4gICAqIHdyaXR0ZW4gdG8gdGhhdCBmaWxlLiBPdGhlcndpc2UsIGl0IHdpbGwgYmUgd3JpdHRlbiB0byB0aGUgc3BlY2lmaWVkIG91dHB1dCBzdHJlYW0uXG4gICAqXG4gICAqIEBwYXJhbSB7VHJhbnNmb3JtYXRpb25+T3B0aW9uc30gb3B0aW9ucyAtIHRoZSBvcHRpb25zIHRvIGJlIHVzZWRcbiAgICogQHJldHVybiB7dm9pZH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWFkSW5wdXQob3B0aW9ucykge1xuICAgIGNvbnN0IGJ1ZmZlciA9IFtdXG4gICAgY29uc3QgcmVhZGVyID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKHtcbiAgICAgIGlucHV0OiB0aGlzLl9pbnB1dCxcbiAgICAgIG91dHB1dDogdGhpcy5fb3V0cHV0LFxuICAgICAgdGVybWluYWw6IGZhbHNlXG4gICAgfSlcblxuICAgIHJlYWRlci5vbignbGluZScsIChsaW5lKSA9PiB7XG4gICAgICBidWZmZXIucHVzaChsaW5lKVxuICAgIH0pXG4gICAgcmVhZGVyLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3JlYWRTdHJpbmcoYnVmZmVyLmpvaW4oJ1xcbicpLCBvcHRpb25zKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyB0aGUgc3BlY2lmaWVkIDxjb2RlPmh0bWw8L2NvZGU+IGludG8gTWFya2Rvd24gYmFzZWQgb24gdGhlIDxjb2RlPm9wdGlvbnM8L2NvZGU+IHByb3ZpZGVkLlxuICAgKlxuICAgKiBJZiBhIHBhdGggaGFzIGJlZW4gc3BlY2lmaWVkIHZpYSB0aGUgPGNvZGU+b3V0cHV0PC9jb2RlPiBjb21tYW5kLWxpbmUgb3B0aW9uLCB0aGVuIHRoZSBnZW5lcmF0ZWQgTWFya2Rvd24gd2lsbCBiZVxuICAgKiB3cml0dGVuIHRvIHRoYXQgZmlsZS4gT3RoZXJ3aXNlLCBpdCB3aWxsIGJlIHdyaXR0ZW4gdG8gdGhlIHNwZWNpZmllZCBvdXRwdXQgc3RyZWFtLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCAtIHRoZSBIVE1MIHRvIGJlIHRyYW5zZm9ybWVkIGludG8gTWFya2Rvd25cbiAgICogQHBhcmFtIHtUcmFuc2Zvcm1hdGlvbn5PcHRpb25zfSBvcHRpb25zIC0gdGhlIG9wdGlvbnMgdG8gYmUgdXNlZFxuICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlYWRTdHJpbmcoaHRtbCwgb3B0aW9ucykge1xuICAgIGNvbnN0IG1hcmtkb3duID0gdGhpcy5fZXVyb3BhLnRyYW5zZm9ybShodG1sLCBvcHRpb25zKVxuXG4gICAgaWYgKHRoaXMuX3Byb2dyYW0ub3V0cHV0KSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBwYXRoLm5vcm1hbGl6ZSh0aGlzLl9wcm9ncmFtLm91dHB1dClcbiAgICAgIGNvbnN0IG91dHB1dCA9IHBhdGguZGlybmFtZSh0YXJnZXQpXG5cbiAgICAgIG1rZGlycC5zeW5jKG91dHB1dClcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyh0YXJnZXQsIG1hcmtkb3duLCBDTEkuRU5DT0RJTkcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX291dHB1dC5lbmQobWFya2Rvd24sIENMSS5FTkNPRElORylcbiAgICB9XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBDTElcbiJdfQ==