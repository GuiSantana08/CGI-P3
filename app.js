import { lookAt, perspective, vec3 } from "../../libs/MV.js";
import { GUI } from '../../libs/dat.gui.module.js';

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as TORUS from '../../libs/objects/torus.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as BUNNY from '../../libs/objects/bunny.js';

let options = {'backface culling':false, 'depth test':false}
let camera = {fovy:0, near:0, far:0}
let eye = {x:0, y:0, z:0}
let at = {x:0, y:0, z:0}
let up = {x:0, y:0, z:0}
let position1 = {x:0, y:0, z:0, w:0} 
let intensities1 = {ambient:vec3(0,0,0), diffuse:vec3(0,0,0), specular:vec3(0,0,0)}
let aixs1 = {x:0, y:0, z:0, aperture:0, cutoff:0}
let position2 = {x:0, y:0, z:0, w:0} 
let intensities2 = {ambient:vec3(0,0,0), diffuse:vec3(0,0,0), specular:vec3(0,0,0)}
let aixs2 = {x:0, y:0, z:0, aperture:0, cutoff:0}
let position3 = {x:0, y:0, z:0, w:0} 
let intensities3 = {ambient:vec3(0,0,0), diffuse:vec3(0,0,0), specular:vec3(0,0,0)}
let aixs3 = {x:0, y:0, z:0, aperture:0, cutoff:0}

let material = {Ka:vec3(0,0,0), Kd:vec3(0,0,0), Ks:vec3(0,0,0), shininess:0}

const gui = new GUI();
const optionsFolder = gui.addFolder('options');
const cameraFolder = gui.addFolder('camera');
const lightsFolder = gui.addFolder('lights');
const materialFolder = gui.addFolder('material');

//options
optionsFolder.add(options, 'backface culling',false,true);
optionsFolder.add(options, 'depth test',0,100);

//camera
cameraFolder.add(camera, 'fovy', 0, 360);
cameraFolder.add(camera, 'near' , 0, 360);
cameraFolder.add(camera, 'far' , 0, 360);
const eyeFolder = cameraFolder.addFolder('eye');
const atFolder= cameraFolder.addFolder('at');
const upFolder= cameraFolder.addFolder('up');
//eye
eyeFolder.add(eye,'x');
eyeFolder.add(eye,'y');
eyeFolder.add(eye,'z');
//at
atFolder.add(at,'x');
atFolder.add(at,'y');
atFolder.add(at,'z');
//up
upFolder.add(up,'x');
upFolder.add(up,'y');
upFolder.add(up,'z');


//lights
//Light1
const light1 = lightsFolder.addFolder('Light1');
const pos1 = light1.addFolder('position');
pos1.add(position1,'x');
pos1.add(position1,'y');
pos1.add(position1,'z');
pos1.add(position1,'w');
const intens1 = light1.addFolder('intensities');
intens1.addColor(intensities1,'ambient');
intens1.addColor(intensities1,'diffuse');
intens1.addColor(intensities1,'specular');
const ax1 = light1.addFolder('axis');
ax1.add(aixs1,'x');
ax1.add(aixs1,'y');
ax1.add(aixs1,'z');
ax1.add(aixs1,'aperture',0,100);
ax1.add(aixs1,'cutoff',0,100);

//Light2
const light2 = lightsFolder.addFolder('Light2');
const pos2 = light2.addFolder('position');
pos2.add(position2,'x');
pos2.add(position2,'y');
pos2.add(position2,'z');
pos2.add(position2,'w');
const intens2 = light2.addFolder('intensities');
intens2.addColor(intensities2,'ambient');
intens2.addColor(intensities2,'diffuse');
intens2.addColor(intensities2,'specular');
const ax2 = light2.addFolder('axis');
ax2.add(aixs2,'x');
ax2.add(aixs2,'y');
ax2.add(aixs2,'z');
ax2.add(aixs2,'aperture',0,100);
ax2.add(aixs2,'cutoff',0,100);

//Light3
const light3 = lightsFolder.addFolder('Light3');
const pos3 = light3.addFolder('position');
pos3.add(position3,'x');
pos3.add(position3,'y');
pos3.add(position3,'z');
pos3.add(position3,'w');
const intens3 = light3.addFolder('intensities');
intens3.addColor(intensities3,'ambient');
intens3.addColor(intensities3,'diffuse');
intens3.addColor(intensities3,'specular');
const ax3 = light3.addFolder('axis');
ax3.add(aixs3,'x');
ax3.add(aixs3,'y');
ax3.add(aixs3,'z');
ax3.add(aixs3,'aperture',0,100);
ax3.add(aixs3,'cutoff',0,100);

//material
materialFolder.addColor(material,'Ka');
materialFolder.addColor(material,'Kd');
materialFolder.addColor(material,'Ks');
materialFolder.add(material,'shininess');



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
            position: [0.0,0.0,10.0,1.0],
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