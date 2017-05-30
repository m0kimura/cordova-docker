(function() {
  var $, extend, handleDrag, hg;

  hg = require('mercury');

  extend = require('xtend');

  $ = require('atom-space-pen-views').$;

  handleDrag = function(ev, broadcast) {
    var data, delegator, onmove, onup;
    data = this.data;
    delegator = hg.Delegator();
    onmove = function(ev) {
      var delta, docHeight, docWidth, pageX, pageY, statusBarHeight;
      docHeight = $(document).height();
      docWidth = $(document).width();
      pageY = ev.pageY, pageX = ev.pageX;
      statusBarHeight = $('div.status-bar-left').height();
      if (statusBarHeight == null) {
        statusBarHeight = 0;
      }
      delta = {
        height: docHeight - pageY - statusBarHeight,
        sideWidth: docWidth - pageX
      };
      return broadcast(extend(data, delta));
    };
    onup = function(ev) {
      delegator.unlistenTo('mousemove');
      delegator.removeGlobalEventListener('mousemove', onmove);
      return delegator.removeGlobalEventListener('mouseup', onup);
    };
    delegator.listenTo('mousemove');
    delegator.addGlobalEventListener('mousemove', onmove);
    return delegator.addGlobalEventListener('mouseup', onup);
  };

  module.exports = hg.BaseEvent(handleDrag);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvZHJhZy1oYW5kbGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLE1BQUEsR0FBUyxPQUFBLENBQVEsT0FBUjs7RUFDUixJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFFTixVQUFBLEdBQWEsU0FBQyxFQUFELEVBQUssU0FBTDtBQUNYLFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDO0lBQ1osU0FBQSxHQUFZLEVBQUUsQ0FBQyxTQUFILENBQUE7SUFFWixNQUFBLEdBQVMsU0FBQyxFQUFEO0FBQ1AsVUFBQTtNQUFBLFNBQUEsR0FBWSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUFBO01BQ1osUUFBQSxHQUFXLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQUE7TUFDVixnQkFBRCxFQUFRO01BQ1IsZUFBQSxHQUFrQixDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxNQUF6QixDQUFBO01BQ2xCLElBQTJCLHVCQUEzQjtRQUFBLGVBQUEsR0FBa0IsRUFBbEI7O01BRUEsS0FBQSxHQUFRO1FBQ04sTUFBQSxFQUFRLFNBQUEsR0FBWSxLQUFaLEdBQW9CLGVBRHRCO1FBRU4sU0FBQSxFQUFXLFFBQUEsR0FBVyxLQUZoQjs7YUFLUixTQUFBLENBQVUsTUFBQSxDQUFPLElBQVAsRUFBYSxLQUFiLENBQVY7SUFaTztJQWNULElBQUEsR0FBTyxTQUFDLEVBQUQ7TUFDTCxTQUFTLENBQUMsVUFBVixDQUFxQixXQUFyQjtNQUNBLFNBQVMsQ0FBQyx5QkFBVixDQUFvQyxXQUFwQyxFQUFpRCxNQUFqRDthQUNBLFNBQVMsQ0FBQyx5QkFBVixDQUFvQyxTQUFwQyxFQUErQyxJQUEvQztJQUhLO0lBTVAsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsV0FBbkI7SUFDQSxTQUFTLENBQUMsc0JBQVYsQ0FBaUMsV0FBakMsRUFBOEMsTUFBOUM7V0FDQSxTQUFTLENBQUMsc0JBQVYsQ0FBaUMsU0FBakMsRUFBNEMsSUFBNUM7RUExQlc7O0VBNEJiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEVBQUUsQ0FBQyxTQUFILENBQWEsVUFBYjtBQWhDakIiLCJzb3VyY2VzQ29udGVudCI6WyJoZyA9IHJlcXVpcmUgJ21lcmN1cnknXG5leHRlbmQgPSByZXF1aXJlICd4dGVuZCdcbnskfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5oYW5kbGVEcmFnID0gKGV2LCBicm9hZGNhc3QpIC0+XG4gIGRhdGEgPSB0aGlzLmRhdGFcbiAgZGVsZWdhdG9yID0gaGcuRGVsZWdhdG9yKClcblxuICBvbm1vdmUgPSAoZXYpIC0+XG4gICAgZG9jSGVpZ2h0ID0gJChkb2N1bWVudCkuaGVpZ2h0KClcbiAgICBkb2NXaWR0aCA9ICQoZG9jdW1lbnQpLndpZHRoKClcbiAgICB7cGFnZVksIHBhZ2VYfSA9IGV2XG4gICAgc3RhdHVzQmFySGVpZ2h0ID0gJCgnZGl2LnN0YXR1cy1iYXItbGVmdCcpLmhlaWdodCgpXG4gICAgc3RhdHVzQmFySGVpZ2h0ID0gMCB1bmxlc3Mgc3RhdHVzQmFySGVpZ2h0P1xuICAgIFxuICAgIGRlbHRhID0ge1xuICAgICAgaGVpZ2h0OiBkb2NIZWlnaHQgLSBwYWdlWSAtIHN0YXR1c0JhckhlaWdodFxuICAgICAgc2lkZVdpZHRoOiBkb2NXaWR0aCAtIHBhZ2VYXG4gICAgfVxuXG4gICAgYnJvYWRjYXN0KGV4dGVuZChkYXRhLCBkZWx0YSkpXG5cbiAgb251cCA9IChldikgLT5cbiAgICBkZWxlZ2F0b3IudW5saXN0ZW5UbyAnbW91c2Vtb3ZlJ1xuICAgIGRlbGVnYXRvci5yZW1vdmVHbG9iYWxFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCBvbm1vdmVcbiAgICBkZWxlZ2F0b3IucmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIG9udXBcblxuXG4gIGRlbGVnYXRvci5saXN0ZW5UbyAnbW91c2Vtb3ZlJ1xuICBkZWxlZ2F0b3IuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgb25tb3ZlXG4gIGRlbGVnYXRvci5hZGRHbG9iYWxFdmVudExpc3RlbmVyICdtb3VzZXVwJywgb251cFxuXG5tb2R1bGUuZXhwb3J0cyA9IGhnLkJhc2VFdmVudChoYW5kbGVEcmFnKVxuIl19
