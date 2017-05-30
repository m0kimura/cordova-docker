'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  ecmaVersion: {
    doc: 'The ECMAScript version to parse. Should be either 5, 6 or 7. Default is 6.'
  },
  libs: {
    browser: {
      doc: 'JavaScript'
    },
    jquery: {
      doc: 'JQuery'
    },
    underscore: {
      doc: 'underscore'
    },
    chai: {
      doc: 'chai'
    }
  },
  loadEagerly: {
    doc: 'loadEagerly allows you to force some files to always be loaded, it may be an array of filenames or glob patterns (i.e. foo/bar/*.js).'
  },
  dontLoad: {
    doc: 'The dontLoad option can be used to prevent Tern from loading certain files. It also takes an array of file names or glob patterns.'
  },
  plugins: {
    doc: 'Plugins used by this project. Currenty you can only activate the plugin from this view without setting up the options for it. After saving the config, plugins with default options are added to the .tern-project file. Unchecking the plugin will result in removing the plugin property entirely from the .tern-project file. Please refer to <a href=\"http://ternjs.net/doc/manual.html#plugins\">this page</a> for detailed information for the build in server plugins.'
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9jb25maWcvdGVybi1jb25maWctZG9jcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7O3FCQUVHO0FBQ2IsYUFBVyxFQUFFO0FBQ1gsT0FBRyxFQUFFLDRFQUE0RTtHQUNsRjtBQUNELE1BQUksRUFBRTtBQUNKLFdBQU8sRUFBRTtBQUNQLFNBQUcsRUFBRSxZQUFZO0tBQ2xCO0FBQ0QsVUFBTSxFQUFFO0FBQ04sU0FBRyxFQUFFLFFBQVE7S0FDZDtBQUNELGNBQVUsRUFBRTtBQUNWLFNBQUcsRUFBRSxZQUFZO0tBQ2xCO0FBQ0QsUUFBSSxFQUFFO0FBQ0osU0FBRyxFQUFFLE1BQU07S0FDWjtHQUNGO0FBQ0QsYUFBVyxFQUFFO0FBQ1gsT0FBRyxFQUFFLHVJQUF1STtHQUM3STtBQUNELFVBQVEsRUFBRTtBQUNSLE9BQUcsRUFBRSxvSUFBb0k7R0FDMUk7QUFDRCxTQUFPLEVBQUU7QUFDUCxPQUFHLEVBQUUsZ2RBQWdkO0dBQ3RkO0NBQ0YiLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2NvbmZpZy90ZXJuLWNvbmZpZy1kb2NzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZWNtYVZlcnNpb246IHtcbiAgICBkb2M6ICdUaGUgRUNNQVNjcmlwdCB2ZXJzaW9uIHRvIHBhcnNlLiBTaG91bGQgYmUgZWl0aGVyIDUsIDYgb3IgNy4gRGVmYXVsdCBpcyA2LidcbiAgfSxcbiAgbGliczoge1xuICAgIGJyb3dzZXI6IHtcbiAgICAgIGRvYzogJ0phdmFTY3JpcHQnXG4gICAgfSxcbiAgICBqcXVlcnk6IHtcbiAgICAgIGRvYzogJ0pRdWVyeSdcbiAgICB9LFxuICAgIHVuZGVyc2NvcmU6IHtcbiAgICAgIGRvYzogJ3VuZGVyc2NvcmUnXG4gICAgfSxcbiAgICBjaGFpOiB7XG4gICAgICBkb2M6ICdjaGFpJ1xuICAgIH1cbiAgfSxcbiAgbG9hZEVhZ2VybHk6IHtcbiAgICBkb2M6ICdsb2FkRWFnZXJseSBhbGxvd3MgeW91IHRvIGZvcmNlIHNvbWUgZmlsZXMgdG8gYWx3YXlzIGJlIGxvYWRlZCwgaXQgbWF5IGJlIGFuIGFycmF5IG9mIGZpbGVuYW1lcyBvciBnbG9iIHBhdHRlcm5zIChpLmUuIGZvby9iYXIvKi5qcykuJ1xuICB9LFxuICBkb250TG9hZDoge1xuICAgIGRvYzogJ1RoZSBkb250TG9hZCBvcHRpb24gY2FuIGJlIHVzZWQgdG8gcHJldmVudCBUZXJuIGZyb20gbG9hZGluZyBjZXJ0YWluIGZpbGVzLiBJdCBhbHNvIHRha2VzIGFuIGFycmF5IG9mIGZpbGUgbmFtZXMgb3IgZ2xvYiBwYXR0ZXJucy4nXG4gIH0sXG4gIHBsdWdpbnM6IHtcbiAgICBkb2M6ICdQbHVnaW5zIHVzZWQgYnkgdGhpcyBwcm9qZWN0LiBDdXJyZW50eSB5b3UgY2FuIG9ubHkgYWN0aXZhdGUgdGhlIHBsdWdpbiBmcm9tIHRoaXMgdmlldyB3aXRob3V0IHNldHRpbmcgdXAgdGhlIG9wdGlvbnMgZm9yIGl0LiBBZnRlciBzYXZpbmcgdGhlIGNvbmZpZywgcGx1Z2lucyB3aXRoIGRlZmF1bHQgb3B0aW9ucyBhcmUgYWRkZWQgdG8gdGhlIC50ZXJuLXByb2plY3QgZmlsZS4gVW5jaGVja2luZyB0aGUgcGx1Z2luIHdpbGwgcmVzdWx0IGluIHJlbW92aW5nIHRoZSBwbHVnaW4gcHJvcGVydHkgZW50aXJlbHkgZnJvbSB0aGUgLnRlcm4tcHJvamVjdCBmaWxlLiBQbGVhc2UgcmVmZXIgdG8gPGEgaHJlZj1cXFwiaHR0cDovL3Rlcm5qcy5uZXQvZG9jL21hbnVhbC5odG1sI3BsdWdpbnNcXFwiPnRoaXMgcGFnZTwvYT4gZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIGZvciB0aGUgYnVpbGQgaW4gc2VydmVyIHBsdWdpbnMuJ1xuICB9XG59O1xuIl19