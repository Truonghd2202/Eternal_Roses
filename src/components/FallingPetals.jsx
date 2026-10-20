import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = typeof window !== 'undefined' && window.innerWidth < 700 ? 42 : 86;
const FLOWER_COUNT = typeof window !== 'undefined' && window.innerWidth < 700 ? 4 : 7;
const HEART_COUNT = typeof window !== 'undefined' && window.innerWidth < 700 ? 5 : 8;
const STAR_COUNT = typeof window !== 'undefined' && window.innerWidth < 700 ? 7 : 12;
const rand = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(-0.18, 0.08, -0.22, 0.38, -0.08, 0.58);
  shape.quadraticCurveTo(0, 0.67, 0.08, 0.58);
  shape.bezierCurveTo(0.22, 0.38, 0.18, 0.08, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 10);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    pos.setZ(i, Math.sin(y * 5.2) * 0.055 + Math.abs(x) * 0.03);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createFlowerGeometry() {
  const shape = new THREE.Shape();
  const lobes = 5;
  for (let i = 0; i <= lobes * 2; i += 1) {
    const angle = (i / (lobes * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? 0.22 : 0.13;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 8);
  geometry.computeVertexNormals();
  return geometry;
}

function createHeartGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.42);
  shape.bezierCurveTo(-0.16, -0.28, -0.5, -0.04, -0.48, 0.2);
  shape.bezierCurveTo(-0.46, 0.48, -0.12, 0.5, 0, 0.27);
  shape.bezierCurveTo(0.12, 0.5, 0.46, 0.48, 0.48, 0.2);
  shape.bezierCurveTo(0.5, -0.04, 0.16, -0.28, 0, -0.42);
  const geometry = new THREE.ShapeGeometry(shape, 12);
  geometry.computeVertexNormals();
  return geometry;
}

function createStarGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? 0.34 : 0.15;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 8);
  geometry.computeVertexNormals();
  return geometry;
}

function createSmallEffectData(count, seed) {
  const scaleFactor = typeof window !== 'undefined' && window.innerWidth < 700 ? 0.58 : 1;
  return Array.from({ length: count }, (_, i) => ({
    x: (rand(i + seed) - 0.5) * 9,
    y: rand(i + seed + 10) * 9 - 2.8,
    z: (rand(i + seed + 20) - 0.5) * 6,
    speed: 0.3 + rand(i + seed + 30) * 0.42,
    phase: rand(i + seed + 40) * Math.PI * 2,
    spin: (rand(i + seed + 50) - 0.5) * 0.65,
    scale: (0.34 + rand(i + seed + 60) * 0.2) * scaleFactor,
  }));
}

function updateSmallEffects(mesh, items, dummy, time, delta) {
  items.forEach((item, i) => {
    item.y -= item.speed * delta;
    if (item.y < -4.8) {
      item.y = 5.5 + rand(i + Math.floor(time) * 19) * 2;
      item.x = (rand(i + Math.floor(time) + 61) - 0.5) * 9;
      item.z = (rand(i + Math.floor(time) + 71) - 0.5) * 6;
    }
    dummy.position.set(
      item.x + Math.sin(time * 0.38 + item.phase) * 0.32,
      item.y,
      item.z,
    );
    dummy.rotation.set(0, 0, time * 0.28 + item.phase + item.spin);
    dummy.scale.setScalar(item.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

export function FallingPetals() {
  const mesh = useRef();
  const flowers = useRef();
  const hearts = useRef();
  const stars = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: (rand(i + 1) - 0.5) * 10,
        y: rand(i + 2) * 8 - 2.6,
        z: (rand(i + 3) - 0.5) * 8,
        speed: 0.35 + rand(i + 4) * 0.7,
        drift: 0.18 + rand(i + 5) * 0.35,
        phase: rand(i + 6) * Math.PI * 2,
        spin: (rand(i + 7) - 0.5) * 1.35,
        scale: 0.08 + rand(i + 8) * 0.13,
        swayZ: 0.15 + rand(i + 10) * 0.18,
      })),
    [],
  );
  const flowerData = useMemo(
    () => Array.from({ length: FLOWER_COUNT }, (_, i) => ({
      x: (rand(i + 41) - 0.5) * 8,
      y: rand(i + 51) * 8 - 2.5,
      z: (rand(i + 61) - 0.5) * 5,
      speed: 0.22 + rand(i + 71) * 0.24,
      phase: rand(i + 81) * Math.PI * 2,
      spin: (rand(i + 91) - 0.5) * 0.7,
      scale: 0.28 + rand(i + 101) * 0.16,
    })),
    [],
  );
  const heartData = useMemo(() => createSmallEffectData(HEART_COUNT, 121), []);
  const starData = useMemo(() => createSmallEffectData(STAR_COUNT, 221), []);
  const geometry = useMemo(createPetalGeometry, []);
  const flowerGeometry = useMemo(createFlowerGeometry, []);
  const heartGeometry = useMemo(createHeartGeometry, []);
  const starGeometry = useMemo(createStarGeometry, []);

  useFrame(({ clock }, delta) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    const d = Math.min(delta, 0.04);

    data.forEach((p, i) => {
      p.y -= p.speed * d;
      if (p.y < -4.8) {
        p.y = 5 + rand(i + Math.floor(t) * 13) * 2.4;
        p.x = (rand(i + Math.floor(t) + 1) - 0.5) * 10;
        p.z = (rand(i + Math.floor(t) + 2) - 0.5) * 8;
      }

      dummy.position.set(
        p.x + Math.sin(t * 0.58 + p.phase) * p.drift,
        p.y,
        p.z + Math.cos(t * 0.41 + p.phase) * p.swayZ,
      );
      dummy.rotation.set(
        t * 0.34 + p.phase,
        Math.sin(t * 0.47 + p.phase) * 0.5,
        Math.sin(t * 0.63 + p.phase) * 0.4 + p.spin,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;

    flowerData.forEach((flower, i) => {
      flower.y -= flower.speed * d;
      if (flower.y < -4.8) {
        flower.y = 5.5 + rand(i + Math.floor(t) * 17) * 2;
        flower.x = (rand(i + Math.floor(t) + 31) - 0.5) * 8;
        flower.z = (rand(i + Math.floor(t) + 41) - 0.5) * 5;
      }
      dummy.position.set(
        flower.x + Math.sin(t * 0.35 + flower.phase) * 0.28,
        flower.y,
        flower.z,
      );
      dummy.rotation.set(0, 0, t * 0.22 + flower.phase + flower.spin);
      dummy.scale.setScalar(flower.scale);
      dummy.updateMatrix();
      flowers.current.setMatrixAt(i, dummy.matrix);
    });
    flowers.current.instanceMatrix.needsUpdate = true;

    updateSmallEffects(hearts.current, heartData, dummy, t, d);
    updateSmallEffects(stars.current, starData, dummy, t, d);
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, undefined, COUNT]}>
        <meshStandardMaterial color="#a30d2b" roughness={0.45} metalness={0.04} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={flowers} args={[flowerGeometry, undefined, FLOWER_COUNT]}>
        <meshStandardMaterial color="#f4b9c8" roughness={0.55} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={hearts} args={[heartGeometry, undefined, HEART_COUNT]}>
        <meshStandardMaterial color="#ff829c" roughness={0.48} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={stars} args={[starGeometry, undefined, STAR_COUNT]}>
        <meshStandardMaterial color="#e7c881" roughness={0.42} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}
