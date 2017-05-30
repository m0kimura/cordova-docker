(function() {
  var $, $$$, DEFAULT_HEADING_TEXT, ResultView, View, clickablePaths, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$$ = ref.$$$, View = ref.View;

  clickablePaths = require('./clickable-paths');

  DEFAULT_HEADING_TEXT = 'Mocha test results';

  module.exports = ResultView = (function(superClass) {
    extend(ResultView, superClass);

    function ResultView() {
      this.resizeView = bind(this.resizeView, this);
      return ResultView.__super__.constructor.apply(this, arguments);
    }

    ResultView.content = function() {
      return this.div({
        "class": 'mocha-test-runner'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'panel'
          }, function() {
            _this.div({
              outlet: 'heading',
              "class": 'heading'
            }, function() {
              _this.div({
                "class": 'pull-right'
              }, function() {
                return _this.span({
                  outlet: 'closeButton',
                  "class": 'close-icon'
                });
              });
              return _this.span({
                outlet: 'headingText'
              }, DEFAULT_HEADING_TEXT);
            });
            return _this.div({
              "class": 'panel-body'
            }, function() {
              return _this.pre({
                outlet: 'results',
                "class": 'results'
              });
            });
          });
        };
      })(this));
    };

    ResultView.prototype.initialize = function(state) {
      var height;
      height = state != null ? state.height : void 0;
      this.openHeight = Math.max(140, state != null ? state.openHeight : void 0, height);
      this.height(height);
      this.heading.on('dblclick', (function(_this) {
        return function() {
          return _this.toggleCollapse();
        };
      })(this));
      this.closeButton.on('click', (function(_this) {
        return function() {
          return atom.commands.dispatch(_this, 'result-view:close');
        };
      })(this));
      this.heading.on('mousedown', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
      this.results.addClass('native-key-bindings');
      this.results.attr('tabindex', -1);
      return clickablePaths.attachClickHandler();
    };

    ResultView.prototype.serialize = function() {
      return {
        height: this.height(),
        openHeight: this.openHeight
      };
    };

    ResultView.prototype.destroy = function() {
      return clickablePaths.removeClickHandler();
    };

    ResultView.prototype.resizeStarted = function(arg) {
      var pageY;
      pageY = arg.pageY;
      this.resizeData = {
        pageY: pageY,
        height: this.height()
      };
      $(document.body).on('mousemove', this.resizeView);
      return $(document.body).one('mouseup', this.resizeStopped.bind(this));
    };

    ResultView.prototype.resizeStopped = function() {
      var currentHeight;
      $(document.body).off('mousemove', this.resizeView);
      currentHeight = this.height();
      if (currentHeight > this.heading.outerHeight()) {
        return this.openHeight = currentHeight;
      }
    };

    ResultView.prototype.resizeView = function(arg) {
      var headingHeight, pageY;
      pageY = arg.pageY;
      headingHeight = this.heading.outerHeight();
      this.height(Math.max(this.resizeData.height + this.resizeData.pageY - pageY, headingHeight));
      return this.updateResultPanelHeight();
    };

    ResultView.prototype.reset = function() {
      this.heading.removeClass('alert-success alert-danger');
      this.heading.addClass('alert-info');
      this.headingText.html(DEFAULT_HEADING_TEXT + "...");
      return this.results.empty();
    };

    ResultView.prototype.updateResultPanelHeight = function() {
      var panelBody;
      panelBody = this.find('.panel-body');
      return panelBody.height(this.height() - this.heading.outerHeight());
    };

    ResultView.prototype.addLine = function(line) {
      if (line !== '\n') {
        return this.results.append(line);
      }
    };

    ResultView.prototype.success = function(stats) {
      this.heading.removeClass('alert-info');
      this.heading.addClass('alert-success');
      return this.updateResultPanelHeight();
    };

    ResultView.prototype.failure = function(stats) {
      this.heading.removeClass('alert-info');
      this.heading.addClass('alert-danger');
      return this.updateResultPanelHeight();
    };

    ResultView.prototype.updateSummary = function(stats) {
      if (!(stats != null ? stats.length : void 0)) {
        return;
      }
      return this.headingText.html(DEFAULT_HEADING_TEXT + ": " + (stats.join(', ')));
    };

    ResultView.prototype.toggleCollapse = function() {
      var headingHeight, viewHeight;
      headingHeight = this.heading.outerHeight();
      viewHeight = this.height();
      if (!(headingHeight > 0)) {
        return;
      }
      if (viewHeight > headingHeight) {
        this.openHeight = viewHeight;
        return this.height(headingHeight);
      } else {
        return this.height(this.openHeight);
      }
    };

    return ResultView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL2xpYi9yZXN1bHQtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1FQUFBO0lBQUE7Ozs7RUFBQSxNQUFpQixPQUFBLENBQVEsc0JBQVIsQ0FBakIsRUFBQyxTQUFELEVBQUksYUFBSixFQUFTOztFQUNULGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSOztFQUVqQixvQkFBQSxHQUF1Qjs7RUFFdkIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7SUFFSixVQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQkFBUDtPQUFMLEVBQWlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDL0IsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtXQUFMLEVBQXFCLFNBQUE7WUFDbkIsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLE1BQUEsRUFBUSxTQUFSO2NBQW1CLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBMUI7YUFBTCxFQUEwQyxTQUFBO2NBQ3hDLEtBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2VBQUwsRUFBMEIsU0FBQTt1QkFDeEIsS0FBQyxDQUFBLElBQUQsQ0FBTTtrQkFBQSxNQUFBLEVBQVEsYUFBUjtrQkFBdUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUE5QjtpQkFBTjtjQUR3QixDQUExQjtxQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNO2dCQUFBLE1BQUEsRUFBUSxhQUFSO2VBQU4sRUFBNkIsb0JBQTdCO1lBSHdDLENBQTFDO21CQUlBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7YUFBTCxFQUEwQixTQUFBO3FCQUN4QixLQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLE1BQUEsRUFBUSxTQUFSO2dCQUFtQixDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQTFCO2VBQUw7WUFEd0IsQ0FBMUI7VUFMbUIsQ0FBckI7UUFEK0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO0lBRFE7O3lCQVVWLFVBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixVQUFBO01BQUEsTUFBQSxtQkFBUyxLQUFLLENBQUU7TUFDaEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLEdBQVQsa0JBQWEsS0FBSyxDQUFFLG1CQUFwQixFQUErQixNQUEvQjtNQUNkLElBQUMsQ0FBQSxNQUFELENBQVEsTUFBUjtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFVBQVosRUFBd0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxjQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixLQUF2QixFQUE2QixtQkFBN0I7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxXQUFaLEVBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO2lCQUFPLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtRQUFQO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBVCxDQUFrQixxQkFBbEI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxVQUFkLEVBQTBCLENBQUMsQ0FBM0I7YUFFQSxjQUFjLENBQUMsa0JBQWYsQ0FBQTtJQVhVOzt5QkFhWixTQUFBLEdBQVcsU0FBQTthQUNUO1FBQUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUjtRQUNBLFVBQUEsRUFBWSxJQUFDLENBQUEsVUFEYjs7SUFEUzs7eUJBSVgsT0FBQSxHQUFTLFNBQUE7YUFDUCxjQUFjLENBQUMsa0JBQWYsQ0FBQTtJQURPOzt5QkFHVCxhQUFBLEdBQWUsU0FBQyxHQUFEO0FBQ2IsVUFBQTtNQURlLFFBQUQ7TUFDZCxJQUFDLENBQUEsVUFBRCxHQUNFO1FBQUEsS0FBQSxFQUFPLEtBQVA7UUFDQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQURSOztNQUVGLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBWCxDQUFnQixDQUFDLEVBQWpCLENBQW9CLFdBQXBCLEVBQWlDLElBQUMsQ0FBQSxVQUFsQzthQUNBLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBWCxDQUFnQixDQUFDLEdBQWpCLENBQXFCLFNBQXJCLEVBQWdDLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFvQixJQUFwQixDQUFoQztJQUxhOzt5QkFPZixhQUFBLEdBQWUsU0FBQTtBQUNiLFVBQUE7TUFBQSxDQUFBLENBQUUsUUFBUSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixXQUFyQixFQUFrQyxJQUFDLENBQUEsVUFBbkM7TUFFQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDaEIsSUFBRyxhQUFBLEdBQWdCLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFBLENBQW5CO2VBQ0UsSUFBQyxDQUFBLFVBQUQsR0FBYyxjQURoQjs7SUFKYTs7eUJBT2YsVUFBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFVBQUE7TUFEWSxRQUFEO01BQ1gsYUFBQSxHQUFpQixJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBQTtNQUNqQixJQUFDLENBQUEsTUFBRCxDQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLEdBQXFCLElBQUMsQ0FBQSxVQUFVLENBQUMsS0FBakMsR0FBeUMsS0FBbEQsRUFBd0QsYUFBeEQsQ0FBUjthQUNBLElBQUMsQ0FBQSx1QkFBRCxDQUFBO0lBSFU7O3lCQUtaLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLDRCQUFyQjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBVCxDQUFrQixZQUFsQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFxQixvQkFBRCxHQUFzQixLQUExQzthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFBO0lBSks7O3lCQU1QLHVCQUFBLEdBQXlCLFNBQUE7QUFDdkIsVUFBQTtNQUFBLFNBQUEsR0FBWSxJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU47YUFDWixTQUFTLENBQUMsTUFBVixDQUFrQixJQUFDLENBQUEsTUFBRCxDQUFBLENBQUEsR0FBWSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBQSxDQUE5QjtJQUZ1Qjs7eUJBSXpCLE9BQUEsR0FBUyxTQUFDLElBQUQ7TUFDUCxJQUFHLElBQUEsS0FBVSxJQUFiO2VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQWhCLEVBREY7O0lBRE87O3lCQUlULE9BQUEsR0FBUyxTQUFDLEtBQUQ7TUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsWUFBckI7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBa0IsZUFBbEI7YUFDQSxJQUFDLENBQUEsdUJBQUQsQ0FBQTtJQUhPOzt5QkFLVCxPQUFBLEdBQVMsU0FBQyxLQUFEO01BQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLFlBQXJCO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULENBQWtCLGNBQWxCO2FBQ0EsSUFBQyxDQUFBLHVCQUFELENBQUE7SUFITzs7eUJBS1QsYUFBQSxHQUFlLFNBQUMsS0FBRDtNQUNiLElBQUEsa0JBQWMsS0FBSyxDQUFFLGdCQUFyQjtBQUFBLGVBQUE7O2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQXFCLG9CQUFELEdBQXNCLElBQXRCLEdBQXlCLENBQUMsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQUQsQ0FBN0M7SUFGYTs7eUJBSWYsY0FBQSxHQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQUE7TUFDaEIsVUFBQSxHQUFhLElBQUMsQ0FBQSxNQUFELENBQUE7TUFFYixJQUFBLENBQUEsQ0FBYyxhQUFBLEdBQWdCLENBQTlCLENBQUE7QUFBQSxlQUFBOztNQUVBLElBQUcsVUFBQSxHQUFhLGFBQWhCO1FBQ0UsSUFBQyxDQUFBLFVBQUQsR0FBYztlQUNkLElBQUMsQ0FBQSxNQUFELENBQVEsYUFBUixFQUZGO09BQUEsTUFBQTtlQUlFLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLFVBQVQsRUFKRjs7SUFOYzs7OztLQS9FTztBQU56QiIsInNvdXJjZXNDb250ZW50IjpbInskLCAkJCQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5jbGlja2FibGVQYXRocyA9IHJlcXVpcmUgJy4vY2xpY2thYmxlLXBhdGhzJ1xuXG5ERUZBVUxUX0hFQURJTkdfVEVYVCA9ICdNb2NoYSB0ZXN0IHJlc3VsdHMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlc3VsdFZpZXcgZXh0ZW5kcyBWaWV3XG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ21vY2hhLXRlc3QtcnVubmVyJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbCcsID0+XG4gICAgICAgIEBkaXYgb3V0bGV0OiAnaGVhZGluZycsIGNsYXNzOiAnaGVhZGluZycsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgICAgQHNwYW4gb3V0bGV0OiAnY2xvc2VCdXR0b24nLCBjbGFzczogJ2Nsb3NlLWljb24nXG4gICAgICAgICAgQHNwYW4gb3V0bGV0OiAnaGVhZGluZ1RleHQnLCBERUZBVUxUX0hFQURJTkdfVEVYVFxuICAgICAgICBAZGl2IGNsYXNzOiAncGFuZWwtYm9keScsID0+XG4gICAgICAgICAgQHByZSBvdXRsZXQ6ICdyZXN1bHRzJywgY2xhc3M6ICdyZXN1bHRzJ1xuXG4gIGluaXRpYWxpemU6IChzdGF0ZSkgLT5cbiAgICBoZWlnaHQgPSBzdGF0ZT8uaGVpZ2h0XG4gICAgQG9wZW5IZWlnaHQgPSBNYXRoLm1heCgxNDAsc3RhdGU/Lm9wZW5IZWlnaHQsaGVpZ2h0KVxuICAgIEBoZWlnaHQgaGVpZ2h0XG5cbiAgICBAaGVhZGluZy5vbiAnZGJsY2xpY2snLCA9PiBAdG9nZ2xlQ29sbGFwc2UoKVxuICAgIEBjbG9zZUJ1dHRvbi5vbiAnY2xpY2snLCA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHRoaXMsICdyZXN1bHQtdmlldzpjbG9zZSdcbiAgICBAaGVhZGluZy5vbiAnbW91c2Vkb3duJywgKGUpID0+IEByZXNpemVTdGFydGVkIGVcbiAgICBAcmVzdWx0cy5hZGRDbGFzcyAnbmF0aXZlLWtleS1iaW5kaW5ncydcbiAgICBAcmVzdWx0cy5hdHRyICd0YWJpbmRleCcsIC0xXG5cbiAgICBjbGlja2FibGVQYXRocy5hdHRhY2hDbGlja0hhbmRsZXIoKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBoZWlnaHQ6IEBoZWlnaHQoKVxuICAgIG9wZW5IZWlnaHQ6IEBvcGVuSGVpZ2h0XG5cbiAgZGVzdHJveTogLT5cbiAgICBjbGlja2FibGVQYXRocy5yZW1vdmVDbGlja0hhbmRsZXIoKVxuXG4gIHJlc2l6ZVN0YXJ0ZWQ6ICh7cGFnZVl9KSAtPlxuICAgIEByZXNpemVEYXRhID1cbiAgICAgIHBhZ2VZOiBwYWdlWVxuICAgICAgaGVpZ2h0OiBAaGVpZ2h0KClcbiAgICAkKGRvY3VtZW50LmJvZHkpLm9uICdtb3VzZW1vdmUnLCBAcmVzaXplVmlld1xuICAgICQoZG9jdW1lbnQuYm9keSkub25lICdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQuYmluZCh0aGlzKVxuXG4gIHJlc2l6ZVN0b3BwZWQ6IC0+XG4gICAgJChkb2N1bWVudC5ib2R5KS5vZmYgJ21vdXNlbW92ZScsIEByZXNpemVWaWV3XG5cbiAgICBjdXJyZW50SGVpZ2h0ID0gQGhlaWdodCgpXG4gICAgaWYgY3VycmVudEhlaWdodCA+IEBoZWFkaW5nLm91dGVySGVpZ2h0KClcbiAgICAgIEBvcGVuSGVpZ2h0ID0gY3VycmVudEhlaWdodFxuXG4gIHJlc2l6ZVZpZXc6ICh7cGFnZVl9KSA9PlxuICAgIGhlYWRpbmdIZWlnaHQgPSAgQGhlYWRpbmcub3V0ZXJIZWlnaHQoKVxuICAgIEBoZWlnaHQgTWF0aC5tYXgoQHJlc2l6ZURhdGEuaGVpZ2h0ICsgQHJlc2l6ZURhdGEucGFnZVkgLSBwYWdlWSxoZWFkaW5nSGVpZ2h0KVxuICAgIEB1cGRhdGVSZXN1bHRQYW5lbEhlaWdodCgpXG5cbiAgcmVzZXQ6IC0+XG4gICAgQGhlYWRpbmcucmVtb3ZlQ2xhc3MgJ2FsZXJ0LXN1Y2Nlc3MgYWxlcnQtZGFuZ2VyJ1xuICAgIEBoZWFkaW5nLmFkZENsYXNzICdhbGVydC1pbmZvJ1xuICAgIEBoZWFkaW5nVGV4dC5odG1sIFwiI3tERUZBVUxUX0hFQURJTkdfVEVYVH0uLi5cIlxuICAgIEByZXN1bHRzLmVtcHR5KClcblxuICB1cGRhdGVSZXN1bHRQYW5lbEhlaWdodDogLT5cbiAgICBwYW5lbEJvZHkgPSBAZmluZCAnLnBhbmVsLWJvZHknXG4gICAgcGFuZWxCb2R5LmhlaWdodCAoQGhlaWdodCgpIC0gQGhlYWRpbmcub3V0ZXJIZWlnaHQoKSlcblxuICBhZGRMaW5lOiAobGluZSkgLT5cbiAgICBpZiBsaW5lIGlzbnQgJ1xcbidcbiAgICAgIEByZXN1bHRzLmFwcGVuZCBsaW5lXG5cbiAgc3VjY2VzczogKHN0YXRzKSAtPlxuICAgIEBoZWFkaW5nLnJlbW92ZUNsYXNzICdhbGVydC1pbmZvJ1xuICAgIEBoZWFkaW5nLmFkZENsYXNzICdhbGVydC1zdWNjZXNzJ1xuICAgIEB1cGRhdGVSZXN1bHRQYW5lbEhlaWdodCgpXG5cbiAgZmFpbHVyZTogKHN0YXRzKSAtPlxuICAgIEBoZWFkaW5nLnJlbW92ZUNsYXNzICdhbGVydC1pbmZvJ1xuICAgIEBoZWFkaW5nLmFkZENsYXNzICdhbGVydC1kYW5nZXInXG4gICAgQHVwZGF0ZVJlc3VsdFBhbmVsSGVpZ2h0KClcblxuICB1cGRhdGVTdW1tYXJ5OiAoc3RhdHMpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBzdGF0cz8ubGVuZ3RoXG4gICAgQGhlYWRpbmdUZXh0Lmh0bWwgXCIje0RFRkFVTFRfSEVBRElOR19URVhUfTogI3tzdGF0cy5qb2luKCcsICcpfVwiXG5cbiAgdG9nZ2xlQ29sbGFwc2U6IC0+XG4gICAgaGVhZGluZ0hlaWdodCA9IEBoZWFkaW5nLm91dGVySGVpZ2h0KClcbiAgICB2aWV3SGVpZ2h0ID0gQGhlaWdodCgpXG5cbiAgICByZXR1cm4gdW5sZXNzIGhlYWRpbmdIZWlnaHQgPiAwXG5cbiAgICBpZiB2aWV3SGVpZ2h0ID4gaGVhZGluZ0hlaWdodFxuICAgICAgQG9wZW5IZWlnaHQgPSB2aWV3SGVpZ2h0XG4gICAgICBAaGVpZ2h0KGhlYWRpbmdIZWlnaHQpXG4gICAgZWxzZVxuICAgICAgQGhlaWdodCBAb3BlbkhlaWdodFxuIl19
