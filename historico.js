(()=>{
const CHAVE='controlePesoHistorico';
const ler=()=>{try{return JSON.parse(localStorage.getItem(CHAVE)||'[]')}catch(e){return[]}};
const gravar=h=>localStorage.setItem(CHAVE,JSON.stringify(h));
const copia=o=>JSON.parse(JSON.stringify(o));
const assinatura=d=>JSON.stringify({a:(d.animais||[]).map(x=>[x.brinco,x.peso,x.descricao]),kg:d.valorKg,f:d.fundo,v:d.vendedor,c:d.comprador});
function arquivarAtual(){
 if(etapa!==4||!estado.animais||!estado.animais.length)return;
 const h=ler(),sig=assinatura(estado);
 if(h.some(x=>x.assinatura===sig))return;
 h.unshift({id:Date.now().toString(),data:new Date().toISOString(),assinatura:sig,dados:copia(estado)});
 gravar(h.slice(0,200));
}
function dataBR(s){return new Date(s).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}
function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function normaliza(s){return String(s||'').trim().toLocaleLowerCase('pt-BR')}
function cadastros(tipo){
 const mapa=new Map();
 ler().forEach(x=>{const d=x.dados&&x.dados[tipo];if(d&&String(d.nome||'').trim())mapa.set(normaliza(d.nome),copia(d))});
 return [...mapa.values()];
}
function aplicarMemoria(tipo){
 const sec=document.getElementById(tipo);if(!sec)return;
 const input=sec.querySelector(`[data-model="${tipo}.nome"]`);if(!input)return;
 const lista=cadastros(tipo);if(!lista.length)return;
 const id=`memoria-${tipo}`;
 document.getElementById(id)?.remove();
 const dl=document.createElement('datalist');dl.id=id;
 dl.innerHTML=lista.map(x=>`<option value="${esc(x.nome)}"></option>`).join('');
 document.body.appendChild(dl);input.setAttribute('list',id);
 input.addEventListener('change',()=>{
   const achou=lista.find(x=>normaliza(x.nome)===normaliza(input.value));if(!achou)return;
   estado[tipo]={...estado[tipo],...copia(achou)};salvar();
   tipo==='vendedor'?renderVendedor():renderComprador();
 });
}
window.abrirHistorico=function(){
 const h=ler();let caixa=document.getElementById('historicoRelatorios');if(caixa)caixa.remove();
 caixa=document.createElement('div');caixa.id='historicoRelatorios';caixa.innerHTML=`<div class="hist-card"><div class="hist-top"><h2>HISTÓRICO DE RELATÓRIOS</h2><button onclick="fecharHistorico()">✕</button></div>${h.length?`<div class="hist-lista">${h.map(x=>{const d=x.dados,t=(d.animais||[]).reduce((s,a)=>s+num(a.peso),0),liq=t*num(d.valorKg)*(1-num(d.fundo)/100);return `<div class="hist-item"><div><b>${esc(d.comprador?.nome||'Comprador não informado')}</b><span>${dataBR(x.data)} · ${(d.animais||[]).length} animal(is) · ${t.toFixed(1)} kg</span><strong>${moeda(liq)}</strong></div><div class="hist-acoes"><button onclick="carregarHistorico('${x.id}')">ABRIR</button><button class="excluir" onclick="excluirHistorico('${x.id}')">EXCLUIR</button></div></div>`}).join('')}</div>`:'<p class="hist-vazio">Nenhum relatório salvo ainda.</p>'}</div>`;
 document.body.appendChild(caixa);
};
window.fecharHistorico=()=>document.getElementById('historicoRelatorios')?.remove();
window.carregarHistorico=id=>{
 const x=ler().find(r=>r.id===id);if(!x)return;
 const atual=copia(estado);
 estado=copia(x.dados);
 anterior();
 estado=atual;
 etapa=4;
 fecharHistorico();
 nav();
 window.scrollTo({top:0,behavior:'smooth'});
};
window.excluirHistorico=id=>{if(!confirm('Excluir este relatório do histórico?'))return;gravar(ler().filter(x=>x.id!==id));abrirHistorico()};
window.novaPesagem=()=>{
 if(!confirm('Iniciar uma nova pesagem? Os dados atuais serão limpos, mas o histórico continuará salvo.'))return;
 estado={
   animais:[],
   rascunho:{brinco:'',peso:'',descricao:''},
   valorKg:'',
   fundo:1.5,
   vendedor:{nome:'',cpf:'',banco:'',agencia:'',conta:'',email:''},
   comprador:{nome:'',cpf:'',cnpj:'',cep:'',cidade:'',estado:'',endereco:''}
 };
 salvar();etapa=0;render();window.scrollTo({top:0,behavior:'smooth'});
};
function botoesTopo(){
 const r=document.getElementById('relatorio');if(!r)return;
 let barra=document.getElementById('atalhosRelatorio');
 if(!barra){barra=document.createElement('div');barra.id='atalhosRelatorio';barra.className='atalhos-relatorio no-print';r.insertBefore(barra,r.firstChild)}
 barra.innerHTML='<button class="btn-nova-pesagem" onclick="novaPesagem()">＋ NOVA PESAGEM</button><button id="btnHistorico" class="btn-historico" aria-label="Histórico de relatórios" title="Histórico de relatórios" onclick="abrirHistorico()">🕘</button>';
}
const anterior=renderRelatorio;
renderRelatorio=function(){anterior();if(etapa===4)arquivarAtual();botoesTopo()};
const renderVendedorBase=renderVendedor;
renderVendedor=function(){renderVendedorBase();aplicarMemoria('vendedor')};
const renderCompradorBase=renderComprador;
renderComprador=function(){renderCompradorBase();aplicarMemoria('comprador')};
botoesTopo();aplicarMemoria('vendedor');aplicarMemoria('comprador');
const css=document.createElement('style');css.textContent=`.atalhos-relatorio{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px}.btn-nova-pesagem{height:40px;padding:0 14px;border:0;border-radius:11px;background:#08745f;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 3px 9px rgba(8,116,95,.18)}.btn-historico{display:flex;margin-left:auto;width:40px;height:40px;padding:0;border:0;border-radius:11px;background:#006b78;color:#fff;font-size:20px;align-items:center;justify-content:center;font-weight:800;cursor:pointer;box-shadow:0 3px 9px rgba(0,107,120,.18)}#historicoRelatorios{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.48);padding:18px;overflow:auto}.hist-card{max-width:760px;margin:25px auto;background:#fff;border-radius:18px;padding:16px;box-shadow:0 12px 35px rgba(0,0,0,.25)}.hist-top{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #dce8e9;padding-bottom:10px}.hist-top h2{margin:0;color:#075f68;font-size:20px}.hist-top button{border:0;background:#eef5f5;border-radius:9px;width:38px;height:38px;font-size:18px}.hist-lista{display:grid;gap:9px;margin-top:12px}.hist-item{display:flex;justify-content:space-between;gap:12px;align-items:center;border:1px solid #d8e5e6;border-radius:13px;padding:12px}.hist-item>div:first-child{display:grid;gap:3px}.hist-item span{font-size:12px;color:#617477}.hist-item strong{color:#08745f}.hist-acoes{display:flex;gap:6px}.hist-acoes button{border:0;border-radius:9px;padding:9px 11px;background:#006b78;color:#fff;font-weight:800}.hist-acoes .excluir{background:#b3261e}.hist-vazio{text-align:center;padding:25px;color:#607477}@media(max-width:600px){.hist-item{align-items:stretch;flex-direction:column}.hist-acoes button{flex:1}.hist-acoes{display:flex}.hist-card{margin:5px auto}.hist-top h2{font-size:17px}.btn-nova-pesagem{font-size:12px;padding:0 11px}}`;document.head.appendChild(css);
})();