"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Preload } from "@react-three/drei";

// This component is a placeholder for your 3D model.
// Once you have a public URL for your .glb file, replace the URL in the useGLTF hook.
const Model = () => {
  // IMPORTANT: Replace this URL with the public URL of your GLB file.
  const { scene } = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chatbot/model.gltf"
  );
  return <primitive object={scene} scale={1.5} position-y={-1} />;
};

const Scene = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        width: "100%",
        height: "100%",
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Suspense fallback={null}>
        <Model />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2.5}
        />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
