(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, fs, os, path, ref, ref1, scrollInjectScript,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  path = require('path');

  os = require('os');

  scrollInjectScript = "<script>\n(function () {\n  var scriptTag = document.scripts[document.scripts.length - 1];\n  document.addEventListener('DOMContentLoaded',()=>{\n    var elem = document.createElement(\"span\")\n    try {\n      // Scroll to this current script tag\n      elem.style.width = 100\n      // Center the scrollY\n      elem.style.height = \"20vh\"\n      elem.style.marginTop = \"-20vh\"\n      elem.style.marginLeft = -100\n      elem.style.display = \"block\"\n      var par = scriptTag.parentNode\n      par.insertBefore(elem, scriptTag)\n      elem.scrollIntoView()\n    } catch (error) {}\n    try { elem.remove() } catch (error) {}\n    try { scriptTag.remove() } catch (error) {}\n  }, false)\n})();\n</script>";

  module.exports = AtomHtmlPreviewView = (function(superClass) {
    extend(AtomHtmlPreviewView, superClass);

    atom.deserializers.add(AtomHtmlPreviewView);

    AtomHtmlPreviewView.prototype.editorSub = null;

    AtomHtmlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.deserialize = function(state) {
      return new AtomHtmlPreviewView(state);
    };

    AtomHtmlPreviewView.content = function() {
      return this.div({
        "class": 'atom-html-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          var style;
          style = 'z-index: 2; padding: 2em;';
          _this.div({
            "class": 'show-error',
            style: style
          });
          return _this.div({
            "class": 'show-loading',
            style: style
          }, "Loading HTML");
        };
      })(this));
    };

    function AtomHtmlPreviewView(arg) {
      var filePath, handles;
      this.editorId = arg.editorId, filePath = arg.filePath;
      this.handleEvents = bind(this.handleEvents, this);
      AtomHtmlPreviewView.__super__.constructor.apply(this, arguments);
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
        this.tmpPath = this.getPath();
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(filePath);
            };
          })(this));
        }
      }
      handles = $("atom-pane-resize-handle");
      handles.on('mousedown', (function(_this) {
        return function() {
          return _this.onStartedResize();
        };
      })(this));
    }

    AtomHtmlPreviewView.prototype.onStartedResize = function() {
      this.css({
        'pointer-events': 'none'
      });
      return document.addEventListener('mouseup', this.onStoppedResizing.bind(this));
    };

    AtomHtmlPreviewView.prototype.onStoppedResizing = function() {
      this.css({
        'pointer-events': 'all'
      });
      return document.removeEventListener('mouseup', this.onStoppedResizing);
    };

    AtomHtmlPreviewView.prototype.serialize = function() {
      return {
        deserializer: 'AtomHtmlPreviewView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    AtomHtmlPreviewView.prototype.destroy = function() {
      if (typeof editorSub !== "undefined" && editorSub !== null) {
        return this.editorSub.dispose();
      }
    };

    AtomHtmlPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.trigger('title-changed');
      this.handleEvents();
      return this.renderHTML();
    };

    AtomHtmlPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var ref2, ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (ref2 = atom.workspace) != null ? (ref3 = ref2.paneForItem(_this)) != null ? ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            resolve();
            return _this.renderHTML();
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.editorForId = function(editorId) {
      var editor, i, len, ref2, ref3;
      ref2 = atom.workspace.getTextEditors();
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    AtomHtmlPreviewView.prototype.handleEvents = function() {
      var changeHandler, contextMenuClientX, contextMenuClientY;
      contextMenuClientX = 0;
      contextMenuClientY = 0;
      this.on('contextmenu', function(event) {
        contextMenuClientY = event.clientY;
        return contextMenuClientX = event.clientX;
      });
      atom.commands.add(this.element, {
        'atom-html-preview:open-devtools': (function(_this) {
          return function() {
            return _this.webview.openDevTools();
          };
        })(this),
        'atom-html-preview:inspect': (function(_this) {
          return function() {
            return _this.webview.inspectElement(contextMenuClientX, contextMenuClientY);
          };
        })(this),
        'atom-html-preview:print': (function(_this) {
          return function() {
            return _this.webview.print();
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var pane;
          _this.renderHTML();
          pane = atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      this.editorSub = new CompositeDisposable;
      if (this.editor != null) {
        if (atom.config.get("atom-html-preview.triggerOnSave")) {
          this.editorSub.add(this.editor.onDidSave(changeHandler));
        } else {
          this.editorSub.add(this.editor.onDidStopChanging(changeHandler));
        }
        return this.editorSub.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.trigger('title-changed');
          };
        })(this)));
      }
    };

    AtomHtmlPreviewView.prototype.renderHTML = function() {
      this.showLoading();
      if (this.editor != null) {
        if (!atom.config.get("atom-html-preview.triggerOnSave") && (this.editor.getPath() != null)) {
          return this.save(this.renderHTMLCode);
        } else {
          return this.renderHTMLCode();
        }
      }
    };

    AtomHtmlPreviewView.prototype.save = function(callback) {
      var column, editorText, error, fileEnding, findTagBefore, firstSelection, lastTagRE, offset, out, outPath, ref2, row, tagIndex, tagRE;
      outPath = path.resolve(path.join(os.tmpdir(), this.editor.getTitle() + ".html"));
      out = "";
      fileEnding = this.editor.getTitle().split(".").pop();
      if (atom.config.get("atom-html-preview.enableMathJax")) {
        out += "<script type=\"text/x-mathjax-config\">\nMathJax.Hub.Config({\ntex2jax: {inlineMath: [['\\\\f$','\\\\f$']]},\nmenuSettings: {zoom: 'Click'}\n});\n</script>\n<script type=\"text/javascript\"\nsrc=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\">\n</script>";
      }
      if (atom.config.get("atom-html-preview.preserveWhiteSpaces") && indexOf.call(atom.config.get("atom-html-preview.fileEndings"), fileEnding) >= 0) {
        out += "<style type=\"text/css\">\nbody { white-space: pre; }\n</style>";
      } else {
        out += "<base href=\"" + this.getPath() + "\">";
      }
      editorText = this.editor.getText();
      firstSelection = this.editor.getSelections()[0];
      ref2 = firstSelection.getBufferRange().start, row = ref2.row, column = ref2.column;
      if (atom.config.get("atom-html-preview.scrollToCursor")) {
        try {
          offset = this._getOffset(editorText, row, column);
          tagRE = /<((\/[\$\w\-])|br|input|link)\/?>/.source;
          lastTagRE = RegExp(tagRE + "(?![\\s\\S]*" + tagRE + ")", "i");
          findTagBefore = function(beforeIndex) {
            var matchedClosingTag;
            matchedClosingTag = editorText.slice(0, beforeIndex).match(lastTagRE);
            if (matchedClosingTag) {
              return matchedClosingTag.index + matchedClosingTag[0].length;
            } else {
              return -1;
            }
          };
          tagIndex = findTagBefore(offset);
          if (tagIndex > -1) {
            editorText = (editorText.slice(0, tagIndex)) + "\n" + scrollInjectScript + "\n" + (editorText.slice(tagIndex));
          }
        } catch (error1) {
          error = error1;
          return -1;
        }
      }
      out += editorText;
      this.tmpPath = outPath;
      return fs.writeFile(outPath, out, (function(_this) {
        return function() {
          try {
            return _this.renderHTMLCode();
          } catch (error1) {
            error = error1;
            return _this.showError(error);
          }
        };
      })(this));
    };

    AtomHtmlPreviewView.prototype.renderHTMLCode = function() {
      var error, webview;
      if (this.webview == null) {
        webview = document.createElement("webview");
        webview.setAttribute("sandbox", "allow-scripts allow-same-origin");
        webview.setAttribute("style", "height: 100%");
        this.webview = webview;
        this.append($(webview));
      }
      this.webview.src = this.tmpPath;
      try {
        this.find('.show-error').hide();
        this.find('.show-loading').hide();
        this.webview.reload();
      } catch (error1) {
        error = error1;
        null;
      }
      return atom.commands.dispatch('atom-html-preview', 'html-changed');
    };

    AtomHtmlPreviewView.prototype._getOffset = function(text, row, column) {
      var line_re, match, match_index, offset;
      if (column == null) {
        column = 0;
      }
      line_re = /\n/g;
      match_index = null;
      while (row--) {
        if (match = line_re.exec(text)) {
          match_index = match.index;
        } else {
          return -1;
        }
      }
      offset = match_index + column;
      if (offset < text.length) {
        return offset;
      } else {
        return -1;
      }
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return (this.editor.getTitle()) + " Preview";
      } else {
        return "HTML Preview";
      }
    };

    AtomHtmlPreviewView.prototype.getURI = function() {
      return "html-preview://editor/" + this.editorId;
    };

    AtomHtmlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    AtomHtmlPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.find('.show-error').html($$$(function() {
        this.h2('Previewing HTML Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      })).show();
    };

    AtomHtmlPreviewView.prototype.showLoading = function() {
      return this.find('.show-loading').show();
    };

    return AtomHtmlPreviewView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20taHRtbC1wcmV2aWV3L2xpYi9hdG9tLWh0bWwtcHJldmlldy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUhBQUE7SUFBQTs7Ozs7RUFBQSxFQUFBLEdBQXdCLE9BQUEsQ0FBUSxJQUFSOztFQUN4QixNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDZDQUFELEVBQXNCOztFQUN0QixPQUF3QixPQUFBLENBQVEsc0JBQVIsQ0FBeEIsRUFBQyxVQUFELEVBQUksY0FBSixFQUFTOztFQUNULElBQUEsR0FBd0IsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBd0IsT0FBQSxDQUFRLElBQVI7O0VBRXhCLGtCQUFBLEdBQXFCOztFQXlCckIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixtQkFBdkI7O2tDQUVBLFNBQUEsR0FBc0I7O2tDQUN0QixnQkFBQSxHQUFzQixTQUFBO2FBQU8sSUFBQSxVQUFBLENBQUE7SUFBUDs7a0NBQ3RCLG1CQUFBLEdBQXNCLFNBQUE7YUFBTyxJQUFBLFVBQUEsQ0FBQTtJQUFQOztJQUV0QixtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtBQUQ7YUFDUixJQUFBLG1CQUFBLENBQW9CLEtBQXBCO0lBRFE7O0lBR2QsbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHVDQUFQO1FBQWdELFFBQUEsRUFBVSxDQUFDLENBQTNEO09BQUwsRUFBbUUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ2pFLGNBQUE7VUFBQSxLQUFBLEdBQVE7VUFDUixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFB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UUFBUixDQUFBLENBQUQsQ0FBQSxHQUFvQixXQUR4QjtPQUFBLE1BQUE7ZUFHRSxlQUhGOztJQURROztrQ0FNVixNQUFBLEdBQVEsU0FBQTthQUNOLHdCQUFBLEdBQXlCLElBQUMsQ0FBQTtJQURwQjs7a0NBR1IsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFHLG1CQUFIO2VBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsRUFERjs7SUFETzs7a0NBSVQsU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNULFVBQUE7TUFBQSxjQUFBLG9CQUFpQixNQUFNLENBQUU7YUFFekIsSUFBQyxDQUFBLElBQUQsQ0FBTSxhQUFOLENBQ0EsQ0FBQyxJQURELENBQ00sR0FBQSxDQUFJLFNBQUE7UUFDUixJQUFDLENBQUEsRUFBRCxDQUFJLHdCQUFKO1FBQ0EsSUFBc0Isc0JBQXRCO2lCQUFBLElBQUMsQ0FBQSxFQUFELENBQUksY0FBSixFQUFBOztNQUZRLENBQUosQ0FETixDQUlBLENBQUMsSUFKRCxDQUFBO0lBSFM7O2tDQVNYLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBLElBQUQsQ0FBTSxlQUFOLENBQXNCLENBQUMsSUFBdkIsQ0FBQTtJQURXOzs7O0tBelBtQjtBQWhDbEMiLCJzb3VyY2VzQ29udGVudCI6WyJmcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdmcydcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgJCQkLCBTY3JvbGxWaWV3fSAgPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG5vcyAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdvcydcblxuc2Nyb2xsSW5qZWN0U2NyaXB0ID0gXCJcIlwiXG48c2NyaXB0PlxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNjcmlwdFRhZyA9IGRvY3VtZW50LnNjcmlwdHNbZG9jdW1lbnQuc2NyaXB0cy5sZW5ndGggLSAxXTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsKCk9PntcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpXG4gICAgdHJ5IHtcbiAgICAgIC8vIFNjcm9sbCB0byB0aGlzIGN1cnJlbnQgc2NyaXB0IHRhZ1xuICAgICAgZWxlbS5zdHlsZS53aWR0aCA9IDEwMFxuICAgICAgLy8gQ2VudGVyIHRoZSBzY3JvbGxZXG4gICAgICBlbGVtLnN0eWxlLmhlaWdodCA9IFwiMjB2aFwiXG4gICAgICBlbGVtLnN0eWxlLm1hcmdpblRvcCA9IFwiLTIwdmhcIlxuICAgICAgZWxlbS5zdHlsZS5tYXJnaW5MZWZ0ID0gLTEwMFxuICAgICAgZWxlbS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiXG4gICAgICB2YXIgcGFyID0gc2NyaXB0VGFnLnBhcmVudE5vZGVcbiAgICAgIHBhci5pbnNlcnRCZWZvcmUoZWxlbSwgc2NyaXB0VGFnKVxuICAgICAgZWxlbS5zY3JvbGxJbnRvVmlldygpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgdHJ5IHsgZWxlbS5yZW1vdmUoKSB9IGNhdGNoIChlcnJvcikge31cbiAgICB0cnkgeyBzY3JpcHRUYWcucmVtb3ZlKCkgfSBjYXRjaCAoZXJyb3IpIHt9XG4gIH0sIGZhbHNlKVxufSkoKTtcbjwvc2NyaXB0PlxuXCJcIlwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEF0b21IdG1sUHJldmlld1ZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gIGF0b20uZGVzZXJpYWxpemVycy5hZGQodGhpcylcblxuICBlZGl0b3JTdWIgICAgICAgICAgIDogbnVsbFxuICBvbkRpZENoYW5nZVRpdGxlICAgIDogLT4gbmV3IERpc3Bvc2FibGUoKVxuICBvbkRpZENoYW5nZU1vZGlmaWVkIDogLT4gbmV3IERpc3Bvc2FibGUoKVxuXG4gIEBkZXNlcmlhbGl6ZTogKHN0YXRlKSAtPlxuICAgIG5ldyBBdG9tSHRtbFByZXZpZXdWaWV3KHN0YXRlKVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdhdG9tLWh0bWwtcHJldmlldyBuYXRpdmUta2V5LWJpbmRpbmdzJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgc3R5bGUgPSAnei1pbmRleDogMjsgcGFkZGluZzogMmVtOydcbiAgICAgIEBkaXYgY2xhc3M6ICdzaG93LWVycm9yJywgc3R5bGU6IHN0eWxlXG4gICAgICBAZGl2IGNsYXNzOiAnc2hvdy1sb2FkaW5nJywgc3R5bGU6IHN0eWxlLCBcIkxvYWRpbmcgSFRNTFwiXG5cbiAgY29uc3RydWN0b3I6ICh7QGVkaXRvcklkLCBmaWxlUGF0aH0pIC0+XG4gICAgc3VwZXJcblxuICAgIGlmIEBlZGl0b3JJZD9cbiAgICAgIEByZXNvbHZlRWRpdG9yKEBlZGl0b3JJZClcbiAgICAgIEB0bXBQYXRoID0gQGdldFBhdGgoKSAjIGFmdGVyIHJlc29sdmVFZGl0b3JcbiAgICBlbHNlXG4gICAgICBpZiBhdG9tLndvcmtzcGFjZT9cbiAgICAgICAgQHN1YnNjcmliZVRvRmlsZVBhdGgoZmlsZVBhdGgpXG4gICAgICBlbHNlXG4gICAgICAgICMgQHN1YnNjcmliZSBhdG9tLnBhY2thZ2VzLm9uY2UgJ2FjdGl2YXRlZCcsID0+XG4gICAgICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgPT5cbiAgICAgICAgICBAc3Vic2NyaWJlVG9GaWxlUGF0aChmaWxlUGF0aClcblxuICAgICMgRGlzYWJsZSBwb2ludGVyLWV2ZW50cyB3aGlsZSByZXNpemluZ1xuICAgIGhhbmRsZXMgPSAkKFwiYXRvbS1wYW5lLXJlc2l6ZS1oYW5kbGVcIilcbiAgICBoYW5kbGVzLm9uICdtb3VzZWRvd24nLCA9PiBAb25TdGFydGVkUmVzaXplKClcblxuICBvblN0YXJ0ZWRSZXNpemU6IC0+XG4gICAgQGNzcyAncG9pbnRlci1ldmVudHMnOiAnbm9uZSdcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQG9uU3RvcHBlZFJlc2l6aW5nLmJpbmQgdGhpc1xuXG4gIG9uU3RvcHBlZFJlc2l6aW5nOiAtPlxuICAgIEBjc3MgJ3BvaW50ZXItZXZlbnRzJzogJ2FsbCdcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQG9uU3RvcHBlZFJlc2l6aW5nXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGRlc2VyaWFsaXplciA6ICdBdG9tSHRtbFByZXZpZXdWaWV3J1xuICAgIGZpbGVQYXRoICAgICA6IEBnZXRQYXRoKClcbiAgICBlZGl0b3JJZCAgICAgOiBAZWRpdG9ySWRcblxuICBkZXN0cm95OiAtPlxuICAgICMgQHVuc3Vic2NyaWJlKClcbiAgICBpZiBlZGl0b3JTdWI/XG4gICAgICBAZWRpdG9yU3ViLmRpc3Bvc2UoKVxuXG4gIHN1YnNjcmliZVRvRmlsZVBhdGg6IChmaWxlUGF0aCkgLT5cbiAgICBAdHJpZ2dlciAndGl0bGUtY2hhbmdlZCdcbiAgICBAaGFuZGxlRXZlbnRzKClcbiAgICBAcmVuZGVySFRNTCgpXG5cbiAgcmVzb2x2ZUVkaXRvcjogKGVkaXRvcklkKSAtPlxuICAgIHJlc29sdmUgPSA9PlxuICAgICAgQGVkaXRvciA9IEBlZGl0b3JGb3JJZChlZGl0b3JJZClcblxuICAgICAgaWYgQGVkaXRvcj9cbiAgICAgICAgQHRyaWdnZXIgJ3RpdGxlLWNoYW5nZWQnIGlmIEBlZGl0b3I/XG4gICAgICAgIEBoYW5kbGVFdmVudHMoKVxuICAgICAgZWxzZVxuICAgICAgICAjIFRoZSBlZGl0b3IgdGhpcyBwcmV2aWV3IHdhcyBjcmVhdGVkIGZvciBoYXMgYmVlbiBjbG9zZWQgc28gY2xvc2VcbiAgICAgICAgIyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgICBhdG9tLndvcmtzcGFjZT8ucGFuZUZvckl0ZW0odGhpcyk/LmRlc3Ryb3lJdGVtKHRoaXMpXG5cbiAgICBpZiBhdG9tLndvcmtzcGFjZT9cbiAgICAgIHJlc29sdmUoKVxuICAgIGVsc2VcbiAgICAgICMgQHN1YnNjcmliZSBhdG9tLnBhY2thZ2VzLm9uY2UgJ2FjdGl2YXRlZCcsID0+XG4gICAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlID0+XG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgICBAcmVuZGVySFRNTCgpXG5cbiAgZWRpdG9yRm9ySWQ6IChlZGl0b3JJZCkgLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIHJldHVybiBlZGl0b3IgaWYgZWRpdG9yLmlkPy50b1N0cmluZygpIGlzIGVkaXRvcklkLnRvU3RyaW5nKClcbiAgICBudWxsXG5cbiAgaGFuZGxlRXZlbnRzOiA9PlxuICAgIGNvbnRleHRNZW51Q2xpZW50WCA9IDBcbiAgICBjb250ZXh0TWVudUNsaWVudFkgPSAwXG5cbiAgICBAb24gJ2NvbnRleHRtZW51JywgKGV2ZW50KSAtPlxuICAgICAgY29udGV4dE1lbnVDbGllbnRZID0gZXZlbnQuY2xpZW50WVxuICAgICAgY29udGV4dE1lbnVDbGllbnRYID0gZXZlbnQuY2xpZW50WFxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsXG4gICAgICAnYXRvbS1odG1sLXByZXZpZXc6b3Blbi1kZXZ0b29scyc6ID0+XG4gICAgICAgIEB3ZWJ2aWV3Lm9wZW5EZXZUb29scygpXG4gICAgICAnYXRvbS1odG1sLXByZXZpZXc6aW5zcGVjdCc6ID0+XG4gICAgICAgIEB3ZWJ2aWV3Lmluc3BlY3RFbGVtZW50KGNvbnRleHRNZW51Q2xpZW50WCwgY29udGV4dE1lbnVDbGllbnRZKVxuICAgICAgJ2F0b20taHRtbC1wcmV2aWV3OnByaW50JzogPT5cbiAgICAgICAgQHdlYnZpZXcucHJpbnQoKVxuXG5cbiAgICBjaGFuZ2VIYW5kbGVyID0gPT5cbiAgICAgIEByZW5kZXJIVE1MKClcbiAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKEBnZXRVUkkoKSlcbiAgICAgIGlmIHBhbmU/IGFuZCBwYW5lIGlzbnQgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG5cbiAgICBAZWRpdG9yU3ViID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIGlmIEBlZGl0b3I/XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWh0bWwtcHJldmlldy50cmlnZ2VyT25TYXZlXCIpXG4gICAgICAgIEBlZGl0b3JTdWIuYWRkIEBlZGl0b3Iub25EaWRTYXZlIGNoYW5nZUhhbmRsZXJcbiAgICAgIGVsc2VcbiAgICAgICAgQGVkaXRvclN1Yi5hZGQgQGVkaXRvci5vbkRpZFN0b3BDaGFuZ2luZyBjaGFuZ2VIYW5kbGVyXG4gICAgICBAZWRpdG9yU3ViLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlUGF0aCA9PiBAdHJpZ2dlciAndGl0bGUtY2hhbmdlZCdcblxuICByZW5kZXJIVE1MOiAtPlxuICAgIEBzaG93TG9hZGluZygpXG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWh0bWwtcHJldmlldy50cmlnZ2VyT25TYXZlXCIpICYmIEBlZGl0b3IuZ2V0UGF0aCgpP1xuICAgICAgICBAc2F2ZShAcmVuZGVySFRNTENvZGUpXG4gICAgICBlbHNlXG4gICAgICAgIEByZW5kZXJIVE1MQ29kZSgpXG5cbiAgc2F2ZTogKGNhbGxiYWNrKSAtPlxuICAgICMgVGVtcCBmaWxlIHBhdGhcbiAgICBvdXRQYXRoID0gcGF0aC5yZXNvbHZlIHBhdGguam9pbihvcy50bXBkaXIoKSwgQGVkaXRvci5nZXRUaXRsZSgpICsgXCIuaHRtbFwiKVxuICAgIG91dCA9IFwiXCJcbiAgICBmaWxlRW5kaW5nID0gQGVkaXRvci5nZXRUaXRsZSgpLnNwbGl0KFwiLlwiKS5wb3AoKVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1odG1sLXByZXZpZXcuZW5hYmxlTWF0aEpheFwiKVxuICAgICAgb3V0ICs9IFwiXCJcIlxuICAgICAgPHNjcmlwdCB0eXBlPVwidGV4dC94LW1hdGhqYXgtY29uZmlnXCI+XG4gICAgICBNYXRoSmF4Lkh1Yi5Db25maWcoe1xuICAgICAgdGV4MmpheDoge2lubGluZU1hdGg6IFtbJ1xcXFxcXFxcZiQnLCdcXFxcXFxcXGYkJ11dfSxcbiAgICAgIG1lbnVTZXR0aW5nczoge3pvb206ICdDbGljayd9XG4gICAgICB9KTtcbiAgICAgIDwvc2NyaXB0PlxuICAgICAgPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCJcbiAgICAgIHNyYz1cImh0dHA6Ly9jZG4ubWF0aGpheC5vcmcvbWF0aGpheC9sYXRlc3QvTWF0aEpheC5qcz9jb25maWc9VGVYLUFNUy1NTUxfSFRNTG9yTU1MXCI+XG4gICAgICA8L3NjcmlwdD5cbiAgICAgIFwiXCJcIlxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KFwiYXRvbS1odG1sLXByZXZpZXcucHJlc2VydmVXaGl0ZVNwYWNlc1wiKSBhbmQgZmlsZUVuZGluZyBpbiBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWh0bWwtcHJldmlldy5maWxlRW5kaW5nc1wiKVxuICAgICAgIyBFbmNsb3NlIGluIDxwcmU+IHN0YXRlbWVudCB0byBwcmVzZXJ2ZSB3aGl0ZXNwYWNlc1xuICAgICAgb3V0ICs9IFwiXCJcIlxuICAgICAgPHN0eWxlIHR5cGU9XCJ0ZXh0L2Nzc1wiPlxuICAgICAgYm9keSB7IHdoaXRlLXNwYWNlOiBwcmU7IH1cbiAgICAgIDwvc3R5bGU+XG4gICAgICBcIlwiXCJcbiAgICBlbHNlXG4gICAgICAjIEFkZCBiYXNlIHRhZzsgYWxsb3cgcmVsYXRpdmUgbGlua3MgdG8gd29yayBkZXNwaXRlIGJlaW5nIGxvYWRlZFxuICAgICAgIyBhcyB0aGUgc3JjIG9mIGFuIHdlYnZpZXdcbiAgICAgIG91dCArPSBcIjxiYXNlIGhyZWY9XFxcIlwiICsgQGdldFBhdGgoKSArIFwiXFxcIj5cIlxuXG4gICAgIyBTY3JvbGwgaW50byB2aWV3XG4gICAgZWRpdG9yVGV4dCA9IEBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgZmlyc3RTZWxlY3Rpb24gPSB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKClbMF1cbiAgICB7IHJvdywgY29sdW1uIH0gPSBmaXJzdFNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoXCJhdG9tLWh0bWwtcHJldmlldy5zY3JvbGxUb0N1cnNvclwiKVxuICAgICAgdHJ5XG4gICAgICAgIG9mZnNldCA9IEBfZ2V0T2Zmc2V0KGVkaXRvclRleHQsIHJvdywgY29sdW1uKVxuXG4gICAgICAgIHRhZ1JFID0gLzwoKFxcL1tcXCRcXHdcXC1dKXxicnxpbnB1dHxsaW5rKVxcLz8+Ly5zb3VyY2VcbiAgICAgICAgbGFzdFRhZ1JFPSAvLy8je3RhZ1JFfSg/IVtcXHNcXFNdKiN7dGFnUkV9KS8vL2lcbiAgICAgICAgZmluZFRhZ0JlZm9yZSA9IChiZWZvcmVJbmRleCkgLT5cbiAgICAgICAgICAjc2FtcGxlID0gZWRpdG9yVGV4dC5zbGljZShzdGFydEluZGV4LCBzdGFydEluZGV4ICsgMzAwKVxuICAgICAgICAgIG1hdGNoZWRDbG9zaW5nVGFnID0gZWRpdG9yVGV4dC5zbGljZSgwLCBiZWZvcmVJbmRleCkubWF0Y2gobGFzdFRhZ1JFKVxuICAgICAgICAgIGlmIG1hdGNoZWRDbG9zaW5nVGFnXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlZENsb3NpbmdUYWcuaW5kZXggKyBtYXRjaGVkQ2xvc2luZ1RhZ1swXS5sZW5ndGhcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gLTFcblxuICAgICAgICB0YWdJbmRleCA9IGZpbmRUYWdCZWZvcmUob2Zmc2V0KVxuICAgICAgICBpZiB0YWdJbmRleCA+IC0xXG4gICAgICAgICAgZWRpdG9yVGV4dCA9IFwiXCJcIlxuICAgICAgICAgICN7ZWRpdG9yVGV4dC5zbGljZSgwLCB0YWdJbmRleCl9XG4gICAgICAgICAgI3tzY3JvbGxJbmplY3RTY3JpcHR9XG4gICAgICAgICAgI3tlZGl0b3JUZXh0LnNsaWNlKHRhZ0luZGV4KX1cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgcmV0dXJuIC0xXG5cbiAgICBvdXQgKz0gZWRpdG9yVGV4dFxuXG4gICAgQHRtcFBhdGggPSBvdXRQYXRoXG4gICAgZnMud3JpdGVGaWxlIG91dFBhdGgsIG91dCwgPT5cbiAgICAgIHRyeVxuICAgICAgICBAcmVuZGVySFRNTENvZGUoKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgQHNob3dFcnJvciBlcnJvclxuXG4gIHJlbmRlckhUTUxDb2RlOiAoKSAtPlxuICAgIHVubGVzcyBAd2Vidmlldz9cbiAgICAgIHdlYnZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwid2Vidmlld1wiKVxuICAgICAgIyBGaXggZnJvbSBAa3dhYWsgKGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJCb3hpby9hdG9tLWh0bWwtcHJldmlldy9pc3N1ZXMvMS8jaXNzdWVjb21tZW50LTQ5NjM5MTYyKVxuICAgICAgIyBBbGxvd3MgZm9yIHRoZSB1c2Ugb2YgcmVsYXRpdmUgcmVzb3VyY2VzIChzY3JpcHRzLCBzdHlsZXMpXG4gICAgICB3ZWJ2aWV3LnNldEF0dHJpYnV0ZShcInNhbmRib3hcIiwgXCJhbGxvdy1zY3JpcHRzIGFsbG93LXNhbWUtb3JpZ2luXCIpXG4gICAgICB3ZWJ2aWV3LnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwiaGVpZ2h0OiAxMDAlXCIpXG4gICAgICBAd2VidmlldyA9IHdlYnZpZXdcbiAgICAgIEBhcHBlbmQgJCB3ZWJ2aWV3XG5cbiAgICBAd2Vidmlldy5zcmMgPSBAdG1wUGF0aFxuICAgIHRyeVxuICAgICAgQGZpbmQoJy5zaG93LWVycm9yJykuaGlkZSgpXG4gICAgICBAZmluZCgnLnNob3ctbG9hZGluZycpLmhpZGUoKVxuICAgICAgQHdlYnZpZXcucmVsb2FkKClcblxuICAgIGNhdGNoIGVycm9yXG4gICAgICBudWxsXG5cbiAgICAjIEB0cmlnZ2VyKCdhdG9tLWh0bWwtcHJldmlldzpodG1sLWNoYW5nZWQnKVxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggJ2F0b20taHRtbC1wcmV2aWV3JywgJ2h0bWwtY2hhbmdlZCdcblxuICAjIEdldCB0aGUgb2Zmc2V0IG9mIGEgZmlsZSBhdCBhIHNwZWNpZmljIFBvaW50IGluIHRoZSBmaWxlXG4gIF9nZXRPZmZzZXQ6ICh0ZXh0LCByb3csIGNvbHVtbj0wKSAtPlxuICAgIGxpbmVfcmUgPSAvXFxuL2dcbiAgICBtYXRjaF9pbmRleCA9IG51bGxcbiAgICB3aGlsZSByb3ctLVxuICAgICAgaWYgbWF0Y2ggPSBsaW5lX3JlLmV4ZWModGV4dClcbiAgICAgICAgbWF0Y2hfaW5kZXggPSBtYXRjaC5pbmRleFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gLTFcbiAgICBvZmZzZXQgPSBtYXRjaF9pbmRleCArIGNvbHVtblxuICAgIHJldHVybiBpZiBvZmZzZXQgPCB0ZXh0Lmxlbmd0aCB0aGVuIG9mZnNldCBlbHNlIC0xXG5cblxuICBnZXRUaXRsZTogLT5cbiAgICBpZiBAZWRpdG9yP1xuICAgICAgXCIje0BlZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld1wiXG4gICAgZWxzZVxuICAgICAgXCJIVE1MIFByZXZpZXdcIlxuXG4gIGdldFVSSTogLT5cbiAgICBcImh0bWwtcHJldmlldzovL2VkaXRvci8je0BlZGl0b3JJZH1cIlxuXG4gIGdldFBhdGg6IC0+XG4gICAgaWYgQGVkaXRvcj9cbiAgICAgIEBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgc2hvd0Vycm9yOiAocmVzdWx0KSAtPlxuICAgIGZhaWx1cmVNZXNzYWdlID0gcmVzdWx0Py5tZXNzYWdlXG5cbiAgICBAZmluZCgnLnNob3ctZXJyb3InKVxuICAgIC5odG1sICQkJCAtPlxuICAgICAgQGgyICdQcmV2aWV3aW5nIEhUTUwgRmFpbGVkJ1xuICAgICAgQGgzIGZhaWx1cmVNZXNzYWdlIGlmIGZhaWx1cmVNZXNzYWdlP1xuICAgIC5zaG93KClcblxuICBzaG93TG9hZGluZzogLT5cbiAgICBAZmluZCgnLnNob3ctbG9hZGluZycpLnNob3coKVxuIl19
