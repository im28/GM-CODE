import {
    AdditiveBlending, CustomBlending, MultiplyBlending, NormalBlending, NoBlending, SubtractiveBlending,
    AddEquation, ReverseSubtractEquation, SubtractEquation,
    AddOperation, MixOperation, MultiplyOperation,
    AmbientLight,
    Color,
    CubeTextureLoader,
    CubeRefractionMapping,
    DoubleSide, FrontSide, BackSide,
    DstAlphaFactor, DstColorFactor, OneFactor, OneMinusDstAlphaFactor, OneMinusDstColorFactor, OneMinusSrcAlphaFactor, OneMinusSrcColorFactor, SrcAlphaFactor, SrcAlphaSaturateFactor, SrcColorFactor, ZeroFactor,
    Float32BufferAttribute,
    Fog,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    MeshDepthMaterial,
    MeshLambertMaterial,
    MeshMatcapMaterial,
    MeshNormalMaterial,
    MeshPhongMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MeshToonMaterial,
    NearestFilter,
    PerspectiveCamera,
    PointLight,
    RepeatWrapping,
    RGBFormat,
    Scene,
    TextureLoader,
    TorusKnotBufferGeometry,
    VertexColors, NoColors,
    WebGLRenderer
} from "./build/three.module.js";

import { GUI } from './examples/jsm/libs/dat.gui.module.js';

/**
 * @author TatumCreative (Greg Tatum) / http://gregtatum.com/
 */

var constants = {

    combine: {

        'THREE.MultiplyOperation': MultiplyOperation,
        'THREE.MixOperation': MixOperation,
        'THREE.AddOperation': AddOperation

    },

    side: {

        'THREE.FrontSide': FrontSide,
        'THREE.BackSide': BackSide,
        'THREE.DoubleSide': DoubleSide

    },

    colors: {

        'THREE.NoColors': NoColors,
        'THREE.VertexColors': VertexColors

    },

    blendingMode: {

        'THREE.NoBlending': NoBlending,
        'THREE.NormalBlending': NormalBlending,
        'THREE.AdditiveBlending': AdditiveBlending,
        'THREE.SubtractiveBlending': SubtractiveBlending,
        'THREE.MultiplyBlending': MultiplyBlending,
        'THREE.CustomBlending': CustomBlending

    },

    equations: {

        'THREE.AddEquation': AddEquation,
        'THREE.SubtractEquation': SubtractEquation,
        'THREE.ReverseSubtractEquation': ReverseSubtractEquation

    },

    destinationFactors: {

        'THREE.ZeroFactor': ZeroFactor,
        'THREE.OneFactor': OneFactor,
        'THREE.SrcColorFactor': SrcColorFactor,
        'THREE.OneMinusSrcColorFactor': OneMinusSrcColorFactor,
        'THREE.SrcAlphaFactor': SrcAlphaFactor,
        'THREE.OneMinusSrcAlphaFactor': OneMinusSrcAlphaFactor,
        'THREE.DstAlphaFactor': DstAlphaFactor,
        'THREE.OneMinusDstAlphaFactor': OneMinusDstAlphaFactor

    },

    sourceFactors: {

        'THREE.DstColorFactor': DstColorFactor,
        'THREE.OneMinusDstColorFactor': OneMinusDstColorFactor,
        'THREE.SrcAlphaSaturateFactor': SrcAlphaSaturateFactor

    }

};

function getObjectsKeys( obj ) {

    var keys = [];

    for ( var key in obj ) {

        if ( obj.hasOwnProperty( key ) ) {

            keys.push( key );

        }

    }

    return keys;

}

var textureLoader = new TextureLoader();
var cubeTextureLoader = new CubeTextureLoader();

var envMaps = ( function () {

    var path = './examples/textures/cube/SwedishRoyalCastle/';
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    var reflectionCube = cubeTextureLoader.load( urls );
    reflectionCube.format = RGBFormat;

    var refractionCube = cubeTextureLoader.load( urls );
    refractionCube.mapping = CubeRefractionMapping;
    refractionCube.format = RGBFormat;

    return {
        none: null,
        reflection: reflectionCube,
        refraction: refractionCube
    };

} )();

var diffuseMaps = ( function () {

    var bricks = textureLoader.load( './examples/textures/brick_diffuse.jpg' );
    bricks.wrapS = RepeatWrapping;
    bricks.wrapT = RepeatWrapping;
    bricks.repeat.set( 9, 1 );

    return {
        none: null,
        bricks: bricks
    };

} )();

var roughnessMaps = ( function () {

    var bricks = textureLoader.load( './examples/textures/brick_roughness.jpg' );
    bricks.wrapT = RepeatWrapping;
    bricks.wrapS = RepeatWrapping;
    bricks.repeat.set( 9, 1 );

    return {
        none: null,
        bricks: bricks
    };

} )();

var matcaps = ( function () {

    return {
        none: null,
        porcelainWhite: textureLoader.load( './examples/textures/matcaps/matcap-porcelain-white.jpg' )
    };

} )();

