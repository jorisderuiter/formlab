import numberFormatter from 'number-formatter';

import style from '../styles/style.css';

import ModelViewer from './modules/ModelViewer';
import { getBase64File } from './helpers';

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

    const label = document.createElement('label');
    label.htmlFor = 'stlUploader';
    label.innerHTML = '<img src="https://app.convertcalculator.co/img/icons/upload.svg" alt="">Upload STL File';
    label.classList.add('cc-3d__upload-button');
    questionElement.appendChild(label);

    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'stlUploader';
    input.style.display = 'none';
    input.classList.add('cc-3d__upload-input');
    questionElement.appendChild(input);

    const modelViewerContainer = document.createElement('div');
    modelViewerContainer.classList.add('cc-3d__modelviewer-container');
    questionElement.appendChild(modelViewerContainer);
    const modelViewer = new ModelViewer(modelViewerContainer);
    modelViewer.animate();

    const infoBox = document.createElement('div');
    infoBox.classList.add('cc-3d__info-box');
    questionElement.appendChild(infoBox);

    input.addEventListener('change', (ev) => {
      const { files } = ev.target;
      const file = files[0];

      modelViewer.openFile(file, (volume, area) => {
        const volumeLabel = `${numberFormatter('#,##0.#####', volume)} cm3`;
        const areaLabel = `${numberFormatter('#,##0.#####', area)} cm2`;

        question.handleChange({ label: volumeLabel, value: volume });

        infoBox.innerHTML = `Material Volume: ${volumeLabel} <br />Surface Area: ${areaLabel}`;
        infoBox.classList.add('active');
      });

      getBase64File(file, (base64File) => {
        calculator.addFormData('STL File', [base64File]);
      });
    });

    calculator.addFormula({
      _id: 'print-price-formula',
      order: 0,
      title: 'SLA 3D Print Price Calculator',
      description: 'Complete the form to generate a price for printing your model. ',
      equation: 'QA * QC * QB',
      decimals: 2,
      prefix: '£',
      postfix: ' total (inc. VAT)',
    });
  });
});
