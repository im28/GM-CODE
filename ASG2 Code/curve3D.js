// TubeGeometry in the shape of an ellipse
  
  //
  
  var mesh, renderer, scene, camera, controls;
  
  init();
  render();
  
  function init() {
  
    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  
    // scene
    scene = new THREE.Scene();
  
    // camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-20, 20, 20);
  
    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
    controls.minDistance = 10;
    controls.maxDistance = 50;
  
    // light
    var light = new THREE.PointLight(0xffffff, 0.7);
    camera.add(light);
    scene.add(camera); // add to scene only because the camera  has a child
  
    // axes
    scene.add(new THREE.AxisHelper(20));
  
    // path
    // var path = new Ellipse(5, 10);
    //   console.log(path);
    // params
    var pathSegments = 64;
    var tubeRadius = 0.5;
    var radiusSegments = 16;
    var closed = false;
  
    var curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-1, 0, 2),
      new THREE.Vector3(-5, 1, 3),
      new THREE.Vector3(2, 5, 4),
      new THREE.Vector3(1, 0, 0)
    );
    // var points = curve.getPoints(50);
    var geometry = new THREE.TubeBufferGeometry(curve, pathSegments, tubeRadius, radiusSegments, closed);
  
    // material
    var material = new THREE.MeshPhongMaterial({
      color: 0x0080ff,
    });
  
    // mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  
  }
  
  function render() {
  
    renderer.render(scene, camera);
  
  }
  