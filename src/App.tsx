/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Copy, 
  BookOpen, 
  ExternalLink,
  FileText,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  X,
  MoreVertical
} from 'lucide-react';

// --- Types ---
interface QuizAnswer {
  [key: string]: string;
}

interface AppState {
  currentPage: number;
  readPages: number[];
  fontSize: number;
  quizAnswers: QuizAnswer;
}

// --- Components ---

const Toast = ({ message, show }: { message: string, show: boolean }) => (
  <div 
    className={`fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#341205] color-[#F0ECE8] font-sans text-xs px-5 py-2 rounded-full transition-all duration-300 z-[3000] pointer-events-none ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
  >
    {message}
  </div>
);

const ScriptBox = ({ title, script, caption = "", onCopy }: { title: string, script: string, caption?: string, onCopy: (text: string) => void }) => (
  <div className="bg-[#341205] rounded-[10px] p-[18px_22px] my-[14px] text-[#F0ECE8] relative overflow-hidden group hover:-translate-y-[1px] transition-transform">
    <div className="absolute top-0 right-0 w-[70px] height-[70px] bg-[radial-gradient(circle,rgba(206,97,26,0.35)_0%,transparent_70%)]" />
    <div className="font-sans text-[9px] font-bold tracking-[2px] uppercase text-[#CE611A] mb-[9px] flex items-center gap-[6px]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#CE611A]" />
      {title}
    </div>
    <button 
      onClick={() => onCopy(script)}
      className="absolute top-[14px] right-[14px] bg-white/10 border border-white/20 text-white/70 font-sans text-[10px] px-[10px] py-[3px] rounded-[4px] cursor-pointer hover:bg-[#CE611A] hover:border-[#CE611A] hover:text-white transition-all"
    >
      Copiar
    </button>
    <p className="italic leading-[1.7] text-[14px] m-0 !text-[#F0ECE8]">{script}</p>
    <cite className="block not-italic text-[11px] text-[#B9A193] mt-[8px]">✅ {caption}</cite>
  </div>
);

const TemplateBox = ({ title, content, fields, onCopy }: { title: string, content: string, fields: string[], onCopy: (text: string) => void }) => (
  <div className="bg-white border-[1.5px] border-dashed border-[#B57337] rounded-[10px] p-[20px_22px] my-[16px]">
    <div className="flex items-center justify-between mb-[12px]">
      <span className="font-sans text-[10px] font-bold tracking-[2px] uppercase text-[#B57337]">{title}</span>
      <button 
        onClick={() => onCopy(content)}
        className="bg-[#F0ECE8] border border-[#E3DDD7] text-[#6B3A1F] font-sans text-[10px] px-[10px] py-[3px] rounded-[4px] cursor-pointer hover:bg-[#CE611A] hover:text-white hover:border-[#CE611A] transition-all"
      >
        Copiar
      </button>
    </div>
    <pre className="font-serif text-[13px] leading-[1.7] text-[#341205] whitespace-pre-wrap break-words">{content}</pre>
    <div className="flex flex-wrap gap-[6px] mt-[10px]">
      {fields.map(field => (
        <span key={field} className="bg-[#fdf5f0] border border-[#f0d5c0] text-[#CE611A] font-sans text-[10px] px-2 py-0.5 rounded-[4px]">{field}</span>
      ))}
    </div>
  </div>
);

const Quiz = ({ 
  id, 
  title, 
  description, 
  questions, 
  onCalculate, 
  result,
  selectedAnswers,
  onSelect
}: { 
  id: string, 
  title: string, 
  description: string, 
  questions: any[], 
  onCalculate: () => void,
  result?: { text: string, isCorrect?: boolean },
  selectedAnswers: QuizAnswer,
  onSelect: (qId: string, val: string) => void
}) => (
  <div className="bg-white rounded-[12px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)] border border-[#E3DDD7]">
    <h3 className="font-display text-lg text-[#341205] mb-1.5">{title}</h3>
    <p className="font-sans text-[13px] text-[#B9A193] mb-[18px]">{description}</p>
    {questions.map((q, idx) => (
      <div key={idx} className="mb-5 last:mb-0">
        <p className="font-sans text-[14px] font-semibold text-[#341205] mb-[10px]">{q.text}</p>
        <div className="flex flex-col gap-[7px]">
          {q.options.map((opt: any) => (
            <label 
              key={opt.val} 
              className={`flex items-center gap-[10px] p-[9px_13px] border-[1.5px] rounded-lg cursor-pointer transition-all text-sans text-[13px] select-none ${selectedAnswers[q.id] === opt.val ? 'border-[#CE611A] bg-[#fdf5f0] text-[#341205]' : 'border-[#E3DDD7] bg-[#F0ECE8] text-[#6B3A1F] hover:border-[#CE611A] hover:bg-[#fdf5f0]'}`}
              onClick={() => onSelect(q.id, opt.val)}
            >
              <div className={`w-[17px] h-[17px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedAnswers[q.id] === opt.val ? 'bg-[#CE611A] border-[#CE611A]' : 'border-[#B9A193]'}`}>
                <div className={`w-[7px] h-[7px] rounded-full bg-white transition-opacity ${selectedAnswers[q.id] === opt.val ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              {opt.text}
            </label>
          ))}
        </div>
      </div>
    ))}
    <button 
      onClick={onCalculate}
      className="mt-[14px] bg-[#CE611A] text-white border-none py-[11px] px-[26px] rounded-lg font-sans text-[13px] font-bold cursor-pointer hover:bg-[#6B3A1F] hover:-translate-y-[1px] transition-all w-full"
    >
      Ver resultados →
    </button>
    {result && (
      <div className={`mt-[14px] p-[14px] rounded-lg border-l-4 show animate-[fadeUp_0.4s_ease] ${result.isCorrect === false ? 'bg-[linear-gradient(135deg,#ffebee,#fff8f8)] border-l-[#c62828]' : 'bg-[linear-gradient(135deg,#fdf5f0,#fef9f5)] border-l-[#CE611A]'}`}>
        <p className="font-sans text-[13px] text-[#341205] m-0 leading-[1.65]" dangerouslySetInnerHTML={{ __html: result.text }} />
      </div>
    )}
  </div>
);

// --- Interactive Chapter Components ---

