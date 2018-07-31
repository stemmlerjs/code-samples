// TextInput.test.js
import React from 'react';
import { shallow, mount, render } from 'enzyme';
import TextInput from '../TextInput';

// describe what we are testing
describe('Shared Components -> Input/TextInput', () => {
 
 // make our assertion and what we expect to happen 
 it('should render without throwing an error', () => {
   expect(shallow(<TextInput />).find('label').exists()).toBe(true)
 })
})