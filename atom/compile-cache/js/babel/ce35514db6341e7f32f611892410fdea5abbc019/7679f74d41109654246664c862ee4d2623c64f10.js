Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _configTernConfigDocs = require('../../config/tern-config-docs');

var _configTernConfigDocs2 = _interopRequireDefault(_configTernConfigDocs);

var _configTernPluginsDefintionsJs = require('../../config/tern-plugins-defintions.js');

var _configTernPluginsDefintionsJs2 = _interopRequireDefault(_configTernPluginsDefintionsJs);

var _configTernConfig = require('../../config/tern-config');

'use babel';

var templateContainer = '\n\n  <div>\n    <h1 class="title"></h1>\n    <div class="content"></div>\n    <button class="btn btn-default">Save &amp; Restart Server</button>\n  </div>\n';

var createView = function createView(model) {

  return new ConfigView(model).init();
};

exports.createView = createView;

var ConfigView = (function () {
  function ConfigView(model) {
    _classCallCheck(this, ConfigView);

    this.setModel(model);
    model.gatherData();
  }

  _createClass(ConfigView, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var projectDir = this.model.getProjectDir();

      this.el = document.createElement('div');
      this.el.classList.add('atom-ternjs-config');
      this.el.innerHTML = templateContainer;

      var elContent = this.el.querySelector('.content');
      var elTitle = this.el.querySelector('.title');
      elTitle.innerHTML = projectDir;

      var buttonSave = this.el.querySelector('button');

      buttonSave.addEventListener('click', function (e) {

        _this.model.updateConfig();
      });

      var sectionEcmaVersion = this.renderSection('ecmaVersion');
      var ecmaVersions = this.renderRadio();
      ecmaVersions.forEach(function (ecmaVersion) {
        return sectionEcmaVersion.appendChild(ecmaVersion);
      });
      elContent.appendChild(sectionEcmaVersion);

      var sectionLibs = this.renderSection('libs');
      var libs = this.renderlibs();
      libs.forEach(function (lib) {
        return sectionLibs.appendChild(lib);
      });
      elContent.appendChild(sectionLibs);

      elContent.appendChild(this.renderEditors('loadEagerly', this.model.config.loadEagerly));
      elContent.appendChild(this.renderEditors('dontLoad', this.model.config.dontLoad));

      var sectionPlugins = this.renderSection('plugins');
      var plugins = this.renderPlugins();
      plugins.forEach(function (plugin) {
        return sectionPlugins.appendChild(plugin);
      });
      elContent.appendChild(sectionPlugins);

      return this.el;
    }
  }, {
    key: 'renderSection',
    value: function renderSection(title) {

      var section = document.createElement('section');
      section.classList.add(title);

      var header = document.createElement('h2');
      header.innerHTML = title;

      section.appendChild(header);

      var docs = _configTernConfigDocs2['default'][title].doc;

      if (docs) {

        var doc = document.createElement('p');
        doc.innerHTML = docs;

        section.appendChild(doc);
      }

      return section;
    }
  }, {
    key: 'renderRadio',
    value: function renderRadio() {
      var _this2 = this;

      return _configTernConfig.ecmaVersions.map(function (ecmaVersion) {

        var inputWrapper = document.createElement('div');
        inputWrapper.classList.add('input-wrapper');

        var label = document.createElement('span');
        label.innerHTML = 'ecmaVersion ' + ecmaVersion;

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'ecmaVersions';
        radio.value = ecmaVersion;
        radio.checked = _this2.model.config.ecmaVersion === ecmaVersion;

        radio.addEventListener('change', function (e) {

          _this2.model.setEcmaVersion(e.target.value);
        }, false);

        inputWrapper.appendChild(label);
        inputWrapper.appendChild(radio);

        return inputWrapper;
      });
    }
  }, {
    key: 'renderEditors',
    value: function renderEditors(identifier) {
      var _this3 = this;

      var paths = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var section = this.renderSection(identifier);

      paths.forEach(function (path) {

        section.appendChild(_this3.createInputWrapper(path, identifier));
      });

      section.appendChild(this.createInputWrapper(null, identifier));

      return section;
    }
  }, {
    key: 'renderPlugins',
    value: function renderPlugins() {
      var _this4 = this;

      var plugins = Object.keys(this.model.config.plugins);
      var availablePluginsKeys = Object.keys(_configTernConfig.availablePlugins);
      var unknownPlugins = plugins.filter(function (plugin) {

        return !_configTernConfig.availablePlugins[plugin] ? true : false;
      });

      return availablePluginsKeys.map(function (plugin) {
        return _this4.renderPlugin(plugin);
      }).concat(unknownPlugins.map(function (plugin) {
        return _this4.renderPlugin(plugin);
      }));
    }
  }, {
    key: 'renderPlugin',
    value: function renderPlugin(plugin) {

      var wrapper = document.createElement('p');

      wrapper.appendChild(this.buildBoolean(plugin, 'plugin', this.model.config.plugins[plugin]));

      var doc = document.createElement('span');
      doc.innerHTML = _configTernPluginsDefintionsJs2['default'][plugin] && _configTernPluginsDefintionsJs2['default'][plugin].doc;

      wrapper.appendChild(doc);

      return wrapper;
    }
  }, {
    key: 'renderlibs',
    value: function renderlibs() {
      var _this5 = this;

      return _configTernConfig.availableLibs.map(function (lib) {

        return _this5.buildBoolean(lib, 'lib', _this5.model.config.libs.includes(lib));
      });
    }
  }, {
    key: 'buildBoolean',
    value: function buildBoolean(key, type, checked) {
      var _this6 = this;

      var inputWrapper = document.createElement('div');
      var label = document.createElement('span');
      var checkbox = document.createElement('input');

      inputWrapper.classList.add('input-wrapper');
      label.innerHTML = key;
      checkbox.type = 'checkbox';
      checkbox.value = key;
      checkbox.checked = checked;

      checkbox.addEventListener('change', function (e) {

        switch (type) {

          case 'lib':
            {

              e.target.checked ? _this6.model.addLib(key) : _this6.model.removeLib(key);
            }break;

          case 'plugin':
            {

              e.target.checked ? _this6.model.addPlugin(key) : _this6.model.removePlugin(key);
            }
        }
      }, false);

      inputWrapper.appendChild(label);
      inputWrapper.appendChild(checkbox);

      return inputWrapper;
    }
  }, {
    key: 'createInputWrapper',
    value: function createInputWrapper(path, identifier) {

      var inputWrapper = document.createElement('div');
      var editor = this.createTextEditor(path, identifier);

      inputWrapper.classList.add('input-wrapper');
      inputWrapper.appendChild(editor);
      inputWrapper.appendChild(this.createAdd(identifier));
      inputWrapper.appendChild(this.createSub(editor));

      return inputWrapper;
    }
  }, {
    key: 'createSub',
    value: function createSub(editor) {
      var _this7 = this;

      var sub = document.createElement('span');
      sub.classList.add('sub');
      sub.classList.add('inline-block');
      sub.classList.add('status-removed');
      sub.classList.add('icon');
      sub.classList.add('icon-diff-removed');

      sub.addEventListener('click', function (e) {

        _this7.model.removeEditor(editor);
        var inputWrapper = e.target.closest('.input-wrapper');
        inputWrapper.parentNode.removeChild(inputWrapper);
      }, false);

      return sub;
    }
  }, {
    key: 'createAdd',
    value: function createAdd(identifier) {
      var _this8 = this;

      var add = document.createElement('span');
      add.classList.add('add');
      add.classList.add('inline-block');
      add.classList.add('status-added');
      add.classList.add('icon');
      add.classList.add('icon-diff-added');
      add.addEventListener('click', function (e) {

        e.target.closest('section').appendChild(_this8.createInputWrapper(null, identifier));
      }, false);

      return add;
    }
  }, {
    key: 'createTextEditor',
    value: function createTextEditor(path, identifier) {

      var editor = document.createElement('atom-text-editor');
      editor.setAttribute('mini', true);

      if (path) {

        editor.getModel().getBuffer().setText(path);
      }

      this.model.editors.push({

        identifier: identifier,
        ref: editor
      });

      return editor;
    }
  }, {
    key: 'getModel',
    value: function getModel() {

      return this.model;
    }
  }, {
    key: 'setModel',
    value: function setModel(model) {

      this.model = model;
    }
  }, {
    key: 'destroy',
    value: function destroy() {

      this.el.remove();
    }
  }]);

  return ConfigView;
})();

