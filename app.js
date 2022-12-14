import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import {flatten, lookAt, perspective, vec3, normalMatrix } from "../../libs/MV.js";

import * as dat from '../../libs/dat.gui.module.js';

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as TORUS from '../../libs/objects/torus.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as BUNNY from '../../libs/objects/bunny.js';

import * as STACK from '../../libs/stack.js';

const TYPE_PONTUAL = 0;
const TYPE_DIRECTIONAL = 1;
const TYPE_SPOTLIGHT = 2;

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
            position: [0,0.0,10.0,1.0],
            axis: [0.0,0.0,-1.0],
            aperture: 10.0,
            cutoff:10,
            active: true,
            spotlight: false
        },
        {
            ambient: [50, 0, 0],
            diffuse: [50, 0.0, 0.0],
            specular: [150, 0.0, 0.0],
            position: [-20, 5.0, 5.0, 0.0],
            axis: [20.0, -5.0, -5.0],
            aperture: 180.0,
            cutoff: -1,
            active: true,
            spotlight: false
        },
        {
            ambient: [75, 75, 100],
            diffuse: [75, 75, 100],
            specular: [150, 150, 175],
            position: [5.0, 5.0, 2.0, 1.0],
            axis: [-5.0, -5.0, -2.0],
            aperture: 180.0,
            cutoff: -1,
            active: true,
            spotlight: true
        }
    ];

    let groundMaterial = {
        Ka: [150,150,75],
        Kd: [125, 125, 125],
        Ks: [0,0,0],
        shininess: 1.0
    };

    let bunnyMaterial = {
        Ka: [150, 150, 150],
        Kd: [125, 125, 125],
        Ks: [200,200,200],
        shininess: 100.0
    }

    let cubeMaterial = {
        Ka: [150, 75, 75],
        Kd: [150, 75, 75],
        Ks: [200,200,200],
        shininess: 100.0
    }

    let torusMaterial = {
        Ka: [50, 150, 50],
        Kd: [50, 150, 50],
        Ks: [200,200,200],
        shininess: 100.0
    }

    let cylinderMaterial = {
        Ka: [0, 150, 100],
        Kd: [50, 125, 100],
        Ks: [200,200,200],
        shininess: 100.0
    };

    //Visualization options
    let options = {
        'backface culling': true,
        'depth test': true
    };

    //Generate the canvas to fill the entire Window
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    /** @type WebGL2RenderingContext */
    let gl = setupWebGL(canvas);

    let programP = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    const program = programP;

    const gui = new dat.GUI();
    const optionsFolder = gui.addFolder('options');
    const cameraFolder = gui.addFolder('camera');
    const lightsFolder = gui.addFolder('lights');
    const materialFolder = gui.addFolder('material');

    //options
    optionsFolder.add(options, 'backface culling',false,true);
    optionsFolder.add(options, 'depth test',0,100);


    //camera
    cameraFolder.add(camera, 'fovy', 0, 100);
    cameraFolder.add(camera, 'near' , 0.1, 20);
    cameraFolder.add(camera, 'far' , 0.1, 20);
    const eyeFolder = cameraFolder.addFolder('eye');
    const atFolder= cameraFolder.addFolder('at');
    const upFolder= cameraFolder.addFolder('up');
    eyeFolder.add(camera.eye, 0).name('x');
    eyeFolder.add(camera.eye, 1).name('y');
    eyeFolder.add(camera.eye, 2).name('z');
    //at
    atFolder.add(camera.at, 0).name('x');
    atFolder.add(camera.at, 1).name('y');
    atFolder.add(camera.at, 2).name('z');
    //up
    upFolder.add(camera.up, 0).name('x');
    upFolder.add(camera.up, 1).name('y');
    upFolder.add(camera.up, 2).name('z');

    //lights
    //Light1
    for(let i =0; i<lights.length; i++){
        const light = lightsFolder.addFolder('Light' + (i+1));
        light.add(lights[i],'active');
        light.add(lights[i], 'spotlight');
        const pos = light.addFolder('position');
        pos.add(lights[i].position,0).name('x');
        pos.add(lights[i].position,1).name('y');
        pos.add(lights[i].position,2).name('z');
        pos.add(lights[i].position,3).name('w');
        const intens = light.addFolder('intensities');
        intens.addColor(lights[i], "ambient");
        intens.addColor(lights[i], "diffuse");
        intens.addColor(lights[i], "specular");
        const ax = light.addFolder('axis');
        ax.add(lights[i].axis,0).name('x');
        ax.add(lights[i].axis,1).name('y');
        ax.add(lights[i].axis,2).name('z');
        const spotLightOps = light.addFolder('spotlightOps')
        spotLightOps.add(lights[i], 'aperture',0,100);
        spotLightOps.add(lights[i],'cutoff',0,100);
    }
    

    //material
    materialFolder.addColor(bunnyMaterial, 'Ka');
    materialFolder.addColor(bunnyMaterial,'Kd');
    materialFolder.addColor(bunnyMaterial,'Ks');
    materialFolder.add(bunnyMaterial,'shininess');



    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0); //cor de fundo
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    resizeCanvasToFullWindow();
    window.addEventListener('resize', resizeCanvasToFullWindow);

    CUBE.init(gl);
    SPHERE.init(gl);
    TORUS.init(gl);
    CYLINDER.init(gl);
    BUNNY.init(gl);
    

    window.requestAnimationFrame(render);

    function resizeCanvasToFullWindow()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
    }

    let mode = gl.TRIANGLES;

    let mView = lookAt( camera.eye, camera.at, camera.up);
    let mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);
    
    
    let lastX, lastY;
    let down = false;


    function render()
    {
        window.requestAnimationFrame(render);


        mView = lookAt( camera.eye, camera.at, camera.up);
        mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        STACK.loadMatrix(mView);
    
        if(options["backface culling"]){
            gl.enable(gl.CULL_FACE);
        }
        else gl.disable(gl.CULL_FACE);

        if(options["depth test"]){
            gl.enable(gl.DEPTH_TEST);
        }else gl.disable(gl.DEPTH_TEST);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));
        gl.uniform1i(gl.getUniformLocation(program,"uNLights"),lights.length);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewF"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormalsF"), false, flatten(normalMatrix(mView)));

        
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),groundMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),groundMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),groundMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),groundMaterial.shininess);

        STACK.pushMatrix();
            STACK.multTranslation([0,-0.25,0])
            STACK.multScale([10,0.5,10]);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            CUBE.draw(gl, program, mode);
        STACK.popMatrix();

        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),cubeMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),cubeMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),cubeMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),cubeMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([-2.5, 1,-2.5]);
            STACK.multScale([2,2,2])
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            CUBE.draw(gl,program,mode);
        STACK.popMatrix();
        
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),cylinderMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),cylinderMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),cylinderMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),cylinderMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([2.5,1,-2.5]);
            STACK.multScale([2,2,2])
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            CYLINDER.draw(gl,program,mode);
        STACK.popMatrix();
        
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),torusMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),torusMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),torusMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),torusMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([-2.5,0.4,2.5]);
            STACK.multScale([2,2,2])
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            TORUS.draw(gl,program, mode);
        STACK.popMatrix();
        

        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),bunnyMaterial.Ka);
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),bunnyMaterial.Kd);
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),bunnyMaterial.Ks);
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),bunnyMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([2.5,0,2.5]);
            STACK.multScale([12,12,12]);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            BUNNY.draw(gl,program,mode);
            STACK.popMatrix();
        STACK.popMatrix()


        for(let i = 0; i < lights.length; i++){
            let ambient = vec3(lights[i].ambient[0], lights[i].ambient[1],lights[i].ambient[2]);
            let diffuse = vec3(lights[i].diffuse[0], lights[i].diffuse[1],lights[i].diffuse[2]);
            let specular = vec3(lights[i].specular[0], lights[i].specular[1],lights[i].specular[2]);
        
                
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Ia"),ambient);
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Id"),diffuse);
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Is"),specular);
            gl.uniform4fv(gl.getUniformLocation(program, "uLight[" + i +"].pos"),lights[i].position);
            gl.uniform4fv(gl.getUniformLocation(program, "uLight[" + i +"].axis"),lights[i].axis);
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].aperture"), lights[i].aperture);
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].cutoff"), lights[i].cutoff);
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isActive"), lights[i].active);
            gl.uniform1f(gl.getUniformLocation(program, "uLight[" + i +"].spotlight"),lights[i].spotlight)

        }


        
    }
    
}


const urls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(urls).then( shaders => main(shaders));