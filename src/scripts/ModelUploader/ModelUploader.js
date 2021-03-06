import React, { Component, Fragment } from 'react';

import ModelViewer from '../ModelViewer';

import { getAreaLabel, getDimensionsLabel, getVolumeLabel, getBase64File } from './helpers';

class ModelUploader extends Component {
  constructor(props) {
    super(props);

    this.handleChangeMaterial = this.handleChangeMaterial.bind(this);
    this.handleChangeModeledIn = this.handleChangeModeledIn.bind(this);
    this.handleInitModelViewer = this.handleInitModelViewer.bind(this);
    this.handeOnUploadModel = this.handeOnUploadModel.bind(this);

    this.state = {
      area: undefined,
      dimensions: { x: undefined, y: undefined, z: undefined },
      isModalLoaded: false,
      material: 'solid',
      modeledIn: 'mm',
      volume: undefined,
      supportVolume: undefined,
      totalVolume: undefined,
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

  handleChangeMaterial(material) {
    this.setState({ material });

    if (!this.modelViewer) return;

    this.modelViewer.changeMaterial(material);
  }

  handleChangeModeledIn(ev) {
    const { value } = ev.target;

    this.setState({ modeledIn: value });

    if (!this.modelViewer) return;

    this.modelViewer.setModeledIn(value, (volume, area, dimensions) => {
      this.handleSetMeasurements(area, dimensions, volume);
    });
  }

  handeOnUploadModel(ev) {
    const { files } = ev.target;
    const file = files[0];

    const { onAddFormData } = this.props;
    const { modeledIn } = this.state;

    this.modelViewer.openFile(file, (volume, area, dimensions) => {
      this.handleSetMeasurements(area, dimensions, volume);
      this.setState({ isModalLoaded: true });
    });

    getBase64File(file, (base64File) => {
      onAddFormData('STL File', [base64File]);
    });
  }

  handleSetMeasurements(area, dimensions, volume) {
    const { onSetAnswer } = this.props;

    const supportVolume = volume * 5;
    const totalVolume = volume + supportVolume;

    this.setState({
      area,
      dimensions,
      volume,
      supportVolume,
      totalVolume,
    });

    onSetAnswer({ label: getVolumeLabel(totalVolume, modeledIn), value: totalVolume / 1000 });
  }

  render() {
    const {
      area,
      dimensions,
      isModalLoaded,
      material,
      modeledIn,
      supportVolume,
      totalVolume,
      volume,
    } = this.state;

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
        >
          <div className="cc-3d__modelviewer-actions">
            <button
              className={`cc-3d__button small ${material === 'solid' ? 'active': ''}`}
              onClick={() => { this.handleChangeMaterial('solid'); }}
            >
              Solid
            </button>
            <button
              className={`cc-3d__button small ${material === 'wireframe' ? 'active': ''}`}
              onClick={() => { this.handleChangeMaterial('wireframe'); }}
            >
              Wireframe
            </button>
          </div>
        </div>

        {isModalLoaded &&
          <p className="cc-3d__instructions">Drag to rotate · Scroll to zoom right-click · Drag to pan</p>
        }

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
            {dimensions && <span>Material dimensions: {getDimensionsLabel(dimensions)} <br /></span>}
            {volume && <span>Material Volume: {getVolumeLabel(volume, modeledIn)} <br /></span>}
            {supportVolume && <span>Support Volume: {getVolumeLabel(supportVolume, modeledIn)} <br /></span>}
            {totalVolume && <span>Total Volume: {getVolumeLabel(totalVolume, modeledIn)} <br /></span>}
            {area && <span>Surface Area: {getAreaLabel(area, modeledIn)} <br /></span>}
          </div>
        }
      </Fragment>
    )
  }
}

export default ModelUploader;
