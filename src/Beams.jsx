import {
  MeshTransmissionMaterial,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export default function Beams() {
  const { nodes } = useGLTF("assets/models/beams.glb");

  const [beams_mask] = useTexture(["assets/textures/beams_mask.png"]);

  const beamsGeometries = [
    nodes.beam0.geometry,
    nodes.beam1.geometry,
    nodes.beam2.geometry,
    nodes.beam3.geometry,
    nodes.beam4.geometry,
    nodes.beam5.geometry,
    nodes.beam6.geometry,
  ];

  return (
    <>
      {beamsGeometries.map((geometry, i) => (
        <Beam
          geometry={geometry}
          beams_mask={beams_mask}
          beam_index={i}
          key={i}
        />
      ))}
    </>
  );
}

function Beam({ geometry, beams_mask, beam_index }) {
  const { vectors, initialPositionAttribute } = useMemo(() => {
    let vectors = [];

    const initialPositionAttribute = geometry.clone().getAttribute("position");

    for (let i = 0; i < initialPositionAttribute.count; i++) {
      let vector = new Vector3();
      vector.fromBufferAttribute(initialPositionAttribute, i);

      const idx = vectors.findIndex((vec, i) => {
        if (vec.x == vector.x && vec.y == vector.y && vec.z == vector.z)
          return true;
      });

      // only add the vector if it didn't already exist in the array
      if (idx === -1) vectors.push(vector);
    }

    vectors.sort((a, b) => a.y - b.y);

    return { vectors, initialPositionAttribute };
  }, []);

  useFrame((state) => {
    const clock = state.clock;
    const elapsed = clock.getElapsedTime();

    const transformVector = new Vector3(0, 0, 1);
    transformVector.applyAxisAngle(
      new Vector3(0, 1, 0),
      elapsed * 0.25 + beam_index * 17.87975
    );
    transformVector.multiplyScalar(3.25);

    const currentPositionAttribute = geometry.getAttribute("position");

    for (let i = 0; i < currentPositionAttribute.count; i++) {
      let vector = new Vector3();
      vector.fromBufferAttribute(initialPositionAttribute, i);

      const isTopVertex =
        ( vector.x == vectors[2].x &&
          vector.y == vectors[2].y &&
          vector.z == vectors[2].z) ||
        ( vector.x == vectors[3].x &&
          vector.y == vectors[3].y &&
          vector.z == vectors[3].z);

      // only add the vector if it didn't already exist in the array
      if (isTopVertex) {
        currentPositionAttribute.array[i * 3 + 0] =
          vector.x + transformVector.x;
        currentPositionAttribute.array[i * 3 + 1] =
          vector.y + transformVector.y;
        currentPositionAttribute.array[i * 3 + 2] =
          vector.z + transformVector.z;

        currentPositionAttribute.needsUpdate = true;
      }
    }
  });

  const isEven = beam_index % 2 === 0;
  const color = isEven ? "#fff7ed" : "#feedd7";
  const emissive = isEven ? [0.025, 0.011, 0.01] : [0.035, 0.0195, 0.01];

  return (
    <mesh geometry={geometry}>
      <MeshTransmissionMaterial
        alphaToCoverage={true}
        transparent={true}
        alphaMap={beams_mask}
        side={DoubleSide}
        envMapIntensity={0}
        roughness={0.2}
        ior={1.5}
        thickness={0.205}
        transmission={1}
        chromaticAberration={1}
        anisotropy={10}
        color={color}
        emissive={emissive}
      />
    </mesh>
  );
}
