(() => {
  requirejs.config({
    baseUrl: './front/js',
    paths: {
      react: [
        'https://cdnjs.cloudflare.com/ajax/libs/react/15.4.1/react.min',
        '../dependencies/react.min'
      ],
      reactDom: [
        'https://cdnjs.cloudflare.com/ajax/libs/react/15.4.1/react-dom.min',
        '../dependencies/react-dom.min'
      ],
      reactRouter: [
        'https://cdnjs.cloudflare.com/ajax/libs/react-router/3.0.0/ReactRouter.min',
        '../dependencies/ReactRouter.min'
      ],
      reactScrollbar: [
        '../dependencies/scrollArea'
      ],
      lodash: [
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.2/lodash.min',
        '../dependencies/lodash.min'
      ],
      superagent: [
        'https://cdnjs.cloudflare.com/ajax/libs/superagent/3.3.2/superagent.min',
        '../dependencies/superagent'
      ]
    }
  });
  
  require([
    'react',
    'reactDom',
    'reactRouter',
    'reactScrollbar',
    'lodash',
    'superagent',
    './Config',
    './Cookie',
    './Cache',
    './Request',
    './Authentication',
    './App',
    './components/Login',
    './components/Home',
    './components/Router'
  ], (
    React,
    ReactDOM,
    ReactRouter,
    ScrollArea,
    _,
    request,
    Config,
    Cookie,
    Cache,
    Request,
    Authentication,
    App,
    Login,
    Home,
    Router
  ) => App.init());
})();
