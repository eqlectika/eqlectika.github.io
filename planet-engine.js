import * as THREE from 'three';

class PlanetEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
        this.camera.position.set(0, 0, 0); 
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Свет (сохраняем как свойство класса)
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        this.pointLight = new THREE.PointLight(0xffffff, 2, 100);
        this.scene.add(this.pointLight); 

        // Геометрия
        const geometry = new THREE.IcosahedronGeometry(5, 0);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff5f00, 
            wireframe: true, 
            side: THREE.DoubleSide 
        });
        this.planet = new THREE.Mesh(geometry, material);
        this.planet.frustumCulled = false; 
        this.scene.add(this.planet);

        // Физика
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.friction = 0.92;
        this.moveSpeed = 0.01;

        // Состояние
        this.isMovingForward = false;
        this.isMovingBackward = false;
        this.verticalDirection = 0;

        // Блокировка контекстного меню
        window.addEventListener('contextmenu', (e) => e.preventDefault());

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

    checkCollisions() {
        const radius = 4.8;
        if (this.camera.position.length() > radius) {
            this.camera.position.setLength(radius);
            this.velocity.multiplyScalar(-0.5);
        }
    }

    updateCamera() {
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

        if (this.isMovingForward) this.velocity.add(direction.multiplyScalar(this.moveSpeed));
        if (this.isMovingBackward) this.velocity.sub(direction.multiplyScalar(this.moveSpeed));
        
        if (this.verticalDirection !== 0) this.velocity.y += this.verticalDirection * this.moveSpeed;

        this.velocity.multiplyScalar(this.friction);
        this.camera.position.add(this.velocity);

        this.checkCollisions();

        this.pointLight.position.copy(this.camera.position);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }
}

new PlanetEngine();
