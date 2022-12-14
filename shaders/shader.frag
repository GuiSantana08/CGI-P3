precision highp float;

uniform bool uUseNormals;

const int MAX_LIGHTS = 10;
const float PI = 3.141592653589793;

struct LightInfo {
    vec4 pos;
    vec3 axis;
    vec3 Ia;
    vec3 Id;
    vec3 Is;
    float aperture;
    float cutoff;
    bool isActive;
    bool spotlight;
};

// Utilizar a psoção da luz pos -fPosição
// utilizar a direção da luz axis
//calcular o angulo entre os dois vetores (axis,(pos -fPosição))
// ver se é maior ou menor que a abertura
//converter os graus do angulo em radianos
struct MaterialInfo {
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float shininess;
};

uniform mat4 mView;
uniform mat4 mViewNormals;


uniform int uNLights; // Effective number of lights used

uniform LightInfo uLight[MAX_LIGHTS]; // The array of lights present in the scene
uniform MaterialInfo uMaterial;  // The material of the object being drawn

varying vec3 fViewer;
varying vec3 fNormal;
varying vec3 fPosition;

void main() {
    vec3 total;

    vec3 ka = vec3(uMaterial.Ka.x/250.0, uMaterial.Ka.y/250.0, uMaterial.Ka.z/250.0);
    vec3 kd = vec3(uMaterial.Kd.x/250.0, uMaterial.Kd.y/250.0, uMaterial.Kd.z/250.0);
    vec3 ks = vec3(uMaterial.Ks.x/250.0, uMaterial.Ks.y/250.0, uMaterial.Ks.z/250.0);

    for(int i = 0; i < MAX_LIGHTS;i++){
        if(i == uNLights) break;
        if(uLight[i].isActive){
            vec3 fLight;
           
            if(uLight[i].pos.w == 0.0)
                fLight = normalize((mViewNormals * vec4(uLight[i].pos)).xyz);
            else
                fLight = normalize((mView * vec4(uLight[i].pos)).xyz - fPosition);


            //Meter lá para baixo a condição da spotlight

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

            if(uLight[i].spotlight == true){
                vec3 lightDirection = normalize((vec4(uLight[i].pos)).xyz - fPosition);
                float angle = acos(dot(lightDirection, normalize(-uLight[i].axis)));
                angle = (180.0*angle)/PI;

                if(angle > uLight[i].aperture){
                    total += vec3(0,0,0);
                }
                else {
                    total += pow(cos((PI*angle)/180.0), uLight[i].cutoff) * (ambientColor + diffuse + specular);
                }
            }
            else{
                total += ambientColor+diffuse+specular;
            }
            
            
        }

    }

    gl_FragColor = vec4(total, 1.0);
}