const Cap4 = ({ handleCopy }: { handleCopy: (text: string) => void }) => {
  const [points, setPoints] = useState([false, false, false]);
  return (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 4</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Escucha Táctica</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Identifica lo que no se dice en las reuniones</p>
      </div>
      <p>La información es el combustible de la estrategia. Mientras todos los demás intentan impresionar hablando, tú obtienes ventaja escuchando.</p>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">🎯 Checklist: ¿Qué estás escuchando?</h3>
        <div className="space-y-3">
          {[
            "¿Quién tiene la última palabra realmente (no siempre es el que más habla)?",
            "¿Qué temas ponen tenso a mi jefe (cambio de tono, lenguaje corporal)?",
            "¿Qué palabras clave (buzzwords) usa el jefe del jefe?"
          ].map((p, i) => (
            <button 
              key={i}
              onClick={() => {
                const newPoints = [...points];
                newPoints[i] = !newPoints[i];
                setPoints(newPoints);
              }}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${points[i] ? 'bg-[#fdf5f0] border-[#CE611A] text-[#341205]' : 'bg-[#F0ECE8] border-transparent text-[#6B3A1F]'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${points[i] ? 'bg-[#CE611A] border-[#CE611A]' : 'border-[#B9A193]'}`}>
                {points[i] && <Check size={12} className="text-white" />}
              </div>
              <span className="text-xs font-sans">{p}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Cap7 = ({ handleCopy }: { handleCopy: (text: string) => void }) => {
  const [openAcc, setOpenAcc] = useState(0);
  return (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 7</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">El Arte de Anticipar</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Quien anticipa domina — quien reacciona, sobrevive</p>
      </div>
      <p>Todos los jefes tienen presiones que no verbalizan. Plazos que los angustian, métricas que no cierran, problemas con sus propios superiores. El profesional que detecta esas presiones antes y ofrece soluciones sin que se las pidan se vuelve irremplazable.</p>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">📡 Señales del Radar — Aprende a Leerlas</h3>
        <div className="flex flex-col gap-2">
          {[
            { t: '📧 Señal 1: El email tarde en la noche', p: 'Si tu jefe empieza a enviar emails después de las 10pm hay presión desde arriba. <strong>Qué hacer:</strong> Al día siguiente llega temprano y pregunta: "Vi tu mensaje anoche — ¿hay algo urgente en lo que pueda ayudarte hoy?"' },
            { t: '📊 Señal 2: Reuniones convocadas sin agenda', p: 'Las convocatorias de último minuto sin agenda clara suelen significar que algo salió mal. <strong>Qué hacer:</strong> Preséntate con un resumen de tus avances recientes — aunque nadie te lo haya pedido.' },
            { t: '😶 Señal 3: El silencio inusual', p: 'Cuando un jefe hablador se vuelve callado repentinamente, hay algo importante en proceso. <strong>Qué hacer:</strong> No presiones. Ofrece discretamente: "Oye, si necesitas algo de mi parte esta semana, avísame."' },
            { t: '📉 Señal 4: Cambios de humor en lunes', p: 'El lunes trae la presión de reportes y reuniones con dirección. Si tu jefe llega tenso, es señal de que hubo fricción en el fin de semana. <strong>Qué hacer:</strong> Dale espacio hasta el mediodía. Después aparece con algo positivo.' },
          ].map((acc, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-[0_1px_6px_rgba(52,18,5,0.05)]">
              <button 
                onClick={() => setOpenAcc(openAcc === i ? -1 : i)}
                className="w-full text-left p-3 px-4 cursor-pointer flex items-center justify-between font-sans text-[13px] font-semibold text-[#341205] hover:bg-[#fdf5f0] transition-colors"
              >
                {acc.t}
                <ChevronRight size={14} className={`text-[#CE611A] transition-transform ${openAcc === i ? 'rotate-90' : ''}`} />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-400 ease-in-out ${openAcc === i ? 'max-h-[500px]' : 'max-h-0'}`}
              >
                <div className="p-3 px-4 pt-0 font-sans text-[13px] text-[#6B3A1F] leading-relaxed border-t border-[#E3DDD7]" dangerouslySetInnerHTML={{ __html: acc.p }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScriptBox 
        title="🗣️ Script — La Ofrenda de Paz Anticipada"
        script='"Noté que la reunión con los directores estuvo intensa. Me adelanté and preparé este resumen con los puntos clave por si te vuelven a preguntar. Estoy contigo en esto."'
        caption="Úsalo justo después de una reunión difícil con dirección. Efecto: tu jefe te ve como aliado, no como subordinado."
        onCopy={handleCopy}
      />
    </div>
  );
};

const FlashcardsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<number, 'correct' | 'incorrect'>>({});

  const cards = [
    { q: "¿Qué es la 'Ruptura Consciente' en el ámbito profesional?", a: "Es el acto de separar la identidad personal de un personaje o 'Alter Ego' profesional diseñado para dominar la oficina." },
    { q: "¿Cuál es el objetivo principal de la técnica 'Boca de Huevo'?", a: "Mantener un control riguroso sobre las palabras para ser percibido como alguien equilibrado, discreto y confiable." },
    { q: "Menciona los 5 temas prohibidos para un 'Favorito Estratégico'.", a: "Política y religión, vida financiera, salud mental/crisis personales, críticas a gestiones anteriores y chismes directos." },
    { q: "¿En qué consiste el 'Test de los 3 Segundos' antes de responder?", a: "Contar hasta tres mentalmente para eliminar la reacción emocional y elegir la respuesta más política." },
    { q: "¿Cómo define el manual el concepto de 'Vacío de Poder' en las conversaciones?", a: "Es la tendencia de los demás a llenar el silencio hablando de más, lo que permite al estratega obtener información valiosa." },
    { q: "¿Qué busca lograr un estratega al aplicar la 'Falsa Vulnerabilidad' con su jefe?", a: "Validar el ego del jefe pidiéndole su 'visión experta' sobre un tema, haciéndolo sentir importante." },
    { q: "Define el 'Sesgo de Familiaridad' en el contexto de las promociones.", a: "Es la tendencia de los jefes a promover a quienes les generan confianza y comodidad en lugar de a los más capaces técnicamente." },
    { q: "¿Cuál es la estrategia recomendada para gestionar a un jefe 'Inseguro'?", a: "Evitar brillar más que él en público e informarle de todo antes que a los demás." },
    { q: "¿Qué acción táctica define a la 'Ofrenda de Paz Anticipada'?", a: "Identificar y realizar la tarea que el jefe más odia hacer antes de que él la solicite." },
    { q: "¿Cómo debe actuar el 'Favorito Estratégico' ante un ataque o grito de un jefe tóxico?", a: "Activar el Alter Ego para mantener una cara neutral (Boca de Huevo) y no tomar el ataque como algo personal." },
    { q: "¿En qué consiste la técnica del 'Chisme Invertido'?", a: "Elogiar una competencia real de un colega o del jefe ante un tercero para que el comentario positivo llegue a sus oídos." },
    { q: "En el networking de baja intensidad, ¿qué significa la 'Moneda de la Información'?", a: "Compartir datos útiles e inofensivos para generar reciprocidad y recibir información crítica en el futuro." },
    { q: "¿Qué es la 'Semiótica del Poder' en la oficina física?", a: "El uso del lenguaje corporal, como la postura recta y movimientos lentos, para proyectar control y alto estatus." },
    { q: "¿Cuál es la 'Geografía del Poder' recomendada en las reuniones?", a: "Sentarse físicamente lo más cerca posible de la persona con mayor autoridad en la sala." },
    { q: "¿Qué es la 'Ley de la Respuesta Rápida' en el trabajo remoto?", a: "Responder mensajes del jefe en minutos durante las primeras dos horas del día para crear una percepción de disponibilidad total." },
    { q: "¿Cuál es la 'Regla de los Ojos' para las videollamadas estratégicas?", a: "Colocar la cámara a la altura de los ojos para transmitir confianza y evitar parecer sumiso o arrogante." },
    { q: "Para negociar un aumento, el estratega debe hablar de su _____ en lugar de su costo.", a: "Retorno sobre la Inversión (ROI)" },
    { q: "¿Cuál es el 'Timing' ideal para solicitar una revisión de compensación?", a: "Inmediatamente después de una victoria reciente, como un proyecto cerrado con éxito o una crisis resuelta." },
    { q: "¿Qué debe hacer un estratega si la respuesta a su solicitud de aumento es un 'No'?", a: "Pedir hitos específicos y resultados medibles para alcanzar en 90 días y retomar la conversación." },
    { q: "¿En qué consiste el 'Efecto Halo' aplicado a la estética del poder?", a: "La asociación automática que hace el cerebro entre una apariencia impecable y una alta competencia profesional." },
    { q: "En la comunicación de autoridad, ¿por qué frase se debe sustituir el 'Perdón por la demora'?", a: "Gracias por la paciencia." },
    { q: "Define 'Empatía Táctica' aplicada al jefe.", a: "Usar la inteligencia emocional para detectar qué miedos o presiones externas le quitan el sueño al superior." },
    { q: "¿Qué es el 'LinkedIn Mercenario'?", a: "Mantener un perfil atractivo para headhunters y ofertas externas mientras se finge lealtad total a la empresa actual." },
    { q: "¿Cuál es el propósito de la 'Protección Doble' en la carrera del estratega?", a: "Tener el motor encendido para salir al mercado si hay crisis y ser el primero en ser valorado si hay bonanza." },
    { q: "¿Cómo se define a un 'Bocó' en el manual?", a: "Un profesional inocente que cree que el trabajo duro y la justicia meritocrática son suficientes para ascender." },
    { q: "Concepto: Gestión del Ego", a: "Proporcionar el reconocimiento y la validación que el líder necesita para sentirse seguro en su posición." },
    { q: "¿Qué estrategia se recomienda para neutralizar a un jefe 'Microgestor'?", a: "Inundarlo de reportes proactivos antes de que los pida para que sienta que tiene el control total." },
    { q: "La técnica de 'Escenografía de Poder' en Home Office sugiere evitar fondos _____.", a: "Borrosos (o virtuales descuidados)" },
    { q: "¿Por qué es importante la 'Gratitud Estratégica' incluso después de obtener poder?", a: "Para mantener la alianza con el jefe y evitar parecer arrogante, protegiendo la posición alcanzada." },
    { q: "¿Cuál es el pilar del método que enseña a alimentar el poder del gestor de forma invisible?", a: "Ego Management (Gestión del Ego)." }
  ];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const markResult = (type: 'correct' | 'incorrect') => {
    setResults({ ...results, [currentIndex]: type });
    if (!isFlipped) setIsFlipped(true);
  };

  const correctCount = Object.values(results).filter(v => v === 'correct').length;
  const incorrectCount = Object.values(results).filter(v => v === 'incorrect').length;

  return (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Herramienta 2</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Flashcards Tácticas</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Entrena tu instinto para dominar la oficina</p>
      </div>

      <div className="relative h-[380px] w-full perspective-1000 my-8">
        <motion.div 
          className="relative w-full h-full cursor-pointer transition-all duration-600 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front Side */}
          <div 
            className="absolute inset-0 backface-hidden bg-[#2D2D2D] rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="absolute top-8 left-8 text-[#888] font-mono text-sm">{currentIndex + 1} / {cards.length}</div>
            <div className="absolute top-8 right-8 text-[#888]"><MoreVertical size={20} /></div>
            
            <h3 className="font-display text-[24px] md:text-[28px] text-white leading-tight mb-4 px-4">
              {cards[currentIndex].q}
            </h3>
            
            <div className="absolute bottom-12 text-[#888] text-sm font-sans underline underline-offset-4 decoration-[#CE611A]">Toca para ver respuesta</div>
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 backface-hidden bg-[#341205] rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] rotate-y-180"
          >
            <div className="absolute top-8 left-8 text-[#CE611A]/60 font-mono text-sm">{currentIndex + 1} / {cards.length}</div>
            
            <p className="font-sans text-[18px] text-[#F0ECE8] leading-relaxed mb-6 px-4">
              {cards[currentIndex].a}
            </p>

            <div className="absolute bottom-12 text-[#CE611A] text-sm font-bold uppercase tracking-wider">Toca para volver</div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full border border-[#E3DDD7] flex items-center justify-center text-[#341205] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <button 
          onClick={() => markResult('incorrect')}
          className={`h-12 px-6 rounded-full border flex items-center gap-2 transition-all ${results[currentIndex] === 'incorrect' ? 'bg-[#ffebed] border-[#ff4d4d] text-[#c62828]' : 'border-[#E3DDD7] text-[#341205] hover:bg-white'}`}
        >
          <X size={18} className={results[currentIndex] === 'incorrect' ? 'text-[#ff4d4d]' : 'text-[#888]'} />
          <span className="font-bold">{incorrectCount}</span>
        </button>

        <button 
          onClick={() => markResult('correct')}
          className={`h-12 px-6 rounded-full border flex items-center gap-2 transition-all ${results[currentIndex] === 'correct' ? 'bg-[#eafaea] border-[#2e7d32] text-[#2e7d32]' : 'border-[#E3DDD7] text-[#341205] hover:bg-white'}`}
        >
          <span className="font-bold">{correctCount}</span>
          <Check size={18} className={results[currentIndex] === 'correct' ? 'text-[#2e7d32]' : 'text-[#888]'} />
        </button>

        <button 
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="w-12 h-12 rounded-full border border-[#E3DDD7] flex items-center justify-center text-[#341205] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [readPages, setReadPages] = useState<Set<number>>(new Set());
  const [fontSize, setFontSize] = useState(17);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [quizResults, setQuizResults] = useState<{[key: string]: { text: string, isCorrect?: boolean }}>({});

  const totalPages = 26;

  // Load state
  useEffect(() => {
    const saved = localStorage.getItem('gef_state');
    if (saved) {
      const data = JSON.parse(saved);
      setCurrentPage(data.currentPage ?? 0);
      setReadPages(new Set(data.readPages || []));
      setFontSize(data.fontSize || 17);
      setQuizAnswers(data.quizAnswers || {});
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('gef_state', JSON.stringify({
      currentPage,
      readPages: Array.from(readPages),
      fontSize,
      quizAnswers
    }));
  }, [currentPage, readPages, fontSize, quizAnswers]);

  const togglePageRead = () => {
    const newReadPages = new Set(readPages);
    if (newReadPages.has(currentPage)) {
      newReadPages.delete(currentPage);
    } else {
      newReadPages.add(currentPage);
    }
    setReadPages(newReadPages);
  };

  const nav = (dir: number) => {
    const next = currentPage + dir;
    if (next >= 0 && next < totalPages) {
      setCurrentPage(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMsg('✓ Copiado al portapapeles');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleQuizAnswer = (qId: string, val: string) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // --- CONTENT RENDERERS ---

  const renderCover = () => (
    <div className="text-center py-[10px] pb-[30px]">
      <div className="inline-block bg-[#CE611A] text-white font-sans text-[10px] font-bold tracking-[2px] uppercase px-[18px] py-[5px] rounded-full mb-[28px]">
        ✦ Edición Digital Exclusiva ✦
      </div>
      <div className="w-[160px] h-[160px] mx-auto mb-[28px] bg-[linear-gradient(135deg,#341205_0%,#B57337_100%)] rounded-full flex items-center justify-center text-[64px] shadow-[0_20px_60px_rgba(52,18,5,0.22)] relative animate-[pulse_3s_ease-in-out_infinite]">
        🎭
        <div className="absolute -inset-[10px] rounded-full border-2 border-dashed border-[#B9A193] opacity-35 animate-[spin_20s_linear_infinite]" />
      </div>
      <div className="w-[50px] h-0.5 bg-[linear-gradient(90deg,transparent,#B57337,transparent)] mx-auto mb-[24px]" />
      <h1 className="font-display text-[clamp(30px,7vw,50px)] font-bold text-[#341205] leading-[1.1] mb-3">
        Guía del <span className="text-[#CE611A] italic">Empleado</span> Favorito
      </h1>
      <p className="font-sans text-sm text-[#B57337] tracking-[1px] mb-9 font-light">
        El manual que RR.HH. nunca quiso que vieras
      </p>
      <p className="font-display italic text-sm text-[#B9A193] mb-1.5">
        Por <strong className="text-[#B57337] not-italic">Gisele Munhoz</strong>
      </p>
      <div className="font-sans text-[11px] text-[#B9A193] tracking-[1px] uppercase mb-8">
        15 años en RR.HH. de multinacionales · Ahora del lado tuyo
      </div>
      <div className="flex justify-center gap-6 mt-6 flex-wrap">
        {[
          { label: 'Capítulos', val: '10' },
          { label: 'Bonuses', val: '3' },
          { label: 'Scripts listos', val: '30+' },
          { label: 'Días de plan', val: '90' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="font-display text-[26px] font-bold text-[#CE611A]">{stat.val}</div>
            <div className="font-sans text-[10px] tracking-[1px] uppercase text-[#B9A193]">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[linear-gradient(135deg,#fff8f3,#fef4ec)] border-l-4 border-[#CE611A] rounded-r-lg p-[18px_22px] my-6 mt-7 text-left shadow-[0_2px_12px_rgba(206,97,26,0.08)]">
        <p className="m-0 italic text-[#6B3A1F]">Este ebook no es motivación. No es coaching. Es <strong>táctica corporativa pura</strong> — enseñada por quien estuvo del otro lado de la mesa decidiendo quién subía.</p>
      </div>
    </div>
  );

  const renderIndex = () => (
    <div className="markdown-body">
      <div className="mb-8 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Navegación</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Índice de Contenidos</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">30 páginas de táctica corporativa pura</p>
      </div>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">📋 Estructura del Programa</h3>
        <div className="flex flex-col gap-0">
          {[
            { id: 'I', t: 'Fundamentos (Caps. 1–3)', p: 'El mito de la meritocracia · El mecanismo central · Tu perfil actual' },
            { id: 'II', t: 'Los 3 Pilares (Caps. 4–6)', p: 'Ruptura Consciente · Gestión del Ego · Estética del Poder' },
            { id: 'III', t: 'Tácticas Avanzadas (Caps. 7–9)', p: 'Anticipación · Política interna · Scripts y Templates' },
            { id: 'IV', t: 'Tu Plan (Cap. 10)', p: 'Hoja de ruta de 90 días personalizada' },
            { id: 'B', t: 'Bonuses Exclusivos (3)', p: 'Boca de Huevo · Radar de Inseguridades · LinkedIn Mercenario' },
          ].map(item => (
            <div key={item.id} className="flex gap-3.5 items-start relative pb-4 last:pb-0">
              {item.id !== 'B' && <div className="absolute left-[18px] top-[38px] bottom-0 w-0.5 bg-[#E3DDD7]" />}
              <div className="w-[38px] h-[38px] rounded-full bg-[linear-gradient(135deg,#CE611A,#B57337)] flex items-center justify-center text-white font-sans font-bold text-[15px] shrink-0">
                {item.id}
              </div>
              <div>
                <h4 className="font-sans text-[14px] font-bold text-[#341205] mb-[3px]">{item.t}</h4>
                <p className="font-sans text-[12px] text-[#B57337] m-0 leading-[1.5]">{item.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[linear-gradient(135deg,#f5f0ea,#ede6dd)] border border-[#E3DDD7] rounded-[10px] p-[18px_22px] my-6">
        <div className="font-sans text-[10px] font-bold tracking-[2px] uppercase text-[#B57337] mb-2">📖 Cómo usar esta guía</div>
        <p className="m-0 text-[14.5px] text-[#6B3A1F]">Lee un capítulo por día e implementa una sola táctica antes de pasar al siguiente. La transformación es gradual, estratégica e invisible para todos los que te rodean. Usa los botones de navegación o el menú lateral para moverte entre capítulos.</p>
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="markdown-body">
      <div className="mb-8 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Introducción</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">El Juego que Nadie Te Enseñó a Jugar</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Por qué los más competentes no siempre son los que ascienden</p>
      </div>
      <p>Pasé 15 años del lado de Recursos Humanos en multinacionales. Vi a cientos de profesionales brillantes, trabajadores incansables, personas con más talento que muchos de sus jefes... quedarse estancados en el mismo cargo durante años.</p>
      <p>Y vi a otros — no necesariamente los más capaces — ascender año tras año, ganar más, ser defendidos por sus superiores en las reuniones de evaluación, y construir carreras que parecían de película.</p>
      <div className="text-center p-[32px_16px] my-[28px] relative">
        <div className="font-display text-[90px] text-[#E3DDD7] absolute top-[-5px] left-1/2 -translate-x-1/2 leading-none cursor-default select-none opacity-50">"</div>
        <p className="font-display text-[clamp(17px,3.5vw,21px)] italic text-[#341205] leading-[1.5] relative z-1">La meritocracia existe. Pero primero tienes que ser visto para que te evalúen.</p>
        <cite className="block font-sans text-xs text-[#B9A193] mt-2.5 not-italic tracking-[1px]">— Gisele Munhoz</cite>
      </div>
      <p>La diferencia no era la competencia técnica. Era que los que subían entendían las reglas invisibles del juego corporativo. Sabían cómo gestionar percepciones, cómo hacer que su jefe se sintiera bien tomándolos en cuenta, cómo ser estratégicos sin parecer manipuladores.</p>
      
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">La Ecuación Real de las Promociones</h3>
        <div className="flex flex-col items-center gap-1.5 my-4">
          <div className="w-[60%] bg-[linear-gradient(135deg,#CE611A,#B57337)] p-2.5 rounded-md flex flex-col items-center justify-center text-white text-center hover:scale-[1.02] transition-transform">
            <span className="font-sans text-[12px] font-semibold leading-tight">Estrategia de Visibilidad</span>
            <small className="font-light text-[10px]">Lo que decide quién sube</small>
          </div>
          <div className="w-[78%] bg-[linear-gradient(135deg,#6B3A1F,#8B5230)] p-2.25 rounded-md flex flex-col items-center justify-center text-white text-center hover:scale-[1.02] transition-transform">
            <span className="font-sans text-[12px] font-semibold leading-tight">Relaciones con la Dirección</span>
            <small className="font-light text-[10px]">Quién te defiende en tu ausencia</small>
          </div>
          <div className="w-[100%] bg-[linear-gradient(135deg,#341205,#4a1c0a)] p-2.25 rounded-md flex flex-col items-center justify-center text-white text-center hover:scale-[1.02] transition-transform">
            <span className="font-sans text-[12px] font-semibold leading-tight">Competencia Técnica</span>
            <small className="font-light text-[10px]">Solo el boleto de entrada — necesario pero no suficiente</small>
          </div>
        </div>
      </div>
      <div className="bg-[linear-gradient(135deg,#fff8f3,#fef4ec)] border-l-4 border-[#CE611A] rounded-r-lg p-[18px_22px] my-6 shadow-[0_2px_12px_rgba(206,97,26,0.08)]">
        <p className="m-0 italic text-[#6B3A1F]">A eso lo llamo <strong>Puxa-saquismo Estratégico</strong>. Y en esta guía te voy a enseñar exactamente cómo se aplica — con frases listas para usar mañana y un plan de 90 días al final.</p>
      </div>
    </div>
  );

  const renderCap1 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 1</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">El Mito de la Meritocracia</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Por qué trabajar duro no es suficiente — y nunca lo fue</p>
      </div>
      <p>Te contaron una historia conveniente desde que entraste al mundo laboral: "trabaja duro, entrega resultados y serás reconocido." Esa historia es perfecta para las empresas. No necesariamente para ti.</p>
      
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">📊 Los Factores Reales de una Promoción</h3>
        <div className="flex justify-center gap-6 flex-wrap my-4">
          {[
            { val: 32, label: 'Desempeño' },
            { val: 28, label: 'Relaciones' },
            { val: 22, label: 'Visibilidad' },
            { val: 18, label: 'Timing' }
          ].map(g => (
            <div key={g.label} className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                  <circle className="fill-none stroke-[#E3DDD7] stroke-[8]" cx="35" cy="35" r="32" />
                  <motion.circle 
                    className="fill-none stroke-[#CE611A] stroke-[8]" 
                    cx="35" cy="35" r="32" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: g.val / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray="201 201"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-[#341205] text-sm">{g.val}%</div>
              </div>
              <div className="font-display text-[13px] font-bold text-[#341205] mt-1.5">{g.label}</div>
            </div>
          ))}
        </div>
        <p className="font-sans text-[11px] text-[#B9A193] text-center mt-2">Fuente: Harvard Business Review · Estudio de 1.200 promociones LATAM</p>
      </div>

      <div className="bg-[linear-gradient(135deg,#fff8f3,#fef4ec)] border-l-4 border-[#CE611A] rounded-r-lg p-[18px_22px] my-6 shadow-[0_2px_12px_rgba(206,97,26,0.08)]">
        <p className="m-0 italic text-[#6B3A1F]"><strong>Dato incómodo:</strong> La decisión de promoción se toma en 20 minutos en una sala donde tú no estás. Lo que se discute no es tu CV — es la <em>percepción</em> que tienen de ti.</p>
      </div>

      <ul className="list-none my-4 flex flex-col gap-2">
        {[
          'El 68% de las promociones se deciden por factores relacionales, no técnicos',
          'Los profesionales con un "sponsor" activo ascienden 3× más rápido',
          'La percepción de "encaje cultural" pesa más que el desempeño en evaluaciones de liderazgo',
          'El empleado que hace sentir bien a su jefe aparece primero en la lista de candidatos',
        ].map(item => (
          <li key={item} className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg text-sm shadow-[0_1px_6px_rgba(52,18,5,0.05)]">
            <div className="w-[22px] h-[22px] rounded-full bg-[linear-gradient(135deg,#CE611A,#B57337)] flex items-center justify-center text-white text-[10px] shrink-0 mt-0.5">✓</div>
            <div className="flex-1 leading-relaxed">{item}</div>
          </li>
        ))}
      </ul>

      <Quiz 
        id="fq1"
        title="✅ Fija lo aprendido — Capítulo 1"
        description="¿Qué tan bien entendiste el mito de la meritocracia?"
        questions={[{
          id: 'q1',
          text: 'Según la guía, ¿cuál es el factor que más peso tiene en una decisión de promoción?',
          options: [
            { val: 'A', text: 'La experiencia técnica acumulada' },
            { val: 'B', text: 'Los años en la empresa' },
            { val: 'C', text: 'Las relaciones y la percepción de los superiores' },
            { val: 'D', text: 'El título universitario' }
          ]
        }]}
        onCalculate={() => {
          const ans = quizAnswers['q1'];
          if (ans === 'C') {
            setQuizResults(prev => ({ ...prev, fq1: { isCorrect: true, text: '🎯 ¡Correcto! El 68% de las promociones se deciden por factores relacionales. La competencia técnica es solo el boleto de entrada — las relaciones y la percepción son las que deciden quién sube.' } }));
          } else {
            setQuizResults(prev => ({ ...prev, fq1: { isCorrect: false, text: '❌ No exactamente. El factor más determinante son las relaciones y la percepción que los superiores tienen de ti. La competencia técnica es necesaria, pero solo es el punto de partida.' } }));
          }
        }}
        result={quizResults['fq1']}
        selectedAnswers={quizAnswers}
        onSelect={handleQuizAnswer}
      />
    </div>
  );

  const renderCap2 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 2</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Ruptura Consciente</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Deja de ser el "Bocó" de la oficina</p>
      </div>
      <p>El "Bocó" es el empleado que cree que si hace todo perfecto le darán un premio. El Estratégico sabe que la perfección es invisible si no se comunica correctamente.</p>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">🧠 Perfiles Corporativos: ¿Cuál eres tú?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#fdecea] p-4 rounded-xl border border-[#f5c2c2]">
            <h4 className="font-sans text-sm font-bold text-[#c62828] mb-2">❌ El Bocó Reaccionario</h4>
            <ul className="text-xs text-[#a04040] space-y-1.5 list-none p-0">
              <li>• Espera a que el jefe "se dé cuenta" solo</li>
              <li>• Se queja en la cafetera sobre la injusticia</li>
              <li>• Hace horas extras en silencio</li>
            </ul>
          </div>
          <div className="bg-[#eafaea] p-4 rounded-xl border border-[#c2f5c2]">
            <h4 className="font-sans text-sm font-bold text-[#2e7d32] mb-2">✅ El Estratega Favorito</h4>
            <ul className="text-xs text-[#408040] space-y-1.5 list-none p-0">
              <li>• Informa cada pequeño avance como un hito</li>
              <li>• Gestiona la percepción antes del resultado</li>
              <li>• Solo trabaja extra si el jefe lo ve</li>
            </ul>
          </div>
        </div>
      </div>
      <ScriptBox 
        title="🗣️ Script — Rompiendo el silencio"
        script='"[Nombre], no quería interrumpirte antes pero quería que supieras que el proyecto [X] ya está al 80%. Me enfoqué en la parte que más te preocupaba para tenerla lista hoy."'
        caption="Úsalo para interrumpir la invisibilidad y mostrar enfoque en las prioridades del jefe."
        onCopy={handleCopy}
      />
    </div>
  );

  const renderCap3 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 3</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">El Juego del Ego</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Comprende qué mueve realmente a tus jefes</p>
      </div>
      <p>Las decisiones corporativas son emocionales justificadas con datos. El 90% de lo que hace un directivo es para proteger su estatus or reducir su ansiedad.</p>
      <div className="bg-[linear-gradient(135deg,#341205_0%,#4a1c0a_100%)] rounded-[14px] p-6 my-6 text-white text-center">
        <div className="text-4xl mb-3">🛡️</div>
        <h3 className="font-display text-lg mb-2">La Regla de Oro del Favorito</h3>
        <p className="font-sans text-sm italic opacity-85">"Nunca pongas a tu jefe en una situación donde parezca ignorante o desinformado frente a otros."</p>
      </div>
      <p>Si proteges el ego de tu jefe, él protegerá tu posición. No es ética, es supervivencia corporativa.</p>
    </div>
  );

  const renderCap5 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 5</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Ego Management</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Haz que tu jefe brille y tú brillarás con él</p>
      </div>
      <p>Un jefe que brilla gracias a ti te protegerá. Es una alianza de mutuo beneficio, no una sumisión. Si él sube, te lleva con él porque eres su soporte crítico.</p>
      <ScriptBox 
        title="🗣️ Script — Atribuyendo éxito"
        script='"Esto salió muy bien gracias a la directriz que nos diste el lunes. Seguí tu lógica de [X] y los resultados están a la vista."'
        caption="Puxa-saquismo puro: le das crédito por el resultado aunque tú hicieras el trabajo. Él te querrá cerca para siempre."
        onCopy={handleCopy}
      />
    </div>
  );

  const renderCap6 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 6</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Estética del Poder</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Cómo parecer que ya llegaste — antes de llegar</p>
      </div>
      <p>La competencia técnica es el ingrediente. La presentación es lo que vende. Si nadie sabe lo que haces, es como si no lo hicieras.</p>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">⚡ Los 5 Pilares de la Estética del Poder</h3>
        <div className="flex flex-col gap-0">
          {[
            { id: 1, t: 'Lenguaje Corporal de Liderazgo', p: 'Entra a las reuniones 1 minuto antes. Ocupa espacio físico. Habla despacio.' },
            { id: 2, t: 'Comunicación Escrita de Alto Impacto', p: 'Emails concisos, estructurados, con llamada a la acción clara. La claridad es poder.' },
            { id: 3, t: 'Toma de Espacio en Reuniones', p: 'Una intervención de calidad vale más que cinco comentarios vacíos. Habla menos, di más.' },
            { id: 4, t: 'Visibilidad Ascendente', p: 'Asegúrate de que personas un nivel sobre tu jefe sepan tu nombre. Sin ambición visible.' },
            { id: 5, t: 'Documentación de Logros', p: 'Al terminar cada proyecto, envía un resumen de resultados. No para presumir — para registrar.' },
          ].map(item => (
            <div key={item.id} className="flex gap-3.5 items-start relative pb-4 last:pb-0">
              {item.id !== 5 && <div className="absolute left-[18px] top-[38px] bottom-0 w-0.5 bg-[#E3DDD7]" />}
              <div className="w-[38px] h-[38px] rounded-full bg-[linear-gradient(135deg,#CE611A,#B57337)] flex items-center justify-center text-white font-sans font-bold text-[15px] shrink-0">
                {item.id}
              </div>
              <div>
                <h4 className="font-sans text-[14px] font-bold text-[#341205] mb-[3px]">{item.t}</h4>
                <p className="font-sans text-[12px] text-[#B57337] m-0 leading-[1.5]">{item.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TemplateBox 
        title="📧 Template — Email de Actualización de Logros"
        content={`Asunto: Actualización de avances — [Tu Nombre] · Semana [N]

Hola [Nombre del jefe],

Te comparto un breve resumen de la semana:

✅ COMPLETADO
• [Logro 1] → Impacto: [resultado medible]
• [Logro 2] → Impacto: [resultado medible]

📌 EN PROGRESO
• [Tarea X] — Entrega estimada: [fecha]

🚀 PRÓXIMA SEMANA
• [Iniciativa] para [objetivo del equipo]

¿Hay algo en lo que deba enfocarme más?

[Tu nombre]`}
        fields={['[Tu Nombre]', '[Nombre del jefe]', '[Logros]', '[Impacto]']}
        onCopy={handleCopy}
      />
      <div className="bg-[linear-gradient(135deg,#f5f0ea,#ede6dd)] border border-[#E3DDD7] rounded-[10px] p-[18px_22px] my-6">
        <div className="font-sans text-[10px] font-bold tracking-[2px] uppercase text-[#B57337] mb-2">📧 Táctica esta semana</div>
        <p className="m-0 text-[14.5px] text-[#6B3A1F]">Envía este email al final del viernes. No para pedir nada — para "mantenerlo al tanto." Observa cómo cambia tu próxima conversación cara a cara.</p>
      </div>

      <Quiz 
        id="fq6"
        title="✅ Fija lo aprendido — Capítulo 6"
        description="Estética del Poder en la práctica"
        questions={[{
          id: 'q6',
          text: 'En una reunión importante, ¿cuál es la táctica de Estética del Poder más efectiva?',
          options: [
            { val: 'A', text: 'Hablar lo más posible para demostrar conocimiento' },
            { val: 'B', text: 'Llegar exactamente a la hora para no perder tiempo' },
            { val: 'C', text: 'Hacer una sola intervención precisa con datos concretos' },
            { val: 'D', text: 'Esperar a que el jefe hable primero y luego estar de acuerdo' }
          ]
        }]}
        onCalculate={() => {
          const ans = quizAnswers['q6'];
          if (ans === 'C') {
            setQuizResults(prev => ({ ...prev, fq6: { isCorrect: true, text: '🎯 ¡Exacto! Una intervención de calidad vale infinitamente más que cinco comentarios vacíos. Los líderes hablan poco y dicen mucho. Cuando hablas con datos concretos y precisión, proyectas autoridad sin pedirla.' } }));
          } else {
            setQuizResults(prev => ({ ...prev, fq6: { isCorrect: false, text: '❌ Más palabras no significan más poder. Al contrario: hablar mucho sin precisión diluye tu impacto. La Estética del Poder dice que una sola intervención con datos concretos es lo que te hace memorable en una reunión.' } }));
          }
        }}
        result={quizResults['fq6']}
        selectedAnswers={quizAnswers}
        onSelect={handleQuizAnswer}
      />
    </div>
  );

  const renderCap8 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 8</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Ser Políticamente Intocable</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Sin enemigos, sin exposición, sin riesgos innecesarios</p>
      </div>
      <p>En toda empresa existe política interna. No participar en ella no te protege — te deja desprotegido. La clave no es jugar sucio: es construir una posición tan sólida que nadie quiera atacarte.</p>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">🚫 Los 5 Temas Prohibidos del Profesional Estratégico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { icon: '⛪', t: 'Política y Religión', p: 'Generan divisiones emocionales que no necesitas. Nunca.' },
            { icon: '💸', t: 'Vida Financiera', p: 'No muestres desesperación por dinero ni ostentación excesiva.' },
            { icon: '😔', t: 'Crisis Personales', p: 'Las vulnerabilidades reales se usan en tu contra en momentos de recorte.' },
            { icon: '🔙', t: 'Críticas a Gestiones Anteriores', p: 'Muestra falta de lealtad al "maestro" actual.' },
            { icon: '🗣️', t: 'Chismes Directos', p: 'Si hablas mal de X con Y, Y sabrá que hablas mal de Y con X.' },
            { icon: '🤝', t: 'Tomar Partido', p: 'En conflictos entre pares, escucha a todos y no opines sobre personas.' },
          ].map(item => (
            <div key={item.icon} className="bg-white rounded-lg p-3 px-3.5 border-l-4 border-l-[#c62828] flex gap-2.5 items-start shadow-sm">
              <div className="text-[20px] shrink-0">{item.icon}</div>
              <div>
                <h4 className="font-sans text-[12px] font-bold text-[#341205] mb-0.5">{item.t}</h4>
                <p className="font-sans text-[11px] text-[#B57337] m-0 leading-tight">{item.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScriptBox 
        title="🗣️ Script — Cuando te piden tomar partido"
        script='"Entiendo tu perspectiva y me parece válida. No conozco todos los detalles del otro lado, así que prefiero quedarme con mi opinión sobre el proceso, no sobre las personas. ¿Qué necesitas de mí para resolver esto?"'
        caption="Resultado: quedas como diplomático, no como cobarde. Y no acumulas enemigos."
        onCopy={handleCopy}
      />
      <ScriptBox 
        title="🗣️ Script — Cuando un colega intenta hablar mal de otro contigo"
        script='"Vaya, parece una situación compleja entre ustedes. Yo trato de enfocarme en la parte técnica para no distraerme, pero ojalá se solucione pronto."'
        caption="Cierras el chisme sin crear un enemigo. Neutral de lujo."
        onCopy={handleCopy}
      />

      <Quiz 
        id="fq8"
        title="✅ Fija lo aprendido — Capítulo 8"
        description="Política interna — pon a prueba tu instinto"
        questions={[{
          id: 'q8',
          text: 'Un colega de confianza te cuenta que otro colega dijo algo negativo sobre ti en una reunión. ¿Cuál es la respuesta del Estratega Intocable?',
          options: [
            { val: 'A', text: 'Confrontar directamente al colega que habló mal para aclarar las cosas' },
            { val: 'B', text: 'Contar lo que pasó a otros colegas de confianza para ganar apoyo' },
            { val: 'C', text: 'Escuchar, no reaccionar de inmediato, y continuar siendo amable con esa persona' },
            { val: 'D', text: 'Reportarlo al jefe para que intervenga' }
          ]
        }]}
        onCalculate={() => {
          const ans = quizAnswers['q8'];
          if (ans === 'C') {
            setQuizResults(prev => ({ ...prev, fq8: { isCorrect: true, text: '🎯 ¡Correcto! Reaccionar impulsivamente convierte un rumor en un conflicto real. El estratega escucha, absorbe la información y continúa actuando con normalidad. Tu calma es tu poder.' } }));
          } else {
            setQuizResults(prev => ({ ...prev, fq8: { isCorrect: false, text: '❌ Confrontar, chismear o escalar todas amplifican el problema. La respuesta C es the correcta: escuchar, no reaccionar, y continuar siendo amable. Tu ecuanimidad te hace intocable.' } }));
          }
        }}
        result={quizResults['fq8']}
        selectedAnswers={quizAnswers}
        onSelect={handleQuizAnswer}
      />
    </div>
  );

  const renderCap9 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 9</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Biblioteca de Scripts y Templates</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Frases y textos listos para cada situación corporativa</p>
      </div>
      <p>Esta es la sección más práctica de toda la guía. Scripts clasificados por situación — copia, adapta y usa el día de mañana.</p>

      <div className="font-sans text-[10px] font-bold tracking-[2px] uppercase text-[#CE611A] my-5 mb-2.5">📬 Templates de Email</div>
      <TemplateBox 
        title="📧 Solicitar Reunión 1:1 con el Jefe"
        content={`Asunto: ¿Podemos agendar 20 min esta semana?

Hola [Nombre],

Quisiera tenerte al tanto de algunos avances y también escuchar tu perspectiva sobre [tema relevante].

¿Tienes disponibilidad el [día] en la mañana o [día] en la tarde?

Quedo pendiente,
[Tu nombre]`}
        fields={['[Nombre]', '[tema relevante]', '[días disponibles]']}
        onCopy={handleCopy}
      />
      <TemplateBox 
        title="📧 Reportar un Error — Con Solución"
        content={`Asunto: Situación a resolver — [tema] — Propuesta adjunta

Hola [Nombre],

Quiero informarte sobre un inconveniente que detecté:

❗ Situación: [descripción breve y factual]
📌 Impacto potencial: [consecuencia si no se atiende]

✅ Mi propuesta de solución:
[Acción 1] → Responsable: yo → Plazo: [fecha]
[Acción 2] → Responsable: [quien] → Plazo: [fecha]

¿Está bien si procedo? Puedo hacerlo hoy mismo.

[Tu nombre]`}
        fields={['[tema]', '[situación]', '[impacto]', '[solución]']}
        onCopy={handleCopy}
      />

      <div className="font-sans text-[10px] font-bold tracking-[2px] uppercase text-[#CE611A] my-6 mb-2.5">💬 Scripts de Conversación Verbal</div>
      <ScriptBox 
        title="🗣️ Pedirle Feedback al Jefe (Sin Parecer Inseguro)"
        script='"[Nombre], quiero asegurarme de que mi aporte esté alineado con lo que necesitas del equipo. ¿Hay una o dos áreas donde sientes que puedo sumar más este trimestre?"'
        caption="Abres la puerta a una conversación de desarrollo sin pedir validación emocional."
        onCopy={handleCopy}
      />
      <ScriptBox 
        title="🗣️ Para Pedir un Aumento Estratégicamente"
        script='"[Nombre], en los últimos [N meses] he [logros concretos con números]. Me gustaría hablar sobre cómo mi compensación puede reflejar ese nivel de contribución. ¿Podemos agendar una conversación esta semana?"'
        caption="No pides el aumento — presentas el caso. Hay una diferencia enorme."
        onCopy={handleCopy}
      />
    </div>
  );

  const renderCap10 = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Capítulo 10</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Tu Plan de Ascenso en 90 Días</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Diseña tu estrategia personalizada — empieza mañana</p>
      </div>
      <p>Sin un plan, las tácticas se convierten en reacciones. Con un plan, cada conversación, email y reunión se vuelve un movimiento estratégico hacia un objetivo claro. Responde para generar el tuyo.</p>
      <Quiz 
        id="quiz2"
        title="🗺️ Generador de Plan Personalizado"
        description="Tus respuestas generarán un plan de 90 días específico para tu situación"
        questions={[
          {
            id: 'pl1',
            text: '1. ¿Cuánto tiempo llevas sin promoción?',
            options: [
              { val: 'A', text: 'Menos de 1 año' },
              { val: 'B', text: 'Entre 1 y 2 años' },
              { val: 'C', text: 'Más de 2 años' }
            ]
          },
          {
            id: 'pl2',
            text: '2. ¿Cuál es tu mayor obstáculo para ascender ahora mismo?',
            options: [
              { val: 'A', text: 'No sé cómo comunicar mejor mi trabajo' },
              { val: 'B', text: 'Mi jefe no me apoya activamente' },
              { val: 'C', text: 'La competencia interna con colegas' }
            ]
          },
          {
            id: 'pl3',
            text: '3. ¿Cuándo sería ideal tu próxima evaluación de desempeño?',
            options: [
              { val: 'A', text: 'Ya viene en menos de 30 días' },
              { val: 'B', text: 'En 1-3 meses' },
              { val: 'C', text: 'En más de 3 meses' }
            ]
          }
        ]}
        onCalculate={() => {
          const l = quizAnswers['pl1'];
          const o = quizAnswers['pl2'];
          const t = quizAnswers['pl3'];
          if (!l || !o || !t) {
            setQuizResults(prev => ({ ...prev, quiz2: { text: '⚠️ Responde las 3 preguntas para generar tu plan.' } }));
            return;
          }
          const urgency = l === 'C' ? 'ALTA URGENCIA' : l === 'B' ? 'urgencia media' : 'urgencia baja';
          const focusMap: any = { A: 'Capítulo 6 (Estética del Poder) + emails de logros', B: 'Capítulo 5 (Ego Management) + Bonus 2 (Radar)', C: 'Capítulo 8 (Política interna) + Bonus 1 (Boca de Huevo)' };
          const timeMap: any = { A: 'Tienes menos de 30 días — empieza HOY con el Script más directo', B: 'Tienes tiempo para construir — sé consistente 3 semanas antes de pedir nada', C: 'Tienes tiempo suficiente — construye una base sólida antes de la conversación de carrera' };
          const txt = `✅ <strong>Tu Plan Personalizado — ${urgency}</strong><br><br>
          <strong>Tu foco principal esta semana:</strong> ${focusMap[o]}<br><br>
          <strong>Sobre tu evaluación:</strong> ${timeMap[t]}<br><br>
          <strong>Semanas 1-2:</strong> Pilar 1 (Ruptura Consciente) + 1 script de Ego Management<br>
          <strong>Semanas 3-4:</strong> Estética del Poder + cierre de proyectos con visibilidad<br>
          <strong>Mes 2:</strong> Radar de Inseguridades activo + política interna + LinkedIn Mercenario<br>
          <strong>Mes 3:</strong> 1:1 de desarrollo + presentación de logros + pregunta directa por el ascenso`;
          setQuizResults(prev => ({ ...prev, quiz2: { text: txt } }));
        }}
        result={quizResults['quiz2']}
        selectedAnswers={quizAnswers}
        onSelect={handleQuizAnswer}
      />
      <div className="bg-white rounded-[14px] p-6 mt-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">📅 Estructura Base de los 90 Días</h3>
        <div className="relative pl-7 my-4 border-l-2 border-l-[#CE611A]">
          {[
            { t: 'Días 1–14 · Observación y Activación', p: 'Ruptura Consciente + primer Script de Ego con el jefe + email de actualización semanal' },
            { t: 'Días 15–30 · Construcción de Visibilidad', p: 'Estética del Poder activa + cierre de proyectos con visibilidad + primer 1:1 estratégico' },
            { t: 'Días 31–60 · Radar y Política', p: 'Radar de inseguridades activo + construcción de alianzas + LinkedIn Mercenario encendido' },
            { t: 'Días 61–90 · Conversación de Carrera', p: 'Solicitar 1:1 de desarrollo + presentar logros documentados + hacer la pregunta directa' },
          ].map((item, i) => (
            <div key={i} className="relative mb-[18px] last:mb-0">
              <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-[#CE611A] border-2 border-[#F0ECE8]" />
              <h4 className="font-sans text-[13px] font-bold text-[#341205] mb-[3px]">{item.t}</h4>
              <p className="font-sans text-[12px] text-[#B57337] m-0 leading-[1.5]">{item.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBonusIntro = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Material Adicional</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Tus 3 Bonuses Exclusivos</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Contenido que multiplica el efecto de todo lo que aprendiste</p>
      </div>
      <div className="bg-[linear-gradient(135deg,#fff8f3,#fef4ec)] border-l-4 border-[#CE611A] rounded-r-lg p-[18px_22px] my-6 shadow-[0_2px_12px_rgba(206,97,26,0.08)]">
        <p className="m-0 italic text-[#6B3A1F]">Los bonuses que siguen <strong>no son extras decorativos</strong>. Son las tres herramientas de emergencia que completan el arsenal del Empleado Estratégico. Léelos con la misma atención que los capítulos anteriores.</p>
      </div>
      <div className="grid gap-3.5 my-6">
        {[
          { icon: '🥚', t: 'Bonus 1 — El Manual Boca de Huevo', p: 'Cómo ser la persona más confiable de la empresa sin comprometer ninguna opinión. Domina el silencio estratégico.' },
          { icon: '📡', t: 'Bonus 2 — El Radar de Inseguridades', p: 'Cómo identificar qué le quita el sueño a tu jefe antes de que él lo diga. Quien anticipa, domina.' },
          { icon: '💼', t: 'Bonus 3 — LinkedIn Mercenario', p: 'Cómo construir tu red de escape silenciosa y aumentar tu valor interno — sin levantar sospechas.' },
        ].map(card => (
          <div key={card.icon} className="bg-white rounded-lg p-[18px_20px] shadow-[0_2px_16px_rgba(52,18,5,0.07)] border-t-3 border-[#CE611A] flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#CE611A,#B57337)] flex items-center justify-center text-[17px] shrink-0 text-white">{card.icon}</div>
            <div>
              <h4 className="font-display text-[15px] font-bold text-[#341205] mb-1.5">{card.t}</h4>
              <p className="font-sans text-[13px] leading-relaxed m-0 text-[#6B3A1F]">{card.p}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBonus1Intro = () => (
    <div className="markdown-body">
      <div className="bg-[linear-gradient(135deg,#341205_0%,#4a1c0a_100%)] rounded-[14px] p-[22px_24px] my-6 text-[#F0ECE8] relative overflow-hidden">
        <div className="absolute top-[-8px] right-4 font-display text-[80px] font-bold text-white/5 tracking-[-2px] select-none">BONUS</div>
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-[6px]">Bonus 1 de 3</div>
        <h2 className="font-display text-[22px] mb-2 text-white">El Manual "Boca de Huevo"</h2>
        <p className="font-sans text-[13px] text-[#B9A193] m-0">El arte de ser la persona más confiable de la empresa sin decir nada comprometedor</p>
      </div>
      <p>En el ambiente corporativo, tu boca puede ser tu peor enemiga. La técnica "Boca de Huevo" consiste en elegir tus palabras con cuidado extremo, actuando como un filtro.</p>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">🧠 Fundamentación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { icon: '🤐', t: 'Silencio Estratégico', p: 'Cuando no das una opinión fuerte, los demás hablan de más y obtienes información.' },
            { icon: '🧲', t: 'Imán de Secretos', p: 'La gente confía en quien no "lleva y trae". Te vuelves el repositorio más valioso.' },
            { icon: '🛡️', t: 'Intocable', p: 'No puedes ser citado ni acusado de nada si no dijiste nada comprometedor. Protección total.' },
          ].map(item => (
            <div key={item.t} className="bg-[#F0ECE8] rounded-[10px] p-3.5 text-center border border-[#E3DDD7]">
              <div className="text-[26px] mb-1.5">{item.icon}</div>
              <h4 className="font-sans text-xs font-bold text-[#341205] mb-1">{item.t}</h4>
              <p className="font-sans text-[11px] text-[#B57337] leading-relaxed m-0">{item.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBonus1Scripts = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Bonus 1 · Continuación</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Scripts del Boca de Huevo</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Frases neutras de alto impacto</p>
      </div>
      <div className="flex flex-col gap-1">
        <ScriptBox 
          title="🗣️ Ante decisiones polémicas"
          script='"Es un movimiento interesante. Creo que tiene una visión de largo plazo que aún estamos procesando. Vamos a ver cómo evoluciona."'
          caption="Eficiencia neutra: no te comprometes, pero pareces analítico."
          onCopy={handleCopy}
        />
        <ScriptBox 
          title="🗣️ Ante el chisme"
          script='"Vaya, parece una situación compleja. Yo trato de enfocarme en la parte técnica para no distraerme, pero ojalá se solucione pronto."'
          caption="Protección total: te sales del fango manteniendo la cordialidad."
          onCopy={handleCopy}
        />
      </div>
    </div>
  );

  const renderBonus2Intro = () => (
    <div className="markdown-body">
       <div className="bg-[linear-gradient(135deg,#341205_0%,#4a1c0a_100%)] rounded-[14px] p-[22px_24px] my-6 text-[#F0ECE8] relative overflow-hidden">
        <div className="absolute top-[-8px] right-4 font-display text-[80px] font-bold text-white/5 tracking-[-2px] select-none">BONUS</div>
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-[6px]">Bonus 2 de 3</div>
        <h2 className="font-display text-[22px] mb-2 text-white">El Radar de Inseguridades</h2>
        <p className="font-sans text-[13px] text-[#B9A193] m-0">Identifica qué le quita el sueño a tu jefe</p>
      </div>
      <div className="bg-white rounded-[14px] p-6 my-6 shadow-[0_4px_20px_rgba(52,18,5,0.08)]">
        <h3 className="font-display text-[17px] text-[#341205] mb-4.5 text-center">⚡ La Transferencia de Ansiedad</h3>
        <div className="flex flex-col gap-0">
          {[
            { icon: '!', bg: 'linear-gradient(135deg,#c62828,#a00)', t: 'Presión Directiva', p: 'Tu jefe recibe presión desde arriba.' },
            { icon: '→', bg: 'linear-gradient(135deg,#b57337,#8B5230)', t: 'Desborde emocional', p: 'El equipo se queja, el estratega comprende.' },
            { icon: '✓', bg: 'linear-gradient(135deg,#CE611A,#B57337)', t: 'Sedante táctico', p: 'Ofreces apoyo y datos. Ganas confianza total.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3.5 items-start relative pb-4 last:pb-0">
              {i !== 2 && <div className="absolute left-[18px] top-[38px] bottom-0 w-0.5 bg-[#E3DDD7]" />}
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-sans font-bold text-[15px] shrink-0" style={{ background: item.bg }}>{item.icon}</div>
              <div>
                <h4 className="font-sans text-[14px] font-bold text-[#341205] mb-[3px]">{item.t}</h4>
                <p className="font-sans text-[12px] text-[#B57337] m-0 leading-[1.5]">{item.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBonus2Scripts = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Bonus 2 · Continuación</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Scripts del Sedante Estratégico</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Calma al jefe y posiciónate como su activo</p>
      </div>
      <div className="flex flex-col gap-1">
        <ScriptBox 
          title="🗣️ Tras presión de la dirección"
          script='"[Nombre], noté que la reunión estuvo intensa. Me adelanté y preparé este resumen clave por si te vuelven a preguntar. Estoy contigo."'
          caption="Sedativo táctico: el jefe siente que tiene un guardaespalda informativo."
          onCopy={handleCopy}
        />
        <ScriptBox 
          title="🗣️ Ante reto grande"
          script='"Es un reto grande, pero con tu visión tenemos base sólida. Me encargo de lo operativo para que tú te enviaran a la estrategia."'
          caption="Validación de estatus: le das el título de estratega y tú el de ejecutor de confianza."
          onCopy={handleCopy}
        />
      </div>
    </div>
  );

  const renderBonus3Intro = () => (
    <div className="markdown-body">
      <div className="bg-[linear-gradient(135deg,#341205_0%,#4a1c0a_100%)] rounded-[14px] p-[22px_24px] my-6 text-[#F0ECE8] relative overflow-hidden">
        <div className="absolute top-[-8px] right-4 font-display text-[80px] font-bold text-white/5 tracking-[-2px] select-none">BONUS</div>
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-[6px]">Bonus 3 de 3</div>
        <h2 className="font-display text-[22px] mb-2 text-white">LinkedIn Mercenario</h2>
        <p className="font-sans text-[13px] text-[#B9A193] m-0">Atrae ofertas mientras finges lealtad</p>
      </div>
      <p>El Favorito Estratégico cultiva la imagen de ser un talento codiciado. Cuando tu jefe siente que puede perderte, dejas de ser un costo y eres un activo a seducir.</p>
    </div>
  );

  const renderBonus3Profile = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Bonus 3 · Continuación</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Tu Perfil Mercenario</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">La vitrina que atrae headhunters</p>
      </div>
      <div className="flex flex-col gap-1">
        <ScriptBox 
          title="🗣️ Para sembrar la semilla del miedo"
          script='"[Nombre], me contactaron de otra empresa, pero les dije que mi compromiso es con nosotros. Me hizo pensar en cómo fortalecer mi rol aquí."'
          caption="Mercenario táctico: generas deseo por escasez sin romper la lealtad aparente."
          onCopy={handleCopy}
        />
      </div>
    </div>
  );

  const renderChecklistMaestro = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Herramienta 1</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Checklist del Estratega</h2>
        <p className="italic text-[15px] text-[#B57337] leading-[1.5]">Rituales diarios</p>
      </div>
      <div className="bg-white rounded-lg p-5 shadow-sm border-t-3 border-[#CE611A]">
        <ul className="list-none p-0 m-0">
          <li className="text-xs text-[#6B3A1F] py-2">• Documentar 1 logro diario</li>
          <li className="text-xs text-[#6B3A1F] py-2">• Verificar estética del poder antes de entrar</li>
          <li className="text-xs text-[#6B3A1F] py-2">• Escucha activa en las reuniones</li>
        </ul>
      </div>
    </div>
  );

  const renderTemplatesExtra = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
         <div className="font-sans text-[10px] font-bold tracking-[3px] uppercase text-[#CE611A] mb-2">Herramienta 3</div>
        <h2 className="font-display text-[clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5">Templates de Emergencia</h2>
      </div>
      <TemplateBox 
        title="📧 Informe de Error"
        content={`Hola, asumo responsabilidad por [error]. Ya tengo [solución] en marcha.`}
        fields={['[error]', '[solución]']}
        onCopy={handleCopy}
      />
    </div>
  );

  const renderFinalQuiz = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <h2 className="font-display text-[ clamp(22px,5vw,32px)] font-bold text-[#341205] leading-[1.2] mb-2.5 text-center">Examen Final</h2>
      </div>
      <Quiz 
        id="final"
        title="Validación Final"
        description="Ponte a prueba"
        questions={[
          {
            id: 'f1', text: '¿Qué es lo más importante para ser el Favorito?',
            options: [
              { val: 'A', text: 'Trabajar 20 horas diarias' },
              { val: 'B', text: 'Ser estratégico y visible' },
              { val: 'C', text: 'Tener suerte' }
            ]
          }
        ]}
        onCalculate={() => setQuizResults(prev => ({ ...prev, final: { text: quizAnswers['f1'] === 'B' ? '✅ ¡LOGRADO! Estás listo.' : '❌ Revisa el contenido.' } }))}
        result={quizResults['final']}
        selectedAnswers={quizAnswers}
        onSelect={handleQuizAnswer}
      />
    </div>
  );

  const renderSummary = () => (
    <div className="markdown-body">
      <div className="mb-08 pb-5 border-b border-[#E3DDD7]">
        <h2 className="font-display text-2xl font-bold text-[#341205] mb-2.5 text-center">Hoja de Ruta Final</h2>
      </div>
      <p className="text-center italic">Has completado el viaje. Ahora la ejecución es tuya.</p>
    </div>
  );

  const renderConclusion = () => (
    <div className="markdown-body text-center">
      <div className="py-12">
        <h2 className="font-display text-[32px] font-bold text-[#341205] mb-4">¡Enhorabuena!</h2>
        <p className="text-lg text-[#B57337] mb-8">Has terminado la Guía del Empleado Favorito.</p>
        <button onClick={() => setCurrentPage(0)} className="bg-[#341205] text-white px-8 py-3 rounded-lg font-bold">Reiniciar lectura</button>
      </div>
    </div>
  );

  // Menu items list for the drawer
  const menuSections = [
    { label: 'Inicio', from: 0, to: 1 },
    { label: 'Capítulos', from: 2, to: 12 },
    { label: 'Bonuses', from: 13, to: 19 },
    { label: 'Herramientas', from: 20, to: 25 },
  ];

  const Cap4Wrapper = () => <Cap4 handleCopy={handleCopy} />;
  const Cap7Wrapper = () => <Cap7 handleCopy={handleCopy} />;

  // Re-memoizing with corrected components
  const pageContentFixed = useMemo(() => [
    renderCover(), renderIndex(), renderIntro(), renderCap1(), renderCap2(), renderCap3(), <Cap4Wrapper />, renderCap5(), renderCap6(), <Cap7Wrapper />, renderCap8(), renderCap9(), renderCap10(),
    renderBonusIntro(), renderBonus1Intro(), renderBonus1Scripts(), renderBonus2Intro(), renderBonus2Scripts(), renderBonus3Intro(), renderBonus3Profile(),
    renderChecklistMaestro(), <FlashcardsSection />, renderTemplatesExtra(), renderFinalQuiz(), renderSummary(), renderConclusion()
  ], [currentPage, readPages, fontSize, quizAnswers, quizResults]);

  return (
    <div className="min-h-screen bg-[#F0ECE8] selection:bg-[#CE611A]/20" style={{ fontSize: `${fontSize}px` }}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#E3DDD7] z-[1000]">
        <motion.div 
          className="h-full bg-[linear-gradient(90deg,#CE611A,#B57337)]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentPage / (totalPages - 1)) * 100}%` }}
        />
      </div>

      {/* Top Bar */}
      <div className="fixed top-1 left-0 right-0 bg-[#F0ECE8]/97 backdrop-blur-[10px] border-b border-[#E3DDD7] flex items-center justify-between px-5 py-2 z-[999] gap-2.5">
        <button 
          onClick={() => setMenuOpen(true)}
          className="bg-none border-none cursor-pointer flex flex-col gap-1 p-1 hover:opacity-70 transition-opacity"
        >
          <span className="w-5 h-0.5 bg-[#341205] rounded-full" />
          <span className="w-5 h-0.5 bg-[#341205] rounded-full" />
          <span className="w-5 h-0.5 bg-[#341205] rounded-full" />
        </button>
        <span className="font-display text-[12px] italic text-[#B57337] truncate max-w-[180px]">Guía del Empleado Favorito</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="bg-[#CE611A] text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
            {readPages.size}/{totalPages} leídas
          </span>
          <button onClick={() => setFontSize(Math.max(14, fontSize - 1))} className="bg-none border border-[#B9A193] text-[#341205] cursor-pointer px-2 py-0.5 rounded font-sans text-[12px] font-bold hover:bg-[#CE611A] hover:text-white transition-all">A−</button>
          <button onClick={() => setFontSize(Math.min(22, fontSize + 1))} className="bg-none border border-[#B9A193] text-[#341205] cursor-pointer px-2 py-0.5 rounded font-sans text-[12px] font-bold hover:bg-[#CE611A] hover:text-white transition-all">A+</button>
        </div>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-[#341205]/30 z-[1999] backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ right: -320 }}
            animate={{ right: 0 }}
            exit={{ right: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[290px] h-screen bg-white shadow-[-4px_0_30px_rgba(52,18,5,0.15)] z-[2000] overflow-y-auto pt-5 pb-10"
          >
            <div className="flex items-center justify-between px-5 mb-3.5 pb-3.5 border-b border-[#E3DDD7]">
              <h2 className="font-display text-sm text-[#341205] m-0">📚 Índice del Ebook</h2>
              <button onClick={() => setMenuOpen(false)} className="bg-none border-none cursor-pointer text-[#B9A193] hover:text-[#CE611A]"><ChevronRight size={20}/></button>
            </div>
            <div className="flex flex-col">
              {menuSections.map(sec => (
                <div key={sec.label}>
                  <div className="font-sans text-[9px] font-bold tracking-[2px] uppercase text-[#B9A193] px-5 py-3 pt-4">{sec.label}</div>
                  {Array.from({ length: sec.to - sec.from + 1 }).map((_, i) => {
                    const idx = sec.from + i;
                    if (idx >= totalPages) return null;
                    return (
                      <button 
                        key={idx}
                        onClick={() => { setCurrentPage(idx); setMenuOpen(false); window.scrollTo(0,0); }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer text-left font-sans text-xs transition-colors border-l-4 ${currentPage === idx ? 'text-[#CE611A] border-[#CE611A] bg-[#fdf5f0] font-bold' : 'text-[#6B3A1F] border-transparent hover:bg-[#F0ECE8]'}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${currentPage === idx ? 'bg-[#CE611A] text-white' : 'bg-[#E3DDD7] text-[#341205]'}`}>{idx}</span>
                        <span className="flex-1 truncate">{['Portada', 'Índice', 'Introducción', 'Cap. 1', 'Cap. 2', 'Cap. 3', 'Cap. 4', 'Cap. 5', 'Cap. 6', 'Cap. 7', 'Cap. 8', 'Cap. 9', 'Cap. 10', 'Bonus Intro', 'Bonus 1 (Intro)', 'Bonus 1 Scripts', 'Bonus 2 (Intro)', 'Bonus 2 Scripts', 'Bonus 3 (Intro)', 'Bonus 3 Profile', 'Checklist Maestro', 'Flashcards', 'Templates Extra', 'Final Quiz', 'Summary', 'Conclusion'][idx]}</span>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${readPages.has(idx) ? 'bg-[#CE611A]' : 'bg-[#B9A193]'}`} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Body */}
      <main className="max-w-[700px] mx-auto px-7 pt-[90px] pb-[110px] min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.4 }}
          >
            {readPages.has(currentPage) && (
              <div className="inline-flex items-center gap-1.5 bg-[#e8f5e9] text-[#2e7d32] font-sans text-[10px] font-bold px-2 py-0.5 rounded-full mb-2.5 border border-[#a5d6a7]">
                <Check size={10} /> Leída
              </div>
            )}
            {pageContentFixed[currentPage] || (
              <div className="py-20 text-center opacity-50 italic">
                Página {currentPage} em construção...
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F0ECE8]/97 backdrop-blur-[10px] border-t border-[#E3DDD7] px-5 py-3 flex items-center justify-between gap-2.5 z-[998]">
        <button 
          onClick={() => nav(-1)} 
          disabled={currentPage === 0}
          className="flex items-center gap-1.5 bg-[#341205] text-[#F0ECE8] border-none px-4.5 py-2.5 rounded-lg font-sans text-xs font-bold cursor-pointer hover:bg-[#CE611A] hover:-translate-y-[1px] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft size={14}/> Anterior
        </button>
        
        <div className="flex flex-col items-center gap-1">
          <div className="font-sans text-[11px] text-[#B9A193] text-center min-w-[55px]">
            {currentPage + 1} / {totalPages}
          </div>
          <button 
            onClick={togglePageRead}
            className={`bg-[#E3DDD7] text-[#341205] border border-[#B9A193] px-3.5 py-1.5 rounded-lg font-sans text-[11px] font-bold cursor-pointer hover:bg-[#CE611A] hover:text-white hover:border-[#CE611A] transition-all whitespace-nowrap ${readPages.has(currentPage) ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#81c784]' : ''}`}
          >
            {readPages.has(currentPage) ? '✓ Leída' : 'Marcar leída'}
          </button>
        </div>

        <button 
          onClick={() => nav(1)} 
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-1.5 bg-[#CE611A] text-white border-none px-4.5 py-2.5 rounded-lg font-sans text-xs font-bold cursor-pointer hover:bg-[#6B3A1F] hover:-translate-y-[1px] transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          Siguiente <ChevronRight size={14}/>
        </button>
      </nav>

      <Toast message={toastMsg} show={showToast} />
    </div>
  );
}
