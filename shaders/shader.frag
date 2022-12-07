precision highp float;

uniform bool uUseNormals;

const int MAX_LIGHTS = 8;

struct LightInfo {
    //Light colour intensities
    vec4 pos;
    vec3 Ia;
    vec3 Id;
    vec3 Is;
    bool isDirectional;
    bool isActive;
};

struct MaterialInfo {
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float shininess;
};

uniform int uNLights; // Effective number of lights used

uniform LightInfo uLight[MAX_LIGHTS]; // The array of lights present in the scene
uniform MaterialInfo uMaterial;  // The material of the object being drawn

uniform mat4 mViewF;
uniform mat4 mViewNormalsF;




varying vec3 fViewer;
varying vec3 fNormal;
varying vec3 fPosition;

void main()
{
    vec3 total;


    for(int i = 0; i < MAX_LIGHTS;i++){
        if(uLight[i].isActive){
        if(i == uNLights) break;
        vec3 fLight;
        if(uLight[i].isDirectional) 
            fLight = normalize((mViewNormalsF * uLight[i].pos).xyz);
        else 
            fLight = normalize((mViewF * uLight[i].pos).xyz - fPosition);

        vec3 L = normalize(fLight);
        vec3 V = normalize(fViewer);
        vec3 N = normalize(fNormal);
        vec3 H = normalize(L+V);    

        vec3 ambientColor = uLight[i].Ia * uMaterial.Ka;
        vec3 diffuseColor = uLight[i].Id * uMaterial.Kd;
        vec3 specularColor = uLight[i].Is * uMaterial.Ks;

        float diffuseFactor = max (dot(L,N),0.0);
        vec3 diffuse = diffuseFactor * diffuseColor;

        float specularFactor = pow(max (dot(N,H),0.0),uMaterial.shininess);
        vec3 specular = specularFactor * specularColor;

        if (dot(L,N) < 0.0){
            specular = vec3(0.0,0.0,0.0);
        }
        total += ambientColor+diffuse+specular;
        }
    }

    gl_FragColor = vec4(total, 1.0);
}