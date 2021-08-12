let renderer = null;
let camera = null;
let scene = null;
let controls = null;


function init(){

    const width = d3.select("#canvas_container").node().clientWidth - 50;
    // const topHeight = d3.select(".top").node().clientHeight
    const height = window.innerHeight - 50

    const can = document.querySelector("#scene");
    
    renderer = new THREE.WebGLRenderer({canvas: can, alpha:true});
    renderer.setClearColor('hsl(0, 0%, 0%)', 0)
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)

    //camera
    const fieldOfView = 4;
    const aspect = width / height;
    const near = 1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fieldOfView, aspect, near, far);
    camera.position.x = 20;
    camera.position.y = 10
    camera.position.z = 30;

    camera.lookAt (new THREE.Vector3(-2,0,0));

    //scene
    scene = new THREE.Scene();
    // console.log(self.scene.position)
    // self.scene.position.x = 2;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render)
    // controls.update()

    // directional light
    // Lights
    let ambient = new THREE.AmbientLight('hsl(0, 0%, 100%)', 0.25);
    let keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 0.6);
    let fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 60%, 85%)'), 0.6);
    let backLight = new THREE.DirectionalLight('hsl(0, 0%, 100%)', 0.4);

    keyLight.position.set(-1, 0, 1);
    fillLight.position.set(1, 0, 1);
    backLight.position.set(1, 0, -1).normalize();

    scene.add(ambient)
    scene.add(keyLight)
    scene.add(fillLight)
    scene.add(backLight)


    // add the nozzle
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.load('nozzle.mtl', mtls => {
        mtls.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(mtls);
        objLoader.setPath('models/');
        objLoader.load('nozzle.obj', obj => {
            obj.scale.set(20, 20, 20);
            obj.position.set(-0.001, -0.0905, 0);
            scene.add(obj);
            render();
        });
    });


    // the hard part... volume rendering



}

function render(){
    renderer.render(scene, camera)
}

init()