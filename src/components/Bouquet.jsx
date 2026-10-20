import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const fract = (n) => n - Math.floor(n);
const rnd = (n) => fract(Math.sin(n * 127.1 + 78.233) * 43758.5453123);
const rosePalette = ['#8f0619', '#b7091f', '#c90a23', '#da152c', '#f22433', '#a80a1b'];

function createCurvedPetalGeometry() {
  const nx = 10;
  const ny = 14;
  const positions = [];
  const indices = [];
  const uvs = [];

  for (let iy = 0; iy <= ny; iy += 1) {
    const t = iy / ny;
    const width = Math.pow(Math.sin(t * Math.PI), 0.74) * (0.86 + 0.18 * t);
    for (let ix = 0; ix <= nx; ix += 1) {
      const u = ix / nx * 2 - 1;
      const x = u * width * 0.52;
      const y = t;
      const z =
        0.13 * (1 - u * u) * Math.sin(t * Math.PI) +
        0.22 * u * u * t * t -
        0.18 * t * t * t +
        0.05 * Math.sin(u * 6.4) * t * t +
        0.03 * Math.cos(t * Math.PI * 2.0) * (1 - Math.abs(u));
      positions.push(x, y, z);
      uvs.push(ix / nx, t);
    }
  }

  for (let y = 0; y < ny; y += 1) {
    for (let x = 0; x < nx; x += 1) {
      const k = y * (nx + 1) + x;
      indices.push(k, k + 1, k + nx + 1, k + 1, k + nx + 2, k + nx + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function mergeGeometry(source, transforms, colors) {
  const srcPos = source.attributes.position;
  const srcNormal = source.attributes.normal;
  const srcIndex = source.index;
  const positions = [];
  const normals = [];
  const colorArray = [];
  const indices = [];
  const vec = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const localColor = new THREE.Color();

  transforms.forEach((matrix, idx) => {
    const base = positions.length / 3;
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
    localColor.copy(colors[idx]);

    for (let i = 0; i < srcPos.count; i += 1) {
      vec.fromBufferAttribute(srcPos, i).applyMatrix4(matrix);
      nrm.fromBufferAttribute(srcNormal, i).applyMatrix3(normalMatrix).normalize();
      positions.push(vec.x, vec.y, vec.z);
      normals.push(nrm.x, nrm.y, nrm.z);
      const shade = 0.78 + 0.22 * srcPos.getY(i);
      colorArray.push(localColor.r * shade, localColor.g * shade, localColor.b * shade);
    }

    for (let i = 0; i < srcIndex.count; i += 1) {
      indices.push(base + srcIndex.getX(i));
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function createRoseGeometry() {
  const petal = createCurvedPetalGeometry();
  const transforms = [];
  const colors = [];

  const layers = [
    { count: 5, radius: 0.03, scale: 0.13, tilt: -0.26, height: 0.14 },
    { count: 7, radius: 0.075, scale: 0.17, tilt: -0.48, height: 0.11 },
    { count: 10, radius: 0.13, scale: 0.22, tilt: -0.68, height: 0.06 },
    { count: 14, radius: 0.19, scale: 0.28, tilt: -0.88, height: 0.00 },
    { count: 17, radius: 0.245, scale: 0.31, tilt: -1.06, height: -0.04 },
  ];

  layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i += 1) {
      const angle = (i / layer.count) * Math.PI * 2 + layerIndex * 0.3;
      const matrix = new THREE.Matrix4();
      const scale = layer.scale * (0.9 + rnd(i + layerIndex * 13.7) * 0.18);
      const position = new THREE.Vector3(
        Math.cos(angle) * layer.radius,
        layer.height + (rnd(i + 91 + layerIndex * 11) - 0.5) * 0.018,
        Math.sin(angle) * layer.radius,
      );

      const quaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          layer.tilt + (rnd(i + 7.1 + layerIndex * 2.2) - 0.5) * 0.12,
          (rnd(i + 14.7 + layerIndex * 8) - 0.5) * 0.26,
          angle - Math.PI / 2 + (rnd(i + 22.3 + layerIndex * 4) - 0.5) * 0.14,
          'ZYX',
        ),
      );

      matrix.compose(position, quaternion, new THREE.Vector3(scale, scale * 0.92, scale));
      transforms.push(matrix);
      colors.push(new THREE.Color(rosePalette[(i + layerIndex * 2) % rosePalette.length]));
    }
  });

  const budTransforms = [];
  const budColors = [];
  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2;
    const m = new THREE.Matrix4();
    const position = new THREE.Vector3(Math.cos(angle) * 0.025, 0.14, Math.sin(angle) * 0.025);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.03, 0.08 * Math.sin(angle), angle, 'ZYX'));
    m.compose(position, q, new THREE.Vector3(0.1, 0.1, 0.1));
    budTransforms.push(m);
    budColors.push(new THREE.Color('#6b0012'));
  }

  const merged = mergeGeometry(petal, [...transforms, ...budTransforms], [...colors, ...budColors]);
  petal.dispose();
  return merged;
}

