import * as THREE from 'three';

class PlanetEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 0); // Старт из центра
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Свет
        this.scene.add(new THREE.AmbientLight(0x222222));
        const lightPositions = [[10, 10, 10], [-10, 10, 10], [0, 20, 0], [0, -20, 0], [10, -10, -10]];
        lightPositions.forEach(pos => {
            const light = new THREE.DirectionalLight(0xffffff, 0.8);
            light.position.set(pos[0], pos[1], pos[2]);
            this.scene.add(light);
        });

        // Геометрия
        const geometry = new THREE.IcosahedronGeometry(5, 0);
        const material = new THREE.MeshPhongMaterial({ color: 0xff5f00, wireframe: true, side: THREE.DoubleSide });
        this.planet = new THREE.Mesh(geometry, material);
        this.scene.add(this.planet);

        // Параметры камеры (инерция)
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotationVelocity = new THREE.Vector2(0, 0);
        this.friction = 0.95;
        this.moveSpeed = 0.05;

        // Ввод
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Вращение левой кнопкой мыши
                this.rotationVelocity.set(-e.movementY * 0.002, -e.movementX * 0.002);
            }
        });

        this.animate();
    }

    updateCamera() {
        // Управление движением (WASD + Space/Ctrl)
        if (this.keys['KeyW']) this.velocity.z -= this.moveSpeed;
        if (this.keys['KeyS']) this.velocity.z += this.moveSpeed;
        if (this.keys['Space']) this.velocity.y += this.moveSpeed;
        if (this.keys['ControlLeft']) this.velocity.y -= this.moveSpeed;

        // Применение инерции
        this.velocity.multiplyScalar(this.friction);
        this.camera.position.add(this.velocity);

        // Вращение камеры
        this.camera.rotation.x += this.rotationVelocity.x;
        this.camera.rotation.y += this.rotationVelocity.y;
        this.rotationVelocity.multiplyScalar(this.friction);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }
}

new PlanetEngine();
