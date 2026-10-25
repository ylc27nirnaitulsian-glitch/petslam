import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Animal } from '../../data/animals';

export type CombatActionType = 'idle' | 'jab' | 'maul' | 'takedown' | 'guard' | 'hit' | 'victory' | 'defeat' | 'tag_in';

interface ThreeArenaSimulationProps {
  playerBeast: Animal;
  opponentBeast: Animal;
  actionState: {
    playerMove: CombatActionType;
    opponentMove: CombatActionType;
  };
  screenShake: boolean;
  is2v2?: boolean;
  allyBeast?: Animal | null;
  opponentAlly?: Animal | null;
  playerHpPercent?: number;
  opponentHpPercent?: number;
  allyHpPercent?: number;
  opponentAllyHpPercent?: number;
  targetedOpponentIndex?: 0 | 1;
  onTapArena?: () => void;
  onSelectTarget?: (index: 0 | 1) => void;
}

interface FighterNode {
  id: string;
  group: THREE.Group;
  standeeMesh: THREE.Mesh;
  standeeMat: THREE.MeshBasicMaterial;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  auraRing: THREE.Mesh;
  pedestal: THREE.Mesh;
  hpFill: THREE.Mesh;
  targetReticle?: THREE.Group;
  origPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  isPlayerSide: boolean;
  colorHex: number;
  recoilOffset: number;
}

