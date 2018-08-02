import React, { Component, Fragment } from 'react';

import ModelViewer from '../ModelViewer';

import { getAreaLabel, getVolumeLabel, getBase64File } from './helpers';

class ModelUploader extends Component {
  constructor(props) {
    super(props);

    this.handleChangeModeledIn = this.handleChangeModeledIn.bind(this);
    this.handleInitModelViewer = this.handleInitModelViewer.bind(this);
    this.handeOnUploadModel = this.handeOnUploadModel.bind(this);

    this.state = {
      area: undefined,
      modeledIn: 'mm',
      volume: undefined,
    }
  }

  componentDidMount() {
    this.handleInitModelViewer();
  }

  handleInitModelViewer() {
    if (!this.modelViewerContainer) return;

    this.modelViewer = new ModelViewer(this.modelViewerContainer);
    this.modelViewer.animate();
  }

  handleChangeModeledIn(ev) {
    const { value } = ev.target;

    const { question } = this.props;

    this.setState({ modeledIn: value });

    if (!this.modelViewer) return;

    this.modelViewer.setModeledIn(value, (volume, area) => {
      question.handleChange({ label: getVolumeLabel(volume, modeledIn), value: volume / 1000 });

      this.setState({ area, volume });
    });
  }

  handeOnUploadModel(ev) {
    const { files } = ev.target;
    const file = files[0];

    const { calculator, question } = this.props;
    const { modeledIn } = this.state;

    this.modelViewer.openFile(file, (volume, area) => {
      question.handleChange({ label: getVolumeLabel(volume, modeledIn), value: volume / 1000 });

      this.setState({
        area,
        volume,
      });
    });

    getBase64File(file, (base64File) => {
      calculator.addFormData('STL File', [base64File]);
    });
  }

  render() {
    const { calculator, question } = this.props;
    const { area, modeledIn, volume } = this.state;

    const volumeLabel = getVolumeLabel(volume, modeledIn);
    const areaLabel = getAreaLabel(area, modeledIn);

    return (
      <Fragment>
        <label
          className="cc-3d__upload-button"
          htmlFor="stlUploader"
        >
          <img src="https://app.convertcalculator.co/img/icons/upload.svg" alt="" />Upload STL File
        </label>
        <input
          id="stlUploader"
          className="cc-3d__upload-input"
          type="file"
          style={{ display: 'none' }}
          onChange={this.handeOnUploadModel}
        />

        <div
          ref={(c) => { this.modelViewerContainer = c; }}
          className="cc-3d__modelviewer-container"
        />

        <div className="cc-3d__modeled-in-box">
          <label htmlFor="modeledIn">Parts modeled in:&nbsp;
            <select
              name="modeledIn"
              id="modeledIn"
              value={modeledIn}
              onChange={this.handleChangeModeledIn}
            >
              <option value="mm">Milimeters</option>
              <option value="cm">Centimeters</option>
              <option value="in">Inches</option>
              <option value="ft">Feet</option>
            </select>
          </label>

        </div>

        {(volume || area) &&
          <div className="cc-3d__info-box">
            {volume && <span>Material Volume: {volumeLabel} <br /></span>}
            {area && <span>Surface Area: {areaLabel} <br /></span>}
          </div>
        }
      </Fragment>
    )
  }
}

export default ModelUploader;
