(function() {
  var bunyan, fs, logStream, path;

  bunyan = require('bunyan');

  path = require('path');

  fs = require('fs');

  logStream = fs.createWriteStream(path.join(__dirname, '..', '/debugger.log'));

  module.exports = bunyan.createLogger({
    name: 'debugger',
    stream: logStream,
    level: 'info'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL2xvZ2dlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLFNBQUEsR0FBWSxFQUFFLENBQUMsaUJBQUgsQ0FBcUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQXJCLEVBQTJCLGVBQTNCLENBQXJCOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE1BQU0sQ0FBQyxZQUFQLENBQW9CO0lBQ25DLElBQUEsRUFBTSxVQUQ2QjtJQUVuQyxNQUFBLEVBQVEsU0FGMkI7SUFHbkMsS0FBQSxFQUFPLE1BSDRCO0dBQXBCO0FBTmpCIiwic291cmNlc0NvbnRlbnQiOlsiYnVueWFuID0gcmVxdWlyZSAnYnVueWFuJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXG5sb2dTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnL2RlYnVnZ2VyLmxvZycpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJ1bnlhbi5jcmVhdGVMb2dnZXIoe1xuICBuYW1lOiAnZGVidWdnZXInLFxuICBzdHJlYW06IGxvZ1N0cmVhbSxcbiAgbGV2ZWw6ICdpbmZvJ1xufSlcbiJdfQ==