var alphaMaps = ( function () {

    var fibers = textureLoader.load( './examples/textures/alphaMap.jpg' );
    fibers.wrapT = RepeatWrapping;
    fibers.wrapS = RepeatWrapping;
    fibers.repeat.set( 9, 1 );

    return {
        none: null,
        fibers: fibers
    };

} )();

var gradientMaps = ( function () {

    var threeTone = textureLoader.load( './examples/textures/gradientMaps/threeTone.jpg' );
    threeTone.minFilter = NearestFilter;
    threeTone.magFilter = NearestFilter;

    var fiveTone = textureLoader.load( './examples/textures/gradientMaps/fiveTone.jpg' );
    fiveTone.minFilter = NearestFilter;
    fiveTone.magFilter = NearestFilter;

    return {
        none: null,
        threeTone: threeTone,
        fiveTone: fiveTone
    };

} )();

var envMapKeys = getObjectsKeys( envMaps );
var diffuseMapKeys = getObjectsKeys( diffuseMaps );
var roughnessMapKeys = getObjectsKeys( roughnessMaps );
var matcapKeys = getObjectsKeys( matcaps );
var alphaMapKeys = getObjectsKeys( alphaMaps );
var gradientMapKeys = getObjectsKeys( gradientMaps );

function generateVertexColors( geometry ) {

    var positionAttribute = geometry.attributes.position;

    var colors = [];
    var color = new Color();

    for ( var i = 0, il = positionAttribute.count; i < il; i ++ ) {

        color.setHSL( i / il * Math.random(), 0.5, 0.5 );
        colors.push( color.r, color.g, color.b );

    }

    geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

}

function handleColorChange( color ) {

    return function ( value ) {

        if ( typeof value === 'string' ) {

            value = value.replace( '#', '0x' );

        }

        color.setHex( value );

    };

}

function needsUpdate( material, geometry ) {

    return function () {
        material.vertexColors = parseInt( material.vertexColors ); //Ensure number
        material.side = parseInt( material.side ); //Ensure number
        material.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

    };

}

function updateTexture( material, materialKey, textures ) {

    return function ( key ) {

        material[ materialKey ] = textures[ key ];
        material.needsUpdate = true;

    };

}


function guiMaterial( gui, mesh, material, geometry ) {

    var folder = gui.addFolder( 'THREE.Material' );

    folder.add( material, 'transparent' );
    folder.add( material, 'opacity', 0, 1 ).step( 0.01 );
    // folder.add( material, 'blending', constants.blendingMode );
    // folder.add( material, 'blendSrc', constants.destinationFactors );
    // folder.add( material, 'blendDst', constants.destinationFactors );
    // folder.add( material, 'blendEquation', constants.equations );
    folder.add( material, 'depthTest' );
    folder.add( material, 'depthWrite' );
    // folder.add( material, 'polygonOffset' );
    // folder.add( material, 'polygonOffsetFactor' );
    // folder.add( material, 'polygonOffsetUnits' );
    folder.add( material, 'alphaTest', 0, 1 ).step( 0.01 ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'visible' );
    folder.add( material, 'side', constants.side ).onChange( needsUpdate( material, geometry ) );

}

function guiMeshBasicMaterial( gui, mesh, material, geometry ) {

    var data = {
        color: material.color.getHex(),
        envMaps: envMapKeys[ 0 ],
        map: diffuseMapKeys[ 0 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshBasicMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'fog' );

    folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
    folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );
    folder.add( material, 'combine', constants.combine );
    folder.add( material, 'reflectivity', 0, 1 );
    folder.add( material, 'refractionRatio', 0, 1 );

}

function guiMeshDepthMaterial( gui, mesh, material ) {

    var data = {
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshDepthMaterial' );

    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );

    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

}

function guiMeshNormalMaterial( gui, mesh, material, geometry ) {

    var folder = gui.addFolder( 'MeshNormalMaterial' );

    folder.add( material, 'flatShading' ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );

}

function guiLineBasicMaterial( gui, mesh, material, geometry ) {

    var data = {
        color: material.color.getHex()
    };

    var folder = gui.addFolder( 'LineBasicMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.add( material, 'linewidth', 0, 10 );
    folder.add( material, 'linecap', [ 'butt', 'round', 'square' ] );
    folder.add( material, 'linejoin', [ 'round', 'bevel', 'miter' ] );
    folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'fog' );

}

function guiMeshLambertMaterial( gui, mesh, material, geometry ) {

    var data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[ 0 ],
        map: diffuseMapKeys[ 0 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshLambertMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );

    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'fog' );

    folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
    folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );
    folder.add( material, 'combine', constants.combine );
    folder.add( material, 'reflectivity', 0, 1 );
    folder.add( material, 'refractionRatio', 0, 1 );

}

