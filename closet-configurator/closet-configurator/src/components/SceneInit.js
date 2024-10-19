import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

export default class SceneInit {
    constructor(canvasId) {
        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;
        this.fov = 45;
        this.nearPlane = 1;
        this.farPlane = 1000;
        this.canvasId = canvasId;
        this.clock = undefined;
        this.stats = undefined;
        this.controls = undefined;
        this.ambientLight = undefined;
        this.directionalLight = undefined;
        this.aspectRatio = 0.7; // This will make the scene take up 70% of the width
    }

    initialize() {
        this.scene = new THREE.Scene();
        const canvas = document.getElementById(this.canvasId);
        const container = canvas.parentElement;

        this.camera = new THREE.PerspectiveCamera(
            this.fov,
            (container.clientWidth / container.clientHeight) * this.aspectRatio,
            this.nearPlane,
            this.farPlane
        );
        this.camera.position.z = 48;

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);

        this.clock = new THREE.Clock();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.ambientLight.castShadow = true;
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        this.directionalLight.position.set(0, 32, 64);
        this.scene.add(this.directionalLight);

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.stats.update();
        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = this.renderer.domElement.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = (width / height) * this.aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}