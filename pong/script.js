const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000});

const p1 = new THREE.Mesh(new THREE.BoxGeometry(2, 22, 2), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
const p2 = new THREE.Mesh(new THREE.BoxGeometry(2, 22, 2), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0000ff }));

scene.add(p1);
scene.add(p2);
scene.add(ball);

p1.translateX(-30);
p2.translateX(30);

camera.position.z = 30;

// ball.attach(camera);
// ball.translateY(10);


function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

animate();