function guiMeshMatcapMaterial( gui, mesh, material ) {

    var data = {
        color: material.color.getHex(),
        matcap: matcapKeys[ 1 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshMatcapMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.add( data, 'matcap', matcapKeys ).onChange( updateTexture( material, 'matcap', matcaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

}

function guiMeshPhongMaterial( gui, mesh, material, geometry ) {

    var data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        specular: material.specular.getHex(),
        envMaps: envMapKeys[ 0 ],
        map: diffuseMapKeys[ 0 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshPhongMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );
    folder.addColor( data, 'specular' ).onChange( handleColorChange( material.specular ) );

    folder.add( material, 'shininess', 0, 100 );
    folder.add( material, 'flatShading' ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'fog' );
    folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
    folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

}

function guiMeshToonMaterial( gui, mesh, material ) {

    var data = {
        color: material.color.getHex(),
        map: diffuseMapKeys[ 0 ],
        gradientMap: gradientMapKeys[ 1 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshToonMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );

    folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
    folder.add( data, 'gradientMap', gradientMapKeys ).onChange( updateTexture( material, 'gradientMap', gradientMaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

}

function guiMeshStandardMaterial( gui, mesh, material, geometry ) {

    var data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[ 0 ],
        map: diffuseMapKeys[ 0 ],
        roughnessMap: roughnessMapKeys[ 0 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshStandardMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );

    folder.add( material, 'roughness', 0, 1 );
    folder.add( material, 'metalness', 0, 1 );
    folder.add( material, 'flatShading' ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'fog' );
    folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
    folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
    folder.add( data, 'roughnessMap', roughnessMapKeys ).onChange( updateTexture( material, 'roughnessMap', roughnessMaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

    // TODO metalnessMap

}

function guiMeshPhysicalMaterial( gui, mesh, material, geometry ) {

    var data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[ 0 ],
        map: diffuseMapKeys[ 0 ],
        roughnessMap: roughnessMapKeys[ 0 ],
        alphaMap: alphaMapKeys[ 0 ]
    };

    var folder = gui.addFolder( 'MeshPhysicalMaterial' );

    folder.addColor( data, 'color' ).onChange( handleColorChange( material.color ) );
    folder.addColor( data, 'emissive' ).onChange( handleColorChange( material.emissive ) );

    folder.add( material, 'roughness', 0, 1 );
    folder.add( material, 'metalness', 0, 1 );
    folder.add( material, 'reflectivity', 0, 1 );
    folder.add( material, 'clearcoat', 0, 1 ).step( 0.01 );
    folder.add( material, 'clearcoatRoughness', 0, 1 ).step( 0.01 );
    folder.add( material, 'flatShading' ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'wireframe' );
    folder.add( material, 'wireframeLinewidth', 0, 10 );
    folder.add( material, 'vertexColors', constants.colors ).onChange( needsUpdate( material, geometry ) );
    folder.add( material, 'fog' );
    folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) );
    folder.add( data, 'map', diffuseMapKeys ).onChange( updateTexture( material, 'map', diffuseMaps ) );
    folder.add( data, 'roughnessMap', roughnessMapKeys ).onChange( updateTexture( material, 'roughnessMap', roughnessMaps ) );
    folder.add( data, 'alphaMap', alphaMapKeys ).onChange( updateTexture( material, 'alphaMap', alphaMaps ) );

    // TODO metalnessMap

}

function chooseFromHash( gui, mesh, geometry,selectedMaterial ) {

    // var selectedMaterial = window.location.hash.substring( 1 ) || 'MeshBasicMaterial';
    var material;
    gui.removeFolder('THREE.Material')
    generateVertexColors(geometry)
    switch ( selectedMaterial ) {

        case 'MeshBasicMaterial' :

            material = new MeshBasicMaterial( { color: 0x2194CE } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshBasicMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshLambertMaterial' :

            material = new MeshLambertMaterial( { color: 0x2194CE } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshLambertMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshMatcapMaterial' :

            material = new MeshMatcapMaterial( { matcap: matcaps.porcelainWhite } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshMatcapMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshPhongMaterial' :

            material = new MeshPhongMaterial( { color: 0x2194CE } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshPhongMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshToonMaterial' :

            material = new MeshToonMaterial( { color: 0x2194CE, gradientMap: gradientMaps.threeTone } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshToonMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshStandardMaterial' :

            material = new MeshStandardMaterial( { color: 0x2194CE } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshStandardMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshPhysicalMaterial' :

            material = new MeshPhysicalMaterial( { color: 0x2194CE } );
            guiMaterial( gui, mesh, material, geometry );
            guiMeshPhysicalMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshDepthMaterial' :

            material = new MeshDepthMaterial();
            guiMaterial( gui, mesh, material, geometry );
            guiMeshDepthMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'MeshNormalMaterial' :

            material = new MeshNormalMaterial();
            guiMaterial( gui, mesh, material, geometry );
            guiMeshNormalMaterial( gui, mesh, material, geometry );

            return material;

            break;

        case 'LineBasicMaterial' :

            material = new LineBasicMaterial( { color: 0x2194CE } );
            guiMaterial( gui, mesh, material, geometry );
            guiLineBasicMaterial( gui, mesh, material, geometry );

            return material;

            break;

    }

}

export {chooseFromHash,guiMaterial};
