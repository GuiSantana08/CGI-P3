import { lookAt, perspective, vec3 } from "../../libs/MV";

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as TORUS from '../../libs/objects/torus.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as BUNNY from '../../libs/objects/bunny.js';



function main(shaders){
    let camera = {
        eye: vec3(0,5,10),
        at: vec3(0,0,0),
        up: vec3(0,1,0,),
        fovy: 45,
        near: 0.1,
        far: 40
    };

    let lights = [
        {        
            ambient: [50, 50, 50],
            diffuse: [60,60,60],
            specular: [200,200,200],
            position: [00,0.0,10.0,1.0],
            axis: [0.0,0.0,-1.0],
            aperture: 10.0,
            cutoff:10
        },
        {
            ambient: [50, 0, 0],
            diffuse: [50, 0.0, 0.0],
            specular: [150, 0.0, 0.0],
            position: [-20, 5.0, 5.0, 0.0],
            axis: [20.0, -5.0, -5.0],
            aperture: 180.0,
            cutoff: -1,
        },
        {
        ambient: [75, 75, 100],
        diffuse: [75, 75, 100],
        specular: [150, 150, 175],
        position: [5.0, 5.0, 2.0, 1.0],
        axis: [-5.0, -5.0, -2.0],
        aperture: 180.0,
        cutoff: -1,
        }
    ];

    let groundMaterial = {
        Ka: [150,150,75],
        Kd: [125, 125, 125],
        Ks: [0,0,0],
        shininess: 1.0
    };

    let grayMaterial = {
        Ka: [150, 150, 150],
        Kd: [125, 125, 125],
        Ks: [200,200,200],
        shininess: 100.0
    }

    let redMaterial = {
        Ka: [150, 75, 75],
        Kd: [150, 75, 75],
        Ks: [200,200,200],
        shininess: 100.0
    }

    let greenMaterial = {
        Ka: [50, 150, 50],
        Kd: [50, 150, 50],
        Ks: [200,200,200],
        shininess: 100.0
    }

    let blueMaterial = {
        Ka: [0, 150, 100],
        Kd: [50, 125, 100],
        Ks: [200,200,200],
        shininess: 100.0
    };

    //Visualization options
    let options = {
        cullFace: true,
        depthTest: true
    };

    //Generate the canvas to fill the entire Window
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    /** @type WebGL2RenderingContext */
    let gl = setupWebGL(canvas);

    let programP = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);
    let programG = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]); //VER A DIFERENÇA

    const program = programP;

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0); //cor de fundo
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BACK);

    CUBE.init(gl);
    SPHERE.init(gl);
    TORUS.init(gl);
    CYLINDER.init(gl);
    BUNNY.init(gl);

    setupGUI();

    let mode = gl.TRIANGLES;

    let mView = lookAt( camera.eye, camera.at, camera.up);
    let mProjection = perspective(camera.fovy, __, camera.near, camera.far); //INCOMPLETO

    


    
    



}