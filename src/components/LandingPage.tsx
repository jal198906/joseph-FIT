import React from 'react';
import { motion } from 'motion/react';
import { 
  Flame, 
  Dumbbell, 
  Utensils, 
  Bell, 
  ChevronRight, 
  CheckCircle2, 
  Heart, 
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  currentTime: Date;
}

export default function LandingPage({ onStart, currentTime }: LandingPageProps) {
  const features = [
    {
      icon: <Utensils className="w-6 h-6 text-orange-500" />,
      title: "Dietas Personalizadas",
      description: "Planes nutricionales adaptados a tus objetivos, desde pérdida de peso hasta ganancia muscular."
    },
    {
      icon: <Dumbbell className="w-6 h-6 text-blue-500" />,
      title: "Rutinas de Ejercicio",
      description: "Ejercicios diarios guiados para mantenerte activo y en forma sin complicaciones."
    },
    {
      icon: <Bell className="w-6 h-6 text-purple-500" />,
      title: "Recordatorios Inteligentes",
      description: "Notificaciones para que nunca olvides tus comidas, hidratación o entrenamientos."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-green-500" />,
      title: "Todo en tu Bolsillo",
      description: "Accede a tus planes y progreso desde cualquier lugar, optimizado para tu móvil."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Top Bar with Clock */}
      <div className="absolute top-4 right-6 z-50">
        <div className="px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
          <span className="text-xs font-bold text-slate-600 tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tu Salud, Nuestra Prioridad</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Joseph-<span className="text-blue-600">FIT</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            La plataforma definitiva para transformar tu estilo de vida. 
            Dieta, ejercicio y salud, todo en un solo lugar diseñado para ti.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onStart}
              className="group relative px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              Empezar Ahora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Saber más
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-12 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Usuarios Activos", value: "10k+", icon: <Heart className="w-4 h-4 text-red-500" /> },
            { label: "Planes Creados", value: "25k+", icon: <Zap className="w-4 h-4 text-yellow-500" /> },
            { label: "Ejercicios", value: "500+", icon: <Dumbbell className="w-4 h-4 text-blue-500" /> },
            { label: "Satisfacción", value: "99%", icon: <Shield className="w-4 h-4 text-green-500" /> }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {stat.icon}
                <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas para triunfar</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Diseñamos herramientas potentes pero sencillas para que tu única preocupación sea dar el máximo.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6">¿Listo para el cambio?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
              Únete a Joseph-FIT hoy mismo y empieza a construir la mejor versión de ti mismo.
            </p>
            <button
              onClick={onStart}
              className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              Comenzar Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Flame className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900">Joseph-FIT</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 Joseph-FIT. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Smartphone className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Heart className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><CheckCircle2 className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
