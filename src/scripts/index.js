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

    const questionElement = question.getElement();

    render(<ModelUploader question={question} calculator={calculator} />, questionElement);
  });
});
