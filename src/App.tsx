/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Utensils, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Bell, 
  Settings,
  Flame,
  Heart,
  Timer,
  Info,
  Camera,
  Scan,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { GoogleGenAI } from "@google/genai";
import { DIETS, EXERCISES, type Diet, type Exercise, type DailyPlan } from './types';
import { FRUIT_DATABASE, type FruitInfo } from './data/fruits';
import { cn } from './lib/utils';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'diets' | 'exercises' | 'scanner' | 'fruits'>('today');
  const [selectedDiet, setSelectedDiet] = useState<Diet>(DIETS[0]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  
  // Scanner state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<{ food: string; calories: string; details: string; isFruit?: boolean; fruitInfo?: FruitInfo } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fruit Library state
  const [fruitSearch, setFruitSearch] = useState('');
  useEffect(() => {
    const savedName = localStorage.getItem('joseph_fit_name');
    if (savedName) {
      setUserName(savedName);
    }

    const savedPlans = localStorage.getItem('joseph_fit_plans');
    if (savedPlans) {
      setDailyPlans(JSON.parse(savedPlans));
    } else {
      const initialPlans: DailyPlan[] = Array.from({ length: 7 }).map((_, i) => ({
        date: addDays(startOfToday(), i).toISOString(),
        dietId: DIETS[0].id,
        exercises: [EXERCISES[0].id],
        completed: false
      }));
      setDailyPlans(initialPlans);
      localStorage.setItem('joseph_fit_plans', JSON.stringify(initialPlans));
    }
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('joseph_fit_name', tempName.trim());
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      analyzeImage(base64String.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Data: string) => {
    setIsAnalyzing(true);
    setScanResult(null);
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: `Analiza esta imagen de comida y estima las calorías. 
              Si detectas que es una fruta, intenta identificarla específicamente. 
              Responde en formato JSON puro con los campos: 
              food (nombre del plato o fruta), 
              calories (número estimado de calorías), 
              details (breve descripción nutricional y beneficios),
              isFruit (booleano, true si es una fruta).
              Responde en español.` },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      // Cross-reference with our fruit database if it's a fruit
      if (result.isFruit) {
        const matchedFruit = FRUIT_DATABASE.find(f => 
          f.name.toLowerCase().includes(result.food.toLowerCase()) || 
          result.food.toLowerCase().includes(f.name.toLowerCase())
        );
        if (matchedFruit) {
          result.fruitInfo = matchedFruit;
          result.details = `${matchedFruit.benefits} ${result.details}`;
        }
      }
      
      setScanResult(result);
    } catch (error) {
      console.error("Error analizando imagen:", error);
      setScanResult({
        food: "Error",
        calories: "N/A",
        details: "No se pudo analizar la imagen. Intenta de nuevo."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const toggleTask = (date: string) => {
    const updatedPlans = dailyPlans.map(plan => 
      plan.date === date ? { ...plan, completed: !plan.completed } : plan
    );
    setDailyPlans(updatedPlans);
    localStorage.setItem('joseph_fit_plans', JSON.stringify(updatedPlans));
  };

  const todayPlan = dailyPlans.find(plan => isSameDay(new Date(plan.date), startOfToday()));

  if (!userName) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100"
        >
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto rotate-3">
            <Flame className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">¡Bienvenido!</h1>
          <p className="text-slate-500 text-center mb-8">
            Para empezar tu proceso de dieta y ejercicio, dinos cómo te llamas.
          </p>
          
          <form onSubmit={handleSaveName} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-2">Tu Nombre</label>
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Ej. Joseph"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all text-lg font-medium"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              disabled={!tempName.trim()}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Comenzar Proceso
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Flame className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Joseph-<span className="text-blue-600">FIT</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowReminderModal(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('joseph_fit_name');
              window.location.reload();
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Cambiar nombre"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Plan de Hoy</h2>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        {format(startOfToday(), "EEEE, d 'de' MMMM", { locale: es })}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-900">¡Dále con todo, {userName}!</h3>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                      <Timer className="text-blue-600 w-8 h-8" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="text-orange-600 w-4 h-4" />
                        <span className="text-xs font-bold text-orange-800 uppercase">Dieta</span>
                      </div>
                      <p className="font-semibold text-slate-900">{selectedDiet.name}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="text-green-600 w-4 h-4" />
                        <span className="text-xs font-bold text-green-800 uppercase">Ejercicio</span>
                      </div>
                      <p className="font-semibold text-slate-900">{EXERCISES[0].name}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => todayPlan && toggleTask(todayPlan.date)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                      todayPlan?.completed 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                    )}
                  >
                    {todayPlan?.completed ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Completado
                      </>
                    ) : (
                      "Marcar como completado"
                    )}
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Próximos Días</h2>
                  <Calendar className="text-slate-400 w-5 h-5" />
                </div>
                <div className="space-y-3">
                  {dailyPlans.slice(1, 5).map((plan, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {format(new Date(plan.date), 'EEE', { locale: es })}
                          </span>
                          <span className="text-lg font-bold text-slate-700">
                            {format(new Date(plan.date), 'd')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{DIETS.find(d => d.id === plan.dietId)?.name}</p>
                          <p className="text-xs text-slate-500">Recordatorio programado</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 w-5 h-5" />
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'diets' && (
            <motion.div
              key="diets"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-slate-900">Sugerencias de Dieta</h2>
              <div className="grid gap-6">
                {DIETS.map((diet) => (
                  <div 
                    key={diet.id}
                    className={cn(
                      "bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer",
                      selectedDiet.id === diet.id ? "border-blue-600 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-200"
                    )}
                    onClick={() => setSelectedDiet(diet)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">
                        {diet.type}
                      </span>
                      {selectedDiet.id === diet.id && <CheckCircle2 className="text-blue-600 w-6 h-6" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{diet.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">{diet.description}</p>
                    
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 uppercase">Menú Sugerido</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-bold text-slate-700">Desayuno</p>
                          <p className="text-slate-500">{diet.meals.breakfast}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">Almuerzo</p>
                          <p className="text-slate-500">{diet.meals.lunch}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">Cena</p>
                          <p className="text-slate-500">{diet.meals.dinner}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">Snack</p>
                          <p className="text-slate-500">{diet.meals.snack}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-slate-900">Ejercicios Diarios</h2>
              <div className="grid gap-4">
                {EXERCISES.map((ex) => (
                  <div key={ex.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      ex.intensity === 'high' ? "bg-red-50 text-red-600" : 
                      ex.intensity === 'medium' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                    )}>
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-900">{ex.name}</h3>
                        <span className="text-xs font-medium text-slate-400">{ex.duration}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{ex.description}</p>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                          {ex.category}
                        </span>
                        <span className={cn(
                          "px-2 py-1 text-[10px] font-bold rounded-md uppercase",
                          ex.intensity === 'high' ? "bg-red-100 text-red-700" : 
                          ex.intensity === 'medium' ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        )}>
                          Intensidad: {ex.intensity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-600 rounded-3xl p-6 text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">¿Quieres un reto extra?</h3>
                  <p className="text-blue-100 text-sm mb-4">Añade 15 minutos de estiramientos al final de tu rutina.</p>
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                    Añadir al plan
                  </button>
                </div>
                <Flame className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-500/20" />
              </div>
            </motion.div>
          )}
          {activeTab === 'scanner' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Escáner de Calorías</h2>
                <p className="text-slate-500 text-sm">Toma una foto de tu comida para estimar su valor nutricional.</p>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden">
                {!previewImage ? (
                  <div className="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                      <Camera className="text-blue-600 w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900">Captura tu comida</p>
                      <p className="text-xs text-slate-400">Sube una foto o usa la cámara para empezar el análisis.</p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                      <label className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 cursor-pointer hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5" />
                        Tomar Foto
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </label>
                      <label className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Subir de Galería
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative aspect-square rounded-[2rem] overflow-hidden group">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
                          <Loader2 className="w-12 h-12 animate-spin" />
                          <p className="font-bold tracking-widest uppercase text-xs">Analizando...</p>
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          setPreviewImage(null);
                          setScanResult(null);
                        }}
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-blue-900">{scanResult.food}</h3>
                          <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                            {scanResult.calories} kcal
                          </div>
                        </div>
                        <p className="text-blue-800/70 text-sm leading-relaxed">
                          {scanResult.details}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => {
                              setPreviewImage(null);
                              setScanResult(null);
                            }}
                            className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm border border-blue-200 hover:bg-blue-100 transition-all"
                          >
                            Escanear otro
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
                <div className="p-3 bg-orange-100 rounded-2xl h-fit">
                  <Info className="text-orange-600 w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-orange-900">Nota Nutricional</p>
                  <p className="text-xs text-orange-800/70 leading-relaxed">
                    Las calorías son estimaciones basadas en el análisis visual. Para resultados precisos, consulta con un nutricionista.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'fruits' && (
            <motion.div
              key="fruits"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Biblioteca de Frutas</h2>
                <p className="text-slate-500 text-sm">Información nutricional de las 100 frutas más consumidas.</p>
              </div>

              <div className="relative">
                <input 
                  type="text"
                  placeholder="Buscar fruta..."
                  value={fruitSearch}
                  onChange={(e) => setFruitSearch(e.target.value)}
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all shadow-sm"
                />
                <Plus className="absolute right-4 top-4 text-slate-300 w-6 h-6 rotate-45" />
              </div>

              <div className="grid gap-4">
                {FRUIT_DATABASE.filter(f => f.name.toLowerCase().includes(fruitSearch.toLowerCase())).map((fruit, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <span className="text-xl">🍎</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{fruit.name}</h3>
                        <p className="text-xs text-slate-500">{fruit.benefits}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{fruit.calories}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">kcal / {fruit.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-4 py-3 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('today')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'today' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Hoy</span>
        </button>
        <button 
          onClick={() => setActiveTab('diets')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'diets' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Utensils className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Dietas</span>
        </button>
        <button 
          onClick={() => setActiveTab('scanner')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'scanner' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Scan className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Escáner</span>
        </button>
        <button 
          onClick={() => setActiveTab('fruits')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'fruits' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Plus className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Frutas</span>
        </button>
        <button 
          onClick={() => setActiveTab('exercises')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'exercises' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Dumbbell className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Ejercicios</span>
        </button>
      </nav>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReminderModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Bell className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Recordatorios Diarios</h3>
              <p className="text-slate-500 text-center text-sm mb-8">
                Recibirás notificaciones para tus comidas y rutinas de ejercicio.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Utensils className="text-slate-400 w-5 h-5" />
                    <span className="font-semibold text-slate-700">Comidas</span>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="text-slate-400 w-5 h-5" />
                    <span className="font-semibold text-slate-700">Entrenamiento</span>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowReminderModal(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
