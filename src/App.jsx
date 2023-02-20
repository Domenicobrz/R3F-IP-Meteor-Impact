import React, { Suspense, useEffect } from "react";
import Scene from "./Scene";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
} from "@react-three/drei";
import Meteor from "./Meteor";
import { NodeToyTick } from "@nodetoy/react-nodetoy";
import Beams from "./Beams";
import { EffectComposer, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";

function App() {
  const state = useThree();
  
  useEffect(() => {
    state.gl.toneMappingExposure = 5;
  }, [state.gl]);

  return (
    <>
      <Environment
        background={"only"}
        files={"assets/textures/envmap_blur.hdr"}
        ground={{ height: 100, radius: 300 }}
      />
      <Environment
        background={false}
        files={"assets/textures/envmap.hdr"}
      />

      <PerspectiveCamera makeDefault fov={33} position={[-0.07, 16.41, -24.1]} />
      <OrbitControls target={[0.02, 0.806, 0.427]} maxPolarAngle={Math.PI * 0.45} />

      <NodeToyTick />

      <Suspense fallback={null}>
        <Scene />
        <Meteor />
        <Beams />
      </Suspense>

      <EffectComposer>
        <Vignette eskil={false} offset={0.1} darkness={0.35} />
        <ChromaticAberration
          offset={[0.0035, 0.00035]}
          radialModulation={true}
          modulationOffset={0.4}
        />
      </EffectComposer>
    </>
  );
}

export default App;
