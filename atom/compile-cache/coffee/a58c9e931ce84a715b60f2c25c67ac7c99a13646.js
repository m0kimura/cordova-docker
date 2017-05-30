(function() {
  var $panel2, $panelBottom, $panelRight, $rootBottom, $rootRight, App, appBottom, appRight, isInited;

  App = require('./Components/App');

  $rootBottom = null;

  $rootRight = null;

  $panelBottom = null;

  $panelRight = null;

  isInited = false;

  $panel2 = null;

  appBottom = null;

  appRight = null;

  exports.show = function(_debugger) {
    if (!isInited) {
      $rootBottom = document.createElement('div');
      $rootRight = document.createElement('div');
      $rootRight.style = "display:flex";
      appBottom = App.startBottom($rootBottom, _debugger);
      appRight = App.startRight($rootRight, _debugger);
    }
    $panelBottom = atom.workspace.addBottomPanel({
      item: $rootBottom
    });
    $panelRight = atom.workspace.addRightPanel({
      item: $rootRight
    });
    return isInited = true;
  };

  exports.hide = function() {
    if ($panelBottom) {
      $panelBottom.destroy();
    }
    if ($panelRight) {
      $panelRight.destroy();
    }
    return atom.workspace.getActivePane().activate();
  };

  exports.destroy = function() {
    exports.hide();
    App.stop();
    isInited = false;
    if ($rootBottom != null) {
      $rootBottom.remove();
    }
    if ($rootRight != null) {
      $rootRight.remove();
    }
    $rootBottom = null;
    return $rootRight = null;
  };

  exports.toggle = function() {
    if (!isInited) {
      return;
    }
    if (!(appBottom.collapsed() && appRight.collapsed())) {
      appBottom.collapsed.set(true);
      return appRight.collapsed.set(true);
    } else {
      appBottom.collapsed.set(false);
      return appRight.collapsed.set(false);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL25vZGUtZGVidWdnZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsa0JBQVI7O0VBRU4sV0FBQSxHQUFjOztFQUNkLFVBQUEsR0FBYTs7RUFDYixZQUFBLEdBQWU7O0VBQ2YsV0FBQSxHQUFjOztFQUNkLFFBQUEsR0FBVzs7RUFDWCxPQUFBLEdBQVU7O0VBQ1YsU0FBQSxHQUFZOztFQUNaLFFBQUEsR0FBVzs7RUFFWCxPQUFPLENBQUMsSUFBUixHQUFlLFNBQUMsU0FBRDtJQUNiLElBQUcsQ0FBSSxRQUFQO01BQ0UsV0FBQSxHQUFjLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2QsVUFBQSxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2IsVUFBVSxDQUFDLEtBQVgsR0FBbUI7TUFDbkIsU0FBQSxHQUFZLEdBQUcsQ0FBQyxXQUFKLENBQWdCLFdBQWhCLEVBQTZCLFNBQTdCO01BQ1osUUFBQSxHQUFXLEdBQUcsQ0FBQyxVQUFKLENBQWUsVUFBZixFQUEyQixTQUEzQixFQUxiOztJQU9BLFlBQUEsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7TUFBQSxJQUFBLEVBQU0sV0FBTjtLQUE5QjtJQUNmLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7TUFBQSxJQUFBLEVBQU0sVUFBTjtLQUE3QjtXQUNkLFFBQUEsR0FBVztFQVZFOztFQVlmLE9BQU8sQ0FBQyxJQUFSLEdBQWUsU0FBQTtJQUNiLElBQTBCLFlBQTFCO01BQUEsWUFBWSxDQUFDLE9BQWIsQ0FBQSxFQUFBOztJQUNBLElBQXlCLFdBQXpCO01BQUEsV0FBVyxDQUFDLE9BQVosQ0FBQSxFQUFBOztXQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQThCLENBQUMsUUFBL0IsQ0FBQTtFQUhhOztFQUtmLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUE7SUFDaEIsT0FBTyxDQUFDLElBQVIsQ0FBQTtJQUNBLEdBQUcsQ0FBQyxJQUFKLENBQUE7SUFDQSxRQUFBLEdBQVc7SUFDWCxJQUF3QixtQkFBeEI7TUFBQSxXQUFXLENBQUMsTUFBWixDQUFBLEVBQUE7O0lBQ0EsSUFBdUIsa0JBQXZCO01BQUEsVUFBVSxDQUFDLE1BQVgsQ0FBQSxFQUFBOztJQUNBLFdBQUEsR0FBYztXQUNkLFVBQUEsR0FBYTtFQVBHOztFQVNsQixPQUFPLENBQUMsTUFBUixHQUFpQixTQUFBO0lBQ2YsSUFBQSxDQUFjLFFBQWQ7QUFBQSxhQUFBOztJQUNBLElBQUEsQ0FBQSxDQUFPLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FBQSxJQUEwQixRQUFRLENBQUMsU0FBVCxDQUFBLENBQWpDLENBQUE7TUFDRSxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQXBCLENBQXdCLElBQXhCO2FBQ0EsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixJQUF2QixFQUZGO0tBQUEsTUFBQTtNQUlFLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBcEIsQ0FBd0IsS0FBeEI7YUFDQSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLEtBQXZCLEVBTEY7O0VBRmU7QUFyQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiQXBwID0gcmVxdWlyZSAnLi9Db21wb25lbnRzL0FwcCdcblxuJHJvb3RCb3R0b20gPSBudWxsXG4kcm9vdFJpZ2h0ID0gbnVsbFxuJHBhbmVsQm90dG9tID0gbnVsbFxuJHBhbmVsUmlnaHQgPSBudWxsXG5pc0luaXRlZCA9IGZhbHNlXG4kcGFuZWwyID0gbnVsbFxuYXBwQm90dG9tID0gbnVsbFxuYXBwUmlnaHQgPSBudWxsXG5cbmV4cG9ydHMuc2hvdyA9IChfZGVidWdnZXIpIC0+XG4gIGlmIG5vdCBpc0luaXRlZFxuICAgICRyb290Qm90dG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAkcm9vdFJpZ2h0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAkcm9vdFJpZ2h0LnN0eWxlID0gXCJkaXNwbGF5OmZsZXhcIiAjIGhhZCB0byBzZXQgZmxleCBoZXJlIHRvIGdldCB0aGUgc3BsaXR0ZXIgdG8gZmlsbCB0aGUgdmVydGljYWwgc3BhY2VcbiAgICBhcHBCb3R0b20gPSBBcHAuc3RhcnRCb3R0b20oJHJvb3RCb3R0b20sIF9kZWJ1Z2dlcilcbiAgICBhcHBSaWdodCA9IEFwcC5zdGFydFJpZ2h0KCRyb290UmlnaHQsIF9kZWJ1Z2dlcilcblxuICAkcGFuZWxCb3R0b20gPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiAkcm9vdEJvdHRvbSlcbiAgJHBhbmVsUmlnaHQgPSBhdG9tLndvcmtzcGFjZS5hZGRSaWdodFBhbmVsKGl0ZW06ICRyb290UmlnaHQpXG4gIGlzSW5pdGVkID0gdHJ1ZVxuXG5leHBvcnRzLmhpZGUgPSAtPlxuICAkcGFuZWxCb3R0b20uZGVzdHJveSgpIGlmICRwYW5lbEJvdHRvbVxuICAkcGFuZWxSaWdodC5kZXN0cm95KCkgaWYgJHBhbmVsUmlnaHRcbiAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKClcblxuZXhwb3J0cy5kZXN0cm95ID0gLT5cbiAgZXhwb3J0cy5oaWRlKClcbiAgQXBwLnN0b3AoKVxuICBpc0luaXRlZCA9IGZhbHNlXG4gICRyb290Qm90dG9tLnJlbW92ZSgpIGlmICRyb290Qm90dG9tP1xuICAkcm9vdFJpZ2h0LnJlbW92ZSgpIGlmICRyb290UmlnaHQ/XG4gICRyb290Qm90dG9tID0gbnVsbFxuICAkcm9vdFJpZ2h0ID0gbnVsbFxuXG5leHBvcnRzLnRvZ2dsZSA9IC0+XG4gIHJldHVybiB1bmxlc3MgaXNJbml0ZWRcbiAgdW5sZXNzIGFwcEJvdHRvbS5jb2xsYXBzZWQoKSBhbmQgYXBwUmlnaHQuY29sbGFwc2VkKClcbiAgICBhcHBCb3R0b20uY29sbGFwc2VkLnNldCh0cnVlKVxuICAgIGFwcFJpZ2h0LmNvbGxhcHNlZC5zZXQodHJ1ZSlcbiAgZWxzZVxuICAgIGFwcEJvdHRvbS5jb2xsYXBzZWQuc2V0KGZhbHNlKVxuICAgIGFwcFJpZ2h0LmNvbGxhcHNlZC5zZXQoZmFsc2UpXG4iXX0=
