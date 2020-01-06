let side= {
    'MeshBasicMaterial':'MeshBasicMaterial',
    'MeshLambertMaterial':'MeshLambertMaterial',
    'MeshMatcapMaterial':'MeshMatcapMaterial',
    'MeshPhongMaterial':'MeshPhongMaterial',
    'MeshToonMaterial':'MeshToonMaterial',
    'MeshStandardMaterial':'MeshStandardMaterial',
    'MeshPhysicalMaterial':'MeshPhysicalMaterial',
    'MeshDepthMaterial':'MeshDepthMaterial',
    'MeshNormalMaterial':'MeshNormalMaterial',
    'LineBasicMaterial':'LineBasicMaterial',

}
let a={}
a.side ="MeshBasicMaterial"
let load = true;
import {chooseFromHash,guiMaterial} from './material.js'

var material;

function loadGUI(gui,params,onWindowResize,addTube,animateCamera,updateSplineOutline,splines,mesh,geometry) {
    if (load) {
        
    
        //Spline GUI
        {
            gui.add( params, 'uniform' );
            gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
                
                splines.uniform.tension = value;
                updateSplineOutline();
                
            } );
            gui.add( params, 'centripetal' );
            gui.add( params, 'chordal' );
            gui.add( params, 'addPoint' );
            gui.add( params, 'removePoint' );
            gui.add( params, 'exportSpline' );
            gui.add( params, 'offset', -100, 100 ).step( 1 );
            gui.add( params, 'radius', 0, 100 ).step( 1 );
        }
    
        //Geometry GUI
        {
        var folderGeometry = gui.addFolder( 'Geometry' );
        folderGeometry.add( params, 'extrusionSegments', 50, 500 ).step( 50 ).onChange( function () {
            addTube();
        } );
        folderGeometry.add( params, 'radiusSegments', 2, 12 ).step( 1 ).onChange( function () {

            addTube();

        } );
        folderGeometry.add( params, 'closed' ).onChange( function () {

            addTube();

        } );
        folderGeometry.open();
        }

        //Camera GUI
        {
        var folderCamera = gui.addFolder( 'Camera' );
        folderCamera.add( params, 'animationView' ).onChange( function () {

            animateCamera();

        } );
        folderCamera.add( params, 'lookAhead' ).onChange( function () {

            animateCamera();

        } );
        folderCamera.add( params, 'cameraHelper' ).onChange( function () {

            animateCamera();

        } );
        folderCamera.add( params, 'cinematic' )
        folderCamera.open();
        }
        //Material GUI
        var folder = gui.addFolder( 'selectedMaterial' );
        {
            material = chooseFromHash(gui,mesh,geometry,'MeshBasicMaterial')

            load= false;
            // var folder = gui.addFolder( 'selectedMaterial' );
            let currentMaterial = 'MeshBasicMaterial';
            
            folder.add( a, 'side', side ).onChange((e)=>{
                material = chooseFromHash(gui,mesh,geometry,e)
                gui.removeFolder(currentMaterial)
                currentMaterial= e;
            });
    
    
            folder.open();
    
        }
    
    }
    window.addEventListener( 'resize', onWindowResize, false );
    return material;
}
export default loadGUI;