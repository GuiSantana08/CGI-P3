import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import {flatten, lookAt, perspective, vec3, normalMatrix } from "../../libs/MV.js";

import * as dat from '../../libs/dat.gui.module.js';

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as TORUS from '../../libs/objects/torus.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as BUNNY from '../../libs/objects/bunny.js';

import * as STACK from '../../libs/stack.js';

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
            type: 'directional'
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
            type: 'pontual'
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
            type: 'spotlight'
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
    let programG = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]); //VER A DIFERENÇA

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
    const light1 = lightsFolder.addFolder('Light1');
    light1.add(lights[0],'active');
    light1.add(lights[0], 'type', ['directional','pontual','spotlight']);
    const pos1 = light1.addFolder('position');
    pos1.add(lights[0].position,0).name('x');
    pos1.add(lights[0].position,1).name('y');
    pos1.add(lights[0].position,2).name('z');
    pos1.add(lights[0].position,3).name('w');
    const intens1 = light1.addFolder('intensities');
    intens1.addColor(lights[0], "ambient");
    intens1.addColor(lights[0], "diffuse");
    intens1.addColor(lights[0], "specular");
    const ax1 = light1.addFolder('axis');
    ax1.add(lights[0].axis,0).name('x');
    ax1.add(lights[0].axis,1).name('y');
    ax1.add(lights[0].axis,2).name('z');
    const spotlightOps1 = light1.addFolder('spotlightOps')
    spotlightOps1.add(lights[0], 'aperture',0,100);
    spotlightOps1.add(lights[0],'cutoff',0,100);

    //Light2
    const light2 = lightsFolder.addFolder('Light2');
    light2.add(lights[1],'active');
    light2.add(lights[1], 'type', ['directional','pontual','spotlight']);
    const pos2 = light2.addFolder('position');
    pos2.add(lights[1].position,0).name('x');
    pos2.add(lights[1].position,1).name('y');
    pos2.add(lights[1].position,2).name('z');
    pos2.add(lights[1].position,3).name('w');
    const intens2 = light2.addFolder('intensities');
    intens2.addColor(lights[1], "ambient");
    intens2.addColor(lights[1], "diffuse");
    intens2.addColor(lights[1], "specular");
    const ax2 = light2.addFolder('axis');
    ax2.add(lights[1].axis,0).name('x');
    ax2.add(lights[1].axis,1).name('y');
    ax2.add(lights[1].axis,2).name('z');
    const spotlightOps2 = light2.addFolder('spotlightOps')
    spotlightOps2.add(lights[1], 'aperture',0,100);
    spotlightOps2.add(lights[1],'cutoff',0,100);

    //Light3
    const light3 = lightsFolder.addFolder('Light3');
    light3.add(lights[2],'active');
    light3.add(lights[2], 'type', ['directional','pontual','spotlight']);
    const pos3 = light3.addFolder('position');
    pos3.add(lights[2].position,0).name('x');
    pos3.add(lights[2].position,1).name('y');
    pos3.add(lights[2].position,2).name('z');
    pos3.add(lights[2].position,3).name('w');
    const intens3 = light3.addFolder('intensities');
    intens3.addColor(lights[2], "ambient");
    intens3.addColor(lights[2], "diffuse");
    intens3.addColor(lights[2], "specular");
    const ax3 = light3.addFolder('axis');
    ax3.add(lights[2].axis,0).name('x');
    ax3.add(lights[2].axis,1).name('y');
    ax3.add(lights[2].axis,2).name('z');
    const spotlightOps3 = light3.addFolder('spotlightOps')
    spotlightOps3.add(lights[2], 'aperture',0,100);
    spotlightOps3.add(lights[2],'cutoff',0,100);

    //material
    materialFolder.addColor(bunnyMaterial, 'Ka');
    materialFolder.addColor(bunnyMaterial,'Kd');
    materialFolder.addColor(bunnyMaterial,'Ks');
    materialFolder.add(bunnyMaterial,'shininess');



    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0); //cor de fundo
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    //gl.enable(gl.BACK);

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

        camera.aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
    }

    let mode = gl.TRIANGLES;

    let mView = lookAt( camera.eye, camera.at, camera.up);
    let mProjection = perspective(camera.fovy, aspect, camera.near, camera.far);
    
    
    let lastX, lastY;
    let down = false;

    function hideSpotLightOps(){
        if(lights[0].type == 'spotlight'){
            spotlightOps1.hide()
        }
        else{
            spotlightOps1.show()
        }
        if(lights[1].type == 'spotlight'){
            spotlightOps2.hide()
        }
        else{
            spotlightOps2.show()
        }
        if(lights[2].type == 'spotlight'){
            spotlightOps3.hide()
        }
        else{
            spotlightOps3.show()
        }
    }

    function render()
    {
        window.requestAnimationFrame(render);

        hideSpotLightOps();


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
            STACK.multTranslation([-2.5,0.5,-2.5]);
            STACK.multScale([2,2,2])
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            CUBE.draw(gl,program,gl.TRIANGLES);
        STACK.popMatrix();
        
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),cylinderMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),cylinderMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),cylinderMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),cylinderMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([2.5,0.5,-2.5]);
            STACK.multScale([2,2,2])
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            CYLINDER.draw(gl,program,gl.TRIANGLES);
        STACK.popMatrix();
        
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),torusMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),torusMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),torusMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),torusMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([-2.5,0.5,2.5]);
            STACK.multScale([2,2,2])
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            TORUS.draw(gl,program,gl.TRIANGLES);
        STACK.popMatrix();
        

        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),bunnyMaterial.Ka);
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),bunnyMaterial.Kd);
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),bunnyMaterial.Ks);
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),bunnyMaterial.shininess);
        STACK.pushMatrix();
            STACK.multTranslation([2.5,0.5,2.5]);
            STACK.multScale([12,12,12]);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
            BUNNY.draw(gl,program,gl.TRIANGLES);
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
            if(lights[i].type == 'directional'){
                gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isDirectional"), true);
                gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isSpotLight"), false);
            }
            else if(lights[i].type == 'pontual'){
                gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isDirectional"), false);
                gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isSpotLight"), false);
            }
            else {
                gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isDirectional"), false);
                gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isSpotLight"), true);
            }
    
        }


        
    }
    
}


const urls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(urls).then( shaders => main(shaders));