import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install( { THREE: THREE } );

import { calculateArea, calculateVolume, loadStl, getConversion } from './helpers';

class ModelViewer {
  constructor(el) {
    this.shouldBeModeledIn = 'mm';
    this.objectModeledIn = 'mm';
    this.materialName = 'solid';

    this.materials = {
      solid: new THREE.MeshPhongMaterial({
        color: 0x697689,
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: 0x697689,
        wireframe: true
      }),
    }

    this.animate = this.animate.bind(this);
    this.openFile = this.openFile.bind(this);
    this.render = this.render.bind(this);

    this.width = el.offsetWidth;
    this.height = this.width / 16 * 9;

    this.container = el;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);
    this.camera.position.set(0, 0, 50);

    this.controls = new CameraControls(this.camera, this.container);

    this.controls.rotateSpeed = 2;
    this.controls.zoomSpeed = 2;
    this.controls.panSpeed = 2;
    this.controls.staticMoving = true;
    this.controls.dampingFactor = 0.3;
    this.controls.draggingDampingFactor = 0.3;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.scene.add(new THREE.AmbientLight(0x666666));

    const light1 = new THREE.DirectionalLight(0xffffff);
    light1.position.set(0, 100, 100);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(0, -100, -100);
    this.scene.add(light2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.width, this.height);

    window.addEventListener('resize', () => {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( this.width, this.height );
    }, false );
  }

  animate() {
    const delta = this.clock.getDelta();
    const isControlsUpdated = this.controls.update(delta);

    requestAnimationFrame(this.animate);

    if (isControlsUpdated) {
      this.render();
    }
  }

  openFile(file, callback) {
    this.container.appendChild( this.renderer.domElement );

    const reader = new FileReader();
    reader.addEventListener('load', (ev) => {
      const { result } = ev.target;
      const geometry = loadStl(result);

      this.scene.remove(this.object);

      this.object = new THREE.Mesh(geometry, this.materials[this.materialName]);

      const volume = calculateVolume(this.object);
      const area = calculateArea(this.object);

      this.resetCameraPosition();

      this.scene.add(this.object);

      this.container.classList.add('active');

      this.render();

      this.setObjectSize(callback);
      //callback(volume, area);
    }, false);
    reader.readAsArrayBuffer(file);
  }

  calculateArea() {
    return calculateArea(this.object);
  }

  calculateVolume() {
    return calculateVolume(this.object);
  }

  calculateDimensions() {
    if (!this.object) return [];

    const box = new THREE.Box3().setFromObject(this.object);

    return box.getSize();
  }

  changeMaterial(materialName) {
    this.materialName = materialName;

    if (!this.object) return;

    this.object.material = this.materials[this.materialName];

    this.render();
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  resetCameraPosition() {
    if (!this.object) return;

    this.controls.reset(false);

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(this.object);

    const size = boundingBox.getSize();

    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = this.camera.fov * ( Math.PI / 180 );
    const distance = Math.abs(maxDim / Math.tan(fov / 2));

    this.controls.dollyTo(distance, false);
  }

  setModeledIn(shouldBeModeledIn, callback) {
    this.shouldBeModeledIn = shouldBeModeledIn;

    this.setObjectSize(callback);
  }

  setObjectSize(callback) {
    if (!this.object || !this.shouldBeModeledIn) return;

    const conversion = getConversion(this.objectModeledIn, this.shouldBeModeledIn);
    const newScale = this.object.scale.x / conversion;

    this.object.scale.set(newScale, newScale, newScale);
    this.objectModeledIn = this.shouldBeModeledIn;

    const volume = calculateVolume(this.object);
    const area = calculateArea(this.object);
    const dimensions = this.calculateDimensions();

    this.resetCameraPosition();
    this.render();

    if (typeof callback === 'function') {
      callback(volume, area, dimensions);
    }
  }
}

export default ModelViewer;
