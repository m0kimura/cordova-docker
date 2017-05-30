(function() {
  var Promise, TreeView, TreeViewItem, TreeViewUtils, h, hg, log;

  hg = require('mercury');

  h = hg.h;

  Promise = require('bluebird');

  log = function(msg) {};

  TreeView = function(title, loadChildren, arg) {
    var handlers, isRoot, ref;
    ref = arg != null ? arg : {}, handlers = ref.handlers, isRoot = ref.isRoot;
    log("TreeView constructor. title=" + title + ", isRoot=" + isRoot);
    return hg.state({
      isRoot: hg.value(isRoot),
      title: hg.value(title),
      items: hg.array([]),
      isOpen: hg.value(false),
      loading: hg.value(false),
      loaded: hg.value(false),
      channels: {
        click: function(state) {
          log("TreeView event handler for click invoked");
          TreeView.toggle(state);
          return handlers != null ? typeof handlers.click === "function" ? handlers.click(state) : void 0 : void 0;
        },
        dblclick: function(state) {
          log("TreeView event handler for dblclick invoked");
          return handlers != null ? typeof handlers.dblclick === "function" ? handlers.dblclick(state) : void 0 : void 0;
        },
        customEvent: function(state) {
          log("TreeView event handler for customEvent invoked");
          return handlers != null ? typeof handlers.customEvent === "function" ? handlers.customEvent(state) : void 0 : void 0;
        }
      },
      functors: {
        render: TreeView.defaultRender,
        loadChildren: loadChildren
      }
    });
  };

  TreeView.toggle = function(state) {
    log("TreeView.toggle " + (state.isOpen()) + " item count=" + (state.items().length) + " loaded=" + (state.loaded()) + ", loading=" + (state.loading()));
    state.isOpen.set(!state.isOpen());
    if (state.loading() || state.loaded()) {
      return;
    }
    return TreeView.populate(state);
  };

  TreeView.reset = function(state) {
    log("TreeView.reset");
    if (!state.loaded()) {
      return;
    }
    state.items.set([]);
    state.isOpen.set(false);
    state.loaded.set(false);
    state.loading.set(false);
    return log("TreeView.reset: done");
  };

  TreeView.populate = function(state) {
    log("TreeView.populate");
    state.loading.set(true);
    return state.functors.loadChildren(state).then(function(children) {
      log("TreeView.populate: children loaded. count=" + children.length + ")");
      state.items.set(children);
      state.loaded.set(true);
      state.loading.set(false);
      return log("TreeView.populate: all done");
    })["catch"](function(e) {
      log("TreeView.populate:error!!!" + JSON.stringify(e));
      state.loaded.set(false);
      return state.loading.set(false);
    });
  };

  TreeView.render = function(state) {
    var ref;
    return state != null ? (ref = state.functors) != null ? typeof ref.render === "function" ? ref.render(state) : void 0 : void 0 : void 0;
  };

  TreeView.defaultRender = function(state) {
    var ref, result, title;
    log("TreeView.render");
    title = (ref = typeof state.title === "function" ? state.title(state) : void 0) != null ? ref : state.title;
    result = h('li.list-nested-item', {
      className: state.isOpen ? '' : 'collapsed'
    }, [
      h('div.header.list-item' + (state.isRoot ? '.heading' : ''), {
        'ev-click': hg.send(state.channels.click),
        'ev-dblclick': hg.send(state.channels.dblclick)
      }, [title]), h('ul.entries.list-tree', {}, state.items.map(TreeView.render))
    ]);
    if (state.isRoot) {
      result = h('div.debugger-vertical-pane.inset-panel', {}, [h('ul.list-tree.has-collapsable-children', {}, [result])]);
    }
    return result;
  };

  TreeViewItem = function(value, arg) {
    var handlers;
    handlers = (arg != null ? arg : {}).handlers;
    return hg.state({
      value: hg.value(value),
      channels: {
        click: function(state) {
          log("TreeViewItem event handler for click invoked");
          return handlers != null ? typeof handlers.click === "function" ? handlers.click(state) : void 0 : void 0;
        },
        dblclick: function(state) {
          log("TreeViewItem event handler for dblclick invoked");
          return handlers != null ? typeof handlers.dblclick === "function" ? handlers.dblclick(state) : void 0 : void 0;
        }
      },
      functors: {
        render: TreeViewItem.render
      }
    });
  };

  TreeViewItem.render = function(state) {
    var ref;
    return h('li.list-item.entry', {
      'ev-click': hg.send(state.channels.click),
      'ev-dblclick': hg.send(state.channels.dblclick)
    }, [(ref = typeof state.value === "function" ? state.value(state) : void 0) != null ? ref : state.value]);
  };

  TreeViewUtils = (function() {
    function TreeViewUtils() {}

    TreeViewUtils.createFileRefHeader = function(fullPath, line) {
      return function(state) {
        return h("div", {
          title: fullPath,
          style: {
            display: 'inline'
          }
        }, [(atom.project.relativizePath(fullPath)[1]) + " : " + line]);
      };
    };

    return TreeViewUtils;

  })();

  exports.TreeView = TreeView;

  exports.TreeViewItem = TreeViewItem;

  exports.TreeViewUtils = TreeViewUtils;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvVHJlZVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0osSUFBSzs7RUFDTixPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBRVYsR0FBQSxHQUFNLFNBQUMsR0FBRCxHQUFBOztFQUVOLFFBQUEsR0FBVyxTQUFDLEtBQUQsRUFBUSxZQUFSLEVBQXNCLEdBQXRCO0FBQ1QsUUFBQTt3QkFEK0IsTUFBdUIsSUFBckIseUJBQVU7SUFDM0MsR0FBQSxDQUFJLDhCQUFBLEdBQStCLEtBQS9CLEdBQXFDLFdBQXJDLEdBQWdELE1BQXBEO0FBQ0EsV0FBTyxFQUFFLENBQUMsS0FBSCxDQUFTO01BQ1osTUFBQSxFQUFRLEVBQUUsQ0FBQyxLQUFILENBQVMsTUFBVCxDQURJO01BRVosS0FBQSxFQUFPLEVBQUUsQ0FBQyxLQUFILENBQVMsS0FBVCxDQUZLO01BR1osS0FBQSxFQUFPLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxDQUhLO01BSVosTUFBQSxFQUFRLEVBQUUsQ0FBQyxLQUFILENBQVMsS0FBVCxDQUpJO01BS1osT0FBQSxFQUFTLEVBQUUsQ0FBQyxLQUFILENBQVMsS0FBVCxDQUxHO01BTVosTUFBQSxFQUFRLEVBQUUsQ0FBQyxLQUFILENBQVMsS0FBVCxDQU5JO01BT1osUUFBQSxFQUFVO1FBQ1IsS0FBQSxFQUNFLFNBQUMsS0FBRDtVQUNFLEdBQUEsQ0FBSSwwQ0FBSjtVQUNBLFFBQVEsQ0FBQyxNQUFULENBQWdCLEtBQWhCOzJFQUNBLFFBQVEsQ0FBRSxNQUFPO1FBSG5CLENBRk07UUFNUixRQUFBLEVBQ0UsU0FBQyxLQUFEO1VBQ0UsR0FBQSxDQUFJLDZDQUFKOzhFQUNBLFFBQVEsQ0FBRSxTQUFV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WSxDQUFDLE1BQWIsR0FBc0IsU0FBQyxLQUFEO0FBQ3BCLFFBQUE7V0FBQSxDQUFBLENBQUUsb0JBQUYsRUFBd0I7TUFDdEIsVUFBQSxFQUFZLEVBQUUsQ0FBQyxJQUFILENBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUF2QixDQURVO01BRXRCLGFBQUEsRUFBZSxFQUFFLENBQUMsSUFBSCxDQUFRLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBdkIsQ0FGTztLQUF4QixFQUdHLHlGQUF1QixLQUFLLENBQUMsS0FBN0IsQ0FISDtFQURvQjs7RUFNaEI7OztJQUNKLGFBQUMsQ0FBQSxtQkFBRCxHQUFzQixTQUFDLFFBQUQsRUFBVyxJQUFYO0FBQ2hCLGFBQU8sU0FBQyxLQUFEO2VBQVcsQ0FBQSxDQUFFLEtBQUYsRUFBUztVQUN2QixLQUFBLEVBQU8sUUFEZ0I7VUFFdkIsS0FBQSxFQUNFO1lBQUEsT0FBQSxFQUFTLFFBQVQ7V0FIcUI7U0FBVCxFQUtoQixDQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLFFBQTVCLENBQXNDLENBQUEsQ0FBQSxDQUF2QyxDQUFBLEdBQTBDLEtBQTFDLEdBQStDLElBQWxELENBTGdCO01BQVg7SUFEUzs7Ozs7O0VBU3hCLE9BQU8sQ0FBQyxRQUFSLEdBQW1COztFQUNuQixPQUFPLENBQUMsWUFBUixHQUF1Qjs7RUFDdkIsT0FBTyxDQUFDLGFBQVIsR0FBd0I7QUExSHhCIiwic291cmNlc0NvbnRlbnQiOlsiaGcgPSByZXF1aXJlICdtZXJjdXJ5J1xue2h9ID0gaGdcblByb21pc2UgPSByZXF1aXJlICdibHVlYmlyZCdcblxubG9nID0gKG1zZykgLT4gI2NvbnNvbGUubG9nKG1zZylcblxuVHJlZVZpZXcgPSAodGl0bGUsIGxvYWRDaGlsZHJlbiwgeyBoYW5kbGVycywgaXNSb290IH0gPSB7fSkgLT5cbiAgbG9nIFwiVHJlZVZpZXcgY29uc3RydWN0b3IuIHRpdGxlPSN7dGl0bGV9LCBpc1Jvb3Q9I3tpc1Jvb3R9XCJcbiAgcmV0dXJuIGhnLnN0YXRlKHtcbiAgICAgIGlzUm9vdDogaGcudmFsdWUoaXNSb290KVxuICAgICAgdGl0bGU6IGhnLnZhbHVlKHRpdGxlKVxuICAgICAgaXRlbXM6IGhnLmFycmF5KFtdKVxuICAgICAgaXNPcGVuOiBoZy52YWx1ZShmYWxzZSlcbiAgICAgIGxvYWRpbmc6IGhnLnZhbHVlKGZhbHNlKVxuICAgICAgbG9hZGVkOiBoZy52YWx1ZShmYWxzZSlcbiAgICAgIGNoYW5uZWxzOiB7XG4gICAgICAgIGNsaWNrOlxuICAgICAgICAgIChzdGF0ZSkgLT5cbiAgICAgICAgICAgIGxvZyBcIlRyZWVWaWV3IGV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIGludm9rZWRcIlxuICAgICAgICAgICAgVHJlZVZpZXcudG9nZ2xlKHN0YXRlKVxuICAgICAgICAgICAgaGFuZGxlcnM/LmNsaWNrPyhzdGF0ZSlcbiAgICAgICAgZGJsY2xpY2s6XG4gICAgICAgICAgKHN0YXRlKSAtPlxuICAgICAgICAgICAgbG9nIFwiVHJlZVZpZXcgZXZlbnQgaGFuZGxlciBmb3IgZGJsY2xpY2sgaW52b2tlZFwiXG4gICAgICAgICAgICBoYW5kbGVycz8uZGJsY2xpY2s/KHN0YXRlKVxuICAgICAgICBjdXN0b21FdmVudDpcbiAgICAgICAgICAoc3RhdGUpIC0+XG4gICAgICAgICAgICBsb2cgXCJUcmVlVmlldyBldmVudCBoYW5kbGVyIGZvciBjdXN0b21FdmVudCBpbnZva2VkXCJcbiAgICAgICAgICAgIGhhbmRsZXJzPy5jdXN0b21FdmVudD8oc3RhdGUpXG4gICAgICB9XG4gICAgICBmdW5jdG9yczoge1xuICAgICAgICByZW5kZXI6IFRyZWVWaWV3LmRlZmF1bHRSZW5kZXJcbiAgICAgICAgbG9hZENoaWxkcmVuOiBsb2FkQ2hpbGRyZW5cbiAgICAgIH1cbiAgICB9KVxuXG5UcmVlVmlldy50b2dnbGUgPSAoc3RhdGUpIC0+XG4gIGxvZyBcIlRyZWVWaWV3LnRvZ2dsZSAje3N0YXRlLmlzT3BlbigpfSBpdGVtIGNvdW50PSN7c3RhdGUuaXRlbXMoKS5sZW5ndGh9IGxvYWRlZD0je3N0YXRlLmxvYWRlZCgpfSwgbG9hZGluZz0je3N0YXRlLmxvYWRpbmcoKX1cIlxuICBzdGF0ZS5pc09wZW4uc2V0KCFzdGF0ZS5pc09wZW4oKSlcbiAgcmV0dXJuIGlmIHN0YXRlLmxvYWRpbmcoKSBvciBzdGF0ZS5sb2FkZWQoKVxuICBUcmVlVmlldy5wb3B1bGF0ZShzdGF0ZSlcblxuVHJlZVZpZXcucmVzZXQgPSAoc3RhdGUpIC0+XG4gIGxvZyBcIlRyZWVWaWV3LnJlc2V0XCJcbiAgcmV0dXJuIHVubGVzcyBzdGF0ZS5sb2FkZWQoKVxuICBzdGF0ZS5pdGVtcy5zZXQoW10pXG4gIHN0YXRlLmlzT3Blbi5zZXQoZmFsc2UpXG4gIHN0YXRlLmxvYWRlZC5zZXQoZmFsc2UpXG4gIHN0YXRlLmxvYWRpbmcuc2V0KGZhbHNlKVxuICBsb2cgXCJUcmVlVmlldy5yZXNldDogZG9uZVwiXG5cblRyZWVWaWV3LnBvcHVsYXRlID0gKHN0YXRlKSAtPlxuICBsb2cgXCJUcmVlVmlldy5wb3B1bGF0ZVwiXG4gIHN0YXRlLmxvYWRpbmcuc2V0KHRydWUpXG4gIHN0YXRlLmZ1bmN0b3JzLmxvYWRDaGlsZHJlbihzdGF0ZSlcbiAgLnRoZW4gKGNoaWxkcmVuKSAtPlxuICAgIGxvZyBcIlRyZWVWaWV3LnBvcHVsYXRlOiBjaGlsZHJlbiBsb2FkZWQuIGNvdW50PSN7Y2hpbGRyZW4ubGVuZ3RofSlcIlxuICAgIHN0YXRlLml0ZW1zLnNldChjaGlsZHJlbilcbiAgICBzdGF0ZS5sb2FkZWQuc2V0KHRydWUpXG4gICAgc3RhdGUubG9hZGluZy5zZXQoZmFsc2UpXG4gICAgbG9nIFwiVHJlZVZpZXcucG9wdWxhdGU6IGFsbCBkb25lXCJcbiAgLmNhdGNoIChlKSAtPlxuICAgIGxvZyhcIlRyZWVWaWV3LnBvcHVsYXRlOmVycm9yISEhXCIgKyBKU09OLnN0cmluZ2lmeShlKSlcbiAgICBzdGF0ZS5sb2FkZWQuc2V0KGZhbHNlKVxuICAgIHN0YXRlLmxvYWRpbmcuc2V0KGZhbHNlKVxuXG5UcmVlVmlldy5yZW5kZXIgPSAoc3RhdGUpIC0+XG4gIHJldHVybiBzdGF0ZT8uZnVuY3RvcnM/LnJlbmRlcj8oc3RhdGUpXG5cblRyZWVWaWV3LmRlZmF1bHRSZW5kZXIgPSAoc3RhdGUpIC0+XG4gIGxvZyBcIlRyZWVWaWV3LnJlbmRlclwiXG4gIHRpdGxlID0gc3RhdGUudGl0bGU/KHN0YXRlKSA/IHN0YXRlLnRpdGxlXG4gIHJlc3VsdCA9IGgoJ2xpLmxpc3QtbmVzdGVkLWl0ZW0nLCB7XG4gICAgICAgIGNsYXNzTmFtZTogaWYgc3RhdGUuaXNPcGVuIHRoZW4gJycgZWxzZSAnY29sbGFwc2VkJ1xuICAgICAgfSwgW1xuICAgICAgICBoKCdkaXYuaGVhZGVyLmxpc3QtaXRlbScgKyAoaWYgc3RhdGUuaXNSb290IHRoZW4gJy5oZWFkaW5nJyBlbHNlICcnKSwge1xuICAgICAgICAgICdldi1jbGljayc6IGhnLnNlbmQgc3RhdGUuY2hhbm5lbHMuY2xpY2tcbiAgICAgICAgICAnZXYtZGJsY2xpY2snOiBoZy5zZW5kIHN0YXRlLmNoYW5uZWxzLmRibGNsaWNrXG4gICAgICAgIH0sIFt0aXRsZV0pLFxuICAgICAgICBoKCd1bC5lbnRyaWVzLmxpc3QtdHJlZScsIHt9LCBzdGF0ZS5pdGVtcy5tYXAoVHJlZVZpZXcucmVuZGVyKSlcbiAgICAgIF0pXG5cbiAgcmVzdWx0ID0gaCgnZGl2LmRlYnVnZ2VyLXZlcnRpY2FsLXBhbmUuaW5zZXQtcGFuZWwnLCB7fSwgW1xuICAgICAgaCgndWwubGlzdC10cmVlLmhhcy1jb2xsYXBzYWJsZS1jaGlsZHJlbicsIHt9LCBbcmVzdWx0XSlcbiAgICBdKSBpZiBzdGF0ZS5pc1Jvb3RcbiAgcmV0dXJuIHJlc3VsdFxuXG5UcmVlVmlld0l0ZW0gPSAodmFsdWUsIHsgaGFuZGxlcnMgfSA9IHt9KSAtPiBoZy5zdGF0ZSh7XG4gICAgdmFsdWU6IGhnLnZhbHVlKHZhbHVlKVxuICAgIGNoYW5uZWxzOiB7XG4gICAgICBjbGljazpcbiAgICAgICAgKHN0YXRlKSAtPlxuICAgICAgICAgIGxvZyBcIlRyZWVWaWV3SXRlbSBldmVudCBoYW5kbGVyIGZvciBjbGljayBpbnZva2VkXCJcbiAgICAgICAgICBoYW5kbGVycz8uY2xpY2s/KHN0YXRlKVxuICAgICAgZGJsY2xpY2s6XG4gICAgICAgIChzdGF0ZSkgLT5cbiAgICAgICAgICBsb2cgXCJUcmVlVmlld0l0ZW0gZXZlbnQgaGFuZGxlciBmb3IgZGJsY2xpY2sgaW52b2tlZFwiXG4gICAgICAgICAgaGFuZGxlcnM/LmRibGNsaWNrPyhzdGF0ZSlcbiAgICB9XG4gICAgZnVuY3RvcnM6IHtcbiAgICAgIHJlbmRlcjogVHJlZVZpZXdJdGVtLnJlbmRlclxuICAgIH1cbiAgfSlcblxuVHJlZVZpZXdJdGVtLnJlbmRlciA9IChzdGF0ZSkgLT5cbiAgaCgnbGkubGlzdC1pdGVtLmVudHJ5Jywge1xuICAgICdldi1jbGljayc6IGhnLnNlbmQgc3RhdGUuY2hhbm5lbHMuY2xpY2tcbiAgICAnZXYtZGJsY2xpY2snOiBoZy5zZW5kIHN0YXRlLmNoYW5uZWxzLmRibGNsaWNrXG4gIH0sIFtzdGF0ZS52YWx1ZT8oc3RhdGUpID8gc3RhdGUudmFsdWVdKVxuXG5jbGFzcyBUcmVlVmlld1V0aWxzXG4gIEBjcmVhdGVGaWxlUmVmSGVhZGVyOiAoZnVsbFBhdGgsIGxpbmUpIC0+XG4gICAgICAgIHJldHVybiAoc3RhdGUpIC0+IGgoXCJkaXZcIiwge1xuICAgICAgICAgICAgdGl0bGU6IGZ1bGxQYXRoXG4gICAgICAgICAgICBzdHlsZTpcbiAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZSdcbiAgICAgICAgICB9XG4gICAgICAgICAgW1wiI3thdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZnVsbFBhdGgpWzFdfSA6ICN7bGluZX1cIl1cbiAgICAgICAgKVxuXG5leHBvcnRzLlRyZWVWaWV3ID0gVHJlZVZpZXdcbmV4cG9ydHMuVHJlZVZpZXdJdGVtID0gVHJlZVZpZXdJdGVtXG5leHBvcnRzLlRyZWVWaWV3VXRpbHMgPSBUcmVlVmlld1V0aWxzXG4iXX0=
