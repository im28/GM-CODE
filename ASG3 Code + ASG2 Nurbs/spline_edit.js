import * as THREE from '../build/three.module.js';

import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/dat.gui.module.js';

import { DragControls } from './jsm/controls/DragControls.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { TransformControls } from './jsm/controls/TransformControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import  loadGUI  from "./loadGUI.js";

String.prototype.format = function () {

    var str = this;

    for ( var i = 0; i < arguments.length; i ++ ) {

        str = str.replace( '{' + i + '}', arguments[ i ] );

    }
    return str;

};
GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
}

var container, stats;
var camera, scene, renderer,splineCamera,cameraHelper,cameraEye,car;
var parent, tubeGeometry, mesh,gui;
var splineHelperObjects = [];
var splinePointsLength = 4;
var positions = [];
var point = new THREE.Vector3();

var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
var transformControl;

var ARC_SEGMENTS = 200;

var material = new THREE.MeshLambertMaterial( { color: 0xff00ff } );
var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.3, wireframe: true, transparent: true } );

var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();
var splines = {};

var params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    addPoint: addPoint,
    removePoint: removePoint,
    exportSpline: exportSpline,
    scale: 1,
    extrusionSegments: 500,
    radiusSegments: 12,
    closed: false,
    animationView: false,
    lookAhead: false,
    cameraHelper: false,
    offset:35,
    radius:20,
    cinematic:false
};

init();
animate();

function addTube() {

    if ( mesh !== undefined ) {

        parent.remove( mesh );
        mesh.geometry.dispose();

    }

    var extrudePath = splines.uniform;
    
    tubeGeometry = new THREE.TubeBufferGeometry( extrudePath, params.extrusionSegments, params.radius, params.radiusSegments, params.closed );

    addGeometry( tubeGeometry );

    setScale();

}
function setScale() {

    mesh.scale.set( params.scale, params.scale, params.scale );

}
function addGeometry( geometry ) {

    // 3D shape

    mesh = new THREE.Mesh( geometry, material );
    // var wireframe = new THREE.Mesh( geometry, wireframeMaterial );
    // mesh.add( wireframe );

    parent.add( mesh );

}
function init() {

    container = document.getElementById( 'container' );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 250, 1000 );
    scene.add( camera );

    

    scene.add( new THREE.AmbientLight( 0xffffff ) );
    var light = new THREE.SpotLight( 0xffffff, 10.5 );
    light.position.set( 0, 1500, 200 );
    light.castShadow = true;
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 70, 1, 200, 2000 ) );
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add( light );

    
    parent = new THREE.Object3D();
    scene.add( parent );

    splineCamera = new THREE.PerspectiveCamera( 84, window.innerWidth / window.innerHeight, 0.01, 1000 );
    parent.add( splineCamera );

    cameraHelper = new THREE.CameraHelper( splineCamera );
    scene.add( cameraHelper );

    cameraEye = new THREE.Mesh( new THREE.SphereBufferGeometry( 5 ), new THREE.MeshBasicMaterial( { color: 0xdddddd } ) );
    parent.add( cameraEye );

    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.cameraHelper;

    var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = - 200;
    plane.receiveShadow = true;
    scene.add( plane );

    var helper = new THREE.GridHelper( 2000, 100 );
    helper.position.y = - 199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

    lights[ 0 ].position.set( 0, 200, 0 );
    lights[ 1 ].position.set( 100, 200, 100 );
    lights[ 2 ].position.set( - 100, - 200, - 100 );

    scene.add( lights[ 0 ] );
    scene.add( lights[ 1 ] );
    scene.add( lights[ 2 ] );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    container.appendChild( stats.dom );
    //3D model
    {

        var loader = new GLTFLoader();
        
        loader.load( './chevrolet/scene.gltf', function ( gltf ) {
            
            //a.scene.scale = new THREE.Vector3(0.1,0.1,0.1);
            car = gltf.scene
            //car.scale.set(0.1,0.1,0.1);
            // car.rotation.z = ( Math.PI*3 / 2);
            scene.add( car );
            
        }, undefined, function ( error ) {
            console.error( error );
        } );
        
    }

    

    // Controls
    {

    
    
    var controls = new OrbitControls( camera, renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    controls.addEventListener( 'start', function () {

        cancelHideTransform();

    } );

    controls.addEventListener( 'end', function () {

        delayHideTransform();

    } );

    transformControl = new TransformControls( camera, renderer.domElement );
    transformControl.addEventListener( 'change', render );
    transformControl.addEventListener( 'dragging-changed', function ( event ) {

        controls.enabled = ! event.value;

    } );
    scene.add( transformControl );

    // Hiding transform situation is a little in a mess :()
    transformControl.addEventListener( 'change', function () {

        cancelHideTransform();

    } );

    transformControl.addEventListener( 'mouseDown', function () {

        cancelHideTransform();

    } );

    transformControl.addEventListener( 'mouseUp', function () {

        delayHideTransform();

    } );

    transformControl.addEventListener( 'objectChange', function () {

        updateSplineOutline();

    } );

    var dragcontrols = new DragControls( splineHelperObjects, camera, renderer.domElement ); //
    dragcontrols.enabled = false;
    dragcontrols.addEventListener( 'hoveron', function ( event ) {

        transformControl.attach( event.object );
        cancelHideTransform();

    } );

    dragcontrols.addEventListener( 'hoveroff', function () {

        delayHideTransform();

    } );

    var hiding;
    
    function delayHideTransform() {
        cancelHideTransform();
    }

    function hideTransform() {

        hiding = setTimeout( function () {

            transformControl.detach( transformControl.object );

        }, 2500 );

    }

    function cancelHideTransform() {

        if ( hiding ) clearTimeout( hiding );

    }
    }

    /*******
     * Curves
     *********/
    {

    
    for ( var i = 0; i < splinePointsLength; i ++ ) {

        addSplineObject( positions[ i ] );

    }

    positions = [];

    for ( var i = 0; i < splinePointsLength; i ++ ) {

        positions.push( splineHelperObjects[ i ].position );

    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );
    
    var curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'catmullrom';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0xff0000,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.uniform = curve;

    curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'centripetal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x00ff00,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.centripetal = curve;

    curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'chordal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x0000ff,
        opacity: 0.35
    } ) );
    curve.mesh.castShadow = true;
    splines.chordal = curve;

    for ( var k in splines ) {

        var spline = splines[ k ];
        scene.add( spline.mesh );

    }
    
    load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
        new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
        new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
        new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );
    }

    addTube();

    gui = new GUI();
    material = loadGUI(gui,params,onWindowResize,addTube,animateCamera,updateSplineOutline,splines,mesh,tubeGeometry)
    gui.open();
}
function animateCamera() {

    cameraHelper.visible = params.cameraHelper;
    cameraEye.visible = params.cameraHelper;

}

