(function() {
  var exec,
    slice = [].slice;

  exec = require("child_process").exec;

  module.exports = function(pid, callback) {
    var process_lister, process_lister_command, stderr, stdout;
    process_lister_command = process.platform === "win32" ? "wmic PROCESS GET Name,ProcessId,ParentProcessId" : "ps -A -o ppid,pid,comm";
    process_lister = exec(process_lister_command);
    process_lister.on("error", callback);
    stdout = "";
    stderr = "";
    process_lister.stdout.on("data", function(data) {
      return stdout += data;
    });
    process_lister.stderr.on("data", function(data) {
      return stderr += data;
    });
    return process_lister.on("close", function(code) {
      var children_of, header_keys, headers, i, info, key, output, proc_infos, procs, ref, row, row_values, rows, value;
      if (code) {
        return callback(new Error("Process `" + process_lister_command + "` exited with code " + code + ":\n" + stderr));
      }
      output = stdout.trim();
      ref = output.split(/\r?\n/), headers = ref[0], rows = 2 <= ref.length ? slice.call(ref, 1) : [];
      header_keys = headers.toLowerCase().trim().split(/\s+/);
      proc_infos = (function() {
        var j, k, len, len1, ref1, results;
        results = [];
        for (j = 0, len = rows.length; j < len; j++) {
          row = rows[j];
          info = {};
          row_values = row.trim().split(/\s+/);
          for (i = k = 0, len1 = header_keys.length; k < len1; i = ++k) {
            key = header_keys[i];
            value = (ref1 = row_values[i]) != null ? ref1 : "";
            if (!(key.match(/name|comm|cmd/i) || isNaN(value))) {
              value = parseFloat(value);
            }
            info[key] = value;
          }
          results.push(info);
        }
        return results;
      })();
      procs = (function() {
        var j, len, ref1, ref2, ref3, ref4, ref5, results;
        results = [];
        for (j = 0, len = proc_infos.length; j < len; j++) {
          info = proc_infos[j];
          results.push({
            pid: (ref1 = info.pid) != null ? ref1 : info.processid,
            ppid: (ref2 = info.ppid) != null ? ref2 : info.parentprocessid,
            name: (ref3 = (ref4 = (ref5 = info.name) != null ? ref5 : info.comm) != null ? ref4 : info.cmd) != null ? ref3 : info.command
          });
        }
        return results;
      })();
      children_of = function(ppid) {
        var j, len, proc, results;
        results = [];
        for (j = 0, len = procs.length; j < len; j++) {
          proc = procs[j];
          if (!(("" + proc.ppid) === ("" + ppid))) {
            continue;
          }
          proc.children = children_of(proc.pid);
          results.push(proc);
        }
        return results;
      };
      return callback(null, children_of(pid));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL21vY2hhLXRlc3QtcnVubmVyL25vZGVfbW9kdWxlcy9wcm9jZXNzLXRyZWUvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSxJQUFBO0lBQUE7O0VBQUMsT0FBUSxPQUFBLENBQVEsZUFBUjs7RUFHVCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEdBQUQsRUFBTSxRQUFOO0FBQ2hCLFFBQUE7SUFBQSxzQkFBQSxHQUNJLE9BQU8sQ0FBQyxRQUFSLEtBQW9CLE9BQXZCLEdBQ0MsaURBREQsR0FHQztJQUVGLGNBQUEsR0FBaUIsSUFBQSxDQUFLLHNCQUFMO0lBQ2pCLGNBQWMsQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQTJCLFFBQTNCO0lBQ0EsTUFBQSxHQUFTO0lBQ1QsTUFBQSxHQUFTO0lBQ1QsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUF0QixDQUF5QixNQUF6QixFQUFpQyxTQUFDLElBQUQ7YUFBUyxNQUFBLElBQVU7SUFBbkIsQ0FBakM7SUFDQSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQXRCLENBQXlCLE1BQXpCLEVBQWlDLFNBQUMsSUFBRDthQUFTLE1BQUEsSUFBVTtJQUFuQixDQUFqQztXQUNBLGNBQWMsQ0FBQyxFQUFmLENBQWtCLE9BQWxCLEVBQTJCLFNBQUMsSUFBRDtBQUMxQixVQUFBO01BQUEsSUFBd0csSUFBeEc7QUFBQSxlQUFPLFFBQUEsQ0FBYSxJQUFBLEtBQUEsQ0FBTSxXQUFBLEdBQVksc0JBQVosR0FBbUMscUJBQW5DLEdBQXdELElBQXhELEdBQTZELEtBQTdELEdBQWtFLE1BQXhFLENBQWIsRUFBUDs7TUFFQSxNQUFBLEdBQVMsTUFBTSxDQUFDLElBQVAsQ0FBQTtNQUlULE1BQXFCLE1BQU0sQ0FBQyxLQUFQLENBQWEsT0FBYixDQUFyQixFQUFDLGdCQUFELEVBQVU7TUFDVixXQUFBLEdBQWMsT0FBTyxDQUFDLFdBQVIsQ0FBQSxDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FBNEIsQ0FBQyxLQUE3QixDQUFtQyxLQUFuQztNQUNkLFVBQUE7O0FBQ0M7YUFBQSxzQ0FBQTs7VUFDQyxJQUFBLEdBQU87VUFDUCxVQUFBLEdBQWEsR0FBRyxDQUFDLElBQUosQ0FBQSxDQUFVLENBQUMsS0FBWCxDQUFpQixLQUFqQjtBQUNiLGVBQUEsdURBQUE7O1lBQ0MsS0FBQSwyQ0FBd0I7WUFDeEIsSUFBQSxDQUFBLENBQWlDLEdBQUcsQ0FBQyxLQUFKLENBQVUsZ0JBQVYsQ0FBQSxJQUErQixLQUFBLENBQU0sS0FBTixDQUFoRSxDQUFBO2NBQUEsS0FBQSxHQUFRLFVBQUEsQ0FBVyxLQUFYLEVBQVI7O1lBQ0EsSUFBSyxDQUFBLEdBQUEsQ0FBTCxHQUFZO0FBSGI7dUJBSUE7QUFQRDs7O01BU0QsS0FBQTs7QUFDQzthQUFBLDRDQUFBOzt1QkFDQztZQUFBLEdBQUEscUNBQWdCLElBQUksQ0FBQyxTQUFyQjtZQUNBLElBQUEsc0NBQWtCLElBQUksQ0FBQyxlQUR2QjtZQUVBLElBQUEsNkdBQXlDLElBQUksQ0FBQyxPQUY5Qzs7QUFERDs7O01BS0QsV0FBQSxHQUFjLFNBQUMsSUFBRDtBQUNiLFlBQUE7QUFBQTthQUFBLHVDQUFBOztnQkFBdUIsQ0FBQSxFQUFBLEdBQUcsSUFBSSxDQUFDLElBQVIsQ0FBQSxLQUFrQixDQUFBLEVBQUEsR0FBRyxJQUFIOzs7VUFDeEMsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsV0FBQSxDQUFZLElBQUksQ0FBQyxHQUFqQjt1QkFDaEI7QUFGRDs7TUFEYTthQUtkLFFBQUEsQ0FBUyxJQUFULEVBQWUsV0FBQSxDQUFZLEdBQVosQ0FBZjtJQTlCMEIsQ0FBM0I7RUFiZ0I7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJcbntleGVjfSA9IHJlcXVpcmUgXCJjaGlsZF9wcm9jZXNzXCJcblxuIyBUT0RPOiBhbGxvdyBwaWQgdG8gYmUgb21taXR0ZWQ7IGxpc3QgYWxsIHByb2Nlc3Nlc1xubW9kdWxlLmV4cG9ydHMgPSAocGlkLCBjYWxsYmFjayktPlxuXHRwcm9jZXNzX2xpc3Rlcl9jb21tYW5kID1cblx0XHRpZiBwcm9jZXNzLnBsYXRmb3JtIGlzIFwid2luMzJcIlxuXHRcdFx0XCJ3bWljIFBST0NFU1MgR0VUIE5hbWUsUHJvY2Vzc0lkLFBhcmVudFByb2Nlc3NJZFwiXG5cdFx0ZWxzZVxuXHRcdFx0XCJwcyAtQSAtbyBwcGlkLHBpZCxjb21tXCJcblx0XG5cdHByb2Nlc3NfbGlzdGVyID0gZXhlYyBwcm9jZXNzX2xpc3Rlcl9jb21tYW5kXG5cdHByb2Nlc3NfbGlzdGVyLm9uIFwiZXJyb3JcIiwgY2FsbGJhY2tcblx0c3Rkb3V0ID0gXCJcIlxuXHRzdGRlcnIgPSBcIlwiXG5cdHByb2Nlc3NfbGlzdGVyLnN0ZG91dC5vbiBcImRhdGFcIiwgKGRhdGEpLT4gc3Rkb3V0ICs9IGRhdGFcblx0cHJvY2Vzc19saXN0ZXIuc3RkZXJyLm9uIFwiZGF0YVwiLCAoZGF0YSktPiBzdGRlcnIgKz0gZGF0YVxuXHRwcm9jZXNzX2xpc3Rlci5vbiBcImNsb3NlXCIsIChjb2RlKS0+XG5cdFx0cmV0dXJuIGNhbGxiYWNrIG5ldyBFcnJvciBcIlByb2Nlc3MgYCN7cHJvY2Vzc19saXN0ZXJfY29tbWFuZH1gIGV4aXRlZCB3aXRoIGNvZGUgI3tjb2RlfTpcXG4je3N0ZGVycn1cIiBpZiBjb2RlXG5cdFx0XG5cdFx0b3V0cHV0ID0gc3Rkb3V0LnRyaW0oKVxuXHRcdCMgY29uc29sZS5sb2cgXCJPdXRwdXQgZnJvbSBgI3twcm9jZXNzX2xpc3Rlcl9jb21tYW5kfWA6XFxuI3tvdXRwdXR9XCJcblx0XHRcblx0XHQjIFRPRE86IG1heWJlIHVzZSBodHRwczovL2dpdGh1Yi5jb20vbmFtc2hpL25vZGUtc2hlbGwtcGFyc2VyXG5cdFx0W2hlYWRlcnMsIHJvd3MuLi5dID0gb3V0cHV0LnNwbGl0IC9cXHI/XFxuL1xuXHRcdGhlYWRlcl9rZXlzID0gaGVhZGVycy50b0xvd2VyQ2FzZSgpLnRyaW0oKS5zcGxpdCAvXFxzKy9cblx0XHRwcm9jX2luZm9zID1cblx0XHRcdGZvciByb3cgaW4gcm93c1xuXHRcdFx0XHRpbmZvID0ge31cblx0XHRcdFx0cm93X3ZhbHVlcyA9IHJvdy50cmltKCkuc3BsaXQgL1xccysvXG5cdFx0XHRcdGZvciBrZXksIGkgaW4gaGVhZGVyX2tleXNcblx0XHRcdFx0XHR2YWx1ZSA9IHJvd192YWx1ZXNbaV0gPyBcIlwiXG5cdFx0XHRcdFx0dmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKSB1bmxlc3Mga2V5Lm1hdGNoKC9uYW1lfGNvbW18Y21kL2kpIG9yIGlzTmFOKHZhbHVlKVxuXHRcdFx0XHRcdGluZm9ba2V5XSA9IHZhbHVlXG5cdFx0XHRcdGluZm9cblx0XHRcblx0XHRwcm9jcyA9XG5cdFx0XHRmb3IgaW5mbyBpbiBwcm9jX2luZm9zXG5cdFx0XHRcdHBpZDogaW5mby5waWQgPyBpbmZvLnByb2Nlc3NpZFxuXHRcdFx0XHRwcGlkOiBpbmZvLnBwaWQgPyBpbmZvLnBhcmVudHByb2Nlc3NpZFxuXHRcdFx0XHRuYW1lOiBpbmZvLm5hbWUgPyBpbmZvLmNvbW0gPyBpbmZvLmNtZCA/IGluZm8uY29tbWFuZFxuXHRcdFxuXHRcdGNoaWxkcmVuX29mID0gKHBwaWQpLT5cblx0XHRcdGZvciBwcm9jIGluIHByb2NzIHdoZW4gXCIje3Byb2MucHBpZH1cIiBpcyBcIiN7cHBpZH1cIlxuXHRcdFx0XHRwcm9jLmNoaWxkcmVuID0gY2hpbGRyZW5fb2YocHJvYy5waWQpXG5cdFx0XHRcdHByb2Ncblx0XHRcblx0XHRjYWxsYmFjayBudWxsLCBjaGlsZHJlbl9vZihwaWQpXG4iXX0=
