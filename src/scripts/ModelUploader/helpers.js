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



export const getAreaLabel = (area) => {
  const isCm = area > 10;
  const newArea = isCm ? area / 100 : area;

  return `${numberFormatter('#,##0.#####', newArea)} ${isCm ? 'cm' : 'mm'}2`
}

export const getDimensionsLabel = (dimensions) => {
  const { x, y , z } = dimensions;
  if (!dimensions.x) return '';

  const min = Math.min(x, y, z);
  const isCm = min > 10;

  const xLabel = `${numberFormatter('#,##0.#####', isCm ? x / 10 : x )} ${isCm ? 'cm' : 'mm'}`;
  const yLabel = `${numberFormatter('#,##0.#####', isCm ? y / 10 : y )} ${isCm ? 'cm' : 'mm'}`;
  const zLabel = `${numberFormatter('#,##0.#####', isCm ? z / 10 : z )} ${isCm ? 'cm' : 'mm'}`;

  return `${xLabel} x ${yLabel} x ${zLabel}`;
}

export const getVolumeLabel = (volume) => {
  const isCm = volume > 10;
  const newVolume = isCm ? volume / 1000 : volume;

  return `${numberFormatter('#,##0.#####', newVolume)} ${isCm ? 'cm' : 'mm'}3`

}