function addSplineObject( position ) {

    var material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
    var object = new THREE.Mesh( geometry, material );
    
    console.log(geometry);
    
    if ( position ) {

        object.position.copy( position );

    } else {

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600;
        object.position.z = Math.random() * 800 - 400;

    }

    object.castShadow = true;
    object.receiveShadow = true;
    scene.add( object );
    splineHelperObjects.push( object );
    //console.log(material);
    
    return object;

}

function addPoint() {

    splinePointsLength ++;

    positions.push( addSplineObject().position );

    updateSplineOutline();

}

function removePoint() {

    if ( splinePointsLength <= 4 ) {

        return;

    }
    splinePointsLength --;
    positions.pop();
    scene.remove( splineHelperObjects.pop() );

    updateSplineOutline();

}

function updateSplineOutline() {

    for ( var k in splines ) {

        var spline = splines[ k ];

        var splineMesh = spline.mesh;
        var position = splineMesh.geometry.attributes.position;

        for ( var i = 0; i < ARC_SEGMENTS; i ++ ) {

            var t = i / ( ARC_SEGMENTS - 1 );
            spline.getPoint( t, point );
            position.setXYZ( i, point.x, point.y, point.z );

        }

        position.needsUpdate = true;

    }

}

function exportSpline() {

    var strplace = [];

    for ( var i = 0; i < splinePointsLength; i ++ ) {

        var p = splineHelperObjects[ i ].position;
        strplace.push( 'new THREE.Vector3({0}, {1}, {2})'.format( p.x, p.y, p.z ) );

    }

    console.log( strplace.join( ',\n' ) );
    var code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
    prompt( 'copy and paste code', code );

}

