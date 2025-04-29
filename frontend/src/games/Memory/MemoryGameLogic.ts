import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    DirectionalLight,
    ShadowGenerator,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Color4,
    GlowLayer,
    Texture,
    ParticleSystem,
    Mesh
  } from "@babylonjs/core";
  
  export function createPongScene(canvas: HTMLCanvasElement): Engine {
    const scoreBoard = document.getElementById("scoreBoard");
    const announce = document.getElementById("announce");
  
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1.0);
  
    function resizeCanvas() {
      if (canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        engine.resize();
      }
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  
    const camera = new ArcRotateCamera("camera", 0, Math.PI / 4.5, 12, Vector3.Zero(), scene);
    camera.setPosition(new Vector3(0, 8, -6));
    camera.attachControl(canvas, true);
    camera.inputs.clear();
  
    new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
    const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -3, -1), scene);
    dirLight.position = new Vector3(0, 6, -4);
    dirLight.intensity = 0.6;
  
    const shadowGen = new ShadowGenerator(1024, dirLight);
    shadowGen.useExponentialShadowMap = true;
  
    const glow = new GlowLayer("glow", scene);
    glow.intensity = 0.6;
  
    const paddleMat1 = new StandardMaterial("paddleMat1", scene);
    paddleMat1.diffuseColor = new Color3(0.6, 0.2, 0.8);
    paddleMat1.emissiveColor = paddleMat1.diffuseColor;
  
    const paddleMat2 = new StandardMaterial("paddleMat2", scene);
    paddleMat2.diffuseColor = new Color3(0.2, 0.4, 1);
    paddleMat2.emissiveColor = paddleMat2.diffuseColor;
  
    const ballMat = new StandardMaterial("ballMat", scene);
    ballMat.diffuseColor = new Color3(1, 0.84, 0);
    ballMat.emissiveColor = new Color3(1, 0.84, 0);
  
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new Texture("/src/games/assets/mat_wallpaper.jpg", scene);
    groundMat.specularColor = new Color3(0, 0, 0);
  
    const ground = MeshBuilder.CreateGround("ground", { width: 9.6, height: 6 }, scene);
    ground.material = groundMat;
  
    const paddle1 = MeshBuilder.CreateBox("paddle1", { width: 0.2, height: 0.4, depth: 1 }, scene);
    paddle1.position.set(-4.6, 0.2, 0);
    paddle1.material = paddleMat1;
  
    const paddle2 = MeshBuilder.CreateBox("paddle2", { width: 0.2, height: 0.4, depth: 1 }, scene);
    paddle2.position.set(4.6, 0.2, 0);
    paddle2.material = paddleMat2;
  
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 0.3 }, scene);
    ball.position.set(0, 0.2, 0);
    ball.material = ballMat;
  
    [paddle1, paddle2, ball].forEach(mesh => shadowGen.addShadowCaster(mesh));
  
    const trail = new ParticleSystem("trail", 200, scene);
    trail.particleTexture = new Texture("https://playground.babylonjs.com/textures/flare.png", scene);
    trail.emitter = ball;
    trail.minSize = 0.08;
    trail.maxSize = 0.15;
    trail.minLifeTime = 0.2;
    trail.maxLifeTime = 0.5;
    trail.emitRate = 200;
    trail.direction1 = new Vector3(-1, 0, -1);
    trail.direction2 = new Vector3(1, 0, 1);
    trail.color1 = new Color4(1, 0.9, 0.2, 1);
    trail.color2 = new Color4(1, 1, 0.4, 1);
    trail.gravity = Vector3.Zero();
    trail.start();
  
    const halo = MeshBuilder.CreateSphere("halo", { diameter: 0.5 }, scene);
    const haloMat = new StandardMaterial("haloMat", scene);
    haloMat.emissiveColor = new Color3(1, 0.84, 0);
    haloMat.alpha = 0.2;
    halo.material = haloMat;
    halo.parent = ball;
  
    MeshBuilder.CreateBox("topWall", { width: 9.6, height: 0.2, depth: 0.2 }, scene).position.set(0, 0.1, -3.1);
    MeshBuilder.CreateBox("bottomWall", { width: 9.6, height: 0.2, depth: 0.2 }, scene).position.set(0, 0.1, 3.1);
    MeshBuilder.CreateBox("leftWall", { width: 0.2, height: 0.2, depth: 6.4 }, scene).position.set(-4.8, 0.1, 0);
    MeshBuilder.CreateBox("rightWall", { width: 0.2, height: 0.2, depth: 6.4 }, scene).position.set(4.8, 0.1, 0);
  
    let ballDir = new Vector3(0.05, 0, 0.03);
    let scorePlayer = 0;
    let scoreIA = 0;
    let targetZ = 0;
    let iaVelocityZ = 0;
  
    function clamp(value: number, min: number, max: number): number {
      return Math.max(min, Math.min(max, value));
    }
  
    function resetBall() {
      ball.position.set(0, 0.2, 0);
      ballDir = new Vector3(0.05 * (Math.random() > 0.5 ? 1 : -1), 0, 0.03 * (Math.random() > 0.5 ? 1 : -1));
    }
  
    window.addEventListener("keydown", (e) => {
      const speed = 0.2;
      if (["s", "ArrowDown"].includes(e.key) && paddle1.position.z > -2.4) paddle1.position.z -= speed;
      if (["w", "ArrowUp"].includes(e.key) && paddle1.position.z < 2.4) paddle1.position.z += speed;
    });
  
    function flashColor(mesh: Mesh, color: Color3) {
      const mat = mesh.material as StandardMaterial;
      const original = mat.emissiveColor.clone();
      mat.emissiveColor = color;
      setTimeout(() => mat.emissiveColor = original, 120);
    }
  
    setInterval(() => {
      if (ballDir.x > 0) {
        let predictedZ = ball.position.z + ballDir.z * ((paddle2.position.x - ball.position.x) / ballDir.x);
        predictedZ = clamp(predictedZ, -2.9, 2.9);
        const stress = Math.max(0.8, 1.5 - scoreIA * 0.05);
        const errorMargin = 0.2 * stress;
        targetZ = predictedZ + (Math.random() - 0.5) * errorMargin;
      }
    }, 1000);
  
    scene.onBeforeRenderObservable.add(() => {
      ball.position.addInPlace(ballDir);
  
      const dz = targetZ - paddle2.position.z;
      if (Math.abs(dz) > 0.1) {
        iaVelocityZ += Math.sign(dz) * 0.01;
      } else {
        iaVelocityZ *= 0.8;
      }
      iaVelocityZ = clamp(iaVelocityZ, -0.25, 0.25);
      paddle2.position.z += iaVelocityZ;
      paddle2.position.z = clamp(paddle2.position.z, -2.4, 2.4);
  
      if (ball.position.z >= 3 || ball.position.z <= -3) ballDir.z *= -1;
  
      const hitP1 = ball.position.x <= paddle1.position.x + 0.15 && Math.abs(ball.position.z - paddle1.position.z) <= 0.6;
      const hitP2 = ball.position.x >= paddle2.position.x - 0.15 && Math.abs(ball.position.z - paddle2.position.z) <= 0.6;
  
      if (hitP1) {
        ballDir.x *= -1;
        ball.position.x = paddle1.position.x + 0.16;
        flashColor(paddle1, new Color3(1, 1, 0));
      } else if (hitP2) {
        ballDir.x *= -1;
        ball.position.x = paddle2.position.x - 0.16;
        flashColor(paddle2, new Color3(1, 1, 0));
      } else if (ball.position.x >= 5 || ball.position.x <= -5) {
        if (ball.position.x >= 5) scorePlayer++;
        else scoreIA++;
  
        if (scoreBoard) scoreBoard.innerText = `${scorePlayer} - ${scoreIA}`;
        if (announce) {
          announce.innerText = ball.position.x >= 5 ? "Point pour vous ✨" : "Point pour l'IA 💀";
          setTimeout(() => announce!.innerText = "", 2000);
        }
        resetBall();
      }
    });
  
    engine.runRenderLoop(() => scene.render());
  
    return engine;
  }
  