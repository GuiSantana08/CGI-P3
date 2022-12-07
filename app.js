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

    const gui = new dat.GUI();



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
    

    //setupGUI();

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

    function render()
    {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        STACK.loadMatrix(mView);
    

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));
        gl.uniform1i(gl.getUniformLocation(program,"uNLights"),lights.length);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewF"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormalsF"), false, flatten(normalMatrix(mView)));

        
        gl.uniform3fv(gl.getUniformLocation(program,"T.Ka"),groundMaterial.Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),groundMaterial.Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),groundMaterial.Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),groundMaterial.shininess);

        STACK.pushMatrix();
        STACK.multTranslation([0,-0.25,0])
        STACK.multScale([10,0.5,10]);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
        CUBE.draw(gl, program, mode);
        STACK.popMatrix();
        for(let i = 0; i < lights.length; i++){
            let ambient = vec3(lights[i].ambient[0] / 255 , lights[i].ambient[1] / 255 ,lights[i].ambient[2]/255);
            let diffuse = vec3(lights[i].diffuse[0] / 255 , lights[i].diffuse[1] / 255 ,lights[i].diffuse[2]/255);
            let specular = vec3(lights[i].specular[0] / 255 , lights[i].specular[1] / 255 ,lights[i].specular[2]/255);
        
                
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Ia"),ambient);
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Id"),diffuse);
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Is"),specular);
            gl.uniform4fv(gl.getUniformLocation(program, "uLight[" + i +"].pos"),lights[i].position);
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isDirectional"), lights[i].directional);
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isActive"), lights[i].active);
    
        }


        
    }
    
}


const urls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(urls).then( shaders => main(shaders));