// Generates a guaranteed crisp, high-resolution 2.5D character card texture
function renderBeastCardTexture(
  animal: Animal,
  teamColorHex: string,
  isPlayerSide: boolean,
  canvas?: HTMLCanvasElement,
  existingTexture?: THREE.CanvasTexture
): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
  const c = canvas || document.createElement('canvas');
  c.width = 512;
  c.height = 640;
  const ctx = c.getContext('2d');

  const tex = existingTexture || new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const redraw = (loadedImg?: HTMLImageElement) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, 512, 640);

    // 1. Ornate Champion Card Shield Outer Glow
    ctx.shadowColor = teamColorHex;
    ctx.shadowBlur = 24;

    // 2. Rounded Champion Frame
    ctx.fillStyle = '#0F1524';
    ctx.beginPath();
    ctx.roundRect(24, 24, 464, 592, 40);
    ctx.fill();

    ctx.shadowBlur = 0; // reset shadow

    // 3. Golden Metallic Border
    ctx.lineWidth = 10;
    ctx.strokeStyle = isPlayerSide ? '#38BDF8' : '#EF4444';
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    // 4. Animal Photo (Guaranteed rendering with crop & rounded corners)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(36, 36, 440, 450, 28);
    ctx.clip();

    if (loadedImg && loadedImg.complete && loadedImg.naturalWidth > 0) {
      // Draw actual photo centered
      const aspect = loadedImg.naturalWidth / loadedImg.naturalHeight;
      let drawW = 440;
      let drawH = 440 / aspect;
      if (drawH < 450) {
        drawH = 450;
        drawW = 450 * aspect;
      }
      const offsetX = 36 - (drawW - 440) / 2;
      const offsetY = 36 - (drawH - 450) / 2;
      ctx.drawImage(loadedImg, offsetX, offsetY, drawW, drawH);
    } else {
      // High-contrast gradient fallback while image loads
      const grad = ctx.createLinearGradient(36, 36, 476, 486);
      grad.addColorStop(0, isPlayerSide ? '#1E293B' : '#3F171A');
      grad.addColorStop(1, '#0B0F19');
      ctx.fillStyle = grad;
      ctx.fillRect(36, 36, 440, 450);

      ctx.fillStyle = teamColorHex;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(animal.species, 256, 260);
    }
    ctx.restore();

    // Inner subtle vignette over image
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(36, 36, 440, 450, 28);
    ctx.clip();
    const vigGrad = ctx.createLinearGradient(0, 300, 0, 486);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(36, 36, 440, 450);
    ctx.restore();

    // 5. Beast Name Banner
    ctx.fillStyle = '#080C14';
    ctx.beginPath();
    ctx.roundRect(40, 496, 432, 104, 20);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    // Level Badge Star Circle
    ctx.fillStyle = isPlayerSide ? '#0284C7' : '#DC2626';
    ctx.beginPath();
    ctx.arc(88, 548, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FCD34D';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${animal.level || 8}`, 88, 548);

    // Name Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(animal.name.toUpperCase().slice(0, 11), 136, 536);

    // Species / Role subtitle
    ctx.fillStyle = teamColorHex;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${animal.species.slice(0, 18)} · ${animal.health} HP`, 136, 568);

    tex.needsUpdate = true;
  };

  // Preload real image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = animal.image;
  if (img.complete) {
    redraw(img);
  } else {
    redraw(); // draw placeholder immediately
    img.onload = () => redraw(img);
    img.onerror = () => redraw();
  }

  return { canvas: c, texture: tex };
}

export const ThreeArenaSimulation: React.FC<ThreeArenaSimulationProps> = ({
  playerBeast,
  opponentBeast,
  actionState,
  screenShake,
  is2v2 = false,
  allyBeast = null,
  opponentAlly = null,
  playerHpPercent = 100,
  opponentHpPercent = 100,
  allyHpPercent = 100,
  opponentAllyHpPercent = 100,
  targetedOpponentIndex = 0,
  onTapArena,
  onSelectTarget,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const actionStateRef = useRef(actionState);
  actionStateRef.current = actionState;

  const screenShakeRef = useRef(screenShake);
  screenShakeRef.current = screenShake;

  const playerHpRef = useRef(playerHpPercent);
  playerHpRef.current = playerHpPercent;

  const opponentHpRef = useRef(opponentHpPercent);
  opponentHpRef.current = opponentHpPercent;

  const allyHpRef = useRef(allyHpPercent);
  allyHpRef.current = allyHpPercent;

  const opponentAllyHpRef = useRef(opponentAllyHpPercent);
  opponentAllyHpRef.current = opponentAllyHpPercent;

  const targetedOpponentRef = useRef(targetedOpponentIndex);
  targetedOpponentRef.current = targetedOpponentIndex;

  const playerBeastRef = useRef(playerBeast);
  playerBeastRef.current = playerBeast;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 340;

    // 1. Dark Colosseum Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14); // Deep night stadium sky
    scene.fog = new THREE.FogExp2(0x080c14, 0.035);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 7.6, 9.4);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Majestic Dark Esports Stadium Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Main Overhead Stadium Spot
    const spotLight = new THREE.SpotLight(0xfffae6, 3.2);
    spotLight.position.set(0, 14, 2);
    spotLight.angle = Math.PI / 3.4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Dual Rim Lights (Cyan on Player Side, Crimson on Opponent Side)
    const cyanRim = new THREE.DirectionalLight(0x00e5ff, 2.2);
    cyanRim.position.set(-8, 5, -4);
    scene.add(cyanRim);

    const crimsonRim = new THREE.DirectionalLight(0xff2244, 2.5);
    crimsonRim.position.set(8, 5, -4);
    scene.add(crimsonRim);

    // 3. Dark Colosseum Octagonal Arena Floor
    const floorGeo = new THREE.CylinderGeometry(7.6, 8.0, 0.5, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111622, // Dark arena slate
      roughness: 0.75,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    scene.add(floor);

    // Outer Neon Ring (Cyan/Lime Inlay)
    const neonRingGeo = new THREE.RingGeometry(5.2, 5.38, 48);
    const neonRingMat = new THREE.MeshBasicMaterial({
      color: 0xccff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat);
    neonRing.rotation.x = -Math.PI / 2;
    neonRing.position.y = 0.015;
    scene.add(neonRing);

    // Inner Battle Circle
    const innerRingGeo = new THREE.RingGeometry(2.1, 2.22, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.018;
    scene.add(innerRing);

    // Colosseum Columns with Glowing Torches
    const columnGeo = new THREE.CylinderGeometry(0.28, 0.32, 4.2, 12);
    const columnMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.8 });
    const torchLights: THREE.PointLight[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.3;
      const x = Math.cos(angle) * 7.0;
      const z = Math.sin(angle) * 7.0;

      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(x, 2.1, z);
      scene.add(col);

      // Flame sphere
      const flameGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, 4.3, z);
      scene.add(flame);

      const torch = new THREE.PointLight(0xff7711, 1.4, 7);
      torch.position.set(x, 4.3, z);
      scene.add(torch);
      torchLights.push(torch);
    }

    // Dynamic Attack Slash Mesh
    const slashGeo = new THREE.TorusGeometry(1.2, 0.12, 8, 28, Math.PI * 0.95);
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const slashMesh = new THREE.Mesh(slashGeo, slashMat);
    slashMesh.position.set(0, 1.2, 0);
    scene.add(slashMesh);

    // Ground Shockwave Mesh
    const shockwaveGeo = new THREE.RingGeometry(0.3, 0.65, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xccff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = -Math.PI / 2;
    shockwaveMesh.position.y = 0.025;
    scene.add(shockwaveMesh);

    // Spark Particles
    const sparkCount = 45;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities: THREE.Vector3[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -10;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3());
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffdd33,
      size: 0.22,
      transparent: true,
      opacity: 0.95,
    });
    const sparkMesh = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkMesh);

    let sparkTimer = 0;
    const triggerSparksAt = (x: number, y: number, z: number, color = 0xffdd33) => {
      sparkMat.color.setHex(color);
      sparkTimer = 0.45;
      const pos = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
        sparkVelocities[i].set(
          (Math.random() - 0.5) * 6,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 6
        );
      }
      sparkGeo.attributes.position.needsUpdate = true;
    };

    let shockwaveTimer = 0;
    const triggerShockwaveAt = (x: number, z: number) => {
      shockwaveMesh.position.set(x, 0.025, z);
      shockwaveMesh.scale.setScalar(0.4);
      shockwaveMat.opacity = 0.95;
      shockwaveTimer = 0.5;
    };

    // 4. Create High-Fidelity Guaranteed Beast Standee
    const createFighterNode = (
      animal: Animal,
      isPlayerSide: boolean,
      spawnX: number,
      spawnZ: number,
      accentColor: number,
      teamColorHex: string
    ): FighterNode => {
      const group = new THREE.Group();

      // Shadow Decal on Arena Floor
      const shadowGeo = new THREE.CircleGeometry(0.95, 24);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.65,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.02;
      group.add(shadowMesh);

      // 3D Sculpted Team Pedestal Base
      const pedGeo = new THREE.CylinderGeometry(0.95, 1.05, 0.24, 28);
      const pedMat = new THREE.MeshStandardMaterial({
        color: isPlayerSide ? 0x0f2744 : 0x451216,
        metalness: 0.5,
        roughness: 0.35,
      });
      const pedestal = new THREE.Mesh(pedGeo, pedMat);
      pedestal.position.y = 0.12;
      pedestal.castShadow = true;
      group.add(pedestal);

      // Golden Bevel Ring on Pedestal
      const pedRimGeo = new THREE.TorusGeometry(0.98, 0.06, 8, 28);
      const pedRimMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const pedRim = new THREE.Mesh(pedRimGeo, pedRimMat);
      pedRim.rotation.x = Math.PI / 2;
      pedRim.position.y = 0.24;
      group.add(pedRim);

      // Ground Neon Aura Ring
      const auraGeo = new THREE.RingGeometry(1.05, 1.22, 32);
      const auraMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const auraRing = new THREE.Mesh(auraGeo, auraMat);
      auraRing.rotation.x = -Math.PI / 2;
      auraRing.position.y = 0.03;
      group.add(auraRing);

      // Guaranteed Crisp Photo Standee Billboard
      const { canvas, texture } = renderBeastCardTexture(animal, teamColorHex, isPlayerSide);
      const standeeGeo = new THREE.PlaneGeometry(1.7, 2.15);
      const standeeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const standeeMesh = new THREE.Mesh(standeeGeo, standeeMat);
      standeeMesh.position.y = 1.35;
      standeeMesh.castShadow = true;
      group.add(standeeMesh);

      // Overhead 3D HP Bar
      const hpBgGeo = new THREE.PlaneGeometry(1.35, 0.16);
      const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x05070a, side: THREE.DoubleSide });
      const hpBg = new THREE.Mesh(hpBgGeo, hpBgMat);
      hpBg.position.set(0, 2.65, 0);

      const hpFillGeo = new THREE.PlaneGeometry(1.28, 0.11);
      const hpFillMat = new THREE.MeshBasicMaterial({
        color: isPlayerSide ? 0xccff00 : 0xff3b30,
        side: THREE.DoubleSide,
      });
      const hpFill = new THREE.Mesh(hpFillGeo, hpFillMat);
      hpFill.position.set(0, 0, 0.01);
      hpBg.add(hpFill);
      group.add(hpBg);

      // 2v2 Target Crosshairs Reticle (for enemy beasts)
      let targetReticle: THREE.Group | undefined;
      if (!isPlayerSide) {
        targetReticle = new THREE.Group();
        targetReticle.position.set(0, 3.05, 0);

        const retRingGeo = new THREE.RingGeometry(0.35, 0.45, 24);
        const retRingMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });
        const retRing = new THREE.Mesh(retRingGeo, retRingMat);
        targetReticle.add(retRing);

        const arrowGeo = new THREE.ConeGeometry(0.12, 0.28, 3);
        const arrow1 = new THREE.Mesh(arrowGeo, retRingMat);
        arrow1.position.y = 0.55;
        arrow1.rotation.z = Math.PI;
        targetReticle.add(arrow1);

        targetReticle.visible = false;
        group.add(targetReticle);
      }

      group.position.set(spawnX, 0, spawnZ);
      scene.add(group);

      return {
        id: animal.id,
        group,
        standeeMesh,
        standeeMat,
        canvas,
        texture,
        auraRing,
        pedestal,
        hpFill,
        targetReticle,
        origPos: new THREE.Vector3(spawnX, 0, spawnZ),
        targetPos: new THREE.Vector3(spawnX, 0, spawnZ),
        isPlayerSide,
        colorHex: accentColor,
        recoilOffset: 0,
      };
    };

    // Instantiate Fighters
    const fighters: FighterNode[] = [];

    // Player 1 (Bottom Left)
    const playerNode = createFighterNode(playerBeast, true, -2.1, 1.4, 0x00e5ff, '#00E5FF');
    fighters.push(playerNode);

    // Opponent 1 (Top Right)
    const opponentNode = createFighterNode(opponentBeast, false, 2.1, -1.4, 0xff3b30, '#FF3B30');
    fighters.push(opponentNode);

    // 2v2 Tag Team: Player Ally & Opponent Ally (4 Full Beasts on Screen)
    let allyNode: FighterNode | null = null;
    let oppAllyNode: FighterNode | null = null;

    if (is2v2 && allyBeast && opponentAlly) {
      allyNode = createFighterNode(allyBeast, true, -3.4, -0.6, 0xccff00, '#CCFF00');
      fighters.push(allyNode);

      oppAllyNode = createFighterNode(opponentAlly, false, 3.4, 0.6, 0xf97316, '#F97316');
      fighters.push(oppAllyNode);
    }

    // Tap-to-select target in 2v2
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (is2v2 && onSelectTarget && oppAllyNode) {
        const intersects = raycaster.intersectObjects([opponentNode.group, oppAllyNode.group], true);
        if (intersects.length > 0) {
          let obj: THREE.Object3D | null = intersects[0].object;
          while (obj && obj.parent !== scene) {
            if (obj === oppAllyNode.group) {
              onSelectTarget(1);
              return;
            }
            if (obj === opponentNode.group) {
              onSelectTarget(0);
              return;
            }
            obj = obj.parent;
          }
        }
      }

      if (onTapArena) {
        onTapArena();
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 5. High-Energy Animation & Physics Loop
    let animId: number;
    const clock = new THREE.Clock();

    let attackProgress = 0;
    let activeAttackType: CombatActionType = 'idle';

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Read dynamic state refs
      const currentAction = actionStateRef.current;
      const isShaking = screenShakeRef.current;
      const pBeast = playerBeastRef.current;
      const targetedOpp = targetedOpponentRef.current;

      // Update Player Beast Card Texture if swapped in deck
      if (playerNode.id !== pBeast.id) {
        playerNode.id = pBeast.id;
        renderBeastCardTexture(pBeast, '#00E5FF', true, playerNode.canvas, playerNode.texture);
        triggerShockwaveAt(playerNode.origPos.x, playerNode.origPos.z);
        triggerSparksAt(playerNode.origPos.x, 1.2, playerNode.origPos.z, 0x00e5ff);
      }

      // Torch flicker
      torchLights.forEach((light, i) => {
        light.intensity = 1.3 + Math.sin(elapsed * 7.5 + i * 1.5) * 0.35;
      });

      // Spark Physics
      if (sparkTimer > 0) {
        sparkTimer -= delta;
        const pos = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          pos[i * 3] += sparkVelocities[i].x * delta;
          pos[i * 3 + 1] += sparkVelocities[i].y * delta;
          pos[i * 3 + 2] += sparkVelocities[i].z * delta;
          sparkVelocities[i].y -= 9.8 * delta;
        }
        sparkGeo.attributes.position.needsUpdate = true;
      }

      // Shockwave Physics
      if (shockwaveTimer > 0) {
        shockwaveTimer -= delta;
        shockwaveMesh.scale.addScalar(delta * 7.5);
        shockwaveMat.opacity = Math.max(0, shockwaveTimer * 2.0);
      } else {
        shockwaveMat.opacity = 0;
      }

      // Update 3D HP Bars
      playerNode.hpFill.scale.x = Math.max(0.001, playerHpRef.current / 100);
      playerNode.hpFill.position.x = -0.64 * (1 - playerNode.hpFill.scale.x);

      opponentNode.hpFill.scale.x = Math.max(0.001, opponentHpRef.current / 100);
      opponentNode.hpFill.position.x = -0.64 * (1 - opponentNode.hpFill.scale.x);

      if (allyNode) {
        allyNode.hpFill.scale.x = Math.max(0.001, allyHpRef.current / 100);
        allyNode.hpFill.position.x = -0.64 * (1 - allyNode.hpFill.scale.x);
      }

      if (oppAllyNode) {
        oppAllyNode.hpFill.scale.x = Math.max(0.001, opponentAllyHpRef.current / 100);
        oppAllyNode.hpFill.position.x = -0.64 * (1 - oppAllyNode.hpFill.scale.x);
      }

      // 2v2 Target Crosshairs
      if (is2v2 && oppAllyNode) {
        if (targetedOpp === 1) {
          if (oppAllyNode.targetReticle) {
            oppAllyNode.targetReticle.visible = true;
            oppAllyNode.targetReticle.rotation.z += delta * 3.5;
            oppAllyNode.targetReticle.scale.setScalar(1.0 + Math.sin(elapsed * 8) * 0.12);
          }
          if (opponentNode.targetReticle) opponentNode.targetReticle.visible = false;
        } else {
          if (opponentNode.targetReticle) {
            opponentNode.targetReticle.visible = true;
            opponentNode.targetReticle.rotation.z += delta * 3.5;
            opponentNode.targetReticle.scale.setScalar(1.0 + Math.sin(elapsed * 8) * 0.12);
          }
          if (oppAllyNode.targetReticle) oppAllyNode.targetReticle.visible = false;
        }
      }

      // Target node for player's current attacks
      const currentTargetNode = (is2v2 && targetedOpp === 1 && oppAllyNode) ? oppAllyNode : opponentNode;

      // ------------------------------------------------------------------
      // COMBAT MOVEMENT KINEMATICS (PHYSICAL CHARGING & LUNGING ATTACKS)
      // ------------------------------------------------------------------
      const pMove = currentAction.playerMove;
      const pGroup = playerNode.group;

      if (pMove !== 'idle' && activeAttackType === 'idle') {
        activeAttackType = pMove;
        attackProgress = 0;
      }

      if (activeAttackType !== 'idle') {
        attackProgress += delta * 2.8;

        if (activeAttackType === 'jab') {
          // QUICK STRIKE: Sprints across the field to strike, then springs back
          if (attackProgress < 0.5) {
            const t = attackProgress / 0.5;
            const chargePos = new THREE.Vector3().lerpVectors(
              playerNode.origPos,
              currentTargetNode.group.position,
              0.8 * t
            );
            pGroup.position.copy(chargePos);
            pGroup.position.y = Math.sin(t * Math.PI) * 0.4;
          } else if (attackProgress < 0.7) {
            // Impact
            slashMesh.material.opacity = 0.95;
            const impactX = (pGroup.position.x + currentTargetNode.group.position.x) / 2;
            const impactZ = (pGroup.position.z + currentTargetNode.group.position.z) / 2;
            slashMesh.position.set(impactX, 1.2, impactZ);
            slashMesh.rotation.z += 0.4;
            triggerSparksAt(impactX, 1.2, impactZ, 0x00e5ff);

            currentTargetNode.recoilOffset = THREE.MathUtils.lerp(currentTargetNode.recoilOffset, 1.1, 0.4);
          } else if (attackProgress < 1.0) {
            const t = (attackProgress - 0.7) / 0.3;
            pGroup.position.lerpVectors(pGroup.position, playerNode.origPos, t);
            pGroup.position.y = Math.sin(t * Math.PI) * 0.3;
            slashMesh.material.opacity = Math.max(0, slashMesh.material.opacity - delta * 4);
          } else {
            pGroup.position.copy(playerNode.origPos);
            pGroup.position.y = 0;
            activeAttackType = 'idle';
          }
        } else if (activeAttackType === 'maul' || activeAttackType === 'takedown') {
          // BEAST SLAM: High airborne parabolic arc leap and ground-pound slam!
          if (attackProgress < 0.5) {
            const t = attackProgress / 0.5;
            const leapPos = new THREE.Vector3().lerpVectors(
              playerNode.origPos,
              currentTargetNode.group.position,
              0.85 * t
            );
            pGroup.position.copy(leapPos);
            pGroup.position.y = Math.sin(t * Math.PI) * 2.4;
          } else if (attackProgress < 0.65) {
            // Slam impact
            pGroup.position.y = 0.05;
            triggerShockwaveAt(pGroup.position.x, pGroup.position.z);
            triggerSparksAt(pGroup.position.x, 1.0, pGroup.position.z, 0xccff00);
            currentTargetNode.recoilOffset = THREE.MathUtils.lerp(currentTargetNode.recoilOffset, 1.4, 0.5);
          } else if (attackProgress < 1.0) {
            const t = (attackProgress - 0.65) / 0.35;
            pGroup.position.lerpVectors(pGroup.position, playerNode.origPos, t);
            pGroup.position.y = Math.sin(t * Math.PI) * 0.4;
          } else {
            pGroup.position.copy(playerNode.origPos);
            pGroup.position.y = 0;
            activeAttackType = 'idle';
          }
        } else {
          pGroup.position.lerp(playerNode.origPos, 0.15);
          activeAttackType = 'idle';
        }
      } else {
        // Idle breathing bob
        pGroup.position.lerp(playerNode.origPos, 0.1);
        pGroup.position.y = Math.sin(elapsed * 4.2) * 0.07;
      }

      // Opponent Recoil Decay
      if (currentTargetNode.recoilOffset > 0.01) {
        currentTargetNode.recoilOffset = THREE.MathUtils.lerp(currentTargetNode.recoilOffset, 0, delta * 4);
        const recoilDir = currentTargetNode.group.position.clone().sub(playerNode.origPos).normalize();
        currentTargetNode.group.position.copy(currentTargetNode.origPos).addScaledVector(recoilDir, currentTargetNode.recoilOffset);
        currentTargetNode.standeeMesh.rotation.z = currentTargetNode.recoilOffset * -0.3;
      } else {
        currentTargetNode.group.position.lerp(currentTargetNode.origPos, 0.1);
        currentTargetNode.standeeMesh.rotation.z = 0;
      }

      // Opponent attacks
      const oMove = currentAction.opponentMove;
      const oGroup = opponentNode.group;

      if (oMove === 'jab' || oMove === 'maul') {
        const oChargePos = new THREE.Vector3().lerpVectors(opponentNode.origPos, playerNode.origPos, 0.7);
        oGroup.position.lerp(oChargePos, 0.28);
        oGroup.position.y = 0.3;
        triggerSparksAt(oChargePos.x - 0.3, 1.1, oChargePos.z, 0xff2244);
      } else if (oMove === 'hit') {
        const oRecoil = opponentNode.origPos.clone().add(new THREE.Vector3(0.9, 0, -0.4));
        oGroup.position.lerp(oRecoil, 0.3);
      } else {
        oGroup.position.lerp(opponentNode.origPos, 0.1);
        oGroup.position.y = Math.sin(elapsed * 4.2 + 1.2) * 0.07;
      }

      // Ally & Opponent Ally Idle Movement in 2v2
      if (allyNode) {
        allyNode.group.position.lerp(allyNode.origPos, 0.1);
        allyNode.group.position.y = Math.sin(elapsed * 4.0 + 0.6) * 0.06;
        allyNode.auraRing.rotation.z += delta * 1.2;
      }

      if (oppAllyNode) {
        oppAllyNode.group.position.lerp(oppAllyNode.origPos, 0.1);
        oppAllyNode.group.position.y = Math.sin(elapsed * 4.0 + 1.8) * 0.06;
        oppAllyNode.auraRing.rotation.z -= delta * 1.2;
      }

      // Rotate ground aura rings
      playerNode.auraRing.rotation.z += delta * 1.5;
      opponentNode.auraRing.rotation.z -= delta * 1.5;

      // Keep Billboards and HP bars facing camera
      fighters.forEach((f) => {
        f.standeeMesh.lookAt(camera.position.x, f.standeeMesh.position.y, camera.position.z);
        const hpPlate = f.group.children[f.group.children.length - 2];
        if (hpPlate) hpPlate.lookAt(camera.position);
      });

      // Camera Tracking & Shake
      if (isShaking) {
        camera.position.x = (Math.random() - 0.5) * 0.45;
        camera.position.y = 7.6 + (Math.random() - 0.5) * 0.45;
      } else {
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(elapsed * 0.3) * 0.3, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 7.6, 0.05);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      neonRingGeo.dispose();
      neonRingMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      slashGeo.dispose();
      slashMat.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
    };
  }, [is2v2, allyBeast, opponentAlly]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[290px] sm:min-h-[360px] overflow-hidden rounded-2xl bg-[#080C14] cursor-crosshair select-none border border-white/10 shadow-2xl"
    />
  );
};
