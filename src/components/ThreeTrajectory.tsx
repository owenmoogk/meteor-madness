import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeTrajectoryProps {
  asteroidSize: number;
  impactLat: number;
  impactLon: number;
  postImpactLat?: number;
  postImpactLon?: number;
  showPreTrajectory: boolean;
  showPostTrajectory: boolean;
  showSun: boolean;
  showMoon: boolean;
}

export function ThreeTrajectory({
  asteroidSize,
  impactLat,
  impactLon,
  postImpactLat,
  postImpactLon,
  showPreTrajectory,
  showPostTrajectory,
  showSun,
  showMoon,
}: ThreeTrajectoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    earth: THREE.Mesh;
    asteroid: THREE.Mesh;
    preOrbit: THREE.Line;
    postOrbit?: THREE.Line;
    sun?: THREE.Mesh;
    moon?: THREE.Mesh;
  }>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(100, 50, 50);
    scene.add(sunLight);

    // Earth with texture
    const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: 0x333333,
      shininess: 25,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    // Rotate Earth so longitude 0 faces the camera properly
    earth.rotation.y = Math.PI;
    scene.add(earth);

    // Asteroid
    const asteroidGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const asteroidMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.5,
    });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    scene.add(asteroid);

    // Convert lat/lon to 3D position on Earth surface
    const phi = (90 - impactLat) * (Math.PI / 180);
    const theta = (impactLon + 180) * (Math.PI / 180);
    const targetX = -(10 * Math.sin(phi) * Math.cos(theta));
    const targetY = 10 * Math.cos(phi);
    const targetZ = 10 * Math.sin(phi) * Math.sin(theta);

    // Pre-trajectory (elliptical approach)
    const prePoints: THREE.Vector3[] = [];
    const steps = 100;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI * 0.5;
      const distance = 80 - t * 70;
      const x = targetX + distance * Math.cos(angle);
      const y = targetY + distance * Math.sin(angle) * 0.3;
      const z = targetZ + distance * Math.sin(angle) * 0.5;
      prePoints.push(new THREE.Vector3(x, y, z));
    }
    prePoints.push(new THREE.Vector3(targetX, targetY, targetZ));

    const preGeometry = new THREE.BufferGeometry().setFromPoints(prePoints);
    const preMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 2,
    });
    const preOrbit = new THREE.Line(preGeometry, preMaterial);
    scene.add(preOrbit);

    // Post-deflection trajectory (if enabled)
    let postOrbit: THREE.Line | undefined;
    if (showPostTrajectory && postImpactLat !== undefined && postImpactLon !== undefined) {
      const postPhi = (90 - postImpactLat) * (Math.PI / 180);
      const postTheta = (postImpactLon + 180) * (Math.PI / 180);
      const postTargetX = -(10 * Math.sin(postPhi) * Math.cos(postTheta));
      const postTargetY = 10 * Math.cos(postPhi);
      const postTargetZ = 10 * Math.sin(postPhi) * Math.sin(postTheta);

      const postPoints: THREE.Vector3[] = [];
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 0.5;
        const distance = 80 - t * 70;
        const x = postTargetX + distance * Math.cos(angle);
        const y = postTargetY + distance * Math.sin(angle) * 0.3;
        const z = postTargetZ + distance * Math.sin(angle) * 0.5;
        postPoints.push(new THREE.Vector3(x, y, z));
      }
      postPoints.push(new THREE.Vector3(postTargetX, postTargetY, postTargetZ));

      const postGeometry = new THREE.BufferGeometry().setFromPoints(postPoints);
      const postMaterial = new THREE.LineBasicMaterial({
        color: 0x00d9ff,
        linewidth: 2,
      });
      postOrbit = new THREE.Line(postGeometry, postMaterial);
      scene.add(postOrbit);
    }

    // Sun indicator
    let sun: THREE.Mesh | undefined;
    if (showSun) {
      const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sun.position.set(100, 50, 50);
      scene.add(sun);
    }

    // Moon indicator
    let moon: THREE.Mesh | undefined;
    if (showMoon) {
      const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.position.set(30, 5, 30);
      scene.add(moon);
    }

    sceneRef.current = {
      scene,
      camera,
      renderer,
      earth,
      asteroid,
      preOrbit,
      postOrbit,
      sun,
      moon,
    };

    // Animation
    let frameId: number;
    let time = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate Earth
      earth.rotation.y += 0.002;

      // Animate asteroid along trajectory
      const pathProgress = (Math.sin(time * 0.5) + 1) / 2;
      const pointIndex = Math.floor(pathProgress * (prePoints.length - 1));
      const point = prePoints[pointIndex];
      asteroid.position.copy(point);

      // Rotate asteroid
      asteroid.rotation.x += 0.02;
      asteroid.rotation.y += 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Mouse controls (simple rotation)
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouse.x;
      const deltaY = e.clientY - previousMouse.y;

      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
      camera.position.applyAxisAngle(
        new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion),
        deltaY * 0.005
      );
      camera.lookAt(0, 0, 0);

      previousMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const direction = camera.position.clone().normalize();
      camera.position.addScaledVector(direction, e.deltaY * zoomSpeed);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [asteroidSize, impactLat, impactLon, postImpactLat, postImpactLon, showPreTrajectory, showPostTrajectory, showSun, showMoon]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div className="absolute top-4 left-4 text-xs text-muted-foreground space-y-1 pointer-events-none z-10">
        <div className="bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded">
          <div className="text-primary font-medium">3D Trajectory View</div>
        </div>
        <div className="bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-destructive"></div>
            <span>Pre-deflection path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span>Post-deflection path</span>
          </div>
        </div>
        <div className="bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded text-muted-foreground/70">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
}
