import React from 'react';
import renderer from 'react-test-renderer';
import App from '../'

test('App snapshot test', () => {
  const component = renderer.create(<App />);
  const tree = component.toJson();
  expect(tree).toMatchSnapshot();
});
