import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';

import { calculateArea, calculateVolume, loadStl, getConversion } from './helpers';

class ModelViewer {
  constructor(el) {
    this.shouldBeModeledIn = 'mm';
    this.animate = this.animate.bind(this);
    this.openFile = this.openFile.bind(this);
    this.render = this.render.bind(this);

    this.width = el.offsetWidth;
    this.height = this.width / 16 * 9;

    this.container = el;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);
    this.camera.position.set(0, 0, 50);

    this.controls = new TrackballControls(this.camera, this.container);

    this.controls.rotateSpeed = 2;
    this.controls.zoomSpeed = 2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = true;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.keys = [ 65, 83, 68 ];
    this.controls.addEventListener( 'change', this.render );

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
    requestAnimationFrame(this.animate);
    this.controls.update();
  }

  openFile(file, callback) {
    this.container.appendChild( this.renderer.domElement );

    const reader = new FileReader();
    reader.addEventListener('load', (ev) => {
      const { result } = ev.target;
      const geometry = loadStl(result);

      this.scene.remove(this.object);

      const material = new THREE.MeshPhongMaterial({
        color: 0x697689,
      });
      const wireframeMaterial = new THREE.LineBasicMaterial( {
        color: 0xffffff,
        linewidth: 2,
      });

      this.objectModeledIn = this.shouldBeModeledIn;
      this.object = new THREE.Mesh(geometry, material);
      const wireframe = new THREE.LineSegments( geometry, wireframeMaterial );
      this.object.add(wireframe);

      const volume = calculateVolume(this.object);
      const area = calculateArea(this.object);

      this.resetCameraPosition();

      this.scene.add(this.object);

      this.container.classList.add('active');

      this.render();
      callback(volume, area);
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
    return [this.object.geometry.min, this.object.geometry.max, this.object.geometry.getSize()];
  }

  render() {
    this.renderer.render( this.scene, this.camera );
  }

  resetCameraPosition() {
    if (!this.object) return;

    this.controls.reset();

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(this.object);

    const size = boundingBox.getSize();

    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = this.camera.fov * ( Math.PI / 180 );
    const distance = Math.abs(maxDim / Math.tan(fov / 2));

    this.camera.position.z = distance;
    this.camera.updateProjectionMatrix();

  }

  setModeledIn(shouldBeModeledIn, callback) {
    this.shouldBeModeledIn = shouldBeModeledIn;

    this.setObjectSize(callback);
  }

  setObjectSize(callback) {
    if (!this.object || !this.shouldBeModeledIn) return;
    if (this.shouldBeModeledIn === this.objectModeledIn) return;

    const conversion = getConversion(this.objectModeledIn, this.shouldBeModeledIn);
    const newScale = this.object.scale.x / conversion;

    this.object.scale.set(newScale, newScale, newScale);
    this.objectModeledIn = this.shouldBeModeledIn;

    const volume = calculateVolume(this.object);
    const area = calculateArea(this.object);

    this.resetCameraPosition();
    this.render();

    if (typeof callback === 'function') {
      callback(volume, area);
    }
  }
}

export default ModelViewer;
