// src/react-three-fiber.d.ts
import "react";
import {
  Mesh,
  Group,
  Object3D,
  PerspectiveCamera,
  OrthographicCamera,
  Camera,
  Light,
  DirectionalLight,
  PointLight,
  SpotLight,
  AmbientLight,
  HemisphereLight,
  Line,
  BufferGeometry,
  Material,
  MeshStandardMaterial,
  Color,
} from "three";
import { Object3DNode } from "@react-three/fiber";
import THREE from "three";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      // Core Three.js objects
      group: Object3DNode<Group, typeof Group>;
      mesh: Object3DNode<Mesh, typeof Mesh>;
      object3D: Object3DNode<Object3D, typeof Object3D>;

      // Cameras
      perspectiveCamera: Object3DNode<
        PerspectiveCamera,
        typeof PerspectiveCamera
      >;
      orthographicCamera: Object3DNode<
        OrthographicCamera,
        typeof OrthographicCamera
      >;
      camera: Object3DNode<Camera, typeof Camera>;

      // Lights
      light: Object3DNode<Light, typeof Light>;
      directionalLight: Object3DNode<DirectionalLight, typeof DirectionalLight>;
      pointLight: Object3DNode<PointLight, typeof PointLight>;
      spotLight: Object3DNode<SpotLight, typeof SpotLight>;
      ambientLight: Object3DNode<AmbientLight, typeof AmbientLight>;
      hemisphereLight: Object3DNode<HemisphereLight, typeof HemisphereLight>;

      // Geometry / helpers
      threeLine: Object3DNode<
        Line<BufferGeometry, Material | Material[]>,
        typeof Line
      >; // renamed to avoid SVG conflict

      // Materials
      meshStandardMaterial: Object3DNode<
        MeshStandardMaterial,
        typeof MeshStandardMaterial
      >;

      // Optional: extend with more Three.js objects if needed
      boxHelper: Object3DNode<THREE.BoxHelper, typeof THREE.BoxHelper>;
      axesHelper: Object3DNode<THREE.AxesHelper, typeof THREE.AxesHelper>;
    }
  }
}
