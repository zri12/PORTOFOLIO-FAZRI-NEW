# Scope

Applies to 3D, WebGL, hero visual, character reveal, and portfolio-specific visual components in this folder.

# Required Rules

- Use one primary active WebGL canvas where practical.
- Do not create a rotating F or FL object.
- Do not create a generic atom model.
- Do not use meaningless cubes or spheres as the main concept.
- Professional scene represents Digital Interface Architecture.
- Spider scene represents Digital Web Architecture.
- 3D must not block text, forms, navigation, or character interaction.
- Maximum DPR should be approximately 1.5 on desktop and 1 on mobile.
- Support reduced motion.
- Support a WebGL fallback or graceful failure.
- Pause offscreen work where practical.
- Dispose geometry, material, texture, renderer, controls, listeners, and RAF loops.
- Avoid large particle systems.
- Avoid multiple shadows and expensive post-processing unless justified.
- Use typed props.
- Keep business data outside 3D components.

# Validation

Check both modes, desktop and mobile framing, reduced motion, WebGL failure behavior, and interaction safety. See [../../../../docs/ANIMATION_3D.md](../../../../docs/ANIMATION_3D.md).
