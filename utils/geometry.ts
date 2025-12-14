import * as THREE from 'three';
import { ParticleData, OrnamentData } from '../types';

const COUNT = 5000;
const RADIUS = 8;
const HEIGHT = 18;

// PBR Colors
const ORNAMENT_COLORS = [
  '#CFB53B', // Retro Gold
  '#800020', // Burgundy
  '#778899', // Grey Blue
  '#B76E79', // Rose Gold
  '#F7E7CE', // Champagne
];

/**
 * 核心算法：圆锥体体积内随机点采样
 * @param height 圆锥高度
 * @param maxRadius 圆锥底半径
 * @returns [x, y, z] 坐标
 */
const getRandomPointInCone = (height: number, maxRadius: number): [number, number, number] => {
  // 1. 随机高度 (从下往上归一化)
  // y 范围: -HEIGHT/2 到 HEIGHT/2
  const y = Math.random() * height - height / 2;
  
  // 归一化高度 (0: 底部, 1: 顶部) - 注意：Three.js Cylinder/Cone 中心在 0,0,0
  // 这里我们需要计算当前高度对应的半径。
  // 假设 Cone 尖端在顶部。
  const relativeY = (y + height / 2) / height; 
  
  // 当前高度的半径 (越往上越小)
  const currentRadius = maxRadius * (1 - relativeY);
  
  // 2. 圆形切面内的随机点 (使用 sqrt 保证分布均匀，避免聚集在中心)
  const r = Math.sqrt(Math.random()) * currentRadius;
  const theta = Math.random() * Math.PI * 2;
  
  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  
  return [x, y, z];
};

export const generateParticles = (): ParticleData[] => {
  const particles: ParticleData[] = [];
  
  for (let i = 0; i < COUNT; i++) {
    // 同样使用圆锥分布逻辑，但为了针叶的密度，我们这里手动展开，
    // 或者可以直接复用 getRandomPointInCone，但为了保持针叶主要在表面或特定分布，保留微调逻辑。
    const pos = getRandomPointInCone(HEIGHT, RADIUS);
    
    // NEBULA SHAPE (Torus/Ring)
    const nebulaAngle = Math.random() * Math.PI * 2;
    const nebulaRadius = 15 + Math.random() * 10;
    const nebulaY = (Math.random() - 0.5) * 5;
    
    const nx = Math.cos(nebulaAngle) * nebulaRadius;
    const nz = Math.sin(nebulaAngle) * nebulaRadius;

    particles.push({
      id: i,
      treePos: pos,
      nebulaPos: [nx, nebulaY, nz],
      color: '#1C4E33', // Deep Pine Green
      size: 0.1 + Math.random() * 0.15,
    });
  }
  return particles;
};

export const generateOrnaments = (): OrnamentData[] => {
  const ornaments: OrnamentData[] = [];
  const count = 200; // Increased count for better volume fill

  for (let i = 0; i < count; i++) {
    // 1. 生成树体位置：圆锥体积内随机
    // 半径略微 +0.5 允许装饰物稍微突出树叶
    const treePos = getRandomPointInCone(HEIGHT, RADIUS + 0.5);

    // 2. 生成星云位置：环形
    const nebulaAngle = (i / count) * Math.PI * 2;
    const nebulaRadius = 22 + (Math.random() - 0.5) * 4;
    const nx = Math.cos(nebulaAngle) * nebulaRadius;
    const nz = Math.sin(nebulaAngle) * nebulaRadius;
    const ny = (Math.random() - 0.5) * 6;

    // 3. 随机变换
    // 随机缩放 0.5 - 1.5
    const scaleVal = 0.5 + Math.random() * 1.0; 
    const scale: [number, number, number] = [scaleVal, scaleVal, scaleVal];
    
    // 完全随机旋转 XYZ
    const rotation: [number, number, number] = [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    ];

    ornaments.push({
      id: i,
      treePos: treePos,
      nebulaPos: [nx, ny, nz],
      type: Math.random() > 0.4 ? 'gift' : 'ball',
      color: ORNAMENT_COLORS[Math.floor(Math.random() * ORNAMENT_COLORS.length)],
      scale,
      rotation,
    });
  }
  return ornaments;
};
