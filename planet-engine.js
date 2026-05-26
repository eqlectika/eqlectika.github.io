import * as THREE from 'three';

class PlanetEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        // Окружающий свет для базовой видимости
const ambientLight = new THREE.AmbientLight(0x222222); 
this.scene.add(ambientLight);

// Статические источники света с разных сторон
const lightPositions = [
    [10, 10, 10], [-10, 10, 10], [0, 20, 0], [0, -20, 0], [10, -10, -10]
];

lightPositions.forEach(pos => {
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(pos[0], pos[1], pos[2]);
    this.scene.add(light);
});
        // Создание сферы с треугольными полигонами
        const geometry = new THREE.IcosahedronGeometry(5, 15);
        const material = new THREE.MeshPhongMaterial({ color: 0xff5f00, wireframe: true });
        this.planet = new THREE.Mesh(geometry, material);
        this.scene.add(this.planet);

        // Свет для рельефа
        this.scene.add(new THREE.AmbientLight(0x404040));
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        
        this.animate();
    }

    // Метод для деформации вершины (выдавливание/втягивание)
    deformVertex(index, displacement) {
        const position = this.planet.geometry.attributes.position;
        // Логика манипуляции вектором вершины
        this.planet.geometry.attributes.position.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}

new PlanetEngine();
