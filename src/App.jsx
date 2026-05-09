import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  User, Target, GraduationCap, Briefcase, Star, 
  ChevronRight, ChevronLeft, Plus, Trash2, 
  Download, Edit2, Check, X, Loader2,
  Sparkles, AlertCircle, LayoutTemplate
} from 'lucide-react';

const estadoInicial = {
  tela: 'form',
  etapaAtual: 1,
  template: 'moderno',
  dadosSalvos: false,
  pessoal: {
    nome: '', email: '', telefone: '',
    cidade: '', linkedin: '', foto: null
  },
  objetivo: { texto: '' },
  formacoes: [{
    id: 1, curso: '', instituicao: '',
    anoInicio: '', anoTermino: '', emAndamento: false
  }],
  experiencias: [{
    id: 1, empresa: '', cargo: '',
    inicio: '', fim: '', atual: false, descricao: ''
  }],
  habilidades: []
};

const SUGESTOES_HABILIDADES = [
  'JavaScript', 'React', 'Python', 'TypeScript', 'Node.js', 
  'Gestão Ágil', 'Comunicação', 'Inglês Fluente', 'SQL', 'Liderança', 'Figma'
];

export default function App() {
  const [estado, setEstado] = useState(estadoInicial);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [habilidadeInput, setHabilidadeInput] = useState('');
  
  const curriculoRef = useRef(null);

  useEffect(() => {
    if (estado !== estadoInicial) {
      localStorage.setItem('curriculo_dados', JSON.stringify({ ...estado, dadosSalvos: true }));
    }
  }, [estado]);

  const showToast = (mensagem, tipo = 'success') => {
    setToast({ tipo, mensagem });
    setTimeout(() => setToast(null), 4000);
  };

  const validarEtapa = () => {
    const novosErros = {};
    const { etapaAtual, pessoal, objetivo, habilidades } = estado;

    if (etapaAtual === 1) {
      if (!pessoal.nome) novosErros.nome = 'Obrigatório';
      if (!pessoal.email || !/^\S+@\S+\.\S+$/.test(pessoal.email)) novosErros.email = 'E-mail inválido';
      if (!pessoal.telefone) novosErros.telefone = 'Obrigatório';
    } else if (etapaAtual === 2) {
      if (!objetivo.texto || objetivo.texto.length < 20) novosErros.objetivo = 'Muito curto';
    } else if (etapaAtual === 5) {
      if (habilidades.length < 2) novosErros.habilidades = 'Mínimo 2';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const avancar = () => {
    if (validarEtapa()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (estado.etapaAtual === 5) setEstado({ ...estado, tela: 'preview' });
      else setEstado({ ...estado, etapaAtual: estado.etapaAtual + 1 });
    }
  };

  const voltar = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setEstado({ ...estado, etapaAtual: estado.etapaAtual - 1 });
  };

  const atualizarCampo = (secao, campo, valor, index = null) => {
    setEstado(prev => {
      const novoEstado = { ...prev };
      if (index !== null) {
        const novosItens = [...novoEstado[secao]];
        novosItens[index] = { ...novosItens[index], [campo]: valor };
        novoEstado[secao] = novosItens;
      } else {
        novoEstado[secao] = { ...novoEstado[secao], [campo]: valor };
      }
      return novoEstado;
    });
  };

  const handleFotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => atualizarCampo('pessoal', 'foto', reader.result);
      reader.readAsDataURL(file);
    }
  };



  const adicionarItem = (secao, template) => {
    setEstado(prev => ({ ...prev, [secao]: [...prev[secao], { id: Date.now(), ...template }] }));
  };

  const removerItem = (secao, id) => {
    setEstado(prev => ({ ...prev, [secao]: prev[secao].filter(item => item.id !== id) }));
  };

  const adicionarHabilidade = () => {
    if (habilidadeInput && !estado.habilidades.includes(habilidadeInput)) {
      setEstado(prev => ({ ...prev, habilidades: [...prev.habilidades, habilidadeInput] }));
      setHabilidadeInput('');
    }
  };

  const removerHabilidade = (hab) => {
    setEstado(prev => ({ ...prev, habilidades: prev.habilidades.filter(h => h !== hab) }));
  };

  const handleDownloadPDF = async () => {
    setEstado(prev => ({ ...prev, tela: 'loading' }));
    try {
      const canvas = await html2canvas(curriculoRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save('curriculo-pro.pdf');
      setEstado(prev => ({ ...prev, tela: 'preview' }));
      showToast('PDF Gerado!');
    } catch {
      setEstado(prev => ({ ...prev, tela: 'preview' }));
      showToast('Erro no PDF.', 'error');
    }
  };

  if (estado.tela === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="font-bold text-orange-400">Gerando seu currículo neon...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24 font-sans text-white selection:bg-orange-500/30">
      
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-800 border border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] rounded-2xl p-4 flex items-center gap-4 animate-slide-up">
          <div className={`w-2 h-2 rounded-full ${toast.tipo === 'error' ? 'bg-red-500' : 'bg-orange-500 animate-pulse'}`} />
          <span className="text-sm font-bold text-white">{toast.mensagem}</span>
        </div>
      )}



      {estado.tela === 'form' && (
        <div className="max-w-4xl mx-auto pt-12 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
                Gerador de <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">Currículo</span> ⚡⚡
              </h1>
              <p className="text-slate-400 font-medium">O seu próximo passo em Neon.</p>
            </div>

          </div>

          {/* Stepper Neon */}
          <div className="mb-12 flex justify-between px-2 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />
            {[1,2,3,4,5].map(step => (
              <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${estado.etapaAtual >= step ? 'bg-orange-500 text-white scale-110 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-slate-900 border-2 border-slate-800 text-slate-600'}`}>
                {step}
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            {/* ETAPA 1: PESSOAL */}
            {estado.etapaAtual === 1 && (
              <div className="p-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-orange-500"><User /> Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-full bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center relative overflow-hidden group">
                      {estado.pessoal.foto ? <img src={estado.pessoal.foto} className="w-full h-full object-cover" /> : <User className="w-10 text-slate-700" />}
                      <label className="absolute inset-0 bg-orange-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all text-white text-xs font-bold">
                        Upload
                        <input type="file" className="hidden" onChange={handleFotoUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-400 mb-2 block">Nome Completo</label>
                    <input type="text" className={`w-full p-4 bg-slate-950 border ${errors.nome ? 'border-red-500' : 'border-slate-800'} text-white rounded-xl focus:border-orange-500 outline-none`} value={estado.pessoal.nome} onChange={(e)=>atualizarCampo('pessoal','nome',e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-400 mb-2 block">E-mail Profissional</label>
                    <input type="email" className={`w-full p-4 bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-800'} text-white rounded-xl focus:border-orange-500 outline-none`} value={estado.pessoal.email} onChange={(e)=>atualizarCampo('pessoal','email',e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-400 mb-2 block">Telefone</label>
                    <input type="text" className={`w-full p-4 bg-slate-950 border ${errors.telefone ? 'border-red-500' : 'border-slate-800'} text-white rounded-xl focus:border-orange-500 outline-none`} value={estado.pessoal.telefone} onChange={(e)=>atualizarCampo('pessoal','telefone',e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2: OBJETIVO */}
            {estado.etapaAtual === 2 && (
              <div className="p-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-orange-500"><Target /> Resumo</h2>
                <div className="relative">
                  <textarea rows={8} className={`w-full p-5 bg-slate-950 border ${errors.objetivo ? 'border-red-500' : 'border-slate-800'} text-white rounded-2xl mb-6 resize-none focus:border-orange-500 outline-none`} value={estado.objetivo.texto} onChange={(e)=>atualizarCampo('objetivo','texto',e.target.value)} />
                </div>
              </div>
            )}

            {/* ETAPA 3: FORMAÇÃO */}
            {estado.etapaAtual === 3 && (
              <div className="p-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-orange-500"><GraduationCap /> Formação</h2>
                {estado.formacoes.map((f, i) => (
                  <div key={f.id} className="p-6 bg-slate-950 rounded-2xl mb-6 relative border border-slate-800">
                    <button onClick={() => removerItem('formacoes', f.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Curso" className="col-span-2 w-full p-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none" value={f.curso} onChange={(e)=>atualizarCampo('formacoes','curso',e.target.value,i)} />
                      <input placeholder="Instituição" className="w-full p-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none" value={f.instituicao} onChange={(e)=>atualizarCampo('formacoes','instituicao',e.target.value,i)} />
                      <input placeholder="Ano" className="w-full p-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none" value={f.anoInicio} onChange={(e)=>atualizarCampo('formacoes','anoInicio',e.target.value,i)} />
                    </div>
                  </div>
                ))}
                <button onClick={() => adicionarItem('formacoes', {curso:'', instituicao:'', anoInicio:''})} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold hover:text-orange-500 hover:border-orange-500 transition-all">+ Add Formação</button>
              </div>
            )}

            {/* ETAPA 4: EXPERIÊNCIA */}
            {estado.etapaAtual === 4 && (
              <div className="p-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-orange-500"><Briefcase /> Experiência</h2>
                {estado.experiencias.map((e, i) => (
                  <div key={e.id} className="p-6 bg-slate-950 rounded-2xl mb-8 relative border border-slate-800">
                    <button onClick={() => removerItem('experiencias', e.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Empresa" className="w-full p-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none" value={e.empresa} onChange={(e)=>atualizarCampo('experiencias','empresa',e.target.value,i)} />
                      <input placeholder="Cargo" className="w-full p-3 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none" value={e.cargo} onChange={(e)=>atualizarCampo('experiencias','cargo',e.target.value,i)} />
                      <div className="md:col-span-2 relative">
                        <textarea placeholder="Descrição..." className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl h-32 focus:border-orange-500 outline-none" value={e.descricao} onChange={(e)=>atualizarCampo('experiencias','descricao',e.target.value,i)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => adicionarItem('experiencias', {empresa:'', cargo:'', descricao:''})} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold hover:text-orange-500 hover:border-orange-500 transition-all">+ Add Experiência</button>
              </div>
            )}

            {/* ETAPA 5: HABILIDADES */}
            {estado.etapaAtual === 5 && (
              <div className="p-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-orange-500"><Star /> Habilidades</h2>
                <div className="flex gap-2 mb-8">
                  <input type="text" className="flex-grow p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-orange-500 outline-none" placeholder="Ex: React" value={habilidadeInput} onChange={(e)=>setHabilidadeInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&adicionarHabilidade()} />
                  <button onClick={adicionarHabilidade} className="bg-orange-600 text-white px-8 rounded-xl font-bold hover:bg-orange-500 shadow-lg shadow-orange-900/20 transition-all">Add</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {estado.habilidades.map(h => (
                    <span key={h} className="bg-slate-950 text-orange-500 border border-orange-500/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                      {h} <button onClick={()=>removerHabilidade(h)}><X className="w-4 h-4"/></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-950 p-8 border-t border-slate-800 flex justify-between items-center">
              {estado.etapaAtual > 1 ? (
                <button onClick={voltar} className="px-8 py-3 font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <ChevronLeft /> Voltar
                </button>
              ) : <div />}
              <button onClick={avancar} className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-orange-900/40 hover:bg-orange-500 hover:-translate-y-1 transition-all flex items-center gap-2">
                {estado.etapaAtual === 5 ? 'Visualizar' : 'Próximo'} <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW DARK NEON */}
      {estado.tela === 'preview' && (
        <div className="max-w-6xl mx-auto pt-10 px-4 pb-24 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-xl font-black text-orange-500 uppercase tracking-widest">Currículo Finalizado</h2>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={()=>setEstado(prev=>({...prev, tela:'form'}))} className="flex-1 md:flex-none px-6 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                <Edit2 className="w-5 h-5" /> Editar
              </button>
              <button onClick={handleDownloadPDF} className="flex-1 md:flex-none px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-900/40 hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5"/> Download PDF
              </button>
            </div>
          </div>

          <div className="flex justify-center overflow-x-auto pb-8">
            <div ref={curriculoRef} className="bg-white text-slate-900 p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]" style={{width:'210mm', minHeight:'297mm'}}>
              <div className="flex justify-between items-start mb-12">
                <div className="flex-1">
                  <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4 border-b-4 border-orange-500 pb-2 inline-block">{estado.pessoal.nome || 'Seu Nome'}</h1>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 font-bold text-sm">
                    <span>{estado.pessoal.email}</span>
                    <span>{estado.pessoal.telefone}</span>
                    <span>{estado.pessoal.cidade}</span>
                  </div>
                </div>
                {estado.pessoal.foto && <img src={estado.pessoal.foto} className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-100" />}
              </div>

              <div className="grid grid-cols-3 gap-12 text-left">
                <div className="col-span-2">
                  <section className="mb-10">
                    <h2 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100">Sobre Mim</h2>
                    <p className="text-slate-700 leading-relaxed font-medium">{estado.objetivo.texto}</p>
                  </section>
                  <section className="mb-10">
                    <h2 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100">Experiência</h2>
                    {estado.experiencias.map(e => (
                      <div key={e.id} className="mb-8 pl-6 border-l-2 border-orange-100">
                        <h3 className="text-lg font-bold text-slate-900">{e.cargo}</h3>
                        <div className="text-sm font-bold text-orange-600 mb-2">{e.empresa}</div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{e.descricao}</p>
                      </div>
                    ))}
                  </section>
                </div>
                <div className="col-span-1">
                  <section className="mb-10">
                    <h2 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100">Educação</h2>
                    {estado.formacoes.map(f => (
                      <div key={f.id} className="mb-6">
                        <h3 className="font-bold text-slate-900 text-sm mb-1">{f.curso}</h3>
                        <p className="text-xs text-slate-500 font-bold">{f.instituicao}</p>
                        <p className="text-xs text-slate-400 mt-1">{f.anoInicio}</p>
                      </div>
                    ))}
                  </section>
                  <section>
                    <h2 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 pb-2 border-b-2 border-slate-100">Habilidades</h2>
                    <div className="flex flex-wrap gap-2">
                      {estado.habilidades.map(h => (
                        <span key={h} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">{h}</span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
