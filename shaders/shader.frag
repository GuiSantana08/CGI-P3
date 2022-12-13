precision highp float;

uniform bool uUseNormals;

const int MAX_LIGHTS = 4;

struct LightInfo {
    vec3 pos;
    vec3 Ia;
    vec3 Id;
    vec3 Is;
    float aperture;
    float cutoff;
    bool isActive;
    bool isDirectional;
    bool isSpotLight;
};

struct MaterialInfo {
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float shininess;
};

uniform mat4 mViewF;
uniform mat4 mViewNormalsF;


uniform int uNLights; // Effective number of lights used

uniform LightInfo uLight[MAX_LIGHTS]; // The array of lights present in the scene
uniform MaterialInfo uMaterial;  // The material of the object being drawn

varying vec3 fViewer;
varying vec3 fNormal;
varying vec3 fPosition;

void main()
{
    vec3 total;

    vec3 ka = vec3(uMaterial.Ka.x/250.0, uMaterial.Ka.y/250.0, uMaterial.Ka.z/250.0);
    vec3 kd = vec3(uMaterial.Kd.x/250.0, uMaterial.Kd.y/250.0, uMaterial.Kd.z/250.0);
    vec3 ks = vec3(uMaterial.Ks.x/250.0, uMaterial.Ks.y/250.0, uMaterial.Ks.z/250.0);

    for(int i = 0; i < MAX_LIGHTS;i++){
        if(uLight[i].isActive){
            if(i == uNLights) break;
            vec3 fLight = normalize((mViewNormalsF * vec4(uLight[i].pos,1.0)).xyz - fPosition);
        
            vec3 L = normalize(fLight);
            vec3 V = normalize(fViewer);
            vec3 N = normalize(fNormal);
            vec3 H = normalize(L+V); 

            vec3 ia = vec3(uLight[i].Ia.x/255.0,uLight[i].Ia.y/255.0,uLight[i].Ia.z/255.0);
            vec3 id = vec3(uLight[i].Id.x/255.0,uLight[i].Id.y/255.0,uLight[i].Id.z/255.0);
            vec3 is = vec3(uLight[i].Is.x/255.0,uLight[i].Is.y/255.0,uLight[i].Is.z/255.0);
        
            vec3 ambientColor = ia * ka;
            vec3 diffuseColor = id * kd;
            vec3 specularColor = is * ks;

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