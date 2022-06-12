precision highp float;
uniform float pixelRatio;
uniform vec2 resolution;
uniform float time;

#define PI 3.14159265359
#define MARCH_STEP 64

float EaseInOutQuad(float x) {
  //x < 0.5f ? 2 * x* x : 1 - pow(-2 * x + 2,2) /2;
  float inValue = 2.0 * x  *x;
  float outValue = 1.0- pow(-2.0 * x + 2.0,2.0) / 2.0;
  float inStep = step(inValue,0.5) * inValue;
  float outStep = step(0.5 , outValue ) * outValue;

  return inStep + outStep;
}

vec3 rotate(vec3 p, float angle, vec3 axis) {
  vec3 a = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float r = 1.0 - c;
  mat3 m = mat3(
      a.x * a.x * r + c,
      a.y * a.x * r + a.z * s,
      a.z * a.x * r - a.y * s,
      a.x * a.y * r - a.z * s,
      a.y * a.y * r + c,
      a.z * a.y * r + a.x * s,
      a.x * a.z * r + a.y * s,
      a.y * a.z * r - a.x * s,
      a.z * a.z * r + c
  );
  return m * p;
}

vec3 translate(vec3 p, vec3 t) {
  mat4 m = mat4(vec4(1.0, 0.0, 0.0, 0.0),
                vec4(0.0, 1.0, 0.0, 0.0),
                vec4(0.0, 0.0, 1.0, 0.0),
                vec4(-t.x, -t.y, -t.z, 1.0));

  return (m * vec4(p, 1.0)).xyz;
}

float smin(float d1, float d2, float k){
  float h = exp(-k * d1) + exp(-k * d2);
  return -log(h) / k;
}



// https://iquilezles.org/articles/distfunctions/
// https://www.shadertoy.com/view/wsSGDG
float sdOctahedron( vec3 p, float s) {
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;

  float k = clamp(0.5*(q.z-q.y+s),0.0,s);
  return length(vec3(q.x,q.y-s+k,q.z-k));
}

float sdRoundBox( vec3 p, vec3 b, float r ) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sdSphere( vec3 p, float s ) {
  return length(p)-s;
}

float distFloor(vec3 p, float offset) {
  return dot(p, vec3(0.0, 1.0, 0.0)) + offset;
}

float getDistance(vec3 p, float size) {
  float d = 0.;

  // float easing = EaseInOutQuad( sin(PI * (time/300.0)) );

  float sd1 = sdOctahedron(p + vec3(-0.3, 0.0, 0.0), size);
  d = sd1;
  float sd2 = sdSphere(p + vec3(0.3, 0.0, 0.0), size);
  d = min(d, sd2);
  float sd3 = distFloor(p, 0.21);
  d = min(d, sd3);

  return d;
}

vec3 getNormal(vec3 p, float size) {
  // float d = getDistance(p, size);
  // vec2 e = vec2(.001, 0); // e === delta
  // // float delta = 0.0001;
  // vec3 n = d - vec3(
  //   getDistance(p - e.xyy, size),
  //   getDistance(p - e.yxy, size),
  //   getDistance(p - e.yyx, size)
  // );

  // return normalize(n);

  // Tetrahedral normal calculation method by iq
    vec2 e = vec2(0.002,-0.002);
    return normalize(e.xxx * getDistance(p + e.xxx, size)
            + e.xyy * getDistance(p + e.xyy, size)
            + e.yxy * getDistance(p + e.yxy, size)
            + e.yyx * getDistance(p + e.yyx, size));
}

float rayMarch(vec3 ro, vec3 rd) {
  float size = 0.2;
  float d;

  // Light Setup
  // vec3 lightPos = normalize(vec3(-10.0 * EaseInOutQuad( sin(PI * (time/300.0)) ), 10.0, -1.0));


  // marching loop
  for(int i = 0; i < MARCH_STEP; i++) {
    vec3 p = ro + rd * d;
    float ds = getDistance(p, size);
    d += ds; // forward ray

    // vec3 lightDirection = normalize(lightPos - p);
    // vec3 normal = getNormal(p, size);

    // Hit a object
    if (ds < 0.0001) {
      break;
    }
  }

  return d;
}

float calcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax ) {
	float res = 1.0;
  float t = mint;
  float ph = 1e10; // big, such that y = 0 on the first iteration

  for( int i=0; i<32; i++ ) {
    float h = getDistance( ro + rd*t, 0.3 );

    // use this if you are getting artifact on the first iteration, or unroll the
    // first iteration out of the loop
    //float y = (i==0) ? 0.0 : h*h/(2.0*ph);

    float y = h*h/(2.0*ph);
    float d = sqrt(h*h-y*y);
    res = min( res, 10.0*d/max(0.0,t-y) );
    ph = h;

    t += h;

    if( res<0.0001 || t>tmax ) break;
  }
  res = clamp( res, 0.0, 1.0 );
  return res*res*(3.0-2.0*res);
}

float getLight(vec3 p) {
  float size = 0.3;
  // * sin(PI * (time/300.0))
  // Light
  vec3 lightPos = normalize(vec3(-10.0 * EaseInOutQuad( sin(PI * (time/300.0)) ), 10.0, -1.0));
  vec3 lightDirection = normalize(lightPos - p);
  vec3 n = getNormal(p, size);

  float diff = dot(n, lightDirection);
  diff = clamp(diff, 0., 1.);

  // Shadow ray march starts from light direction
  float shadow = rayMarch(p + n * 0.0001 * 2., lightDirection) * calcSoftshadow( lightPos, lightDirection, 0.01, 3.0);
  if (shadow < length(lightPos - p)) diff *= .1;
  // if (shadow < length(lightPos - p)) diff *= calcSoftshadow( lightPos, lightDirection, 0.01, 3.0);
  return diff;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution.xy - 1.0) / vec2(resolution.y / resolution.x , 1);
  vec3 col = vec3(0.);

  // ro: ray origin
  vec3 ro = vec3(0.0, 1.0, 4.0);
  // rd: ray direction
  vec3 rd = normalize(vec3(uv, 0) - ro);
  // vec3 rd = normalize(vec3(uv, -1.0 + 0.5 * length(uv)) - ro);

  float d = rayMarch(ro, rd);
  vec3 p = ro + rd * d;
  float diff = getLight(p);

  col = vec3(diff);

  gl_FragColor = vec4(col, 1.);
}




// // make this 1 is your machine is too slow
// #define AA 1

// //------------------------------------------------------------------

// float sdPlane( vec3 p )
// {
// 	return p.y;
// }

// float sdBox( vec3 p, vec3 b )
// {
//     vec3 d = abs(p) - b;
//     return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
// }


// //------------------------------------------------------------------

// float map( in vec3 pos )
// {
//     vec3 qos = vec3( fract(pos.x+0.5)-0.5, pos.yz );
//     return min( sdPlane(     pos.xyz-vec3( 0.0,0.00, 0.0)),
//                 sdBox(       qos.xyz-vec3( 0.0,0.25, 0.0), vec3(0.2,0.5,0.2) ) );
// }

// //------------------------------------------------------------------

// float calcSoftshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax, int technique )
// {
// 	float res = 1.0;
//     float t = mint;
//     float ph = 1e10; // big, such that y = 0 on the first iteration

//     for( int i=0; i<32; i++ )
//     {
// 		float h = map( ro + rd*t );

//         // traditional technique
//         if( technique==0 )
//         {
//         	res = min( res, 10.0*h/t );
//         }
//         // improved technique
//         else
//         {
//             // use this if you are getting artifact on the first iteration, or unroll the
//             // first iteration out of the loop
//             //float y = (i==0) ? 0.0 : h*h/(2.0*ph);

//             float y = h*h/(2.0*ph);
//             float d = sqrt(h*h-y*y);
//             res = min( res, 10.0*d/max(0.0,t-y) );
//             ph = h;
//         }

//         t += h;

//         if( res<0.0001 || t>tmax ) break;

//     }
//     res = clamp( res, 0.0, 1.0 );
//     return res*res*(3.0-2.0*res);
// }

// vec3 calcNormal( in vec3 pos )
// {
//     vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
//     return normalize( e.xyy*map( pos + e.xyy ) +
// 					  e.yyx*map( pos + e.yyx ) +
// 					  e.yxy*map( pos + e.yxy ) +
// 					  e.xxx*map( pos + e.xxx ) );
// }

// float castRay( in vec3 ro, in vec3 rd )
// {
//     float tmin = 1.0;
//     float tmax = 20.0;

