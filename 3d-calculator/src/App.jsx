import { useEffect, useState } from 'react'
import * as THREE from 'three'

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import Stats from "three/examples/jsm/libs/stats.module"

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { CalcShader } from "./calcShader.js"


import './App.css'


function App() {
    useEffect(() => {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.x = 30;
        camera.position.y = 30;
        camera.position.z = 30;
        camera.lookAt(0,0,0);

        const canvas = document.getElementById("ThreeJsCanvas");
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        });
        renderer.setSize(canvas.width, canvas.height);
        document.body.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.castShadow = true;
        spotLight.position.set(0, 64, 32);
        scene.add(spotLight);

        const boxMaterial = new THREE.MeshNormalMaterial();
        const boxGeometry1 = new THREE.BoxGeometry(50, 1, 1);
        const boxMesh1 = new THREE.Mesh(boxGeometry1, boxMaterial);
        boxMesh1.position.set(25, 0, 0);
        //boxMesh1.material.color = 0xff1e1e;
        scene.add(boxMesh1);

        const boxGeometry2 = new THREE.BoxGeometry(1, 50, 1);
        const boxMesh2 = new THREE.Mesh(boxGeometry2, boxMaterial);
        boxMesh2.position.set(0, 25, 0);
        //boxMesh2.material.color = 0xff1e1e;
        scene.add(boxMesh2);

        const boxGeometry3 = new THREE.BoxGeometry(1, 1, 50);
        const boxMesh3 = new THREE.Mesh(boxGeometry3, boxMaterial);
        boxMesh3.position.set(0, 0, 25);
        //boxMesh3.material.color = 0xff1e1e;
        scene.add(boxMesh3);


        const controls = new OrbitControls(camera, renderer.domElement);

        const stats = Stats();
        document.body.appendChild(stats.dom);


        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));

        const calcShader = new ShaderPass(CalcShader);
        calcShader.uniforms = {
            u_inverseProjectionMatrix: {value: camera.projectionMatrixInverse},
            u_inverseViewMatrix: {value: camera.matrixWorldInverse.invert()},
            time: {value: null},
        };
        composer.addPass(calcShader);


        const startTime = Date.now();
        function SecondsElapsed() {
            return (Date.now() - startTime)*0.001;
        }

        const animate = () => {
            stats.update();
            controls.update();
            
            window.requestAnimationFrame(animate);

            calcShader.uniforms.time.value = SecondsElapsed();
            composer.render();
        };
        animate();
    }, []);

    return (
        <>
            
            <canvas className="" id="ThreeJsCanvas" width="500" height="500"></canvas>
        </>
    )
}

export default App
