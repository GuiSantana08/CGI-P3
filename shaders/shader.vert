//atributes
attribute vec4 vPosition;
attribute vec4 vNormal;

//Matrices used
uniform mat4 mProjection;
uniform mat4 mModelView;
uniform mat4 mNormals;

//Normal in camara coordinates
varying vec3 fNormal;

varying vec3 fViewer;

//Normal in camara coordinates
varying vec3 fPosition;



void main()
{
    fPosition = (mModelView * vPosition).xyz;
    fNormal = (mNormals * vNormal).xyz;

    fViewer = vec3(0,0,1);

    gl_Position = mProjection * mModelView * vPosition;

}