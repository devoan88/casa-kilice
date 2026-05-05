"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Float } from "@react-three/drei";
import { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

// ── Types ──────────────────────────────────────────────────────────────────
type ProductDef = {
  slug: string;
  title: string;
  tagline: string;
  imageUrl: string;
  position: [number, number, number];
};

// ── Single floating product card ──────────────────────────────────────────
function ProductCard({
  def,
  onSelect,
}: {
  def: ProductDef;
  onSelect: (slug: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(def.imageUrl);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.4 + def.position[0]) * 0.06;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.45}>
      <group position={def.position}>
        {/* Product image plane */}
        <mesh
          ref={meshRef}
          castShadow
          onPointerEnter={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
          onClick={() => onSelect(def.slug)}
          scale={hovered ? 1.06 : 1}
        >
          <planeGeometry args={[1.8, 2.4]} />
          <meshStandardMaterial
            map={texture}
            transparent
            roughness={0.1}
            metalness={0.12}
          />
        </mesh>

        {/* Glow backing */}
        <mesh position={[0, 0, -0.06]} scale={hovered ? 1.2 : 1.0}>
          <planeGeometry args={[2.0, 2.6]} />
          <meshBasicMaterial
            color={hovered ? "#c8a040" : "#120e0a"}
            transparent
            opacity={hovered ? 0.28 : 0.10}
          />
        </mesh>

        {/* Point light blooms on hover */}
        {hovered && (
          <pointLight color="#e8c45c" intensity={2.5} distance={3.5} decay={2} position={[0, 0, 0.9]} />
        )}
      </group>
    </Float>
  );
}

// ── Mouse-reactive camera — event listener inside useEffect ──────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  // Register once, clean up properly
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Ambient dust ──────────────────────────────────────────────────────────
function DustParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geo } = useRef((() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geo: g };
  })()).current;

  useFrame((s) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = s.clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial color="#e8c45c" size={0.028} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

// ── Public component ──────────────────────────────────────────────────────
export type ProductScene3DProps = {
  products: ProductDef[];
  onSelect?: (slug: string) => void;
  className?: string;
};

export function ProductScene3D({ products, onSelect, className = "" }: ProductScene3DProps) {
  const handleSelect = (slug: string) => {
    if (onSelect) {
      onSelect(slug);
    } else {
      window.location.href = `/shop/${slug}`;
    }
  };

  return (
    <div className={`relative ${className}`} style={{ touchAction: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
        shadows
      >
        <Suspense fallback={null}>
          {/* Lights only — no Environment preset (avoids CDN HDR fetch) */}
          <ambientLight intensity={0.3} color="#1e1810" />
          <directionalLight position={[5, 8, 5]} intensity={0.8} color="#f5e8c8" castShadow />
          <pointLight position={[-4, -2, 2]} intensity={0.5} color="#d4a830" />
          <pointLight position={[4, 4, -1]} intensity={0.25} color="#ffffff" />
          <hemisphereLight
            color="#2a2018"
            groundColor="#050403"
            intensity={0.4}
          />

          {products.map((p) => (
            <ProductCard key={p.slug} def={p} onSelect={handleSelect} />
          ))}

          <DustParticles count={80} />
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
