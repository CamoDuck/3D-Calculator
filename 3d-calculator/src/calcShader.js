

const CalcShader = {

	name: 'CalcShader',

	uniforms: {
		// 'tDiffuse': { value: null },
		// 'opacity': { value: 0.5 }

	},

	vertexShader: /* glsl */`
        varying vec2 vUv;

		void main() {
            vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

		}`,

	fragmentShader: /* glsl */`
        const int MAXDEG = 2;

        struct Equation { // format is "ax^b + ...  cy^d + ... + fz^g + ... + h = 0" where a,b,c,d,f,g,h are real numbers
            // polynomial terms with specified variable in this equation (only goes up to MAXDEG)
            float[MAXDEG] XTerms; 
            float[MAXDEG] YTerms; 
            float[MAXDEG] ZTerms; 

            float constTerm; // constant term (specified as h above)
        };

        
        float[MAXDEG+1] Intersect(Equation eq, vec3 ray, vec3 camPos);
        float Roots(float[MAXDEG+1] eq);
        float[MAXDEG+1] BinomialTheorum(float[MAXDEG+1] result, float coEff, float x, float y, int n);

        uniform mat4 u_inverseProjectionMatrix;
        uniform mat4 u_inverseViewMatrix;
        uniform float time;

        varying vec2 vUv;

		void main() {
            mat4 u_inverseViewProjMatrix = u_inverseViewMatrix * u_inverseProjectionMatrix;

            vec2 ndc = vUv * 2.0 - 1.0;

            // Calculate the ray direction in clip space (ndc)
            vec4 rayClip = vec4(ndc.xy, 1.0, 1.0);
            
            vec4 camWorldPos = u_inverseViewProjMatrix * vec4(0, 0, 0, 1.0);
            // Transform the ray direction to camera space
            vec4 rayWorld = u_inverseViewProjMatrix * rayClip;
            vec3 rayDirection = normalize(rayWorld.xyz);
        
            // Output the ray direction (for debugging purposes)
            //gl_FragColor = vec4(abs(rayDirection.x), abs(rayDirection.y), abs(rayDirection.z), 1.0);
            //gl_FragColor = vec4(rayDirection.xyz, 1.0);

            Equation eq = Equation(
                float[MAXDEG](0.0, 1.0),
                float[MAXDEG](0.0, 1.0),
                float[MAXDEG](-1.0, 0.0),
                0.0);

            float[MAXDEG+1] intersection = Intersect(eq, rayDirection, camWorldPos.xyz);
            float rootsCount = Roots(intersection);
            
            // gl_FragColor = vec4(0.25 * rootsCount, 0.1, 0.1, 0.0);
            gl_FragColor = vec4(0.6, 0.1, 0.1, 0.2);
		}

        int binomial(int n, int k) { // n choose k (binomial coefficient)
            if (k > n) {return 0;}
            if (k * 2 > n) {k = n-k;}
            if (k == 0) {return 1;}

            int result = n;
            for( int i = 2; i <= k; ++i ) {
                result *= (n-i+1);
                result /= i;
            }
            return result;
        }
        
        float[MAXDEG+1] Intersect(Equation eq, vec3 ray, vec3 camPos) {
            float[MAXDEG+1] result; // equation in one variable 
            for (int i = 0; i < MAXDEG; i++) {
                float coEff = eq.XTerms[i];
                result = BinomialTheorum(result, coEff, ray.x, camPos.x, i);
            }
            for (int i = 0; i < MAXDEG; i++) {
                float coEff = eq.YTerms[i];
                result = BinomialTheorum(result, coEff, ray.y, camPos.y, i);
            }
            for (int i = 0; i < MAXDEG; i++) {
                float coEff = eq.ZTerms[i];
                result = BinomialTheorum(result, coEff, ray.z, camPos.z, i);
            }

            result[0] += eq.constTerm;

            // gl_FragColor = vec4(normalize(vec3(result[0], result[1], result[2])), 0.5);

            return result;
        }

        // format : coEff * (xt + y)^n
        float[MAXDEG+1] BinomialTheorum(float[MAXDEG+1] result, float coEff, float x, float y, int n) {
            for (int k = 0; k < n; k++) {
                result[k] += coEff * float(binomial(n, k)) * pow(x, float(k)) * pow(y, float(n-k)); // binomial coefficient
            }


            if (result[0] + result[1] + result[2] > 0.0)
            //gl_FragColor = vec4(result[0], result[1], result[2], 0.5);

            return result;

        }

        float Roots(float[MAXDEG+1] eq) {   
            // quadratic formula
            float a = eq[2];
            float b = eq[1];
            float c = eq[0];
            float det = pow(b, 2.0) - 4.0*a*c;

            if (det > 0.0) {return 2.0;}
            else if (det == 0.0) {return 1.0;}
            return 0.0;
        }
        
        
        `

};

export { CalcShader };
