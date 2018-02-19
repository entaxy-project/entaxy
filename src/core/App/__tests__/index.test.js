import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import App from '../';
import { Route, Link, MemoryRouter } from 'react-router-dom'

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(
  	<MemoryRouter>
  		<App />
  	</MemoryRouter>, 
  	div
  );
  unmountComponentAtNode(div);
});
