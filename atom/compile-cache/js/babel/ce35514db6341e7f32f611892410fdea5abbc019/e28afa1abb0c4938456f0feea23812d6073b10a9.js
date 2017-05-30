'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var defaultProjectConfig = {

  ecmaVersion: 6,
  libs: [],
  loadEagerly: [],
  dontLoad: ['node_modules/**'],
  plugins: {

    doc_comment: true
  }
};

exports.defaultProjectConfig = defaultProjectConfig;
var defaultServerConfig = {

  ecmaVersion: 6,
  libs: [],
  loadEagerly: [],
  dontLoad: ['node_modules/**'],
  plugins: {

    doc_comment: true
  },
  dependencyBudget: 20000,
  ecmaScript: true
};

exports.defaultServerConfig = defaultServerConfig;
var ecmaVersions = [5, 6, 7];

exports.ecmaVersions = ecmaVersions;
var availableLibs = ['browser', 'chai', 'jquery', 'underscore'];

exports.availableLibs = availableLibs;
var availablePlugins = {

  complete_strings: {

    maxLength: 15
  },
  doc_comment: {

    fullDocs: true,
    strong: false
  },
  node: {

    dontLoad: '',
    load: '',
    modules: ''
  },
  node_resolve: {},
  modules: {

    dontLoad: '',
    load: '',
    modules: ''
  },
  es_modules: {},
  angular: {},
  requirejs: {

    baseURL: '',
    paths: '',
    override: ''
  },
  commonjs: {}
};
exports.availablePlugins = availablePlugins;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2tpbXVyYS8uYXRvbS9wYWNrYWdlcy9hdG9tLXRlcm5qcy9jb25maWcvdGVybi1jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7OztBQUVMLElBQU0sb0JBQW9CLEdBQUc7O0FBRWxDLGFBQVcsRUFBRSxDQUFDO0FBQ2QsTUFBSSxFQUFFLEVBQUU7QUFDUixhQUFXLEVBQUUsRUFBRTtBQUNmLFVBQVEsRUFBRSxDQUNSLGlCQUFpQixDQUNsQjtBQUNELFNBQU8sRUFBRTs7QUFFUCxlQUFXLEVBQUUsSUFBSTtHQUNsQjtDQUNGLENBQUM7OztBQUVLLElBQU0sbUJBQW1CLEdBQUc7O0FBRWpDLGFBQVcsRUFBRSxDQUFDO0FBQ2QsTUFBSSxFQUFFLEVBQUU7QUFDUixhQUFXLEVBQUUsRUFBRTtBQUNmLFVBQVEsRUFBRSxDQUNSLGlCQUFpQixDQUNsQjtBQUNELFNBQU8sRUFBRTs7QUFFUCxlQUFXLEVBQUUsSUFBSTtHQUNsQjtBQUNELGtCQUFnQixFQUFFLEtBQUs7QUFDdkIsWUFBVSxFQUFFLElBQUk7Q0FDakIsQ0FBQzs7O0FBRUssSUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7QUFFL0IsSUFBTSxhQUFhLEdBQUcsQ0FFM0IsU0FBUyxFQUNULE1BQU0sRUFDTixRQUFRLEVBQ1IsWUFBWSxDQUNiLENBQUM7OztBQUVLLElBQU0sZ0JBQWdCLEdBQUc7O0FBRTlCLGtCQUFnQixFQUFFOztBQUVoQixhQUFTLEVBQUUsRUFBRTtHQUNkO0FBQ0QsYUFBVyxFQUFFOztBQUVYLFlBQVEsRUFBRSxJQUFJO0FBQ2QsVUFBTSxFQUFFLEtBQUs7R0FDZDtBQUNELE1BQUksRUFBRTs7QUFFSixZQUFRLEVBQUUsRUFBRTtBQUNaLFFBQUksRUFBRSxFQUFFO0FBQ1IsV0FBTyxFQUFFLEVBQUU7R0FDWjtBQUNELGNBQVksRUFBRSxFQUFFO0FBQ2hCLFNBQU8sRUFBRTs7QUFFUCxZQUFRLEVBQUUsRUFBRTtBQUNaLFFBQUksRUFBRSxFQUFFO0FBQ1IsV0FBTyxFQUFFLEVBQUU7R0FDWjtBQUNELFlBQVUsRUFBRSxFQUFFO0FBQ2QsU0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFTLEVBQUU7O0FBRVQsV0FBTyxFQUFFLEVBQUU7QUFDWCxTQUFLLEVBQUUsRUFBRTtBQUNULFlBQVEsRUFBRSxFQUFFO0dBQ2I7QUFDRCxVQUFRLEVBQUUsRUFBRTtDQUNiLENBQUMiLCJmaWxlIjoiL2hvbWUva2ltdXJhLy5hdG9tL3BhY2thZ2VzL2F0b20tdGVybmpzL2NvbmZpZy90ZXJuLWNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFByb2plY3RDb25maWcgPSB7XG5cbiAgZWNtYVZlcnNpb246IDYsXG4gIGxpYnM6IFtdLFxuICBsb2FkRWFnZXJseTogW10sXG4gIGRvbnRMb2FkOiBbXG4gICAgJ25vZGVfbW9kdWxlcy8qKidcbiAgXSxcbiAgcGx1Z2luczoge1xuXG4gICAgZG9jX2NvbW1lbnQ6IHRydWVcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRTZXJ2ZXJDb25maWcgPSB7XG5cbiAgZWNtYVZlcnNpb246IDYsXG4gIGxpYnM6IFtdLFxuICBsb2FkRWFnZXJseTogW10sXG4gIGRvbnRMb2FkOiBbXG4gICAgJ25vZGVfbW9kdWxlcy8qKidcbiAgXSxcbiAgcGx1Z2luczoge1xuXG4gICAgZG9jX2NvbW1lbnQ6IHRydWVcbiAgfSxcbiAgZGVwZW5kZW5jeUJ1ZGdldDogMjAwMDAsXG4gIGVjbWFTY3JpcHQ6IHRydWVcbn07XG5cbmV4cG9ydCBjb25zdCBlY21hVmVyc2lvbnMgPSBbNSwgNiwgN107XG5cbmV4cG9ydCBjb25zdCBhdmFpbGFibGVMaWJzID0gW1xuXG4gICdicm93c2VyJyxcbiAgJ2NoYWknLFxuICAnanF1ZXJ5JyxcbiAgJ3VuZGVyc2NvcmUnXG5dO1xuXG5leHBvcnQgY29uc3QgYXZhaWxhYmxlUGx1Z2lucyA9IHtcblxuICBjb21wbGV0ZV9zdHJpbmdzOiB7XG5cbiAgICBtYXhMZW5ndGg6IDE1XG4gIH0sXG4gIGRvY19jb21tZW50OiB7XG5cbiAgICBmdWxsRG9jczogdHJ1ZSxcbiAgICBzdHJvbmc6IGZhbHNlXG4gIH0sXG4gIG5vZGU6IHtcblxuICAgIGRvbnRMb2FkOiAnJyxcbiAgICBsb2FkOiAnJyxcbiAgICBtb2R1bGVzOiAnJ1xuICB9LFxuICBub2RlX3Jlc29sdmU6IHt9LFxuICBtb2R1bGVzOiB7XG5cbiAgICBkb250TG9hZDogJycsXG4gICAgbG9hZDogJycsXG4gICAgbW9kdWxlczogJydcbiAgfSxcbiAgZXNfbW9kdWxlczoge30sXG4gIGFuZ3VsYXI6IHt9LFxuICByZXF1aXJlanM6IHtcblxuICAgIGJhc2VVUkw6ICcnLFxuICAgIHBhdGhzOiAnJyxcbiAgICBvdmVycmlkZTogJydcbiAgfSxcbiAgY29tbW9uanM6IHt9XG59O1xuIl19