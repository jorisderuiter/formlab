import * as THREE from 'three';

var binaryVector3 = function (view, offset) {
    var v = new THREE.Vector3();
    v.x = view.getFloat32(offset + 0, true);
    v.y = view.getFloat32(offset + 4, true);
    v.z = view.getFloat32(offset + 8, true);
    return v;
};

var loadBinaryStl = function (buffer) {
    // binary STL
    var view = new DataView(buffer);
    var size = view.getUint32(80, true);
    var geom = new THREE.Geometry();
    var offset = 84;
    for (var i = 0; i < size; i++) {
        var normal = binaryVector3(view, offset);
        geom.vertices.push(binaryVector3(view, offset + 12));
        geom.vertices.push(binaryVector3(view, offset + 24));
        geom.vertices.push(binaryVector3(view, offset + 36));
        geom.faces.push(
            new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2, normal));
        offset += 4 * 3 * 4 + 2;
    }
    return geom;
};


var m2vec3 = function (match) {
    var v = new THREE.Vector3();
    v.x = parseFloat(match[1]);
    v.y = parseFloat(match[2]);
    v.z = parseFloat(match[3]);
    return v;
};
var toLines = function (array) {
    var lines = [];
    var h = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === 10) {
            var line = String.fromCharCode.apply(
                null, array.subarray(h, i));
            lines.push(line);
            h = i + 1;
        }
    }
    lines.push(String.fromCharCode.apply(null, array.subarray(h)));
    return lines;
}
var loadTextStl = function (buffer) {
    var lines = toLines(new Uint8Array(buffer));
    var index = 0;
    var scan = function (regexp) {
        while (lines[index].match(/^\s*$/)) index++;
        var r = lines[index].match(regexp);
        return r;
    };
    var scanOk = function (regexp) {
        var r = scan(regexp);
        if (!r) throw new Error(
            "not text stl: " + regexp.toString() +
            "=> (line " + (index - 1) + ")" +
            "[" + lines[index-1] + "]");
        index++;
        return r;
    }

    var facetReg = /^\s*facet\s+normal\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/;
    var vertexReg = /^\s*vertex\s+([^s]+)\s+([^\s]+)\s+([^\s]+)/;
    var geom = new THREE.Geometry();
    scanOk(/^\s*solid\s(.*)/);
    while (!scan(/^\s*endsolid/)) {
        var normal = scanOk(facetReg);
        scanOk(/^\s*outer\s+loop/);
        var v1 = scanOk(vertexReg);
        var v2 = scanOk(vertexReg);
        var v3 = scanOk(vertexReg);
        scanOk(/\s*endloop/);
        scanOk(/\s*endfacet/);
        var base = geom.vertices.length;
        geom.vertices.push(m2vec3(v1));
        geom.vertices.push(m2vec3(v2));
        geom.vertices.push(m2vec3(v3));
        geom.faces.push(
            new THREE.Face3(base, base + 1, base + 2, m2vec3(normal)));
    }
    return geom;
};

export const loadStl = (buffer) => {
  try {
    return loadTextStl(buffer);
  } catch (ex) {
    return loadBinaryStl(buffer);
  }
}

const getVectors = (face, scale, vertices) => {
  const Pi = face.a;
  const Qi = face.b;
  const Ri = face.c;

  const P = new THREE.Vector3(vertices[Pi].x * scale.x, vertices[Pi].y * scale.y, vertices[Pi].z * scale.z);
  const Q = new THREE.Vector3(vertices[Qi].x * scale.x, vertices[Qi].y * scale.y, vertices[Qi].z * scale.z);
  const R = new THREE.Vector3(vertices[Ri].x * scale.x, vertices[Ri].y * scale.y, vertices[Ri].z * scale.z);

  return {
    P,
    Q,
    R,
  }
}

const volumeOfT = (p1, p2, p3) => {
  const v321 = p3.x * p2.y * p1.z;
  const v231 = p2.x * p3.y * p1.z;
  const v312 = p3.x * p1.y * p2.z;
  const v132 = p1.x * p3.y * p2.z;
  const v213 = p2.x * p1.y * p3.z;
  const v123 = p1.x * p2.y * p3.z;

  return (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;
}

const calculateFaceSignedVolume = (face, scale, vertices) => {
  const { P, Q, R } = getVectors(face, scale, vertices);

  return volumeOfT(P, Q, R);
}

export const calculateVolume = (mesh) => {
  if (!mesh || !mesh.geometry) return 0;

  const { geometry, scale } = mesh;
  const { faces, vertices } = geometry;

  const volume = faces.reduce((volume, face) => {
    return volume + calculateFaceSignedVolume(face, scale, vertices);
  }, 0);

  return Math.abs(volume);
}

const calculateFaceArea = (face, scale, vertices) => {
  const { P, Q, R } = getVectors(face, scale, vertices);

  var ab = Q.clone().sub(P);
  var ac = R.clone().sub(P);

  const cross = new THREE.Vector3();
  cross.crossVectors(ab, ac);

  return cross.length() * 0.5;
}

export const calculateArea = (mesh) => {
  if (!mesh) return 0;

  const { geometry, scale } = mesh;
  const { faces, vertices } = geometry;

  const area = faces.reduce((area, face) => {
    return area + calculateFaceArea(face, scale, vertices);
  }, 0);

  return Math.abs(area);
}

export const getConversion = (fromScale, toScale) => {
  const conversions = {
    mm: 1,
    cm: 0.1,
    in: 0.0393700787,
    ft: 0.0032808399,
  }

  return  conversions[toScale] / conversions[fromScale];
}
