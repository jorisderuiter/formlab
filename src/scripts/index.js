import React from 'react';
import { render } from 'react-dom';

import style from '../styles/style.css';

import ModelUploader from './ModelUploader';



const ccReady = (fn) => {
  const interval = setInterval(() => {
    if (window && window.cc) {
      clearInterval(interval);
      fn();
    }
  }, 50);
}

ccReady(() => {
  const calculator = cc.getInstance();

  calculator.isReady(() => {
    const question = calculator.addQuestion({
      order: 0,
      title: '3D Model',
      description: 'Upload your model here',
      type: 'custom',
      _id: '3dshizzle',
    });

    const formula = calculator.addFormula({
      _id: 'print-price-formula',
      order: 0,
      title: 'SLA 3D Print Price Calculator',
      description: 'Complete the form to generate a price for printing your model. ',
      equation: 'QA * QC * QB * (1 + QD) * IF(QB>10, 0.9, 1) - IF(QB > 1, (QB-1)*7.5, 0)',
      decimals: 2,
      prefix: '£',
      postfix: ' total (inc. VAT)',
    });

    const questionElement = question.getElement();

    render(<ModelUploader question={question} calculator={calculator} />, questionElement);
  });
});
