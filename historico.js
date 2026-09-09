(()=>{
const CHAVE='controlePesoHistorico';
const ler=()=>{try{return JSON.parse(localStorage.getItem(CHAVE)||'[]')}catch(e){return[]}};
const gravar=h=>localStorage.setItem(CHAVE,JSON.stringify(h));
const copia=o=>JSON.parse(JSON.stringify(o));
const assinatura=d=>JSON.stringify({a:(d.animais||[]).map(x=>[x.brinco,x.peso,x.descricao]),kg:d.valorKg,f:d.fundo,v:d.vendedor,c:d.comprador});
function arquivarAtual(){
 if(!estado.animais||!estado.animais.length)return;
 const h=ler(),sig=assinatura(estado);
 if(h.some(x=>x.assinatura===sig))return;
 h.unshift({id:Date.now().toString(),data:new Date().toISOString(),assinatura:sig,dados:copia(estado)});
 gravar(h.slice(0,200));
}
function dataBR(s){return new Date(s).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}
function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
window.abrirHistorico=function(){
 const h=ler();let caixa=document.getElementById('historicoRelatorios');if(caixa)caixa.remove();
 caixa=document.createElement('div');caixa.id='historicoRelatorios';caixa.innerHTML=`<div class="hist-card"><div class="hist-top"><h2>HISTÓRICO DE RELATÓRIOS</h2><button onclick="fecharHistorico()">✕</button></div>${h.length?`<div class="hist-lista">${h.map(x=>{const d=x.dados,t=(d.animais||[]).reduce((s,a)=>s+num(a.peso),0),liq=t*num(d.valorKg)*(1-num(d.fundo)/100);return `<div class="hist-item"><div><b>${esc(d.comprador?.nome||'Comprador não informado')}</b><span>${dataBR(x.data)} · ${(d.animais||[]).length} animal(is) · ${t.toFixed(1)} kg</span><strong>${moeda(liq)}</strong></div><div class="hist-acoes"><button onclick="carregarHistorico('${x.id}')">ABRIR</button><button class="excluir" onclick="excluirHistorico('${x.id}')">EXCLUIR</button></div></div>`}).join('')}</div>`:'<p class="hist-vazio">Nenhum relatório salvo ainda.</p>'}</div>`;
 document.body.appendChild(caixa);
};
window.fecharHistorico=()=>document.getElementById('historicoRelatorios')?.remove();
window.carregarHistorico=id=>{const x=ler().find(r=>r.id===id);if(!x)return;estado=copia(x.dados);salvar();fecharHistorico();ir(4)};
window.excluirHistorico=id=>{if(!confirm('Excluir este relatório do histórico?'))return;gravar(ler().filter(x=>x.id!==id));abrirHistorico()};
function botao(){const r=document.getElementById('relatorio');if(!r||document.getElementById('btnHistorico'))return;const b=document.createElement('button');b.id='btnHistorico';b.className='btn-historico no-print';b.innerHTML='🕘';b.setAttribute('aria-label','Histórico de relatórios');b.title='Histórico de relatórios';b.onclick=abrirHistorico;r.insertBefore(b,r.firstChild)}
const anterior=renderRelatorio;renderRelatorio=function(){anterior();arquivarAtual();botao()};
arquivarAtual();botao();
const css=document.createElement('style');css.textContent=`.btn-historico{display:flex;margin:0 0 10px auto;width:40px;height:40px;padding:0;border:0;border-radius:11px;background:#006b78;color:#fff;font-size:20px;align-items:center;justify-content:center;font-weight:800;cursor:pointer;box-shadow:0 3px 9px rgba(0,107,120,.18)}#historicoRelatorios{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.48);padding:18px;overflow:auto}.hist-card{max-width:760px;margin:25px auto;background:#fff;border-radius:18px;padding:16px;box-shadow:0 12px 35px rgba(0,0,0,.25)}.hist-top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dce8e9;padding-bottom:10px}.hist-top h2{margin:0;color:#075f68;font-size:20px}.hist-top button{border:0;background:#eef5f5;border-radius:9px;width:38px;height:38px;font-size:18px}.hist-lista{display:grid;gap:9px;margin-top:12px}.hist-item{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid #d8e5e6;border-radius:13px;padding:12px}.hist-item>div:first-child{display:grid;gap:3px}.hist-item span{font-size:12px;color:#617477}.hist-item strong{color:#08745f}.hist-acoes{display:flex;gap:6px}.hist-acoes button{border:0;border-radius:9px;padding:9px 11px;background:#006b78;color:#fff;font-weight:800}.hist-acoes .excluir{background:#b3261e}.hist-vazio{text-align:center;padding:25px;color:#607477}@media(max-width:600px){.hist-item{align-items:stretch;flex-direction:column}.hist-acoes button{flex:1}.hist-acoes{display:flex}.hist-card{margin:5px auto}.hist-top h2{font-size:17px}}`;document.head.appendChild(css);
})();