// #if 1
//     // bounding volume
//     float tp1 = (0.0-ro.y)/rd.y; if( tp1>0.0 ) tmax = min( tmax, tp1 );
//     float tp2 = (1.0-ro.y)/rd.y; if( tp2>0.0 ) { if( ro.y>1.0 ) tmin = max( tmin, tp2 );
//                                                  else           tmax = min( tmax, tp2 ); }
// #endif

//     float t = tmin;
//     for( int i=0; i<64; i++ )
//     {
// 	    float precis = 0.0005*t;
// 	    float res = map( ro+rd*t );
//         if( res<precis || t>tmax ) break;
//         t += res;
//     }

//     if( t>tmax ) t=-1.0;
//     return t;
// }

// float calcAO( in vec3 pos, in vec3 nor )
// {
// 	float occ = 0.0;
//     float sca = 1.0;
//     for( int i=0; i<5; i++ )
//     {
//         float h = 0.001 + 0.15*float(i)/4.0;
//         float d = map( pos + h*nor );
//         occ += (h-d)*sca;
//         sca *= 0.95;
//     }
//     return clamp( 1.0 - 1.5*occ, 0.0, 1.0 );
// }

// vec3 render( in vec3 ro, in vec3 rd, in int technique)
// {
//     vec3  col = vec3(0.0);
//     float t = castRay(ro,rd);

//     if( t>-0.5 )
//     {
//         vec3 pos = ro + t*rd;
//         vec3 nor = calcNormal( pos );

//         // material
// 		vec3 mate = vec3(0.3);

//         // key light
//         vec3  lig = normalize( vec3(-0.1, 0.3, 0.6) );
//         vec3  hal = normalize( lig-rd );
//         float dif = clamp( dot( nor, lig ), 0.0, 1.0 ) *
//                     calcSoftshadow( pos, lig, 0.01, 3.0, technique );

// 		float spe = pow( clamp( dot( nor, hal ), 0.0, 1.0 ),16.0)*
//                     dif *
//                     (0.04 + 0.96*pow( clamp(1.0+dot(hal,rd),0.0,1.0), 5.0 ));

// 		col = mate * 4.0*dif*vec3(1.00,0.70,0.5);
//         col +=      12.0*spe*vec3(1.00,0.70,0.5);

//         // ambient light
//         float occ = calcAO( pos, nor );
// 		float amb = clamp( 0.5+0.5*nor.y, 0.0, 1.0 );
//         col += mate*amb*occ*vec3(0.0,0.08,0.1);

//         // fog
//         col *= exp( -0.0005*t*t*t );
//     }

// 	return col;
// }

// mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
// {
// 	vec3 cw = normalize(ta-ro);
// 	vec3 cp = vec3(sin(cr), cos(cr),0.0);
// 	vec3 cu = normalize( cross(cw,cp) );
// 	vec3 cv = normalize( cross(cu,cw) );
//     return mat3( cu, cv, cw );
// }

// void mainImage( out vec4 fragColor, in vec2 fragCoord )
// {
//     // camera
//     float an = 12.0 - sin(0.1*iTime);
//     vec3 ro = vec3( 3.0*cos(0.1*an), 1.0, -3.0*sin(0.1*an) );
//     vec3 ta = vec3( 0.0, -0.4, 0.0 );
//     // camera-to-world transformation
//     mat3 ca = setCamera( ro, ta, 0.0 );

//     int technique = (fract(iTime/2.0)>0.5) ? 1 : 0;

//     vec3 tot = vec3(0.0);
// #if AA>1
//     for( int m=0; m<AA; m++ )
//     for( int n=0; n<AA; n++ )
//     {
//         // pixel coordinates
//         vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
//         vec2 p = (-iResolution.xy + 2.0*(fragCoord+o))/iResolution.y;
// #else
//         vec2 p = (-iResolution.xy + 2.0*fragCoord)/iResolution.y;
// #endif

//         // ray direction
//         vec3 rd = ca * normalize( vec3(p.xy,2.0) );

//         // render
//         vec3 col = render( ro, rd, technique);

// 		// gamma
//         col = pow( col, vec3(0.4545) );

//         tot += col;
// #if AA>1
//     }
//     tot /= float(AA*AA);
// #endif


//     fragColor = vec4( tot, 1.0 );
// }
