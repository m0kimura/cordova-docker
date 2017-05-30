(function() {
  var Promise, TreeView, TreeViewItem, TreeViewUtils, gotoBreakpoint, h, hg, listeners, log, ref;

  hg = require('mercury');

  Promise = require('bluebird');

  h = hg.h;

  listeners = [];

  log = function(msg) {};

  ref = require('./TreeView'), TreeView = ref.TreeView, TreeViewItem = ref.TreeViewItem, TreeViewUtils = ref.TreeViewUtils;

  gotoBreakpoint = function(breakpoint) {
    return atom.workspace.open(breakpoint.script, {
      initialLine: breakpoint.line,
      initialColumn: 0,
      activatePane: true,
      searchAllPanes: true
    });
  };

  exports.create = function(_debugger) {
    var BreakpointPanel, builder;
    builder = {
      listBreakpoints: function() {
        log("builder.listBreakpoints");
        return Promise.resolve(_debugger.breakpointManager.breakpoints);
      },
      breakpoint: function(breakpoint) {
        log("builder.breakpoint");
        return TreeViewItem(TreeViewUtils.createFileRefHeader(breakpoint.script, breakpoint.line + 1), {
          handlers: {
            click: function() {
              return gotoBreakpoint(breakpoint);
            }
          }
        });
      },
      root: function() {
        return TreeView("Breakpoints", (function() {
          return builder.listBreakpoints().map(builder.breakpoint);
        }), {
          isRoot: true
        });
      }
    };
    BreakpointPanel = function() {
      var refresh, state;
      state = builder.root();
      refresh = function() {
        return TreeView.populate(state);
      };
      listeners.push(_debugger.onAddBreakpoint(refresh));
      listeners.push(_debugger.onRemoveBreakpoint(refresh));
      listeners.push(_debugger.onBreak(refresh));
      return state;
    };
    BreakpointPanel.render = function(state) {
      return TreeView.render(state);
    };
    BreakpointPanel.cleanup = function() {
      var i, len, remove, results;
      results = [];
      for (i = 0, len = listeners.length; i < len; i++) {
        remove = listeners[i];
        results.push(remove());
      }
      return results;
    };
    return BreakpointPanel;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvQnJlYWtQb2ludFBhbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsT0FBQSxHQUFVLE9BQUEsQ0FBUSxVQUFSOztFQUNULElBQUs7O0VBRU4sU0FBQSxHQUFZOztFQUVaLEdBQUEsR0FBTSxTQUFDLEdBQUQsR0FBQTs7RUFFTixNQUEwQyxPQUFBLENBQVEsWUFBUixDQUExQyxFQUFDLHVCQUFELEVBQVcsK0JBQVgsRUFBeUI7O0VBRXpCLGNBQUEsR0FBaUIsU0FBQyxVQUFEO1dBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQVUsQ0FBQyxNQUEvQixFQUF1QztNQUNyQyxXQUFBLEVBQWEsVUFBVSxDQUFDLElBRGE7TUFFckMsYUFBQSxFQUFlLENBRnNCO01BR3JDLFlBQUEsRUFBYyxJQUh1QjtNQUlyQyxjQUFBLEVBQWdCLElBSnFCO0tBQXZDO0VBRGU7O0VBUWpCLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLFNBQUMsU0FBRDtBQUVmLFFBQUE7SUFBQSxPQUFBLEdBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7UUFDZixHQUFBLENBQUkseUJBQUo7ZUFDQSxPQUFPLENBQUMsT0FBUixDQUFnQixTQUFTLENBQUMsaUJBQWlCLENBQUMsV0FBNUM7TUFGZSxDQUFqQjtNQUlBLFVBQUEsRUFBWSxTQUFDLFVBQUQ7UUFDVixHQUFBLENBQUksb0JBQUo7ZUFDQSxZQUFBLENBQ0UsYUFBYSxDQUFDLG1CQUFkLENBQWtDLFVBQVUsQ0FBQyxNQUE3QyxFQUFxRCxVQUFVLENBQUMsSUFBWCxHQUFnQixDQUFyRSxDQURGLEVBRUU7VUFBQSxRQUFBLEVBQVU7WUFBRSxLQUFBLEVBQU8sU0FBQTtxQkFBTSxjQUFBLENBQWUsVUFBZjtZQUFOLENBQVQ7V0FBVjtTQUZGO01BRlUsQ0FKWjtNQVVBLElBQUEsRUFBTSxTQUFBO2VBQ0osUUFBQSxDQUFTLGFBQVQsRUFBd0IsQ0FBQyxTQUFBO2lCQUFNLE9BQU8sQ0FBQyxlQUFSLENBQUEsQ0FBeUIsQ0FBQyxHQUExQixDQUE4QixPQUFPLENBQUMsVUFBdEM7UUFBTixDQUFELENBQXhCLEVBQW1GO1VBQUEsTUFBQSxFQUFRLElBQVI7U0FBbkY7TUFESSxDQVZOOztJQWFGLGVBQUEsR0FBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxJQUFSLENBQUE7TUFDUixPQUFBLEdBQVUsU0FBQTtlQUFNLFFBQVEsQ0FBQyxRQUFULENBQWtCLEtBQWxCO01BQU47TUFDVixTQUFTLENBQUMsSUFBVixDQUFlLFNBQVMsQ0FBQyxlQUFWLENBQTBCLE9BQTFCLENBQWY7TUFDQSxTQUFTLENBQUMsSUFBVixDQUFlLFNBQVMsQ0FBQyxrQkFBVixDQUE2QixPQUE3QixDQUFmO01BQ0EsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFTLENBQUMsT0FBVixDQUFrQixPQUFsQixDQUFmO0FBQ0EsYUFBTztJQU5TO0lBUWxCLGVBQWUsQ0FBQyxNQUFoQixHQUF5QixTQUFDLEtBQUQ7YUFDdkIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsS0FBaEI7SUFEdUI7SUFHekIsZUFBZSxDQUFDLE9BQWhCLEdBQTBCLFNBQUE7QUFDeEIsVUFBQTtBQUFBO1dBQUEsMkNBQUE7O3FCQUNFLE1BQUEsQ0FBQTtBQURGOztJQUR3QjtBQUkxQixXQUFPO0VBL0JRO0FBbEJqQiIsInNvdXJjZXNDb250ZW50IjpbImhnID0gcmVxdWlyZSAnbWVyY3VyeSdcblByb21pc2UgPSByZXF1aXJlICdibHVlYmlyZCdcbntofSA9IGhnXG5cbmxpc3RlbmVycyA9IFtdXG5cbmxvZyA9IChtc2cpIC0+ICNjb25zb2xlLmxvZyhtc2cpXG5cbntUcmVlVmlldywgVHJlZVZpZXdJdGVtLCBUcmVlVmlld1V0aWxzfSA9IHJlcXVpcmUgJy4vVHJlZVZpZXcnXG5cbmdvdG9CcmVha3BvaW50ID0gKGJyZWFrcG9pbnQpIC0+XG4gIGF0b20ud29ya3NwYWNlLm9wZW4oYnJlYWtwb2ludC5zY3JpcHQsIHtcbiAgICBpbml0aWFsTGluZTogYnJlYWtwb2ludC5saW5lXG4gICAgaW5pdGlhbENvbHVtbjogMFxuICAgIGFjdGl2YXRlUGFuZTogdHJ1ZVxuICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gIH0pXG5cbmV4cG9ydHMuY3JlYXRlID0gKF9kZWJ1Z2dlcikgLT5cblxuICBidWlsZGVyID1cbiAgICBsaXN0QnJlYWtwb2ludHM6ICgpIC0+XG4gICAgICBsb2cgXCJidWlsZGVyLmxpc3RCcmVha3BvaW50c1wiXG4gICAgICBQcm9taXNlLnJlc29sdmUoX2RlYnVnZ2VyLmJyZWFrcG9pbnRNYW5hZ2VyLmJyZWFrcG9pbnRzKVxuXG4gICAgYnJlYWtwb2ludDogKGJyZWFrcG9pbnQpIC0+XG4gICAgICBsb2cgXCJidWlsZGVyLmJyZWFrcG9pbnRcIlxuICAgICAgVHJlZVZpZXdJdGVtKFxuICAgICAgICBUcmVlVmlld1V0aWxzLmNyZWF0ZUZpbGVSZWZIZWFkZXIgYnJlYWtwb2ludC5zY3JpcHQsIGJyZWFrcG9pbnQubGluZSsxXG4gICAgICAgIGhhbmRsZXJzOiB7IGNsaWNrOiAoKSAtPiBnb3RvQnJlYWtwb2ludChicmVha3BvaW50KSB9XG4gICAgICApXG4gICAgcm9vdDogKCkgLT5cbiAgICAgIFRyZWVWaWV3KFwiQnJlYWtwb2ludHNcIiwgKCgpIC0+IGJ1aWxkZXIubGlzdEJyZWFrcG9pbnRzKCkubWFwKGJ1aWxkZXIuYnJlYWtwb2ludCkpLCBpc1Jvb3Q6IHRydWUpXG5cbiAgQnJlYWtwb2ludFBhbmVsID0gKCkgLT5cbiAgICBzdGF0ZSA9IGJ1aWxkZXIucm9vdCgpXG4gICAgcmVmcmVzaCA9ICgpIC0+IFRyZWVWaWV3LnBvcHVsYXRlKHN0YXRlKVxuICAgIGxpc3RlbmVycy5wdXNoIF9kZWJ1Z2dlci5vbkFkZEJyZWFrcG9pbnQgcmVmcmVzaFxuICAgIGxpc3RlbmVycy5wdXNoIF9kZWJ1Z2dlci5vblJlbW92ZUJyZWFrcG9pbnQgcmVmcmVzaFxuICAgIGxpc3RlbmVycy5wdXNoIF9kZWJ1Z2dlci5vbkJyZWFrIHJlZnJlc2hcbiAgICByZXR1cm4gc3RhdGVcblxuICBCcmVha3BvaW50UGFuZWwucmVuZGVyID0gKHN0YXRlKSAtPlxuICAgIFRyZWVWaWV3LnJlbmRlcihzdGF0ZSlcblxuICBCcmVha3BvaW50UGFuZWwuY2xlYW51cCA9ICgpIC0+XG4gICAgZm9yIHJlbW92ZSBpbiBsaXN0ZW5lcnNcbiAgICAgIHJlbW92ZSgpXG5cbiAgcmV0dXJuIEJyZWFrcG9pbnRQYW5lbFxuIl19