function createRibbonStripGeometry(length = 1.2, width = 0.1, segments = 24, phase = 0) {
  const geometry = new THREE.PlaneGeometry(width, length, 1, segments);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i);
    const t = (y + length / 2) / length;
    pos.setZ(i, Math.sin(t * Math.PI * 2 + phase) * 0.06);
    pos.setX(i, pos.getX(i) + Math.sin(t * Math.PI * 1.2 + phase * 0.5) * 0.03);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createRosePositions() {
  const positions = [];
  let id = 0;
  const rings = 11;

  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings;
    const phi = t * Math.PI * 0.56;
    const radius = Math.sin(phi);
    const count = ring === 0 ? 1 : Math.round(10 + ring * 7.2);

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.33 + (rnd(id + 30) - 0.5) * 0.08;
      const x = Math.cos(angle) * radius * 2.0 * (0.98 + (rnd(id + 13) - 0.5) * 0.08);
      const z = Math.sin(angle) * radius * 1.55 * (0.96 + (rnd(id + 15) - 0.5) * 0.12);
      const y = 1.18 + Math.cos(phi) * 0.95 + (rnd(id + 17) - 0.5) * 0.08;
      const normal = new THREE.Vector3(x * 0.58, 0.64 + Math.cos(phi) * 0.72, z * 0.52).normalize();
      positions.push({
        position: [x, y, z],
        normal,
        scale: 0.74 + rnd(id + 21) * 0.22,
        yaw: rnd(id + 27) * Math.PI * 2,
      });
      id += 1;
    }
  }

  return positions.filter((item) => item.position[1] > 0.58 || Math.abs(item.position[2]) < 1.36);
}

function RoseInstances() {
  const geometry = useMemo(createRoseGeometry, []);
  const rosePositions = useMemo(createRosePositions, []);
  const ref = useRef();

  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    const obj = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    rosePositions.forEach((rose, i) => {
      obj.position.set(...rose.position);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, rose.normal);
      obj.quaternion.copy(quat).multiply(new THREE.Quaternion().setFromAxisAngle(rose.normal, rose.yaw));
      obj.scale.setScalar(rose.scale);
      obj.updateMatrix();
      ref.current.setMatrixAt(i, obj.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [rosePositions]);

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, rosePositions.length]} frustumCulled={false}>
      <meshStandardMaterial vertexColors roughness={0.76} metalness={0.05} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function BabyBreath() {
  const count = 112;
  const points = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const angle = rnd(i + 2) * Math.PI * 2;
      const radius = 1.72 + rnd(i + 8) * 0.4;
      const y = 1.02 + rnd(i + 10) * 0.92;
      const inward = 0.08 + rnd(i + 12) * 0.14;
      return {
        x: Math.cos(angle) * radius,
        y,
        z: Math.sin(angle) * radius * 1.2,
        s: 0.022 + rnd(i + 14) * 0.014,
        stemY: 0.82 + inward,
      };
    }),
    [],
  );

  return (
    <group>
      {points.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]}>
          <mesh position={[0, -(p.y - p.stemY) / 2, 0]}>
            <cylinderGeometry args={[0.0035, 0.0045, p.y - p.stemY, 5]} />
            <meshStandardMaterial color="#71896e" roughness={1} />
          </mesh>
          <mesh>
            <sphereGeometry args={[p.s, 8, 8]} />
            <meshPhysicalMaterial color="#fff8f0" roughness={0.42} clearcoat={0.22} />
          </mesh>
          <mesh position={[p.s * 0.8, p.s * 0.2, 0]}>
            <sphereGeometry args={[p.s * 0.82, 8, 8]} />
            <meshPhysicalMaterial color="#fff6ee" roughness={0.42} clearcoat={0.18} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PaperLayer({ index, total, inner = false }) {
  const geometry = useMemo(() => {
    const width = inner ? 2.2 : 2.85;
    const height = inner ? 1.6 : 2.0;
    const cornerRadius = inner ? 0.3 : 0.38;
    const geo = new THREE.PlaneGeometry(width, height, 20, 20);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const rawX = pos.getX(i);
      const y = pos.getY(i);
      const absY = Math.abs(y);
      const cornerStart = height / 2 - cornerRadius;
      const cornerDepth = Math.max(0, absY - cornerStart);
      const roundedHalfWidth = width / 2 - cornerRadius + Math.sqrt(
        Math.max(0, cornerRadius * cornerRadius - cornerDepth * cornerDepth),
      );
      const x = (rawX / (width / 2)) * roundedHalfWidth;
      const bend = Math.pow((y + height / 2) / height, 1.15);
      pos.setZ(i, Math.abs(x) * 0.075 + bend * (inner ? 0.34 : 0.52));
      pos.setX(i, x + Math.sin((y + index * 0.25) * 2.1) * 0.035);
    }
    geo.computeVertexNormals();
    return geo;
  }, [index, inner]);

  const angle = (index / total) * Math.PI * 2;
  const radius = inner ? 1.72 : 2.08;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius * 1.05;
  const y = inner ? -0.18 : 0;
  const rotationY = -angle + Math.PI / 2;
  const rotationZ = Math.cos(angle * 2) * 0.1 + (inner ? 0.08 : 0.16);

  return (
    <group position={[x, y, z]} rotation={[0.05, rotationY, rotationZ]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color={inner ? '#dda7b0' : '#cc8794'}
          roughness={0.72}
          clearcoat={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function CollarBand() {
  return (
    <group position={[0, 0.28, 0]}>
      <mesh>
        <cylinderGeometry args={[0.58, 0.72, 0.42, 48, 1, true]} />
        <meshPhysicalMaterial color="#f5ccd2" roughness={0.42} transmission={0.05} thickness={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[0.66, 0.02, 12, 80]} />
        <meshStandardMaterial color="#d3a173" roughness={0.45} />
      </mesh>
    </group>
  );
}

function Paper() {
  return (
    <group>
      <mesh position={[0, 1.02, 0]} scale={[1.97, 0.72, 1.48]}>
        <sphereGeometry args={[1, 40, 22, 0, Math.PI * 2, 0, Math.PI / 2.14]} />
        <meshStandardMaterial color="#203322" roughness={1} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <PaperLayer key={`outer-${i}`} index={i} total={10} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <PaperLayer key={`inner-${i}`} index={i} total={8} inner />
      ))}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.72, 1.6, 32, 1, true]} />
        <meshPhysicalMaterial color="#c98592" roughness={0.72} clearcoat={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.54, 0]}>
        <cylinderGeometry args={[0.26, 0.38, 0.8, 20]} />
        <meshStandardMaterial color="#f3c7cf" roughness={0.48} />
      </mesh>
      <CollarBand />
    </group>
  );
}

