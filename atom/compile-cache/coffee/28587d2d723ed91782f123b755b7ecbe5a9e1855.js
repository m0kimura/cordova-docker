(function() {
  var EventEmitter, log;

  EventEmitter = require('events').EventEmitter;

  log = function(msg) {};

  EventEmitter.prototype.subscribe = function(event, handler) {
    var self;
    log("EventEmitter.subscribe");
    self = this;
    self.on(event, handler);
    return (function() {
      return self.removeListener(event, handler);
    });
  };

  EventEmitter.prototype.subscribeDisposable = function(event, handler) {
    var self;
    log("EventEmitter.subscribeDisposable");
    self = this;
    self.on(event, handler);
    return {
      dispose: function() {
        return self.removeListener(event, handler);
      }
    };
  };

  exports.EventEmitter = EventEmitter;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL2V2ZW50aW5nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsZUFBZ0IsT0FBQSxDQUFRLFFBQVI7O0VBRWpCLEdBQUEsR0FBTSxTQUFDLEdBQUQsR0FBQTs7RUFFTixZQUFZLENBQUEsU0FBRSxDQUFBLFNBQWQsR0FBMEIsU0FBQyxLQUFELEVBQVEsT0FBUjtBQUN0QixRQUFBO0lBQUEsR0FBQSxDQUFJLHdCQUFKO0lBQ0EsSUFBQSxHQUFPO0lBQ1AsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWUsT0FBZjtBQUNBLFdBQU8sQ0FBQyxTQUFBO2FBQU0sSUFBSSxDQUFDLGNBQUwsQ0FBb0IsS0FBcEIsRUFBMkIsT0FBM0I7SUFBTixDQUFEO0VBSmU7O0VBTTFCLFlBQVksQ0FBQSxTQUFFLENBQUEsbUJBQWQsR0FBb0MsU0FBQyxLQUFELEVBQVEsT0FBUjtBQUNoQyxRQUFBO0lBQUEsR0FBQSxDQUFJLGtDQUFKO0lBQ0EsSUFBQSxHQUFPO0lBQ1AsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWUsT0FBZjtBQUNBLFdBQU87TUFBRSxPQUFBLEVBQVMsU0FBQTtlQUFHLElBQUksQ0FBQyxjQUFMLENBQW9CLEtBQXBCLEVBQTJCLE9BQTNCO01BQUgsQ0FBWDs7RUFKeUI7O0VBTXBDLE9BQU8sQ0FBQyxZQUFSLEdBQXVCO0FBaEJ2QiIsInNvdXJjZXNDb250ZW50IjpbIntFdmVudEVtaXR0ZXJ9ID0gcmVxdWlyZSAnZXZlbnRzJ1xuXG5sb2cgPSAobXNnKSAtPiAjIGNvbnNvbGUubG9nKG1zZylcblxuRXZlbnRFbWl0dGVyOjpzdWJzY3JpYmUgPSAoZXZlbnQsIGhhbmRsZXIpIC0+XG4gICAgbG9nIFwiRXZlbnRFbWl0dGVyLnN1YnNjcmliZVwiXG4gICAgc2VsZiA9IHRoaXNcbiAgICBzZWxmLm9uIGV2ZW50LCBoYW5kbGVyXG4gICAgcmV0dXJuICgoKSAtPiBzZWxmLnJlbW92ZUxpc3RlbmVyIGV2ZW50LCBoYW5kbGVyKVxuXG5FdmVudEVtaXR0ZXI6OnN1YnNjcmliZURpc3Bvc2FibGUgPSAoZXZlbnQsIGhhbmRsZXIpIC0+XG4gICAgbG9nIFwiRXZlbnRFbWl0dGVyLnN1YnNjcmliZURpc3Bvc2FibGVcIlxuICAgIHNlbGYgPSB0aGlzXG4gICAgc2VsZi5vbiBldmVudCwgaGFuZGxlclxuICAgIHJldHVybiB7IGRpc3Bvc2U6IC0+IHNlbGYucmVtb3ZlTGlzdGVuZXIgZXZlbnQsIGhhbmRsZXIgfVxuXG5leHBvcnRzLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlclxuIl19
