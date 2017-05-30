(function() {
  var CommandHistory;

  CommandHistory = (function() {
    function CommandHistory(editor) {
      this.editor = editor;
      this.cmdHistory = [];
    }

    CommandHistory.prototype.saveIfNew = function(text) {
      if (!((this.cmdHistoryIndex != null) && this.cmdHistory[this.cmdHistoryIndex] === text)) {
        this.cmdHistoryIndex = this.cmdHistory.length;
        this.cmdHistory.push(text);
      }
      return this.historyMode = false;
    };

    CommandHistory.prototype.moveUp = function() {
      if (this.cmdHistoryIndex == null) {
        return;
      }
      if (this.cmdHistoryIndex > 0 && this.historyMode) {
        this.cmdHistoryIndex--;
      }
      this.editor.setText(this.cmdHistory[this.cmdHistoryIndex]);
      return this.historyMode = true;
    };

    CommandHistory.prototype.moveDown = function() {
      if (this.cmdHistoryIndex == null) {
        return;
      }
      if (!this.historyMode) {
        return;
      }
      if (this.cmdHistoryIndex < this.cmdHistory.length - 1 && this.historyMode) {
        this.cmdHistoryIndex++;
      }
      return this.editor.setText(this.cmdHistory[this.cmdHistoryIndex]);
    };

    return CommandHistory;

  })();

  exports.CommandHistory = CommandHistory;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL25vZGUtZGVidWdnZXIvbGliL0NvbXBvbmVudHMvY29uc29sZXBhbmUtdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBTTtJQUNTLHdCQUFDLE1BQUQ7TUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYztJQUZIOzs2QkFJYixTQUFBLEdBQVcsU0FBQyxJQUFEO01BQ1QsSUFBQSxDQUFBLENBQU8sOEJBQUEsSUFBc0IsSUFBQyxDQUFBLFVBQVcsQ0FBQSxJQUFDLENBQUEsZUFBRCxDQUFaLEtBQWlDLElBQTlELENBQUE7UUFDRSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDO1FBQy9CLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixJQUFqQixFQUZGOzthQUdBLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFKTjs7NkJBS1gsTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFjLDRCQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFHLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBQW5CLElBQXlCLElBQUMsQ0FBQSxXQUE3QjtRQUNFLElBQUMsQ0FBQSxlQUFELEdBREY7O01BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLElBQUMsQ0FBQSxVQUFXLENBQUEsSUFBQyxDQUFBLGVBQUQsQ0FBNUI7YUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO0lBTFQ7OzZCQU1SLFFBQUEsR0FBVSxTQUFBO01BQ1IsSUFBYyw0QkFBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLElBQUMsQ0FBQSxXQUFmO0FBQUEsZUFBQTs7TUFDQSxJQUFHLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixHQUFxQixDQUF4QyxJQUE4QyxJQUFDLENBQUEsV0FBbEQ7UUFDRSxJQUFDLENBQUEsZUFBRCxHQURGOzthQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixJQUFDLENBQUEsVUFBVyxDQUFBLElBQUMsQ0FBQSxlQUFELENBQTVCO0lBTFE7Ozs7OztFQVFaLE9BQU8sQ0FBQyxjQUFSLEdBQXlCO0FBeEJ6QiIsInNvdXJjZXNDb250ZW50IjpbIiMgVHJhY2sgY29tbWFuZCBoaXN0b3J5IGZvciBjb25zb2xlIHBhbmVcbmNsYXNzIENvbW1hbmRIaXN0b3J5XG4gIGNvbnN0cnVjdG9yOiAoZWRpdG9yKSAtPlxuICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICBAY21kSGlzdG9yeSA9IFtdXG5cbiAgc2F2ZUlmTmV3OiAodGV4dCkgLT5cbiAgICB1bmxlc3MgQGNtZEhpc3RvcnlJbmRleD8gYW5kIEBjbWRIaXN0b3J5W0BjbWRIaXN0b3J5SW5kZXhdIGlzIHRleHRcbiAgICAgIEBjbWRIaXN0b3J5SW5kZXggPSBAY21kSGlzdG9yeS5sZW5ndGhcbiAgICAgIEBjbWRIaXN0b3J5LnB1c2ggdGV4dFxuICAgIEBoaXN0b3J5TW9kZSA9IGZhbHNlXG4gIG1vdmVVcDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBjbWRIaXN0b3J5SW5kZXg/XG4gICAgaWYgQGNtZEhpc3RvcnlJbmRleCA+IDAgYW5kIEBoaXN0b3J5TW9kZVxuICAgICAgQGNtZEhpc3RvcnlJbmRleC0tXG4gICAgQGVkaXRvci5zZXRUZXh0KEBjbWRIaXN0b3J5W0BjbWRIaXN0b3J5SW5kZXhdKVxuICAgIEBoaXN0b3J5TW9kZSA9IHRydWVcbiAgbW92ZURvd246IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAY21kSGlzdG9yeUluZGV4P1xuICAgIHJldHVybiB1bmxlc3MgQGhpc3RvcnlNb2RlXG4gICAgaWYgQGNtZEhpc3RvcnlJbmRleCA8IEBjbWRIaXN0b3J5Lmxlbmd0aCAtIDEgYW5kIEBoaXN0b3J5TW9kZVxuICAgICAgQGNtZEhpc3RvcnlJbmRleCsrXG4gICAgQGVkaXRvci5zZXRUZXh0KEBjbWRIaXN0b3J5W0BjbWRIaXN0b3J5SW5kZXhdKVxuXG4jIEV4cG9ydHNcbmV4cG9ydHMuQ29tbWFuZEhpc3RvcnkgPSBDb21tYW5kSGlzdG9yeVxuIl19
