import React from 'react';
import { render } from 'react-dom';

import style from '../styles/style.css';

import ModelUploader from './ModelUploader';

window.addEventListener('ccloaded', () => {
  const convertcalculator = cc.getInstance('TAFyi3waAKJF3T78s');

  const question = convertcalculator.questions.questions[0];
  const questionElement = question.getElement();

  console.log(convertcalculator.calculator);

  render(
    <ModelUploader
      onSetAnswer={(answer) => { question.setAnswer(answer); }}
      onAddFormData={(name, value) => { convertcalculator.calculator.addFormData(name, value); }}
    />, questionElement);
});
