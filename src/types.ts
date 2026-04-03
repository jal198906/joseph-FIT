export interface Diet {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  type: 'weight-loss' | 'muscle-gain' | 'balanced' | 'keto' | 'vegan';
}

export interface Exercise {
  id: string;
  name: string;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  category: 'cardio' | 'strength' | 'flexibility';
  description: string;
}

export interface DailyPlan {
  date: string;
  dietId: string;
  exercises: string[];
  completed: boolean;
}

export const DIETS: Diet[] = [
  {
    id: 'balanced-1',
    name: 'Dieta Equilibrada',
    type: 'balanced',
    description: 'Una dieta que incluye todos los grupos de alimentos en proporciones adecuadas.',
    benefits: ['Energía constante', 'Mejora la digestión', 'Sostenible a largo plazo'],
    meals: {
      breakfast: 'Avena con frutas y nueces',
      lunch: 'Pechuga de pollo a la plancha con quinoa y ensalada mixta',
      dinner: 'Salmón al horno con espárragos y batata',
      snack: 'Yogur griego con miel'
    }
  },
  {
    id: 'keto-1',
    name: 'Dieta Cetogénica (Keto)',
    type: 'keto',
    description: 'Alta en grasas saludables y muy baja en carbohidratos para entrar en cetosis.',
    benefits: ['Pérdida de peso rápida', 'Control del azúcar en sangre', 'Claridad mental'],
    meals: {
      breakfast: 'Huevos revueltos con aguacate y tocino',
      lunch: 'Ensalada César con pollo (sin picatostes) y aderezo de aceite de oliva',
      dinner: 'Bistec con mantequilla de ajo y brócoli salteado',
      snack: 'Un puñado de almendras'
    }
  },
  {
    id: 'vegan-1',
    name: 'Dieta Vegana',
    type: 'vegan',
    description: 'Basada exclusivamente en plantas, rica en fibra y antioxidantes.',
    benefits: ['Salud cardiovascular', 'Bajo impacto ambiental', 'Rica en nutrientes'],
    meals: {
      breakfast: 'Tostadas de masa madre con hummus y semillas',
      lunch: 'Bowl de garbanzos, espinacas, tofu marinado y arroz integral',
      dinner: 'Lentejas guisadas con verduras y cúrcuma',
      snack: 'Fruta de temporada'
    }
  }
];

export const EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Caminata Rápida',
    duration: '30 min',
    intensity: 'low',
    category: 'cardio',
    description: 'Caminar a un ritmo que eleve ligeramente las pulsaciones.'
  },
  {
    id: 'ex-2',
    name: 'HIIT en Casa',
    duration: '20 min',
    intensity: 'high',
    category: 'cardio',
    description: 'Intervalos de alta intensidad: burpees, jumping jacks y escaladores.'
  },
  {
    id: 'ex-3',
    name: 'Rutina de Fuerza (Core)',
    duration: '15 min',
    intensity: 'medium',
    category: 'strength',
    description: 'Planchas, abdominales y elevación de piernas.'
  }
];
