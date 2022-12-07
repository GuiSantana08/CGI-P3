import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { length, flatten, inverse, mult, normalMatrix, perspective, lookAt, vec4, vec3, vec2, subtract, add, scale, rotate, normalize } from '../../libs/MV.js';

import * as dat from '../../libs/dat.gui.module.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';
import * as TORUS from '../../libs/objects/torus.js';

import * as STACK from '../../libs/stack.js';

let nLights = 4;
let lightsVec = [];
let lightsGuiVec = [];

function setup(shaders) {
    const canvas = document.getElementById('gl-canvas');
    const gl = setupWebGL(canvas);

    CUBE.init(gl);
    SPHERE.init(gl);
    CYLINDER.init(gl);
    PYRAMID.init(gl);
    TORUS.init(gl);

    const program = buildProgramFromSources(gl, shaders['shader.vert'], shaders['shader.frag']);

    // Camera  
    let camera = {
        eye: vec3(5,5,5),
        at: vec3(0,0,0),
        up: vec3(0,1,0),
        fovy: 45,
        aspect: 1, // Updated further down
        near: 0.1,
        far: 20
    }

    let options = {
        backfaceCulling: true,
        depthTest: true,
        showLights: true
    }

    for (let i = 0; i < nLights; i++){
        let light = {
            position: vec4(0, 0, 1.3, 1.0),
            ambient: vec3(50,50,50),
            diffuse: vec3(180,180,180),
            specular: vec3(255,255,255),
            directional: false,
            active: true
        }
        lightsVec.push(light);
    }

    let objects = {
        type: 'Sphere'
    }

    let material = {
        Ka: vec3(0,25,0),
        Kd: vec3(0,125,0),
        Ks: vec3(255,255,255),
        shininess: 50
    }
    

    const gui = new dat.GUI();

    const optionsGui = gui.addFolder("options");
    optionsGui.add(options, "backfaceCulling");
    optionsGui.add(options, "depthTest");
    optionsGui.add(options, "showLights");

    const cameraGui = gui.addFolder("camera");

    cameraGui.add(camera, "fovy").min(1).max(100).step(1).listen();
    cameraGui.add(camera, "aspect").min(0).max(10).listen().domElement.style.pointerEvents = "none";
    
    cameraGui.add(camera, "near").min(0.1).max(20).onChange( function(v) {
        camera.near = Math.min(camera.far-0.5, v);
    });

    cameraGui.add(camera, "far").min(0.1).max(20).listen().onChange( function(v) {
        camera.far = Math.max(camera.near+0.5, v);
    });

    const eye = cameraGui.addFolder("eye");
    eye.add(camera.eye, 0).step(0.05).name("x");//.domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 1).step(0.05).name("y");//.domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 2).step(0.05).name("z");//.domElement.style.pointerEvents = "none";;

    const at = cameraGui.addFolder("at");
    at.add(camera.at, 0).step(0.05).name("x");//.domElement.style.pointerEvents = "none";;
    at.add(camera.at, 1).step(0.05).name("y");//.domElement.style.pointerEvents = "none";;
    at.add(camera.at, 2).step(0.05).name("z");//.domElement.style.pointerEvents = "none";;

    const up = cameraGui.addFolder("up");
    up.add(camera.up, 0).step(0.05).name("x");//.domElement.style.pointerEvents = "none";;
    up.add(camera.up, 1).step(0.05).name("y");//.domElement.style.pointerEvents = "none";;
    up.add(camera.up, 2).step(0.05).name("z");//.domElement.style.pointerEvents = "none";;

    const lightsGui = gui.addFolder("lights");

    for (let i = 0; i < lightsVec.length; i++){
        const lightGui = lightsGui.addFolder("light" + (i+1));
        const position = lightGui.addFolder("position");
        position.add(lightsVec[i].position, 0).step(0.05).name("x");//.domElement.style.pointerEvents = "none";;
        position.add(lightsVec[i].position, 1).step(0.05).name("y");//.domElement.style.pointerEvents = "none";;
        position.add(lightsVec[i].position, 2).step(0.05).name("z");//.domElement.style.pointerEvents = "none";;
    
        lightGui.addColor(lightsVec[i], "ambient");
        lightGui.addColor(lightsVec[i], "diffuse");
        lightGui.addColor(lightsVec[i], "specular");
        lightGui.add(lightsVec[i], "directional");
        lightGui.add(lightsVec[i], "active");
    
        lightsGuiVec.push(lightGui);
    }

    const gui2 = new dat.GUI();

    gui2.add(objects,"type",["Cube","Sphere","Cylinder", "Pyramid","Torus"]);
    
    const materialGui = gui2.addFolder("material");
    
    materialGui.addColor(material,"Ka");
    materialGui.addColor(material,"Kd").listen();
    materialGui.addColor(material,"Ks");
    materialGui.add(material,"shininess");
   


    // matrices
    let mView, mProjection;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    resizeCanvasToFullWindow();

    window.addEventListener('resize', resizeCanvasToFullWindow);

    window.addEventListener('wheel', function(event) {

        
        const factor = 1 - event.deltaY/1000;
        camera.fovy = Math.max(1, Math.min(100, camera.fovy * factor)); 
    });


    window.requestAnimationFrame(render);

    function resizeCanvasToFullWindow()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
    }

    function render()
    {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        mView = lookAt(camera.eye, camera.at, camera.up);
        STACK.loadMatrix(mView);

        mProjection = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

        if(options.depthTest){
            gl.enable(gl.DEPTH_TEST);
        }
        else gl.disable(gl.DEPTH_TEST);

        if(options.backfaceCulling){
            gl.enable(gl.CULL_FACE)
        }
        else gl.disable(gl.CULL_FACE)

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(STACK.modelView())));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));
        gl.uniform1i(gl.getUniformLocation(program,"uNLights"),lightsVec.length);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewF"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormalsF"), false, flatten(normalMatrix(mView)));


        let KaChao = vec3(50/255,100/255,50/255);
        let KdChao =vec3(100/255,0,100/255);
        let KsChao =vec3(255/255,255/255,255/255);
        let shininessC = 50;
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),KaChao );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),KdChao );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),KsChao );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),shininessC );

        
        
        STACK.pushMatrix();
        STACK.multTranslation([0,-0.55,0])
        STACK.multScale([3,0.1,3]);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
        CUBE.draw(gl, program, options.wireframe ? gl.LINES : gl.TRIANGLES);
        STACK.popMatrix();

      
    

        let Ka = vec3(material.Ka[0] / 255 ,material.Ka[1] / 255 ,material.Ka[2] / 255 );
        let Kd = vec3(material.Kd[0] / 255 ,material.Kd[1] / 255 ,material.Kd[2] / 255 );
        let Ks = vec3(material.Ks[0] / 255 ,material.Ks[1] / 255 ,material.Ks[2] / 255 );

       

        gl.uniform1i(gl.getUniformLocation(program, "uUseNormals"), options.normals);
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ka"),Ka );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Kd"),Kd );
        gl.uniform3fv(gl.getUniformLocation(program,"uMaterial.Ks"),Ks );
        gl.uniform1f(gl.getUniformLocation(program,"uMaterial.shininess"),material.shininess );
        
        
        STACK.pushMatrix();
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(STACK.modelView()));
        if(objects.type == "Sphere") 
        SPHERE.draw(gl, program, gl.TRIANGLES);
        if(objects.type == "Cube") 
        CUBE.draw(gl, program, gl.TRIANGLES);
        if(objects.type == "Cylinder") 
        CYLINDER.draw(gl, program, gl.TRIANGLES);
        if(objects.type == "Pyramid") 
        PYRAMID.draw(gl, program, gl.TRIANGLES);
        if(objects.type == "Torus") 
        TORUS.draw(gl, program,gl.TRIANGLES);
       
        STACK.popMatrix();
        
        for(let i = 0; i < lightsVec.length; i++){
        let ambient = vec3(lightsVec[i].ambient[0] / 255 , lightsVec[i].ambient[1] / 255 ,lightsVec[i].ambient[2]/255);
        let diffuse = vec3(lightsVec[i].diffuse[0] / 255 , lightsVec[i].diffuse[1] / 255 ,lightsVec[i].diffuse[2]/255);
        let specular = vec3(lightsVec[i].specular[0] / 255 , lightsVec[i].specular[1] / 255 ,lightsVec[i].specular[2]/255);
    
            
        gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Ia"),ambient);
        gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Id"),diffuse);
        gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i +"].Is"),specular);
        gl.uniform4fv(gl.getUniformLocation(program, "uLight[" + i +"].pos"),lightsVec[i].position);
        gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isDirectional"), lightsVec[i].directional);
        gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i +"].isActive"), lightsVec[i].active);


        }

       
        
        
    }
}

const urls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(urls).then( shaders => setup(shaders));