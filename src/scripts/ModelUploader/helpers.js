import numberFormatter from 'number-formatter';

const readDataUrl = (file, callback) => {
  const reader = new window.FileReader();

  reader.onloadend = function () {
    callback(reader.result);
  };

  reader.readAsDataURL(file);
};

export const getBase64File = (file, callback) => {
  readDataUrl(file, (res) => {
    const { name, size } = file;

    callback(Object.assign({}, {
      base64: res.split(',')[1],
      name,
      size,
      type: 'application/vnd.ms-pkistl',
    }));
  });
};



export const getAreaLabel = (area, modeledIn) => {
  const isCm = area > 10;
  const newArea = isCm ? area / 100 : area;

  return `${numberFormatter('#,##0.#####', newArea)} ${isCm ? 'cm' : 'mm'}3`
}

export const getVolumeLabel = (volume, modeledIn) => {
  const isCm = volume > 10;
  const newVolume = isCm ? volume / 1000 : volume;

  return `${numberFormatter('#,##0.#####', newVolume)} ${isCm ? 'cm' : 'mm'}3`

}
