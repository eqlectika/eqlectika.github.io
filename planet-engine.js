window.addEventListener('contextmenu', (e) => e.preventDefault());

import * as THREE from 'three';

class PlanetEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.camera.position.set(0, 0, 0); 
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Свет: Увеличили интенсивность, чтобы было видно
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        this.scene.add(pointLight); 

        // Геометрия
        const geometry = new THREE.IcosahedronGeometry(5, 0);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff5f00, 
            wireframe: true, 
            side: THREE.DoubleSide 
        });
        this.planet = new THREE.Mesh(geometry, material);
        this.planet.frustumCulled = false; // Отключает проверку на видимость
        this.scene.add(this.planet);

        // Физика камеры
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotationVelocity = new THREE.Vector2(0, 0);
        this.friction = 0.92;
        this.moveSpeed = 0.01;

        // Состояние
        this.isMovingForward = false;
        this.isMovingBackward = false;
        this.verticalDirection = 0;

        this.initInputListeners();
        this.animate();
    }

    initInputListeners() {
        window.addEventListener('pointerdown', (e) => {
            if (e.button === 0) this.isMovingForward = true;
            if (e.button === 2) this.isMovingBackward = true;
        });

        window.addEventListener('pointerup', () => {
            this.isMovingForward = false;
            this.isMovingBackward = false;
        });

        window.addEventListener('dblclick', () => {
            this.verticalDirection = (this.verticalDirection === 0) ? 0.1 : 0;
        });

        window.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) {
                this.camera.rotation.y -= e.movementX * 0.002;
                this.camera.rotation.x -= e.movementY * 0.002;
            }
        });
    }

updateCamera() {
    // Вектор взгляда камеры
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

    // Управление
    if (this.isMovingForward) this.velocity.add(direction.multiplyScalar(this.moveSpeed));
    if (this.isMovingBackward) this.velocity.sub(direction.multiplyScalar(this.moveSpeed));
    
    // Вертикаль
    if (this.verticalDirection !== 0) this.velocity.y += this.verticalDirection * this.moveSpeed;

    // Инерция
    this.velocity.multiplyScalar(this.friction);
    this.camera.position.add(this.velocity);

    // КОЛЛИЗИИ: не даем выйти за радиус
    this.checkCollisions();

    // Свет всегда рядом
    this.pointLight.position.copy(this.camera.position);
}

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }
}

new PlanetEngine();
checkCollisions() {
    const radius = 4.8; // Чуть меньше радиуса икосаэдра
    if (this.camera.position.length() > radius) {
        this.camera.position.setLength(radius);
        this.velocity.multiplyScalar(-0.5); // Отскок при столкновении
    }
}
