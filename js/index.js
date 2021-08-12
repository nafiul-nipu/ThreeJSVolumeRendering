let renderer = null;
let camera = null;
let scene = null;
let controls = null;
let materials = null;
let cmtextures = null;


function init(){

    const width = d3.select("#canvas_container").node().clientWidth - 50;
    // const topHeight = d3.select(".top").node().clientHeight
    const height = window.innerHeight - 50

    const can = document.querySelector("#scene");
    const context = can.getContext('webgl2')
    
    renderer = new THREE.WebGLRenderer({canvas: can, alpha:true, context:context});
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
    let positions = []
    d3.csv("/particles/0.007.csv", data => {

        positions.push((parseFloat(parseFloat(data['temp']))));

    }).then(function() {
        console.log(positions)
        let data = new Float32Array(positions)
        let volume = [128,64,64]

        const texture = new THREE.DataTexture3D( data, volume[0], volume[1], volume[2] );
        texture.format = THREE.RedFormat;
        texture.type = THREE.FloatType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;

        cmtextures = {
            viridis: new THREE.TextureLoader().load( './textures/cm_viridis.png', render ),
            gray: new THREE.TextureLoader().load( './textures/cm_gray.png', render )
        };

        console.log(cmtextures)

        let volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };

        // Material
        const shader = VolumeRenderShader1;

        const uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        uniforms[ "u_data" ].value = texture;
        uniforms[ "u_size" ].value.set( volume[0], volume[1], volume[2] );
        uniforms[ "u_clim" ].value.set( volconfig.clim1, volconfig.clim2 );
        uniforms[ "u_renderstyle" ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
        uniforms[ "u_renderthreshold" ].value = volconfig.isothreshold; // For ISO renderstyle
        uniforms[ "u_cmdata" ].value = cmtextures[ volconfig.colormap ];

        material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        } );

        // THREE.Mesh
        const geometry = new THREE.BoxGeometry( volume[0], volume[1], volume[2] );
        geometry.translate( volume[0] / 2 - 0.5, volume[1] / 2 - 0.5, volume[2] / 2 - 0.5 );

        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        render();
        console.log('done')

    });


}

function render(){
    renderer.render(scene, camera)
}

init()