exports['default'] = ConfigView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9saWIvdmlld3MvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0NBRTJCLCtCQUErQjs7Ozs2Q0FDNUIseUNBQXlDOzs7O2dDQU1oRSwwQkFBMEI7O0FBVGpDLFdBQVcsQ0FBQzs7QUFXWixJQUFNLGlCQUFpQixrS0FPdEIsQ0FBQzs7QUFFSyxJQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxLQUFLLEVBQUs7O0FBRW5DLFNBQU8sSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDckMsQ0FBQzs7OztJQUVtQixVQUFVO0FBRWxCLFdBRlEsVUFBVSxDQUVqQixLQUFLLEVBQUU7MEJBRkEsVUFBVTs7QUFJM0IsUUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyQixTQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7R0FDcEI7O2VBTmtCLFVBQVU7O1dBUXpCLGdCQUFHOzs7QUFFTCxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUU5QyxVQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7O0FBRXRDLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BELFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hELGFBQU8sQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDOztBQUUvQixVQUFN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RVYsYUFBTyxHQUFHLENBQUM7S0FDWjs7O1dBRWUsMEJBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTs7QUFFakMsVUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzFELFlBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVsQyxVQUFJLElBQUksRUFBRTs7QUFFUixjQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzdDOztBQUVELFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzs7QUFFdEIsa0JBQVUsRUFBVixVQUFVO0FBQ1YsV0FBRyxFQUFFLE1BQU07T0FDWixDQUFDLENBQUM7O0FBRUgsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRU8sb0JBQUc7O0FBRVQsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25COzs7V0FFTyxrQkFBQyxLQUFLLEVBQUU7O0FBRWQsVUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7S0FDcEI7OztXQUVNLG1CQUFHOztBQUVSLFVBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDbEI7OztTQXJSa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2xpYi92aWV3cy9jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHRlcm5Db25maWdEb2NzIGZyb20gJy4uLy4uL2NvbmZpZy90ZXJuLWNvbmZpZy1kb2NzJztcbmltcG9ydCBwbHVnaW5EZWZpbml0aW9ucyBmcm9tICcuLi8uLi9jb25maWcvdGVybi1wbHVnaW5zLWRlZmludGlvbnMuanMnO1xuXG5pbXBvcnQge1xuICBlY21hVmVyc2lvbnMsXG4gIGF2YWlsYWJsZUxpYnMsXG4gIGF2YWlsYWJsZVBsdWdpbnNcbn0gZnJvbSAnLi4vLi4vY29uZmlnL3Rlcm4tY29uZmlnJztcblxuY29uc3QgdGVtcGxhdGVDb250YWluZXIgPSBgXG5cbiAgPGRpdj5cbiAgICA8aDEgY2xhc3M9XCJ0aXRsZVwiPjwvaDE+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj48L2Rpdj5cbiAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1kZWZhdWx0XCI+U2F2ZSAmYW1wOyBSZXN0YXJ0IFNlcnZlcjwvYnV0dG9uPlxuICA8L2Rpdj5cbmA7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVWaWV3ID0gKG1vZGVsKSA9PiB7XG5cbiAgcmV0dXJuIG5ldyBDb25maWdWaWV3KG1vZGVsKS5pbml0KCk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maWdWaWV3IHtcblxuICBjb25zdHJ1Y3Rvcihtb2RlbCkge1xuXG4gICAgdGhpcy5zZXRNb2RlbChtb2RlbCk7XG4gICAgbW9kZWwuZ2F0aGVyRGF0YSgpO1xuICB9XG5cbiAgaW5pdCgpIHtcblxuICAgIGNvbnN0IHByb2plY3REaXIgPSB0aGlzLm1vZGVsLmdldFByb2plY3REaXIoKTtcblxuICAgIHRoaXMuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ2F0b20tdGVybmpzLWNvbmZpZycpO1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gdGVtcGxhdGVDb250YWluZXI7XG5cbiAgICBjb25zdCBlbENvbnRlbnQgPSB0aGlzLmVsLnF1ZXJ5U2VsZWN0b3IoJy5jb250ZW50Jyk7XG4gICAgY29uc3QgZWxUaXRsZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignLnRpdGxlJyk7XG4gICAgZWxUaXRsZS5pbm5lckhUTUwgPSBwcm9qZWN0RGlyO1xuXG4gICAgY29uc3QgYnV0dG9uU2F2ZSA9IHRoaXMuZWwucXVlcnlTZWxlY3RvcignYnV0dG9uJyk7XG5cbiAgICBidXR0b25TYXZlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcblxuICAgICAgdGhpcy5tb2RlbC51cGRhdGVDb25maWcoKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNlY3Rpb25FY21hVmVyc2lvbiA9IHRoaXMucmVuZGVyU2VjdGlvbignZWNtYVZlcnNpb24nKTtcbiAgICBjb25zdCBlY21hVmVyc2lvbnMgPSB0aGlzLnJlbmRlclJhZGlvKCk7XG4gICAgZWNtYVZlcnNpb25zLmZvckVhY2goZWNtYVZlcnNpb24gPT4gc2VjdGlvbkVjbWFWZXJzaW9uLmFwcGVuZENoaWxkKGVjbWFWZXJzaW9uKSk7XG4gICAgZWxDb250ZW50LmFwcGVuZENoaWxkKHNlY3Rpb25FY21hVmVyc2lvbik7XG5cbiAgICBjb25zdCBzZWN0aW9uTGlicyA9IHRoaXMucmVuZGVyU2VjdGlvbignbGlicycpO1xuICAgIGNvbnN0IGxpYnMgPSB0aGlzLnJlbmRlcmxpYnMoKTtcbiAgICBsaWJzLmZvckVhY2gobGliID0+IHNlY3Rpb25MaWJzLmFwcGVuZENoaWxkKGxpYikpO1xuICAgIGVsQ29udGVudC5hcHBlbmRDaGlsZChzZWN0aW9uTGlicyk7XG5cbiAgICBlbENvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJFZGl0b3JzKCdsb2FkRWFnZXJseScsIHRoaXMubW9kZWwuY29uZmlnLmxvYWRFYWdlcmx5KSk7XG4gICAgZWxDb250ZW50LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyRWRpdG9ycygnZG9udExvYWQnLCB0aGlzLm1vZGVsLmNvbmZpZy5kb250TG9hZCkpO1xuXG4gICAgY29uc3Qgc2VjdGlvblBsdWdpbnMgPSB0aGlzLnJlbmRlclNlY3Rpb24oJ3BsdWdpbnMnKTtcbiAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5yZW5kZXJQbHVnaW5zKCk7XG4gICAgcGx1Z2lucy5mb3JFYWNoKHBsdWdpbiA9PiBzZWN0aW9uUGx1Z2lucy5hcHBlbmRDaGlsZChwbHVnaW4pKTtcbiAgICBlbENvbnRlbnQuYXBwZW5kQ2hpbGQoc2VjdGlvblBsdWdpbnMpO1xuXG4gICAgcmV0dXJuIHRoaXMuZWw7XG4gIH1cblxuICByZW5kZXJTZWN0aW9uKHRpdGxlKSB7XG5cbiAgICBjb25zdCBzZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIHNlY3Rpb24uY2xhc3NMaXN0LmFkZCh0aXRsZSk7XG5cbiAgICBjb25zdCBoZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgIGhlYWRlci5pbm5lckhUTUwgPSB0aXRsZTtcblxuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoaGVhZGVyKTtcblxuICAgIGNvbnN0IGRvY3MgPSB0ZXJuQ29uZmlnRG9jc1t0aXRsZV0uZG9jO1xuXG4gICAgaWYgKGRvY3MpIHtcblxuICAgICAgY29uc3QgZG9jID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgZG9jLmlubmVySFRNTCA9IGRvY3M7XG5cbiAgICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQoZG9jKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VjdGlvbjtcbiAgfVxuXG4gIHJlbmRlclJhZGlvKCkge1xuXG4gICAgcmV0dXJuIGVjbWFWZXJzaW9ucy5tYXAoKGVjbWFWZXJzaW9uKSA9PiB7XG5cbiAgICAgIGNvbnN0IGlucHV0V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgaW5wdXRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2lucHV0LXdyYXBwZXInKTtcblxuICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICBsYWJlbC5pbm5lckhUTUwgPSBgZWNtYVZlcnNpb24gJHtlY21hVmVyc2lvbn1gO1xuXG4gICAgICBjb25zdCByYWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgICByYWRpby50eXBlID0gJ3JhZGlvJztcbiAgICAgIHJhZGlvLm5hbWUgPSAnZWNtYVZlcnNpb25zJztcbiAgICAgIHJhZGlvLnZhbHVlID0gZWNtYVZlcnNpb247XG4gICAgICByYWRpby5jaGVja2VkID0gdGhpcy5tb2RlbC5jb25maWcuZWNtYVZlcnNpb24gPT09IGVjbWFWZXJzaW9uO1xuXG4gICAgICByYWRpby5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuXG4gICAgICAgIHRoaXMubW9kZWwuc2V0RWNtYVZlcnNpb24oZS50YXJnZXQudmFsdWUpO1xuXG4gICAgICB9LCBmYWxzZSk7XG5cbiAgICAgIGlucHV0V3JhcHBlci5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICBpbnB1dFdyYXBwZXIuYXBwZW5kQ2hpbGQocmFkaW8pO1xuXG4gICAgICByZXR1cm4gaW5wdXRXcmFwcGVyO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyRWRpdG9ycyhpZGVudGlmaWVyLCBwYXRocyA9IFtdKSB7XG5cbiAgICBjb25zdCBzZWN0aW9uID0gdGhpcy5yZW5kZXJTZWN0aW9uKGlkZW50aWZpZXIpO1xuXG4gICAgcGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuXG4gICAgICBzZWN0aW9uLmFwcGVuZENoaWxkKHRoaXMuY3JlYXRlSW5wdXRXcmFwcGVyKHBhdGgsIGlkZW50aWZpZXIpKTtcbiAgICB9KTtcblxuICAgIHNlY3Rpb24uYXBwZW5kQ2hpbGQodGhpcy5jcmVhdGVJbnB1dFdyYXBwZXIobnVsbCwgaWRlbnRpZmllcikpO1xuXG4gICAgcmV0dXJuIHNlY3Rpb247XG4gIH1cblxuICByZW5kZXJQbHVnaW5zKCkge1xuXG4gICAgY29uc3QgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMubW9kZWwuY29uZmlnLnBsdWdpbnMpO1xuICAgIGNvbnN0IGF2YWlsYWJsZVBsdWdpbnNLZXlzID0gT2JqZWN0LmtleXMoYXZhaWxhYmxlUGx1Z2lucyk7XG4gICAgY29uc3QgdW5rbm93blBsdWdpbnMgPSBwbHVnaW5zLmZpbHRlcigocGx1Z2luKSA9PiB7XG5cbiAgICAgIHJldHVybiAhYXZhaWxhYmxlUGx1Z2luc1twbHVnaW5dID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGF2YWlsYWJsZVBsdWdpbnNLZXlzLm1hcChwbHVnaW4gPT4gdGhpcy5yZW5kZXJQbHVnaW4ocGx1Z2luKSlcbiAgICAuY29uY2F0KHVua25vd25QbHVnaW5zLm1hcChwbHVnaW4gPT4gdGhpcy5yZW5kZXJQbHVnaW4ocGx1Z2luKSkpO1xuICB9XG5cbiAgcmVuZGVyUGx1Z2luKHBsdWdpbikge1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcblxuICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoXG4gICAgICB0aGlzLmJ1aWxkQm9vbGVhbihcbiAgICAgICAgcGx1Z2luLFxuICAgICAgICAncGx1Z2luJyxcbiAgICAgICAgdGhpcy5tb2RlbC5jb25maWcucGx1Z2luc1twbHVnaW5dXG4gICAgICApXG4gICAgKTtcblxuICAgIGNvbnN0IGRvYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBkb2MuaW5uZXJIVE1MID0gcGx1Z2luRGVmaW5pdGlvbnNbcGx1Z2luXSAmJiBwbHVnaW5EZWZpbml0aW9uc1twbHVnaW5dLmRvYztcblxuICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoZG9jKTtcblxuICAgIHJldHVybiB3cmFwcGVyO1xuICB9XG5cbiAgcmVuZGVybGlicygpIHtcblxuICAgIHJldHVybiBhdmFpbGFibGVMaWJzLm1hcCgobGliKSA9PiB7XG5cbiAgICAgIHJldHVybiB0aGlzLmJ1aWxkQm9vbGVhbihcbiAgICAgICAgICBsaWIsXG4gICAgICAgICAgJ2xpYicsXG4gICAgICAgICAgdGhpcy5tb2RlbC5jb25maWcubGlicy5pbmNsdWRlcyhsaWIpXG4gICAgICAgICk7XG4gICAgfSk7XG4gIH1cblxuICBidWlsZEJvb2xlYW4oa2V5LCB0eXBlLCBjaGVja2VkKSB7XG5cbiAgICBjb25zdCBpbnB1dFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICBpbnB1dFdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnaW5wdXQtd3JhcHBlcicpO1xuICAgIGxhYmVsLmlubmVySFRNTCA9IGtleTtcbiAgICBjaGVja2JveC50eXBlID0gJ2NoZWNrYm94JztcbiAgICBjaGVja2JveC52YWx1ZSA9IGtleTtcbiAgICBjaGVja2JveC5jaGVja2VkID0gY2hlY2tlZDtcblxuICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG5cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuXG4gICAgICAgIGNhc2UgJ2xpYic6IHtcblxuICAgICAgICAgIGUudGFyZ2V0LmNoZWNrZWQgPyB0aGlzLm1vZGVsLmFkZExpYihrZXkpIDogdGhpcy5tb2RlbC5yZW1vdmVMaWIoa2V5KTtcblxuICAgICAgICB9IGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BsdWdpbic6IHtcblxuICAgICAgICAgIGUudGFyZ2V0LmNoZWNrZWQgPyB0aGlzLm1vZGVsLmFkZFBsdWdpbihrZXkpIDogdGhpcy5tb2RlbC5yZW1vdmVQbHVnaW4oa2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSwgZmFsc2UpO1xuXG4gICAgaW5wdXRXcmFwcGVyLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICBpbnB1dFdyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2tib3gpO1xuXG4gICAgcmV0dXJuIGlucHV0V3JhcHBlcjtcbiAgfVxuXG4gIGNyZWF0ZUlucHV0V3JhcHBlcihwYXRoLCBpZGVudGlmaWVyKSB7XG5cbiAgICBjb25zdCBpbnB1dFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb25zdCBlZGl0b3IgPSB0aGlzLmNyZWF0ZVRleHRFZGl0b3IocGF0aCwgaWRlbnRpZmllcik7XG5cbiAgICBpbnB1dFdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnaW5wdXQtd3JhcHBlcicpO1xuICAgIGlucHV0V3JhcHBlci5hcHBlbmRDaGlsZChlZGl0b3IpO1xuICAgIGlucHV0V3JhcHBlci5hcHBlbmRDaGlsZCh0aGlzLmNyZWF0ZUFkZChpZGVudGlmaWVyKSk7XG4gICAgaW5wdXRXcmFwcGVyLmFwcGVuZENoaWxkKHRoaXMuY3JlYXRlU3ViKGVkaXRvcikpO1xuXG4gICAgcmV0dXJuIGlucHV0V3JhcHBlcjtcbiAgfVxuXG4gIGNyZWF0ZVN1YihlZGl0b3IpIHtcblxuICAgIGNvbnN0IHN1YiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBzdWIuY2xhc3NMaXN0LmFkZCgnc3ViJyk7XG4gICAgc3ViLmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycpO1xuICAgIHN1Yi5jbGFzc0xpc3QuYWRkKCdzdGF0dXMtcmVtb3ZlZCcpO1xuICAgIHN1Yi5jbGFzc0xpc3QuYWRkKCdpY29uJyk7XG4gICAgc3ViLmNsYXNzTGlzdC5hZGQoJ2ljb24tZGlmZi1yZW1vdmVkJyk7XG5cbiAgICBzdWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuXG4gICAgICB0aGlzLm1vZGVsLnJlbW92ZUVkaXRvcihlZGl0b3IpO1xuICAgICAgY29uc3QgaW5wdXRXcmFwcGVyID0gZS50YXJnZXQuY2xvc2VzdCgnLmlucHV0LXdyYXBwZXInKTtcbiAgICAgIGlucHV0V3JhcHBlci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGlucHV0V3JhcHBlcik7XG5cbiAgICB9LCBmYWxzZSk7XG5cbiAgICByZXR1cm4gc3ViO1xuICB9XG5cbiAgY3JlYXRlQWRkKGlkZW50aWZpZXIpIHtcblxuICAgIGNvbnN0IGFkZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBhZGQuY2xhc3NMaXN0LmFkZCgnYWRkJyk7XG4gICAgYWRkLmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycpO1xuICAgIGFkZC5jbGFzc0xpc3QuYWRkKCdzdGF0dXMtYWRkZWQnKTtcbiAgICBhZGQuY2xhc3NMaXN0LmFkZCgnaWNvbicpO1xuICAgIGFkZC5jbGFzc0xpc3QuYWRkKCdpY29uLWRpZmYtYWRkZWQnKTtcbiAgICBhZGQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuXG4gICAgICBlLnRhcmdldC5jbG9zZXN0KCdzZWN0aW9uJykuYXBwZW5kQ2hpbGQodGhpcy5jcmVhdGVJbnB1dFdyYXBwZXIobnVsbCwgaWRlbnRpZmllcikpO1xuXG4gICAgfSwgZmFsc2UpO1xuXG4gICAgcmV0dXJuIGFkZDtcbiAgfVxuXG4gIGNyZWF0ZVRleHRFZGl0b3IocGF0aCwgaWRlbnRpZmllcikge1xuXG4gICAgY29uc3QgZWRpdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvcicpO1xuICAgIGVkaXRvci5zZXRBdHRyaWJ1dGUoJ21pbmknLCB0cnVlKTtcblxuICAgIGlmIChwYXRoKSB7XG5cbiAgICAgIGVkaXRvci5nZXRNb2RlbCgpLmdldEJ1ZmZlcigpLnNldFRleHQocGF0aCk7XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlbC5lZGl0b3JzLnB1c2goe1xuXG4gICAgICBpZGVudGlmaWVyLFxuICAgICAgcmVmOiBlZGl0b3JcbiAgICB9KTtcblxuICAgIHJldHVybiBlZGl0b3I7XG4gIH1cblxuICBnZXRNb2RlbCgpIHtcblxuICAgIHJldHVybiB0aGlzLm1vZGVsO1xuICB9XG5cbiAgc2V0TW9kZWwobW9kZWwpIHtcblxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG5cbiAgICB0aGlzLmVsLnJlbW92ZSgpO1xuICB9XG59XG4iXX0=