function load( new_positions ) {

    while ( new_positions.length > positions.length ) {

        addPoint();

    }

    while ( new_positions.length < positions.length ) {

        removePoint();

    }

    for ( var i = 0; i < positions.length; i ++ ) {

        positions[ i ].copy( new_positions[ i ] );

    }

    updateSplineOutline();

}
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
function animate() {

    requestAnimationFrame( animate );
    addTube()
    material = loadGUI(gui,params,onWindowResize,addTube,animateCamera,updateSplineOutline,splines,mesh,tubeGeometry)
    render();
    stats.update();

}

function render() {

    var time = Date.now();
    var looptime = 20 * 1000;
    var t = ( time % looptime ) / looptime;

    var pos = tubeGeometry.parameters.path.getPointAt( t );
    pos.multiplyScalar( params.scale );

    var carPos = tubeGeometry.parameters.path.getPointAt( t );
    carPos.multiplyScalar( params.scale );
    // interpolation
    
    var segments = tubeGeometry.tangents.length;
    var pickt = t * segments;
    var pick = Math.floor( pickt );
    var pickNext = ( pick + 1 ) % segments;

    binormal.subVectors( tubeGeometry.normals[ pickNext ], tubeGeometry.normals[ pick ] );
    binormal.multiplyScalar( pickt - pick ).add( tubeGeometry.normals[ pick ] );

    var dir = tubeGeometry.parameters.path.getTangentAt( t );
    var offset = params.offset;

    normal.copy( binormal ).cross( dir );

    // we move on a offset on its binormal
    let a =normal;
    pos.add( normal.clone().multiplyScalar( offset ) );
    carPos.add( normal.clone() );


    //Cinimatic effect
    {
        // splineCamera.position.copy( pos ).multiplyScalar( 1.5 ) ;
        // cameraEye.position.copy( pos ).multiplyScalar( 1.5 ) ;
    }
    
    if (params.cinematic) {
        splineCamera.position.copy( pos ).multiplyScalar( 1.5 ) ;
        cameraEye.position.copy( pos ).multiplyScalar( 1.5 ) ;
    }
    else{
        splineCamera.position.copy( pos ) ;
        cameraEye.position.copy( pos ) ;
    }
    // using arclength for stablization in look ahead
    
    var lookAt = tubeGeometry.parameters.path.getPointAt( ( t + 30 / tubeGeometry.parameters.path.getLength() ) % 1 ).multiplyScalar( params.scale );
    var lookAtCar = tubeGeometry.parameters.path.getPointAt( ( t + 30/ tubeGeometry.parameters.path.getLength() ) % 1 ).multiplyScalar( params.scale );
    // camera orientation 2 - up orientation via normal
   
    if ( ! params.lookAhead ) {
        lookAt.copy( pos ).add( dir );
        lookAtCar.copy( carPos ).add( dir )
        
    }
    splineCamera.matrix.lookAt( splineCamera.position, lookAt, normal );
    splineCamera.quaternion.setFromRotationMatrix( splineCamera.matrix );
    splineCamera.translateZ(10);
    splineCamera.translateY(-5);
    splineCamera.translateX(-5);
    if (car) {
        let x = new THREE.Vector3();;
        x.subVectors( tubeGeometry.binormals[ pickNext ], tubeGeometry.binormals[ pick ] );
        x.multiplyScalar( pickt - pick ).add( tubeGeometry.binormals[ pick ] );
        car.position.copy(pos)
        car.matrix.lookAt( car.position, lookAt, normal );
        car.quaternion.setFromRotationMatrix( car.matrix );
        //car.rotation.x = ( THREE.Math.degToRad(270));
    }
    splines.uniform.mesh.visible = params.uniform;
    splines.centripetal.mesh.visible = params.centripetal;
    splines.chordal.mesh.visible = params.chordal;

    if (params.animationView === true) {
        transformControl.detach( transformControl.object );
        splineHelperObjects.forEach(element => {
            scene.remove( element );
        });
    }
    else{
        splineHelperObjects.forEach(element => {
            scene.add( element );
        });
    }
    
    cameraHelper.update();
    renderer.render( scene, params.animationView === true ? splineCamera : camera );
    

}