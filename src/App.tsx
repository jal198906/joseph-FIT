/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component } from 'react';
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
  Scan,
  Loader2,
  Camera,
  X,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  ClipboardList,
  Check,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { DIETS, EXERCISES, type Diet, type Exercise, type DailyPlan, type Challenge } from '@/src/types';
import { FOOD_DATABASE, type FoodInfo } from '@/src/data/foods';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI } from "@google/genai";
import LandingPage from '@/src/components/LandingPage';

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, errorInfo: '' };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Algo salió mal. Por favor, intenta de nuevo.";
      try {
        const parsed = JSON.parse(this.state.errorInfo);
        if (parsed.error && parsed.error.includes("insufficient permissions")) {
          displayMessage = "No tienes permisos para realizar esta acción. Por favor, inicia sesión de nuevo.";
        }
      } catch (e) {
        // Not JSON, use default
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <X className="text-red-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">¡Ups! Algo salió mal</h2>
            <p className="text-slate-600 mb-8">{displayMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    const { children } = (this as any).props;
    return children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'today' | 'diets' | 'exercises' | 'fruits'>('today');
  const [selectedDiet, setSelectedDiet] = useState<Diet>(DIETS[0]);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [extraChallenges, setExtraChallenges] = useState<Challenge[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  
  // New Challenge Form State
  const [challengeName, setChallengeName] = useState('');
  const [challengeInstructions, setChallengeInstructions] = useState('');
  const [challengeTime, setChallengeTime] = useState('');
  
  // Food Library state
  const [foodSearch, setFoodSearch] = useState('');
  const [apiFoods, setApiFoods] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Custom Diets state
  const [customDiets, setCustomDiets] = useState<Diet[]>([]);
  const [showDietModal, setShowDietModal] = useState(false);
  const [newDiet, setNewDiet] = useState<Partial<Diet>>({
    name: '',
    description: '',
    type: 'balanced',
    benefits: [],
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
      snack: ''
    }
  });

  // Daily Tasks state
  const [dailyTasks, setDailyTasks] = useState<{id: string, text: string, completed: boolean}[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Recipe state
  const [randomRecipe, setRandomRecipe] = useState<any>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId: string | undefined;
      email: string | null | undefined;
      emailVerified: boolean | undefined;
      isAnonymous: boolean | undefined;
      tenantId: string | null | undefined;
      providerInfo: {
        providerId: string;
        displayName: string | null;
        email: string | null;
        photoUrl: string | null;
      }[];
    }
  }

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserName(currentUser.displayName || 'Usuario');
        setShowLanding(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Plans from Firestore
  useEffect(() => {
    if (!user) return;

    const plansPath = `users/${user.uid}/plans`;
    const q = query(collection(db, plansPath));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans: DailyPlan[] = [];
      snapshot.forEach((doc) => {
        plans.push(doc.data() as DailyPlan);
      });
      if (plans.length > 0) {
        setDailyPlans(plans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, plansPath);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Challenges from Firestore
  useEffect(() => {
    if (!user) return;

    const challengesPath = `users/${user.uid}/challenges`;
    const q = query(collection(db, challengesPath));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challenges: Challenge[] = [];
      snapshot.forEach((doc) => {
        challenges.push(doc.data() as Challenge);
      });
      setExtraChallenges(challenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, challengesPath);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now()
        }, { merge: true });

        setUserName(result.user.displayName || 'Usuario');
        setShowLanding(false);
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem('joseph_fit_name');
    if (savedName) {
      setUserName(savedName);
      setShowLanding(false);
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

    const savedChallenges = localStorage.getItem('joseph_fit_challenges');
    if (savedChallenges) {
      setExtraChallenges(JSON.parse(savedChallenges));
    }

    const savedCustomDiets = localStorage.getItem('joseph_fit_custom_diets');
    if (savedCustomDiets) {
      setCustomDiets(JSON.parse(savedCustomDiets));
    }

    const savedDailyTasks = localStorage.getItem('joseph_fit_daily_tasks');
    if (savedDailyTasks) {
      setDailyTasks(JSON.parse(savedDailyTasks));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const formatStopwatchTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('joseph_fit_name', tempName.trim());
      
      // If user is logged in, update their profile in Firestore
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            displayName: tempName.trim()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        }
      }
    }
  };

  const handleAddDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDiet.name && newDiet.description) {
      const dietToAdd: Diet = {
        ...newDiet as Diet,
        id: `custom-${Date.now()}`,
        benefits: newDiet.benefits?.length ? newDiet.benefits : ['Personalizada']
      };
      const updatedDiets = [...customDiets, dietToAdd];
      setCustomDiets(updatedDiets);
      localStorage.setItem('joseph_fit_custom_diets', JSON.stringify(updatedDiets));
      setShowDietModal(false);
      setNewDiet({
        name: '',
        description: '',
        type: 'balanced',
        benefits: [],
        meals: {
          breakfast: '',
          lunch: '',
          dinner: '',
          snack: ''
        }
      });
    }
  };

  const allDiets = [...DIETS, ...customDiets];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      const updatedTasks = [...dailyTasks, { id: Date.now().toString(), text: newTaskText.trim(), completed: false }];
      setDailyTasks(updatedTasks);
      setNewTaskText('');
      localStorage.setItem('joseph_fit_daily_tasks', JSON.stringify(updatedTasks));
    }
  };

  const toggleTaskStatus = (id: string) => {
    const updatedTasks = dailyTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setDailyTasks(updatedTasks);
    localStorage.setItem('joseph_fit_daily_tasks', JSON.stringify(updatedTasks));
  };

  const removeTask = (id: string) => {
    const updatedTasks = dailyTasks.filter(task => task.id !== id);
    setDailyTasks(updatedTasks);
    localStorage.setItem('joseph_fit_daily_tasks', JSON.stringify(updatedTasks));
  };

  const saveToPhone = async () => {
    const dateStr = format(startOfToday(), "EEEE, d 'de' MMMM", { locale: es });
    let content = `📅 Joseph-FIT: Pendientes de Hoy (${dateStr})\n\n`;
    
    content += `🥗 DIETA: ${selectedDiet.name}\n`;
    content += `- Desayuno: ${selectedDiet.meals.breakfast}\n`;
    content += `- Almuerzo: ${selectedDiet.meals.lunch}\n`;
    content += `- Cena: ${selectedDiet.meals.dinner}\n`;
    content += `- Snack: ${selectedDiet.meals.snack}\n\n`;
    
    content += `💪 EJERCICIO: ${EXERCISES[0].name}\n\n`;
    
    if (dailyTasks.length > 0) {
      content += `📝 TAREAS PENDIENTES:\n`;
      dailyTasks.forEach(task => {
        content += `${task.completed ? '[✓]' : '[ ]'} ${task.text}\n`;
      });
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis Pendientes Joseph-FIT',
          text: content,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Download as file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Joseph-FIT-Pendientes-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const searchGlobalFood = async (query: string) => {
    if (!query.trim()) {
      setApiFoods([]);
      return;
    }
    setIsSearchingApi(true);
    try {
      const response = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const names = data.results.map((item: any) => item.name);
        
        // Fetch nutrition for these names
        const nutritionResponse = await fetch("/api/food/nutrition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients: names }),
        });
        const nutritionData = await nutritionResponse.json();
        
        if (Array.isArray(nutritionData)) {
          const mapped = nutritionData.map((item: any) => ({
            name: item.originalName || item.name,
            calories: Math.round(item.nutrition?.nutrients?.find((n: any) => n.name === "Calories")?.amount || 0),
            unit: `${item.amount} ${item.unit}`,
            category: "Global",
            benefits: `Alimento identificado vía API Global. Rico en ${item.nutrition?.nutrients?.[0]?.name || 'nutrientes'}.`
          }));
          setApiFoods(mapped);
        }
      } else {
        setApiFoods([]);
      }
    } catch (error) {
      console.error("Error searching global food:", error);
    } finally {
      setIsSearchingApi(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (foodSearch) searchGlobalFood(foodSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [foodSearch]);
  const fetchRandomRecipe = async () => {
    setIsLoadingRecipe(true);
    try {
      const response = await fetch('/api/recipes/random');
      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setRandomRecipe(data.recipes[0]);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    } finally {
      setIsLoadingRecipe(false);
    }
  };
  const toggleTask = async (date: string) => {
    const updatedPlans = dailyPlans.map(plan => 
      plan.date === date ? { ...plan, completed: !plan.completed } : plan
    );
    setDailyPlans(updatedPlans);
    localStorage.setItem('joseph_fit_plans', JSON.stringify(updatedPlans));

    if (user) {
      const plan = updatedPlans.find(p => p.date === date);
      if (plan) {
        try {
          const planRef = doc(db, `users/${user.uid}/plans`, plan.date.replace(/\./g, '_'));
          await setDoc(planRef, { ...plan, userId: user.uid }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/plans/${plan.date}`);
        }
      }
    }
  };

  const todayPlan = dailyPlans.find(plan => isSameDay(new Date(plan.date), startOfToday()));

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeName.trim() || !challengeInstructions.trim() || !challengeTime.trim()) return;

    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      name: challengeName.trim(),
      instructions: challengeInstructions.trim(),
      duration: challengeTime.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedChallenges = [newChallenge, ...extraChallenges];
    setExtraChallenges(updatedChallenges);
    localStorage.setItem('joseph_fit_challenges', JSON.stringify(updatedChallenges));
    
    if (user) {
      try {
        const challengeRef = doc(db, `users/${user.uid}/challenges`, newChallenge.id);
        await setDoc(challengeRef, { ...newChallenge, userId: user.uid });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/challenges/${newChallenge.id}`);
      }
    }

    // Reset form
    setChallengeName('');
    setChallengeInstructions('');
    setChallengeTime('');
    setShowChallengeModal(false);
  };

  const removeChallenge = async (id: string) => {
    const updatedChallenges = extraChallenges.filter(c => c.id !== id);
    setExtraChallenges(updatedChallenges);
    localStorage.setItem('joseph_fit_challenges', JSON.stringify(updatedChallenges));

    if (user) {
      try {
        const challengeRef = doc(db, `users/${user.uid}/challenges`, id);
        await deleteDoc(challengeRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/challenges/${id}`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserName('');
      localStorage.removeItem('joseph_fit_name');
      setShowLanding(true);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} onGoogleLogin={handleGoogleLogin} currentTime={currentTime} />;
  }

  if (!userName && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
        <div className="absolute top-6 right-6">
          <div className="px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 tabular-nums">
              {format(currentTime, 'HH:mm')}
            </span>
          </div>
        </div>
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
            Para empezar tu proceso de dieta y ejercicio, dinos cómo te llamas o inicia sesión.
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold">O también</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowLanding(true)}
            className="bg-blue-600 p-2 rounded-xl hover:bg-blue-700 transition-colors"
            title="Ir al inicio"
          >
            <Flame className="text-white w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Joseph-<span className="text-blue-600">FIT</span>
          </h1>
          <div className="ml-2 px-2 py-1 bg-slate-100 rounded-md">
            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
              {format(currentTime, 'hh:mm aa')}
            </span>
          </div>
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
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Cerrar sesión"
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
                  <div className="flex items-center gap-2">
                    <ClipboardList className="text-blue-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-slate-900">Pendientes del Día</h2>
                  </div>
                  <button 
                    onClick={saveToPhone}
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    Guardar en Celular
                  </button>
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Ej. Comprar proteínas..."
                      className="flex-1 px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={!newTaskText.trim()}
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="space-y-3">
                    {dailyTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <ClipboardList className="text-slate-300 w-6 h-6" />
                        </div>
                        <p className="text-sm text-slate-400">No tienes pendientes para hoy</p>
                      </div>
                    ) : (
                      dailyTasks.map((task) => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleTaskStatus(task.id)}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                task.completed ? "bg-green-500 border-green-500" : "border-slate-300"
                              )}
                            >
                              {task.completed && <Check className="text-white w-4 h-4" />}
                            </button>
                            <span className={cn(
                              "text-sm font-medium transition-all",
                              task.completed ? "text-slate-400 line-through" : "text-slate-700"
                            )}>
                              {task.text}
                            </span>
                          </div>
                          <button 
                            onClick={() => removeTask(task.id)}
                            className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Sugerencias de Dieta</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowDietModal(true)}
                    className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                    title="Agregar dieta personalizada"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={fetchRandomRecipe}
                    disabled={isLoadingRecipe}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                    title="Obtener receta aleatoria"
                  >
                    {isLoadingRecipe ? <Loader2 className="w-5 h-5 animate-spin" /> : <Utensils className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {randomRecipe && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-bold rounded-full uppercase mb-4 inline-block">
                      Receta del Momento 🌟
                    </span>
                    <h3 className="text-xl font-bold mb-2">{randomRecipe.title}</h3>
                    <div className="flex gap-4 text-xs text-blue-100 mb-4">
                      <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {randomRecipe.readyInMinutes} min</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {Math.round(randomRecipe.healthScore)} Health Score</span>
                    </div>
                    <a 
                      href={randomRecipe.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
                    >
                      Ver Receta Completa
                    </a>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-20">
                    <Utensils className="w-40 h-40" />
                  </div>
                </motion.div>
              )}

              <div className="grid gap-6">
                {allDiets.map((diet) => (
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

              {/* Stopwatch Section */}
              <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cronómetro de Joseph-FIT</span>
                  </div>
                  <div className="text-5xl font-mono font-bold mb-6 tracking-wider">
                    {formatStopwatchTime(stopwatchTime)}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                      className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
                        isStopwatchRunning 
                          ? "bg-orange-500 hover:bg-orange-600 shadow-orange-900/20" 
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20"
                      )}
                    >
                      {isStopwatchRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    <button 
                      onClick={() => {
                        setIsStopwatchRunning(false);
                        setStopwatchTime(0);
                      }}
                      className="w-14 h-14 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center transition-all shadow-lg shadow-black/20"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Timer className="w-32 h-32" />
                </div>
              </div>

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
                  <p className="text-blue-100 text-sm mb-4">Crea tus propios retos personalizados para complementar tu rutina.</p>
                  <button 
                    onClick={() => setShowChallengeModal(true)}
                    className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors"
                  >
                    Crear Reto Extra
                  </button>
                </div>
                <Flame className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-500/20" />
              </div>

              {extraChallenges.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Mis Retos Extras</h3>
                  <div className="grid gap-4">
                    {extraChallenges.map((challenge) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={challenge.id} 
                        className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm relative group"
                      >
                        <button 
                          onClick={() => removeChallenge(challenge.id)}
                          className="absolute top-4 right-4 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Flame className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-slate-900">{challenge.name}</h4>
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                {challenge.duration}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 italic">"{challenge.instructions}"</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
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
                <h2 className="text-2xl font-bold text-slate-900">Biblioteca de Alimentos</h2>
                <p className="text-slate-500 text-sm">Buscar alimento o plato.</p>
              </div>

              <div className="relative">
                <input 
                  type="text"
                  placeholder="Busca un alimento (ej. Baleada, Pollo chuco, Frijoles...)"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:border-blue-600 transition-all shadow-lg shadow-slate-100 text-lg"
                />
              </div>

              <div className="grid gap-4">
                {foodSearch.trim() !== '' ? (
                  <>
                    {/* Local Results */}
                    {FOOD_DATABASE.filter(f => normalizeString(f.name).includes(normalizeString(foodSearch))).map((food, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`local-${i}`} 
                        className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                            food.category === 'Hondureño' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                          )}>
                            <span className="text-xl">
                              {food.category === 'Carne' ? '🥩' : 
                               food.category === 'Fruta' ? '🍎' : 
                               food.category === 'Verdura' ? '🥦' : 
                               food.category === 'Hondureño' ? '🇭🇳' : '🍲'}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900">{food.name}</h3>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase">
                                {food.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{food.benefits}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{food.calories} <span className="text-xs font-medium text-slate-400">Calorías</span></p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">/ {food.unit}</p>
                        </div>
                      </motion.div>
                    ))}

                    {/* API Results */}
                    {isSearchingApi && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    )}
                    
                    {apiFoods.map((food, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`api-${i}`} 
                        className="bg-white/60 p-5 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between group hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                            <span className="text-xl">🌍</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 capitalize">{food.name}</h3>
                              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full font-bold uppercase">
                                Global
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{food.benefits}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-400">{food.calories} <span className="text-xs font-medium text-slate-400">Calorías</span></p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">/ {food.unit}</p>
                        </div>
                      </motion.div>
                    ))}

                    {FOOD_DATABASE.filter(f => normalizeString(f.name).includes(normalizeString(foodSearch))).length === 0 && apiFoods.length === 0 && !isSearchingApi && (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                          <Info className="text-slate-400 w-8 h-8" />
                        </div>
                        <p className="text-slate-500">No encontramos resultados para "{foodSearch}".</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 space-y-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-6">
                      <Utensils className="text-blue-600 w-12 h-12" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Tu Biblioteca de Alimentos</h3>
                      <p className="text-sm text-slate-500">Escribe el nombre de cualquier alimento o plato típico para ver su información calórica.</p>
                    </div>
                  </div>
                )}
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
          onClick={() => setActiveTab('fruits')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'fruits' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Plus className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Biblioteca</span>
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

      {/* Diet Modal */}
      <AnimatePresence>
        {showDietModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDietModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl my-auto"
            >
              <button 
                onClick={() => setShowDietModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto rotate-3 shadow-lg shadow-green-200">
                  <Utensils className="text-white w-8 h-8" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900">Nueva Dieta Personalizada</h3>
                  <p className="text-slate-500 text-sm mt-1">Define tu propio plan alimenticio</p>
                </div>

                <form onSubmit={handleAddDiet} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Nombre de la Dieta</label>
                    <input 
                      type="text" 
                      value={newDiet.name}
                      onChange={(e) => setNewDiet({...newDiet, name: e.target.value})}
                      placeholder="Ej. Mi Dieta Proteica"
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Descripción</label>
                    <input 
                      type="text" 
                      value={newDiet.description}
                      onChange={(e) => setNewDiet({...newDiet, description: e.target.value})}
                      placeholder="Ej. Dieta alta en proteínas para ganar músculo."
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tipo</label>
                      <select 
                        value={newDiet.type}
                        onChange={(e) => setNewDiet({...newDiet, type: e.target.value as any})}
                        className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                      >
                        <option value="balanced">Equilibrada</option>
                        <option value="weight-loss">Bajar Peso</option>
                        <option value="muscle-gain">Ganar Músculo</option>
                        <option value="keto">Keto</option>
                        <option value="vegan">Vegana</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Desayuno</label>
                      <input 
                        type="text" 
                        value={newDiet.meals?.breakfast}
                        onChange={(e) => setNewDiet({...newDiet, meals: {...newDiet.meals!, breakfast: e.target.value}})}
                        placeholder="Ej. Huevos"
                        className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Almuerzo</label>
                      <input 
                        type="text" 
                        value={newDiet.meals?.lunch}
                        onChange={(e) => setNewDiet({...newDiet, meals: {...newDiet.meals!, lunch: e.target.value}})}
                        placeholder="Ej. Pollo"
                        className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Cena</label>
                      <input 
                        type="text" 
                        value={newDiet.meals?.dinner}
                        onChange={(e) => setNewDiet({...newDiet, meals: {...newDiet.meals!, dinner: e.target.value}})}
                        placeholder="Ej. Pescado"
                        className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Snack</label>
                    <input 
                      type="text" 
                      value={newDiet.meals?.snack}
                      onChange={(e) => setNewDiet({...newDiet, meals: {...newDiet.meals!, snack: e.target.value}})}
                      placeholder="Ej. Fruta"
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition-all mt-4"
                  >
                    Guardar Dieta
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <AnimatePresence>
        {showChallengeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChallengeModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowChallengeModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto rotate-3 shadow-lg shadow-blue-200">
                  <Plus className="text-white w-8 h-8" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-900">Nuevo Reto Extra</h3>
                  <p className="text-slate-500 text-sm mt-1">Personaliza tu entrenamiento</p>
                </div>

                <form onSubmit={handleAddChallenge} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Nombre del Reto</label>
                    <input 
                      type="text" 
                      value={challengeName}
                      onChange={(e) => setChallengeName(e.target.value)}
                      placeholder="Ej. Plancha Extrema"
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Indicaciones</label>
                    <textarea 
                      value={challengeInstructions}
                      onChange={(e) => setChallengeInstructions(e.target.value)}
                      placeholder="Ej. Mantén la posición de plancha por el tiempo indicado."
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium min-h-[80px] resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Tiempo / Duración</label>
                    <input 
                      type="text" 
                      value={challengeTime}
                      onChange={(e) => setChallengeTime(e.target.value)}
                      placeholder="Ej. 2 minutos"
                      className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4"
                  >
                    Guardar Reto
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
