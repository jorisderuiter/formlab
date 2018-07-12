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
