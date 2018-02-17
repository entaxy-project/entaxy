import React from 'react';
import ReactDOM from 'react-dom';
import Reboot from 'material-ui/Reboot';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import createHistory from 'history/createBrowserHistory'

const history = createHistory()


ReactDOM.render(
	<Reboot>
		<App history={history} />
	</Reboot>, 
	document.getElementById('root')
)
registerServiceWorker();