function Ribbon() {
  const strips = useMemo(
    () => [
      createRibbonStripGeometry(1.35, 0.11, 32, 0),
      createRibbonStripGeometry(1.1, 0.1, 28, 0.8),
      createRibbonStripGeometry(1.28, 0.095, 28, 1.4),
      createRibbonStripGeometry(1.05, 0.08, 24, 2.1),
    ],
    [],
  );

  return (
    <group position={[0, -0.15, 0.66]}>
      <mesh position={[-0.18, 0.0, 0]} rotation={[0.2, 0.2, 0.8]} scale={[1, 1.05, 1]}>
        <torusGeometry args={[0.21, 0.08, 12, 32, Math.PI * 1.9]} />
        <meshPhysicalMaterial color="#f2b3c2" roughness={0.32} clearcoat={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.18, 0.0, 0]} rotation={[0.2, -0.2, -0.8]} scale={[1, 1.05, 1]}>
        <torusGeometry args={[0.21, 0.08, 12, 32, Math.PI * 1.9]} />
        <meshPhysicalMaterial color="#f9d0d7" roughness={0.3} clearcoat={0.34} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.02, 0.01]}>
        <sphereGeometry args={[0.11, 18, 14]} />
        <meshStandardMaterial color="#f5c7d0" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.026, 10, 72]} />
        <meshStandardMaterial color="#e1a6b2" roughness={0.36} />
      </mesh>
      {strips.map((geo, i) => (
        <mesh
          key={i}
          geometry={geo}
          position={[-0.14 + i * 0.095, -0.56 - i * 0.06, -0.04 + i * 0.02]}
          rotation={[0.08 * i, 0.08 * (i - 1), (i - 1.3) * 0.12 + Math.PI]}
        >
          <meshPhysicalMaterial
            color={i % 2 === 0 ? '#f7cad2' : '#df9dac'}
            roughness={0.34}
            clearcoat={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Bouquet() {
  return (
    <group position={[0, -0.35, 0]}>
      <Paper />
      <RoseInstances />
      <BabyBreath />
      <Ribbon />
    </group>
  );
}
