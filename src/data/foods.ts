export interface FoodInfo {
  name: string;
  calories: number;
  unit: string;
  category: string;
  benefits?: string;
}

export const FOOD_DATABASE: FoodInfo[] = [
  // --- HONDURAS & LATAM ---
  { name: "Baleada Sencilla", calories: 250, unit: "1 unidad", category: "Hondureño", benefits: "Plato típico hondureño, rico en carbohidratos y fibra." },
  { name: "Baleada con Todo", calories: 450, unit: "1 unidad", category: "Hondureño", benefits: "Completa con huevo, aguacate y carne." },
  { name: "Pupusa de Queso", calories: 220, unit: "1 unidad", category: "Latino", benefits: "Tradicional y deliciosa." },
  { name: "Pupusa Revuelta", calories: 290, unit: "1 unidad", category: "Latino", benefits: "Mezcla de chicharrón, frijoles y queso." },
  { name: "Sopa de Caracol", calories: 350, unit: "1 tazón", category: "Hondureño", benefits: "Rica en proteínas marinas y coco." },
  { name: "Pollo con Tajadas (Pollo Chuco)", calories: 850, unit: "1 plato", category: "Hondureño", benefits: "Energía pura, plato festivo." },
  { name: "Nacatamal", calories: 600, unit: "1 unidad", category: "Hondureño", benefits: "Maíz y carne cocidos en hoja de plátano." },
  { name: "Montuca", calories: 350, unit: "1 unidad", category: "Hondureño", benefits: "Tamal de elote tierno con carne." },
  { name: "Atol de Elote", calories: 200, unit: "1 taza", category: "Hondureño", benefits: "Bebida tradicional de maíz." },
  { name: "Horchata", calories: 150, unit: "1 vaso", category: "Hondureño", benefits: "Refrescante a base de semillas de morro y arroz." },
  { name: "Plátano Frito", calories: 180, unit: "100g", category: "Hondureño", benefits: "Acompañamiento esencial, rico en potasio." },
  { name: "Frijoles Fritos", calories: 160, unit: "100g", category: "Hondureño", benefits: "Excelente fuente de hierro y proteína vegetal." },
  { name: "Tortilla de Maíz", calories: 60, unit: "1 unidad", category: "Hondureño", benefits: "Base de la dieta centroamericana." },
  { name: "Mantequilla Rala", calories: 45, unit: "1 cucharada", category: "Hondureño", benefits: "Lácteo tradicional hondureño." },
  { name: "Queso Semiseco", calories: 110, unit: "30g", category: "Hondureño", benefits: "Rico en calcio." },
  { name: "Carne Asada", calories: 250, unit: "150g", category: "Latino", benefits: "Proteína de alta calidad." },
  { name: "Tajadas de Guineo Verde", calories: 220, unit: "100g", category: "Hondureño", benefits: "Base del pollo chuco." },
  { name: "Enchilada Hondureña", calories: 320, unit: "1 unidad", category: "Hondureño", benefits: "Tortilla frita con carne molida y ensalada." },
  { name: "Catracha", calories: 180, unit: "1 unidad", category: "Hondureño", benefits: "Tortilla con frijoles y queso rallado." },
  { name: "Tamalito de Elote", calories: 250, unit: "1 unidad", category: "Hondureño", benefits: "Maíz tierno molido." },
  { name: "Sopa de Mondongo", calories: 400, unit: "1 tazón", category: "Hondureño", benefits: "Sopa tradicional de tripa de res." },
  { name: "Sopa de Frijoles con Huevo", calories: 300, unit: "1 tazón", category: "Hondureño", benefits: "Nutritiva y reconfortante." },
  { name: "Tapado Olanchano", calories: 550, unit: "1 plato", category: "Hondureño", benefits: "Guiso de carnes saladas y verduras." },
  { name: "Pescado Frito del Lago", calories: 450, unit: "1 unidad", category: "Hondureño", benefits: "Especialidad del Lago de Yojoa." },
  { name: "Yuca con Chicharrón", calories: 650, unit: "1 plato", category: "Hondureño", benefits: "Yuca cocida con chicharrón y ensalada." },
  { name: "Ticucos", calories: 300, unit: "1 unidad", category: "Hondureño", benefits: "Tamales de frijoles y chipilín." },
  { name: "Pan de Coco", calories: 280, unit: "1 unidad", category: "Hondureño", benefits: "Tradición de la costa norte." },
  { name: "Arroz con Maíz", calories: 200, unit: "100g", category: "Hondureño", benefits: "Acompañamiento típico." },
  { name: "Chicha de Maíz", calories: 180, unit: "1 vaso", category: "Hondureño", benefits: "Bebida fermentada tradicional." },
  { name: "Pozol", calories: 220, unit: "1 vaso", category: "Hondureño", benefits: "Bebida de maíz y leche." },
  { name: "Rosquillas en Miel", calories: 350, unit: "2 unidades", category: "Hondureño", benefits: "Postre tradicional de Semana Santa." },
  { name: "Tustacas", calories: 150, unit: "1 unidad", category: "Hondureño", benefits: "Pan de maíz con dulce de rapadura." },
  { name: "Semita Hondureña", calories: 200, unit: "1 unidad", category: "Hondureño", benefits: "El pan dulce favorito de Honduras." },
  { name: "Totopostes", calories: 120, unit: "5 unidades", category: "Hondureño", benefits: "Bocadillos crujientes de maíz." },
  { name: "Empanada de Plátano", calories: 220, unit: "1 unidad", category: "Latino", benefits: "Rellenas de frijoles o poleada." },
  { name: "Arepa de Queso", calories: 250, unit: "1 unidad", category: "Latino", benefits: "Clásico sudamericano." },
  { name: "Ceviche", calories: 150, unit: "100g", category: "Latino", benefits: "Proteína fresca y ligera." },
  { name: "Taco Mexicano", calories: 200, unit: "1 unidad", category: "Latino", benefits: "Mundialmente famoso." },
  { name: "Empanada Argentina", calories: 280, unit: "1 unidad", category: "Latino", benefits: "Masa rellena horneada o frita." },
  { name: "Gallo Pinto", calories: 220, unit: "150g", category: "Latino", benefits: "Mezcla de arroz y frijoles." },

  // --- CARNES Y PREPARACIONES ---
  { name: "Pechuga de Pollo", calories: 165, unit: "100g", category: "Carne", benefits: "Proteína magra para músculo." },
  { name: "Pollo Frito", calories: 246, unit: "100g", category: "Carne", benefits: "Sabor intenso, alto en calorías." },
  { name: "Pollo al Vapor", calories: 155, unit: "100g", category: "Carne", benefits: "La forma más saludable de comer pollo." },
  { name: "Pollo Horneado", calories: 190, unit: "100g", category: "Carne", benefits: "Jugoso y con menos grasa que el frito." },
  { name: "Pollo a la Plancha", calories: 165, unit: "100g", category: "Carne", benefits: "Ideal para dietas de definición." },
  { name: "Pollo Guisado", calories: 180, unit: "100g", category: "Carne", benefits: "Rico en sabor por sus vegetales." },
  { name: "Pollo Asado (Rosticería)", calories: 220, unit: "100g", category: "Carne", benefits: "Clásico y equilibrado." },
  { name: "Pollo Empanizado", calories: 280, unit: "100g", category: "Carne", benefits: "Textura crujiente, mayor aporte calórico." },
  { name: "Alitas de Pollo (Fritas)", calories: 290, unit: "100g", category: "Carne", benefits: "Alta en energía, ideal para compartir." },
  { name: "Nuggets de Pollo", calories: 300, unit: "100g", category: "Carne", benefits: "Procesado, rico en energía rápida." },
  
  { name: "Bistec de Res", calories: 240, unit: "100g", category: "Carne", benefits: "Rico en hierro y B12." },
  { name: "Bistec Encebollado", calories: 260, unit: "100g", category: "Carne", benefits: "Clásico latino con mucho sabor." },
  { name: "Carne de Res Guisada", calories: 220, unit: "100g", category: "Carne", benefits: "Tierna y nutritiva." },
  { name: "Carne de Res Horneada", calories: 250, unit: "100g", category: "Carne", benefits: "Excelente para platos principales." },
  { name: "Carne de Res Frita", calories: 310, unit: "100g", category: "Carne", benefits: "Alta en energía y sabor." },
  { name: "Albóndigas de Res", calories: 200, unit: "100g", category: "Carne", benefits: "Proteína en porciones prácticas." },
  { name: "Costillas de Res Asadas", calories: 350, unit: "100g", category: "Carne", benefits: "Ricas en grasas y sabor intenso." },
  { name: "Lomo Saltado (Carne)", calories: 230, unit: "100g", category: "Carne", benefits: "Mezcla perfecta de proteína y vegetales." },

  { name: "Chuleta de Cerdo", calories: 230, unit: "100g", category: "Carne", benefits: "Buena fuente de tiamina." },
  { name: "Chuleta Frita", calories: 290, unit: "100g", category: "Carne", benefits: "Crujiente y tradicional." },
  { name: "Chuleta Horneada", calories: 210, unit: "100g", category: "Carne", benefits: "Opción más ligera para el cerdo." },
  { name: "Cerdo al Vapor", calories: 180, unit: "100g", category: "Carne", benefits: "Mantiene sus nutrientes al máximo." },
  { name: "Cerdo Guisado", calories: 240, unit: "100g", category: "Carne", benefits: "Sabor casero y reconfortante." },
  { name: "Costillas de Cerdo BBQ", calories: 320, unit: "100g", category: "Carne", benefits: "Sabor ahumado y caramelizado." },
  { name: "Pernil de Cerdo Asado", calories: 260, unit: "100g", category: "Carne", benefits: "Tradición festiva, muy nutritivo." },
  { name: "Chorizo Frito", calories: 450, unit: "100g", category: "Carne", benefits: "Intenso sabor, alto en grasas." },

  { name: "Carne Molida (90% magra)", calories: 176, unit: "100g", category: "Carne", benefits: "Versátil y proteica." },
  { name: "Tocino", calories: 541, unit: "100g", category: "Carne", benefits: "Alto en grasas y sabor." },
  { name: "Pavo Horneado", calories: 160, unit: "100g", category: "Carne", benefits: "Proteína magra festiva." },
  { name: "Cordero Asado", calories: 294, unit: "100g", category: "Carne", benefits: "Rico en zinc y sabor único." },
  { name: "Chicharrón", calories: 540, unit: "100g", category: "Carne", benefits: "Grasa y proteína crujiente." },
  { name: "Salchicha", calories: 300, unit: "100g", category: "Carne", benefits: "Procesado, consumir con moderación." },
  { name: "Jamón Horneado", calories: 150, unit: "100g", category: "Carne", benefits: "Bajo en grasa, alto en sabor." },

  // --- PESCADOS Y MARISCOS ---
  { name: "Salmón a la Plancha", calories: 208, unit: "100g", category: "Pescado", benefits: "Omega-3 para el corazón." },
  { name: "Pescado al Horno", calories: 140, unit: "100g", category: "Pescado", benefits: "Ligero y nutritivo." },
  { name: "Filete de Pescado Empanizado", calories: 250, unit: "100g", category: "Pescado", benefits: "Textura crujiente deliciosa." },
  { name: "Pescado al Vapor", calories: 110, unit: "100g", category: "Pescado", benefits: "Máxima pureza y salud." },
  { name: "Atún en agua", calories: 116, unit: "100g", category: "Pescado", benefits: "Proteína pura." },
  { name: "Tilapia a la Plancha", calories: 128, unit: "100g", category: "Pescado", benefits: "Bajo en calorías." },
  { name: "Camarones al Ajillo", calories: 130, unit: "100g", category: "Marisco", benefits: "Sabor intenso y bajo en grasa." },
  { name: "Camarones Empanizados", calories: 240, unit: "100g", category: "Marisco", benefits: "Energía y sabor crujiente." },
  { name: "Langosta", calories: 89, unit: "100g", category: "Marisco", benefits: "Baja en grasa, alta en proteína." },
  { name: "Cangrejo", calories: 84, unit: "100g", category: "Marisco", benefits: "Rico en vitamina B12." },
  { name: "Sardinas", calories: 208, unit: "100g", category: "Pescado", benefits: "Calcio y Omega-3." },

  // --- GRANOS Y CEREALES ---
  { name: "Arroz Blanco", calories: 130, unit: "100g (cocido)", category: "Grano", benefits: "Energía rápida." },
  { name: "Arroz Integral", calories: 111, unit: "100g (cocido)", category: "Grano", benefits: "Fibra y vitaminas B." },
  { name: "Quinoa", calories: 120, unit: "100g (cocido)", category: "Grano", benefits: "Proteína completa vegetal." },
  { name: "Avena", calories: 389, unit: "100g (seco)", category: "Grano", benefits: "Excelente para el corazón y saciedad." },
  { name: "Pan Integral", calories: 247, unit: "100g", category: "Grano", benefits: "Fibra para la digestión." },
  { name: "Pasta (Trigo)", calories: 158, unit: "100g (cocida)", category: "Grano", benefits: "Carbohidratos para energía." },
  { name: "Maíz (Elote)", calories: 86, unit: "100g", category: "Grano", benefits: "Rico en antioxidantes." },

  // --- LEGUMBRES ---
  { name: "Frijoles Negros", calories: 132, unit: "100g (cocidos)", category: "Legumbre", benefits: "Hierro y proteína." },
  { name: "Frijoles Rojos", calories: 127, unit: "100g (cocidos)", category: "Legumbre", benefits: "Clásicos en Honduras." },
  { name: "Lentejas", calories: 116, unit: "100g (cocidas)", category: "Legumbre", benefits: "Ricas en ácido fólico." },
  { name: "Garbanzos", calories: 164, unit: "100g (cocidos)", category: "Legumbre", benefits: "Fibra y proteína." },
  { name: "Soya", calories: 173, unit: "100g (cocida)", category: "Legumbre", benefits: "Proteína vegetal completa." },

  // --- VERDURAS ---
  { name: "Brócoli", calories: 34, unit: "100g", category: "Verdura", benefits: "Vitamina K y C." },
  { name: "Espinaca", calories: 23, unit: "100g", category: "Verdura", benefits: "Hierro y magnesio." },
  { name: "Zanahoria", calories: 41, unit: "100g", category: "Verdura", benefits: "Vitamina A para la vista." },
  { name: "Tomate", calories: 18, unit: "100g", category: "Verdura", benefits: "Licopeno antioxidante." },
  { name: "Lechuga", calories: 15, unit: "100g", category: "Verdura", benefits: "Baja en calorías, hidratante." },
  { name: "Pepino", calories: 15, unit: "100g", category: "Verdura", benefits: "Muy hidratante." },
  { name: "Cebolla", calories: 40, unit: "100g", category: "Verdura", benefits: "Propiedades antiinflamatorias." },
  { name: "Ajo", calories: 149, unit: "100g", category: "Verdura", benefits: "Antibiótico natural." },
  { name: "Papa (Patata)", calories: 77, unit: "100g", category: "Verdura", benefits: "Vitamina C y B6." },
  { name: "Calabacín", calories: 17, unit: "100g", category: "Verdura", benefits: "Muy bajo en calorías." },

  // --- FRUTAS (Existing + More) ---
  { name: "Manzana", calories: 52, unit: "100g", category: "Fruta", benefits: "Fibra y vitamina C." },
  { name: "Plátano", calories: 89, unit: "100g", category: "Fruta", benefits: "Potasio y energía." },
  { name: "Mango", calories: 60, unit: "100g", category: "Fruta", benefits: "Vitamina A y C." },
  { name: "Piña", calories: 50, unit: "100g", category: "Fruta", benefits: "Digestiva (bromelina)." },
  { name: "Sandía", calories: 30, unit: "100g", category: "Fruta", benefits: "Hidratación máxima." },
  { name: "Papaya", calories: 43, unit: "100g", category: "Fruta", benefits: "Salud digestiva." },
  { name: "Aguacate", calories: 160, unit: "100g", category: "Fruta", benefits: "Grasas saludables." },
  { name: "Guayaba", calories: 68, unit: "100g", category: "Fruta", benefits: "Mucha vitamina C." },
  { name: "Nance", calories: 73, unit: "100g", category: "Fruta", benefits: "Tradicional hondureño." },
  { name: "Jocote", calories: 65, unit: "100g", category: "Fruta", benefits: "Rico en vitamina C." },

  // --- LÁCTEOS ---
  { name: "Leche Entera", calories: 61, unit: "100ml", category: "Lácteo", benefits: "Calcio y vitamina D." },
  { name: "Yogur Griego", calories: 59, unit: "100g", category: "Lácteo", benefits: "Proteína y probióticos." },
  { name: "Huevo", calories: 155, unit: "100g", category: "Proteína", benefits: "Proteína de referencia." },
  { name: "Mantequilla", calories: 717, unit: "100g", category: "Grasa", benefits: "Energía concentrada." },

  // ... (Esta lista se expande dinámicamente con la búsqueda de IA) ...
];
