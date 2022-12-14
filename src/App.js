import React from 'react';

import './App.css';
import { RedmineHelpdeskWidgetFactory } from './widget';

function App() {

  React.useEffect(() => {
    const widget_button = document.getElementById('widget_button');
    const redmineWidget = RedmineHelpdeskWidgetFactory({widget_button});
    redmineWidget.load();
  }, []);


  return (
    <div className="App">
      <script type="text/javascript" src="/widget.js" ></script>
      <div id="helpdesk_widget"></div>
      <header className="App-header">
        <button id="widget_button_" >Ask your question</button>
      </header>
    </div>
  );
}

export default App;
