function animate() {
    requestAnimationFrame(animate);
    const raycaster = new THREE.Raycaster();
    const downVector = new THREE.Vector3(0, -1, 0);

    raycaster.set(player.position, downVector);
    const intersects = raycaster.intersectObjects(collidableObjects);

    if (velocity.y <= 0 && intersects.length > 0 && intersects[0].distance < 2.1) {
        player.position.y = intersects[0].point.y + 2; 
        velocity.y = 0; 
    }

    // --- УПРАВЛЕНИЕ КЛАВИАТУРОЙ ---
    if (keys['ArrowLeft']) angularVelocityZ -= TURN_SPEED;
    if (keys['ArrowRight']) angularVelocityZ += TURN_SPEED;
    if (keys['ArrowUp']) angularVelocityX += TURN_SPEED;
    if (keys['ArrowDown']) angularVelocityX -= TURN_SPEED;

    // --- УПРАВЛЕНИЕ С ТАЧ-СКРИНА ---
    if (touchJoystick.active) {
        angularVelocityX += touchJoystick.moveY * TOUCH_TURN_SPEED;
        angularVelocityZ -= touchJoystick.moveX * TOUCH_TURN_SPEED;
    }

    // Применяем трение к угловым скоростям
    angularVelocityX *= DAMPING_TURN;
    angularVelocityZ *= DAMPING_TURN;

    // ЖЕСТКАЯ ФИКСАЦИЯ ЛОКАЛЬНЫХ ОСЕЙ:
    // Каждым кадром создаем дельту вращения на основе текущих скоростей.
    // Порядок 'YXZ' изолирует локальный крен от тангажа внутри кадра.
    const deltaQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(angularVelocityX, 0, angularVelocityZ, 'YXZ')
    );
    
    // Умножаем ТЕКУЩИЙ кватернион на дельту. 
    // Это заставляет объект вращаться относительно его собственного «актуального» верха и лева.
    player.quaternion.multiply(deltaQuaternion);

    let currentFlySpeed = FLY_SPEED;

    // Расчет силы тяги
    let thrustForce = 0;
    if (keys['Space']) {
        const spaceMultiplier = superThrust ? 2.5 : 1.0; 
        thrustForce = currentFlySpeed * spaceMultiplier; 
    } else if (currentThrottle > 0.05) {
        thrustForce = currentFlySpeed * (currentThrottle * 2.0); 
    }

    // Направление тяги строго следует за локальным вектором Y объекта
    const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(player.quaternion);

    if (thrustForce > 0) {
        velocity.add(localUp.clone().multiplyScalar(thrustForce));
    }

    // Гравитация
    velocity.y -= GRAVITY;

    player.position.add(velocity);
    velocity.multiplyScalar(DAMPING_MOVE);

    if (player.position.y < 2) {
        player.position.y = 2;
        velocity.y = Math.max(0, velocity.y * -0.3);
    }

    infiniteGrid.position.set(player.position.x, 0, player.position.z);
    renderer.render(scene, camera);
}
