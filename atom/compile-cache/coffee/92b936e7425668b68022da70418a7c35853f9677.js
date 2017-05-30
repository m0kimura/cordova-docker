(function() {
  var h, hg;

  hg = require('mercury');

  h = hg.h;

  exports.create = function(_debugger) {
    var cancel;
    cancel = function() {
      return _debugger.cleanup();
    };
    return hg.state({
      channels: {
        cancel: cancel
      }
    });
  };

  exports.render = function(state) {
    return h('button.btn.btn-error.icon-primitive-square', {
      'ev-click': hg.send(state.channels.cancel),
      'title': 'stop debugging'
    }, []);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvQ2FuY2VsQnV0dG9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNKLElBQUs7O0VBRU4sT0FBTyxDQUFDLE1BQVIsR0FBaUIsU0FBQyxTQUFEO0FBRWYsUUFBQTtJQUFBLE1BQUEsR0FBUyxTQUFBO2FBQ1AsU0FBUyxDQUFDLE9BQVYsQ0FBQTtJQURPO1dBR1QsRUFBRSxDQUFDLEtBQUgsQ0FBUztNQUNQLFFBQUEsRUFBVTtRQUNSLE1BQUEsRUFBUSxNQURBO09BREg7S0FBVDtFQUxlOztFQVdqQixPQUFPLENBQUMsTUFBUixHQUFpQixTQUFDLEtBQUQ7V0FDZixDQUFBLENBQUUsNENBQUYsRUFBZ0Q7TUFDOUMsVUFBQSxFQUFZLEVBQUUsQ0FBQyxJQUFILENBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUF2QixDQURrQztNQUU5QyxPQUFBLEVBQVMsZ0JBRnFDO0tBQWhELEVBR0csRUFISDtFQURlO0FBZGpCIiwic291cmNlc0NvbnRlbnQiOlsiaGcgPSByZXF1aXJlICdtZXJjdXJ5J1xue2h9ID0gaGdcblxuZXhwb3J0cy5jcmVhdGUgPSAoX2RlYnVnZ2VyKSAtPlxuXG4gIGNhbmNlbCA9ICgpIC0+XG4gICAgX2RlYnVnZ2VyLmNsZWFudXAoKVxuXG4gIGhnLnN0YXRlKHtcbiAgICBjaGFubmVsczoge1xuICAgICAgY2FuY2VsOiBjYW5jZWxcbiAgICB9XG4gIH0pXG5cbmV4cG9ydHMucmVuZGVyID0gKHN0YXRlKSAtPlxuICBoKCdidXR0b24uYnRuLmJ0bi1lcnJvci5pY29uLXByaW1pdGl2ZS1zcXVhcmUnLCB7XG4gICAgJ2V2LWNsaWNrJzogaGcuc2VuZCBzdGF0ZS5jaGFubmVscy5jYW5jZWxcbiAgICAndGl0bGUnOiAnc3RvcCBkZWJ1Z2dpbmcnXG4gIH0sIFtdKVxuIl19
