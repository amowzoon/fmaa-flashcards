// Visual learning module. Each activity is built on a named evidence-based technique:
// retrieval practice, worked → faded examples, dual coding, elaborative interrogation, interleaving, categorisation.
(function(){
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const $=(s,r)=>(r||document).querySelector(s);
const fmt=n=>Math.round(n).toLocaleString();
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
let sub="stmts",pick={diagram:"cycle",anim:"bestport",sim:"cashflow",map:"A1",chart:"margins",stmt:"bs"},stSel=null,stQuiz=false,step=0,ctx=null,ui={};
const frac=(num,den)=>`<span class="frac"><span>${esc(num)}</span><span>${esc(den)}</span></span>`;
const method=t=>`<div class="method">Technique: ${t}</div>`;

// ================= SAMPLE COMPANY (one concrete dataset reused everywhere: concrete examples + dual coding) =================
const CO={name:"Sylven Co. (sample)",cash:27000,ms:8000,ar:25000,inv:34000,prepaid:5000,ppe:90000,ap:12000,accr:8000,ltd:60000,equity:109000,
  sales:150000,cogs:70000,opex:24000,ebit:56000,interest:2000,ni:40000,pur:80000,avgInv:29000,avgAr:27500,avgAp:16000,avgAssets:170000,avgEq:95000};
CO.ca=CO.cash+CO.ms+CO.ar+CO.inv+CO.prepaid;CO.cl=CO.ap+CO.accr;CO.ta=CO.ca+CO.ppe;CO.debt=CO.cl+CO.ltd;
const RATIOS=[
 {fam:"Liquidity",n:"Current ratio",num:"Current assets",den:"Current liabilities",v:()=>CO.ca/CO.cl,m:"Can short-term assets cover short-term debts? Most common solvency check; too high means idle assets."},
 {fam:"Liquidity",n:"Quick (acid-test) ratio",num:"Cash + Marketable securities + Receivables",den:"Current liabilities",v:()=>(CO.cash+CO.ms+CO.ar)/CO.cl,m:"Same question without inventory or prepaids, which may take long to turn into cash."},
 {fam:"Liquidity",n:"Cash ratio",num:"Cash + Marketable securities",den:"Current liabilities",v:()=>(CO.cash+CO.ms)/CO.cl,m:"Strictest: pay everything due now from cash alone."},
 {fam:"Liquidity",n:"Net working capital",num:"Current assets − Current liabilities",den:"",v:()=>CO.ca-CO.cl,m:"Liquidity in dollars, not a ratio."},
 {fam:"Leverage",n:"Debt to total assets",num:"Total debt (CL + LTD)",den:"Total assets",v:()=>CO.debt/CO.ta,m:"Share of assets financed by creditors. Creditors want it low; owners tolerate higher."},
 {fam:"Leverage",n:"Debt to equity",num:"Total debt",den:"Common equity",v:()=>CO.debt/CO.equity,m:"Debt per dollar of owner money. The optimal level minimizes WACC."},
 {fam:"Leverage",n:"Times interest earned",num:"EBIT",den:"Interest expense",v:()=>CO.ebit/CO.interest,m:"How many times profit covers interest. Lenders prefer a high TIE even with high debt."},
 {fam:"Activity",n:"Inventory turnover",num:"Cost of goods sold",den:"Average inventory",v:()=>CO.cogs/CO.avgInv,m:"Times inventory is sold per year. Days in inventory = 360 ÷ turnover."},
 {fam:"Activity",n:"Receivables turnover",num:"Net credit sales",den:"Average receivables",v:()=>CO.sales/CO.avgAr,m:"Times receivables are collected. DSO = 360 ÷ turnover."},
 {fam:"Activity",n:"Payables turnover",num:"Net credit purchases",den:"Average payables",v:()=>CO.pur/CO.avgAp,m:"Times suppliers are paid. Days purchases in payables = 360 ÷ turnover."},
 {fam:"Activity",n:"Cash conversion cycle",num:"Days inventory + Days receivables − Days payables",den:"",v:()=>360/(CO.cogs/CO.avgInv)+360/(CO.sales/CO.avgAr)-360/(CO.pur/CO.avgAp),m:"Days from paying for inventory to collecting cash. Shorter is better."},
 {fam:"Activity",n:"Total asset turnover",num:"Sales",den:"Average total assets",v:()=>CO.sales/CO.avgAssets,m:"Sales generated per dollar of assets. Fake inventory makes this ratio fall unexpectedly."},
 {fam:"Profitability",n:"Gross profit margin",num:"Sales − COGS",den:"Net sales",v:()=>(CO.sales-CO.cogs)/CO.sales,m:"Efficiency of production/purchasing costs."},
 {fam:"Profitability",n:"Operating profit margin",num:"Operating income",den:"Net sales",v:()=>CO.ebit/CO.sales,m:"If this falls while gross margin holds, other operating costs are out of control."},
 {fam:"Profitability",n:"Net profit margin",num:"Net income",den:"Net sales",v:()=>CO.ni/CO.sales,m:"Cents of profit per dollar of sales after everything."},
 {fam:"Profitability",n:"Return on assets",num:"Net income",den:"Average total assets",v:()=>CO.ni/CO.avgAssets,m:"Earning power of the asset base."},
 {fam:"Profitability",n:"Return on equity",num:"Net income − Preferred dividends",den:"Average common equity",v:()=>CO.ni/CO.avgEq,m:"Return to owners. ROE above ROA means borrowed money earned more than it cost."}];
const fmtv=(r,v)=>r.den===""?fmt(v)+(r.n.includes("cycle")?" days":""):r.fam==="Profitability"?(v*100).toFixed(1)+"%":v.toFixed(2)+(r.n.includes("turnover")?"×":"");
function coTable(){return `<table class="vtab small"><tr><th colspan="2">Balance sheet</th><th colspan="2">Income statement</th></tr>
<tr><td>Cash</td><td class="num">${fmt(CO.cash)}</td><td>Sales (all credit)</td><td class="num">${fmt(CO.sales)}</td></tr>
<tr><td>Marketable securities</td><td class="num">${fmt(CO.ms)}</td><td>Cost of goods sold</td><td class="num">${fmt(CO.cogs)}</td></tr>
<tr><td>Receivables</td><td class="num">${fmt(CO.ar)}</td><td>Operating expenses</td><td class="num">${fmt(CO.opex)}</td></tr>
<tr><td>Inventory</td><td class="num">${fmt(CO.inv)}</td><td>EBIT</td><td class="num">${fmt(CO.ebit)}</td></tr>
<tr><td>Prepaids</td><td class="num">${fmt(CO.prepaid)}</td><td>Interest</td><td class="num">${fmt(CO.interest)}</td></tr>
<tr><td>PP&amp;E (net)</td><td class="num">${fmt(CO.ppe)}</td><td>Net income</td><td class="num">${fmt(CO.ni)}</td></tr>
<tr><td>Accounts payable</td><td class="num">${fmt(CO.ap)}</td><td>Credit purchases</td><td class="num">${fmt(CO.pur)}</td></tr>
<tr><td>Accrued liabilities</td><td class="num">${fmt(CO.accr)}</td><td>Avg inventory / A/R / A/P</td><td class="num">${fmt(CO.avgInv)} / ${fmt(CO.avgAr)} / ${fmt(CO.avgAp)}</td></tr>
<tr><td>Long-term debt</td><td class="num">${fmt(CO.ltd)}</td><td>Avg total assets</td><td class="num">${fmt(CO.avgAssets)}</td></tr>
<tr><td>Common equity</td><td class="num">${fmt(CO.equity)}</td><td>Avg common equity</td><td class="num">${fmt(CO.avgEq)}</td></tr></table>`;}

// ================= DIAGRAMS (dual coding: picture + short facts + "why") =================
const D={
cycle:{title:"The accounting cycle",kind:"ring",nodes:[
 {t:"Identify & measure",f:["Spot events that change financial position","Measure them in money"],why:"If it cannot be measured in dollars it never enters the books."},
 {t:"Journalize",f:["Book of ORIGINAL entry, date order","Date · debit(s) · credit(s) · equal amounts · description"],why:"Chronology is preserved here; the ledger loses it."},
 {t:"Post to ledger",f:["Copy amounts into each account (T-accounts)","General ledger = every account; subsidiary ledgers feed it"],why:"Posting is first of the four tested steps: post → adjust → close → reverse."},
 {t:"Unadjusted trial balance",f:["List of all balances at a point in time","Proves total Dr = total Cr"],why:"Not a financial statement. It cannot catch a wrong-account error where Dr still equals Cr."},
 {t:"Adjusting entries",f:["Accrued revenue · accrued expense","Prepaid expense · unearned revenue"],why:"Makes the accrual basis true: revenue when earned, expense when incurred."},
 {t:"Adjusted trial balance",f:["Re-prove Dr = Cr","Source for the statements"],why:"BestPort: 87,300 both before and after adjustments; adjustments move amounts, not totals."},
 {t:"Financial statements",f:["Income statement → changes in equity → balance sheet → cash flows"],why:"Net income is computed first because retained earnings and the balance sheet need it."},
 {t:"Closing entries",f:["Revenues, expenses, dividends → Income Summary → Retained earnings","Temporary accounts end at zero"],why:"Next period must start counting income from zero; balance-sheet accounts carry on."},
 {t:"Post-closing trial balance",f:["Only permanent accounts: assets, liabilities, equity, contra-assets"],why:"BestPort: 86,100, because revenue and expense balances are gone."},
 {t:"Reversing entries",f:["Optional · start of NEXT period","Exact opposite of an adjusting entry"],why:"Lets the bookkeeper record the later cash payment normally without splitting it."}]},
statements:{title:"How the four statements connect",kind:"row",links:["net income","ending equity","Δ cash"],nodes:[
 {t:"Income statement",f:["For a PERIOD","Net sales → gross profit → operating income → income before tax → continuing ops → net income","Discontinued ops shown net of tax; unusual items are not"],why:"Answers: did the business make money doing what it does?"},
 {t:"Changes in equity",f:["Beginning ± prior-period adjustment + net income + shares issued − dividends = ending"],why:"The bridge: takes net income in, hands ending equity to the balance sheet."},
 {t:"Balance sheet",f:["At a POINT in time","Assets = Liabilities + Equity","Current = within 1 year or operating cycle, whichever is longer"],why:"Limitations: historical cost, estimates, unrecorded items (people), snapshot."},
 {t:"Cash flows",f:["Explains the change in balance-sheet cash","Operating (indirect: start from net income) + investing + financing"],why:"Profit is not cash: BestPort earned 7,800 but its cash moved by 51,500."}]},
cashflow:{title:"Cash flow classification",kind:"row",nodes:[
 {t:"Operating",f:["Customers, suppliers, employees, taxes","Interest PAID","Interest and dividends RECEIVED"],why:"Everything that feeds net income. That is why interest paid lands here even though the loan is financing."},
 {t:"Investing",f:["Buy or sell PP&E and other long-lived assets","Buy or sell other companies' securities","Make or collect loans to others (principal only)"],why:"Spending to build future earning capacity."},
 {t:"Financing",f:["Issue or repurchase the company's own stock","Borrow or repay principal","Dividends PAID"],why:"Dealing with the people who fund the company. Treasury stock purchase is financing."}]},
revenue:{title:"Five-step revenue recognition",kind:"row",nodes:[
 {t:"1 Contract",f:["Approved and committed","Rights and payment terms identifiable","Commercial substance","Collection probable"],why:"Cash received before a valid contract or performance is a liability, never revenue."},
 {t:"2 Obligations",f:["Each DISTINCT good or service","Distinct = separately beneficial AND separately identifiable"],why:"Software plus optional support = 2 obligations; software needing heavy customization = 1."},
 {t:"3 Price",f:["Variable amounts: expected value or most likely","Financing component if > 1 year","Rebates and coupons reduce the price"],why:"Expected value: 50%×360k + 30%×320k + 20%×300k = 336,000."},
 {t:"4 Allocate",f:["By relative standalone selling price"],why:"300k contract, SSP 250k + 150k: license 187,500; support 112,500."},
 {t:"5 Recognize",f:["When control transfers (point in time)","Or as it transfers (over time)"],why:"Over time if the customer consumes as you perform, controls the asset being built, or you have no alternative use plus a right to payment."}]},
ratios:{title:"Ratio families",kind:"tree"}};
function drawDiagram(){
  const d=D[pick.diagram];
  if(d.kind==="tree")return drawRatioTree();
  const n=d.nodes.length,sel=step%n,W=760,H=d.kind==="ring"?420:220;let svg="";
  if(d.kind==="ring"){const cx=W/2,cy=H/2,r=160;svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="4 6"/>`;
    d.nodes.forEach((nd,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a),c=Math.cos(a),s=Math.sin(a);
      svg+=`<g class="vn ${i===sel?"on":""}" data-i="${i}"><circle cx="${x}" cy="${y}" r="24"/><text x="${x}" y="${y+5}" text-anchor="middle">${i+1}</text><text class="lb" x="${x+(c>0.3?32:c<-0.3?-32:0)}" y="${y+(s>0.3?40:s<-0.3?-32:5)}" text-anchor="${c>0.3?"start":c<-0.3?"end":"middle"}">${esc(nd.t)}</text></g>`;});
  }else{const w=(W-20*(n+1))/n;
    d.nodes.forEach((nd,i)=>{const x=20+i*(w+20);svg+=`<g class="vn ${i===sel?"on":""}" data-i="${i}"><rect x="${x}" y="30" width="${w}" height="110" rx="10"/><foreignObject x="${x}" y="30" width="${w}" height="110"><div xmlns="http://www.w3.org/1999/xhtml" class="vbox">${esc(nd.t)}</div></foreignObject></g>`;
      if(i<n-1&&!d.links)svg+=`<path d="M${x+w} 85 l14 0 m-5 -5 l5 5 l-5 5" stroke="var(--muted)" stroke-width="2" fill="none"/>`;});
    if(d.links){const c=i=>20+i*(w+20)+w/2;d.links.forEach((l,i)=>{svg+=`<path d="M${c(i)} 140 Q ${c(i)} 185 ${(c(i)+c(i+1))/2} 185 Q ${c(i+1)} 185 ${c(i+1)} 140" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="${(c(i)+c(i+1))/2}" y="205" text-anchor="middle" class="lb">${esc(l)}</text>`;});}}
  const nd=d.nodes[sel];
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">${esc(nd.t)}</div><ul class="facts">${nd.f.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
  <div class="why"><b>Why?</b> ${esc(nd.why)}</div>
  <div class="controls"><button id="vprev">← Prev</button><button class="primary" id="vnext">Next →</button></div></div>${method("dual coding (picture + words) and elaborative interrogation (ask why)")}`;
}
function drawRatioTree(){
  const fams=["Liquidity","Leverage","Activity","Profitability"];const fi=step%fams.length,fam=fams[fi];const rs=RATIOS.filter(r=>r.fam===fam);
  const selR=RATIOS.indexOf(rs[(ui.r||0)%rs.length]);const r=RATIOS[selR];
  return `<div class="vwrap"><div class="famrow">${fams.map((f,i)=>`<button class="${i===fi?"on":""}" data-fam="${i}">${f}</button>`).join("")}</div>
  <div class="ratiorow">${rs.map((x,i)=>`<button class="rchip ${x===r?"on":""}" data-r="${i}">${esc(x.n)}</button>`).join("")}</div>
  <div class="formula"><div class="fname">${esc(r.n)}</div><div class="feq">${r.den?frac(r.num,r.den)+`<span class="feq2">=</span>`+frac(fmt(evalNum(r)),fmt(evalDen(r))):`<span class="fplain">${esc(r.num)}</span>`}<span class="feq2">=</span><span class="fval">${fmtv(r,r.v())}</span></div><div class="fmean">${esc(r.m)}</div></div></div>
  <details class="vinfo"><summary>Sample company numbers used above</summary>${coTable()}</details>${method("concrete example: every formula shown with real numbers, not just symbols")}`;
}
function evalNum(r){const map={"Current assets":CO.ca,"Cash + Marketable securities + Receivables":CO.cash+CO.ms+CO.ar,"Cash + Marketable securities":CO.cash+CO.ms,"Total debt (CL + LTD)":CO.debt,"Total debt":CO.debt,"EBIT":CO.ebit,"Cost of goods sold":CO.cogs,"Net credit sales":CO.sales,"Net credit purchases":CO.pur,"Sales":CO.sales,"Sales − COGS":CO.sales-CO.cogs,"Operating income":CO.ebit,"Net income":CO.ni,"Net income − Preferred dividends":CO.ni};return map[r.num];}
function evalDen(r){const map={"Current liabilities":CO.cl,"Total assets":CO.ta,"Common equity":CO.equity,"Interest expense":CO.interest,"Average inventory":CO.avgInv,"Average receivables":CO.avgAr,"Average payables":CO.avgAp,"Average total assets":CO.avgAssets,"Net sales":CO.sales,"Average common equity":CO.avgEq};return map[r.den];}

// ================= WORKED → FADED EXAMPLES =================
const BP=[["Dec 1 · Owner invests $60,000 cash",[["Cash",60000,0],["Capital",0,60000]]],["Dec 1 · Pay 3 months' rent in advance ($3,000)",[["Prepaid Rent",3000,0],["Cash",0,3000]]],["Dec 5 · Buy equipment for $10,000 cash",[["Equipment",10000,0],["Cash",0,10000]]],["Dec 10 · Receive $9,000 for future services",[["Cash",9000,0],["Unearned Revenue",0,9000]]],["Dec 12 · Buy $800 supplies on credit",[["Supplies",800,0],["Accounts Payable",0,800]]],["Dec 20 · Buy land $20,000: $7,000 cash + $13,000 note",[["Land",20000,0],["Cash",0,7000],["Notes Payable",0,13000]]],["Dec 25 · Pay $3,000 of the note",[["Notes Payable",3000,0],["Cash",0,3000]]],["Dec 27 · $4,000 cash for services performed",[["Cash",4000,0],["Revenue",0,4000]]],["Dec 29 · Invoice client $2,000 for services",[["Accounts Receivable",2000,0],["Revenue",0,2000]]],["Dec 30 · Receive $1,500 for next month's services",[["Cash",1500,0],["Unearned Revenue",0,1500]]],["Dec 31 ADJ · One month of rent used",[["Rent Expense",1000,0],["Prepaid Rent",0,1000]]],["Dec 31 ADJ · $200 of supplies used",[["Supplies Expense",200,0],["Supplies",0,200]]],["Dec 31 ADJ · One third of the $9,000 earned",[["Unearned Revenue",3000,0],["Revenue",0,3000]]],["Dec 31 CLOSE · Revenue → Income Summary",[["Revenue",9000,0],["Income Summary",0,9000]]],["Dec 31 CLOSE · Expenses → Income Summary",[["Income Summary",1200,0],["Rent Expense",0,1000],["Supplies Expense",0,200]]],["Dec 31 CLOSE · Net income → Retained Earnings",[["Income Summary",7800,0],["Retained Earnings",0,7800]]]];
const ACCTS=["Cash","Accounts Receivable","Supplies","Prepaid Rent","Equipment","Land","Accounts Payable","Notes Payable","Unearned Revenue","Capital","Retained Earnings","Revenue","Rent Expense","Supplies Expense","Income Summary"];
function tAccounts(k,touched){const bal={};BP.slice(0,k).forEach(e=>e[1].forEach(([a,d,c])=>{bal[a]=bal[a]||{d:0,c:0};bal[a].d+=d;bal[a].c+=c;}));let td=0,tc=0;
  const rows=ACCTS.filter(a=>bal[a]).map(a=>{const b=bal[a],net=b.d-b.c,dr=net>0?net:0,cr=net<0?-net:0;td+=dr;tc+=cr;return `<div class="tacc ${touched.has(a)?"hit":""}"><div class="th">${esc(a)}</div><div class="tb"><span>${b.d?fmt(b.d):""}</span><span>${b.c?fmt(b.c):""}</span></div><div class="tf"><span>${dr?fmt(dr):""}</span><span>${cr?fmt(cr):""}</span></div></div>`;}).join("");
  return `<div class="tgrid">${rows}</div><div class="meta">Debits ${fmt(td)} · credits ${fmt(tc)} ${td===tc?"✓ balanced":""}${k===10?" · unadjusted trial balance 87,300":k===13?" · adjusted trial balance 87,300":k===16?" · post-closing trial balance 86,100":""}</div>`;}
function animBestport(){
  const k=Math.min(step,BP.length),cur=k?BP[k-1]:null,touched=new Set(cur?cur[1].map(x=>x[0]):[]);
  const phase=k===0?"Start":k<=10?"Journalize & post":k<=13?"Adjusting entries":"Closing entries";
  return `<div class="vinfo"><div class="vt">BestPort Company · ${phase} · ${k}/${BP.length}</div>
  ${cur?`<div class="je">${esc(cur[0])}<table>${cur[1].map(([a,d,c])=>`<tr><td style="padding-left:${c?18:0}px">${esc(a)}</td><td class="num">${d?fmt(d):""}</td><td class="num">${c?fmt(c):""}</td></tr>`).join("")}</table></div><div class="why"><b>Why this entry?</b> ${esc(WHY[k-1])}</div>`:`<div>Watch 16 entries land in T-accounts. Then switch to <b>You post it</b> to do the same entries yourself (faded example).</div>`}
  <div class="controls"><button id="vprev">← Back</button><button class="primary" id="vnext">${k<BP.length?"Next entry →":"Restart"}</button></div></div>${tAccounts(k,touched)}${method("worked example with self-explanation prompts")}`;
}
const WHY=["Cash (asset) rises, so debit it. The owner's claim (equity) rises, so credit Capital.","Rent paid ahead is an asset (future benefit), not yet an expense.","One asset swaps for another: equipment up, cash down.","Cash received but nothing earned yet: a liability to perform (unearned revenue).","Supplies are an asset until used; buying on credit creates a payable.","One debit, two credits: still balances (20,000 = 7,000 + 13,000).","Paying down a liability: debit the liability, credit cash.","Earned and collected: revenue is recognized now.","Earned but not collected: revenue still recognized (accrual basis); a receivable is the asset.","Not earned yet, so it is a liability even though cash arrived.","Adjusting: one of three months has been consumed, so expense 1,000 and shrink the prepaid.","Adjusting: used supplies are expenses; the asset falls to 600.","Adjusting: one third of the work is done, so 3,000 moves from liability to revenue.","Closing: revenue account is zeroed into Income Summary.","Closing: expenses are zeroed into Income Summary (1,200).","Closing: Income Summary balance 7,800 (net income) becomes Retained Earnings, a permanent account."];
let fade={i:0,dr:"",cr:"",res:null,score:0};
function fadedBestport(){
  const e=BP[fade.i],ans=e[1];const need=ans.filter(x=>x[1]).map(x=>x[0]),needC=ans.filter(x=>x[2]).map(x=>x[0]);
  const opt=v=>`<option value="">choose…</option>`+ACCTS.map(a=>`<option ${a===v?"selected":""}>${a}</option>`).join("");
  return `<div class="vinfo"><div class="vt">You post it · entry ${fade.i+1}/${BP.length} · score ${fade.score}</div><div class="je">${esc(e[0])}</div>
  <div class="pickrow"><label>Debit <select id="fdr">${opt(fade.dr)}</select></label><label>Credit <select id="fcr">${opt(fade.cr)}</select></label><button class="primary" id="fchk">Check</button></div>
  ${fade.res===null?`<div class="meta">${ans.length>2?"This entry has "+ans.length+" lines; pick the debit and the FIRST credit.":"Pick the account that increases on the debit side and the one credited."}</div>`:fade.res?`<div class="ok">Correct. ${esc(WHY[fade.i])}</div>`:`<div class="no">Not quite. Answer: Dr ${need.join(" / ")} · Cr ${needC.join(" / ")}. ${esc(WHY[fade.i])}</div>`}
  <div class="controls"><button id="fprev">← Prev</button><button id="fnext">Next →</button></div></div>${tAccounts(fade.i,new Set())}${method("faded worked example: the model is removed and you complete the step (completion problems)")}`;
}
const CF=[["Net income",40000,"start","Profit on the accrual basis is the starting point."],["+ Depreciation",18000,"add","Reduced profit but no cash left."],["− Gain on machine sale",-4000,"sub","The cash (18,000) is shown in investing; leaving the gain here would count it twice."],["+ Decrease in receivables",5000,"add","Collected more than this year's sales."],["− Increase in inventory",-10000,"sub","Cash was tied up in stock."],["− Increase in prepaids",-3000,"sub","Paid ahead: cash out, no expense yet."],["− Decrease in payables",-8000,"sub","Paid suppliers down: cash out beyond this year's expense."],["= Operating cash flow",38000,"total","Profit 40,000 became cash 38,000."],["+ Sale of machine",18000,"add","Investing inflow, the full proceeds."],["− Purchase of machine",-60000,"sub","Investing outflow."],["= Investing",-42000,"total",""],["+ Stock issued",41000,"add","Financing inflow."],["− Loan repaid",-20000,"sub","Principal only; the interest was operating."],["− Dividends paid",-10000,"sub","Financing outflow."],["= Financing",11000,"total",""],["= Net change in cash",7000,"total","20,000 + 7,000 = 27,000 ending cash on the balance sheet."]];
function animCashflow(){
  const k=Math.min(step,CF.length),W=760,H=300,pad=40,min=-45000,max=62000,sy=v=>pad+(max-v)/(max-min)*(H-2*pad);
  let run=0,x=20,svg=`<line x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}" stroke="var(--border)"/>`;const bw=(W-40)/CF.length-6;
  CF.slice(0,k).forEach((r,i)=>{const [lab,v,t]=r;let y0,y1,col;if(t==="start"||t==="total"){run=v;y0=sy(0);y1=sy(v);col=t==="start"?"var(--accent)":v>=0?"var(--good)":"var(--bad)";}else{y0=sy(run);run+=v;y1=sy(run);col=v>=0?"var(--good)":"var(--bad)";}
    const top=Math.min(y0,y1),h=Math.max(2,Math.abs(y1-y0));const ly=v>=0?top-5:top+h+13;
    svg+=`<rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="${col}" opacity="${i===k-1?1:.65}" rx="2"/><text x="${x+bw/2}" y="${ly}" text-anchor="middle" class="lb" font-size="11">${fmt(Math.abs(v))}</text>`;x+=bw+6;});
  const cur=k?CF[k-1]:null;
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">Indirect-method bridge · ${k}/${CF.length}</div><div>${cur?esc(cur[0])+" · running total "+fmt(run):"Start at net income and walk to ending cash. Each bar is one adjustment."}</div>${cur&&cur[3]?`<div class="why"><b>Why?</b> ${esc(cur[3])}</div>`:""}
  <div class="controls"><button id="vprev">← Back</button><button class="primary" id="vnext">${k<CF.length?"Next →":"Restart"}</button></div></div>${method("worked example + dual coding (waterfall chart)")}`;
}
function animDepr(){
  const C=1000000,S=100000,N=5,yrs=[1,2,3,4,5];const sl=yrs.map(()=>180000),syd=yrs.map(y=>900000*(N-y+1)/15);let bv=C;const ddb=yrs.map(()=>{let d=bv*0.4;if(bv-d<S)d=bv-S;bv-=d;return d;});
  const series={"Straight-line":sl,"Sum-of-years'-digits":syd,"Double-declining":ddb},cols={"Straight-line":"var(--accent)","Sum-of-years'-digits":"var(--warn)","Double-declining":"var(--bad)"};
  const W=760,H=300,pad=40,sy=v=>pad+(1-v/450000)*(H-2*pad),sx=y=>60+(y-1)*(W-120)/4;let svg="";
  [100000,200000,300000,400000].forEach(g=>svg+=`<line x1="50" x2="${W-40}" y1="${sy(g)}" y2="${sy(g)}" stroke="var(--border)"/><text x="46" y="${sy(g)+4}" text-anchor="end" class="lb">${g/1000}k</text>`);
  yrs.forEach(y=>svg+=`<text x="${sx(y)}" y="${H-14}" text-anchor="middle" class="lb">Year ${y}</text>`);
  const names=Object.keys(series),show=step%(names.length+1);
  names.forEach((nm,i)=>{if(show&&i!==show-1)return;svg+=`<polyline points="${series[nm].map((v,j)=>`${sx(j+1)},${sy(v)}`).join(" ")}" fill="none" stroke="${cols[nm]}" stroke-width="3"/>`+series[nm].map((v,j)=>`<circle cx="${sx(j+1)}" cy="${sy(v)}" r="4" fill="${cols[nm]}"/><text x="${sx(j+1)}" y="${sy(v)-8}" text-anchor="middle" class="lb">${fmt(v)}</text>`).join("");});
  const bvs=names.map(nm=>{let b=C;return series[nm].map(v=>b-=v);});
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">Annual depreciation · cost 1,000,000 · salvage 100,000 · 5 years</div><div class="legend">${names.map(n=>`<span><i style="background:${cols[n]}"></i>${n}</span>`).join("")}</div>
  <div class="fgrid">${[["Straight-line","Cost − Salvage","Useful life","900,000 ÷ 5 = 180,000"],["Sum-of-years'-digits","(Cost − Salvage) × remaining life","5 + 4 + 3 + 2 + 1 = 15","Year 1: 900,000 × 5/15 = 300,000"],["Double-declining","Book value × 2","Useful life","Year 1: 1,000,000 × 40% = 400,000 (salvage ignored until the floor)"]].map(([n,a,b,ex])=>`<div class="formula small"><div class="fname" style="color:${cols[n]}">${n}</div><div class="feq">${frac(a,b)}</div><div class="fmean">${ex}</div></div>`).join("")}</div>
  <table class="vtab small"><tr><th>Book value at year end</th>${yrs.map(y=>`<th>Y${y}</th>`).join("")}</tr>${names.map((nm,i)=>`<tr><td style="color:${cols[nm]}">${nm}</td>${bvs[i].map(v=>`<td class="num">${fmt(v)}</td>`).join("")}</tr>`).join("")}</table>
  <div class="why"><b>Why does it matter?</b> Accelerated methods front-load expense: lower early profit, more accumulated depreciation, lower retained earnings. Gross fixed assets are identical under all three.</div>
  <div class="controls"><button class="primary" id="vnext">${show?"Show "+(show<names.length?names[show]:"all three"):"Isolate straight-line"}</button></div></div>${method("dual coding: formula, number example and curve side by side")}`;
}
function animInv(){
  const layers=[["Opening",2000,5.00],["Ship 1",1500,5.40],["Ship 2",400,5.65]],method_=step%2?"LIFO (periodic)":"FIFO";
  let rem=layers.map(l=>({n:l[0],u:l[1],c:l[2]}));let need=2000;const order=method_==="FIFO"?rem:rem.slice().reverse();
  order.forEach(l=>{const t=Math.min(need,l.u);l.u-=t;need-=t;});
  const cogs=layers.reduce((a,l,i)=>a+(l[1]-rem[i].u)*l[2],0),ei=rem.reduce((a,l)=>a+l.u*l.c,0);
  const W=760,H=260;let svg="",y=200,scale=0.045;
  layers.forEach((l,i)=>{const h=l[1]*scale,soldU=l[1]-rem[i].u;svg+=`<rect x="260" y="${y-h}" width="200" height="${h}" fill="var(--panel2)" stroke="var(--border)"/>`;
    if(soldU>0){const sh=soldU*scale;svg+=`<rect x="260" y="${method_==="FIFO"?y-h:y-sh}" width="200" height="${sh}" fill="var(--bad)" opacity=".55"/>`;}
    svg+=`<text x="20" y="${y-h/2+4}" class="lb">${l[0]}: ${fmt(l[1])} units @ $${l[2].toFixed(2)}</text>`;y-=h+4;});
  svg+=`<text x="490" y="60" class="lb" font-weight="600">${method_}</text><text x="490" y="85" class="lb">2,000 units sold (red)</text><text x="490" y="110" class="lb">Cost of sales $${fmt(cogs)}</text><text x="490" y="135" class="lb">Ending inventory 1,900 units = $${fmt(ei)}</text>`;
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">Inventory cost layers · Parts Co.</div><div>${method_==="FIFO"?"FIFO sells the OLDEST layer first (bottom up). Ending inventory carries the newest costs.":"LIFO sells the NEWEST layer first (top down). Ending inventory keeps the old $5.00 units."}</div>
  <div class="why"><b>Why does the exam care?</b> When prices rise, FIFO reports lower cost of sales and higher profit; LIFO the opposite. FIFO gives the same answer periodic or perpetual; LIFO can differ.</div>
  <div class="controls"><button class="primary" id="vnext">Switch to ${method_==="FIFO"?"LIFO":"FIFO"}</button></div></div>${method("contrasting cases: same data, two methods")}`;
}
let rw={i:0,ans:"",res:null,score:0,order:shuffle(RATIOS.map((r,i)=>i))};
function ratioWorkout(){
  const r=RATIOS[rw.order[rw.i%rw.order.length]],v=r.v();
  return `<div class="vinfo"><div class="vt">Ratio workout · ${rw.i+1} · score ${rw.score}</div>
  <div>Using the sample company below, compute the <b>${esc(r.n)}</b>.${r.fam==="Profitability"?" Enter a percentage.":r.den===""?" Enter a number.":""}</div>
  <div class="pickrow"><input id="ranswer" type="number" step="any" placeholder="your answer" value="${rw.ans}"><button class="primary" id="rchk">Check</button><button id="rhint">Formula hint</button></div>
  ${ui.hint?`<div class="formula small"><div class="feq">${r.den?frac(r.num,r.den):esc(r.num)}</div></div>`:""}
  ${rw.res===null?"":rw.res?`<div class="ok">Correct: ${fmtv(r,v)}. ${esc(r.m)}</div>`:`<div class="no">Answer: ${r.den?frac(fmt(evalNum(r)),fmt(evalDen(r))):""} = ${fmtv(r,v)}. ${esc(r.m)}</div>`}
  <div class="controls"><button id="rnext">Next ratio →</button></div>${coTable()}</div>${method("practice testing with feedback, interleaved across ratio families")}`;
}
const ANIMS={bestport:["BestPort: watch the entries",animBestport],faded:["BestPort: you post it",fadedBestport],cashflow:["Cash-flow bridge (waterfall)",animCashflow],depr:["Depreciation methods",animDepr],inventory:["FIFO vs LIFO layers",animInv],workout:["Ratio workout",ratioWorkout]};

// ================= CHARTS (reading real statements) =================
const FT={yrs:[2011,2012,2013],sales:[95.2,246.9,267.6],gm:[25,22,19],ebit:[16,13,5],ni:[10,9,3],cash:[25,14,6],inv:[21,34,33],ar:[5,7,10],ap:[2,0,25],cfo:[-2.6,9.2,1.7]};
function chartMargins(){
  const W=760,H=300,pad=44,sy=v=>pad+(1-v/30)*(H-2*pad),sx=i=>120+i*260;const S=[["Gross margin %","gm","var(--accent)"],["EBIT %","ebit","var(--warn)"],["Net margin %","ni","var(--good)"]];
  let svg="";[0,10,20,30].forEach(g=>svg+=`<line x1="80" x2="${W-40}" y1="${sy(g)}" y2="${sy(g)}" stroke="var(--border)"/><text x="74" y="${sy(g)+4}" text-anchor="end" class="lb">${g}%</text>`);
  FT.yrs.forEach((y,i)=>svg+=`<text x="${sx(i)}" y="${H-14}" text-anchor="middle" class="lb">${y}</text>`);
  S.forEach(([n,k,c])=>{svg+=`<polyline points="${FT[k].map((v,i)=>`${sx(i)},${sy(v)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3"/>`+FT[k].map((v,i)=>`<circle cx="${sx(i)}" cy="${sy(v)}" r="4" fill="${c}"/><text x="${sx(i)+10}" y="${sy(v)+4}" class="lb">${v}%</text>`).join("");});
  return {svg:`<svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg>`,legend:S.map(([n,,c])=>`<span><i style="background:${c}"></i>${n}</span>`).join(""),q:"Sales almost tripled (95M → 268M). Why did net margin collapse from 10% to 3%?",a:"Gross margin fell 25 → 19% (cost of sales rising faster than price), then G&A jumped from 3% to 7% of sales. Vertical common-size analysis shows the squeeze even while revenue grows."};
}
function chartAssets(){
  const W=760,H=300,pad=40,bw=120;const keys=[["cash","Cash","var(--good)"],["inv","Inventory","var(--warn)"],["ar","Receivables","var(--accent)"]];let svg="";
  FT.yrs.forEach((y,i)=>{let acc=0;const x=110+i*230;keys.forEach(([k,n,c])=>{const v=FT[k][i],h=v*(H-2*pad)/100;acc+=v;svg+=`<rect x="${x}" y="${pad+(H-2*pad)-acc*(H-2*pad)/100}" width="${bw}" height="${h}" fill="${c}"/><text x="${x+bw/2}" y="${pad+(H-2*pad)-acc*(H-2*pad)/100+h/2+4}" text-anchor="middle" font-size="12" fill="#fff">${v}%</text>`;});
    svg+=`<text x="${x+bw/2}" y="${H-14}" text-anchor="middle" class="lb">${y}</text><text x="${x+bw/2}" y="${pad-8}" text-anchor="middle" class="lb">A/P ${FT.ap[i]}% · CFO ${FT.cfo[i]}M</text>`;});
  return {svg:`<svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg>`,legend:keys.map(([,n,c])=>`<span><i style="background:${c}"></i>${n} (% of total assets)</span>`).join(""),q:"Cash fell from 25% to 6% of assets while inventory and receivables ballooned. What is the working-capital story?",a:"Sales growth was funded by stock-piling inventory and letting customers pay late, then by stretching suppliers (A/P 2% → 25% of assets). Operating cash flow (1.7M) is a fraction of net income (8.1M): profit on paper, not in the bank. Horizontal analysis: inventory index 100 → 426."};
}
const CHARTS={margins:["Future Tech: margins are shrinking",chartMargins],assets:["Future Tech: where did the cash go?",chartAssets]};
function drawChart(){const [t,f]=CHARTS[pick.chart];const c=f();
  return `<div class="vwrap">${c.svg}</div><div class="vinfo"><div class="vt">${t}</div><div class="legend">${c.legend}</div><div class="why"><b>Read the chart:</b> ${esc(c.q)}</div>${ui.reveal?`<div class="ok">${esc(c.a)}</div>`:`<div class="controls"><button class="primary" id="vreveal">Reveal the analysis</button></div>`}</div>${method("generate first, then check: predict the explanation before revealing it")}`;}

// ================= PRACTICE: sorting + matching =================
const SIMS={
cashflow:{title:"Sort the cash flows",intro:"The statement of cash flows has three buckets. Operating = anything that feeds net income (customers, suppliers, wages, taxes, and interest). Investing = buying or selling long-lived assets and other companies' securities, or lending to others. Financing = dealing with the company's own funders: its shareholders and its lenders (principal only). The two traps: interest paid is OPERATING, dividends paid is FINANCING.",buckets:["Operating","Investing","Financing"],items:[["Interest paid on bank loan","Operating","Interest is an expense on the income statement, so its cash effect is operating even though the loan itself is financing."],["Dividends paid to shareholders","Financing","Dividends are a return to owners, not an expense; they never touch net income."],["Purchase of equipment","Investing","Buying a long-lived productive asset."],["Dividends received on investments","Operating","Dividend income is revenue on the income statement, so the cash is operating."],["Repurchase of treasury stock","Financing","Buying back the company's own shares is a transaction with its owners."],["Collection of a loan made to another company","Investing","Getting principal back on money lent to others reverses an investing outflow."],["Cash paid to suppliers","Operating","Inventory purchases run through cost of goods sold."],["Issuance of common stock","Financing","Raising money from owners."],["Sale of a trademark","Investing","Disposing of a long-lived (intangible) asset."],["Interest received","Operating","Interest revenue is on the income statement."],["Repayment of loan principal","Financing","Paying back the lender's principal; the interest part was operating."],["Income taxes paid","Operating","Tax expense is part of net income."]]},
balance:{title:"Normal balance: debit or credit?",intro:"An account's normal balance is the side that INCREASES it. Assets, expenses and losses grow with debits. Liabilities, equity, revenues and gains grow with credits. A contra account has the OPPOSITE balance of the account it reduces; an adjunct account has the SAME balance as the account it adds to.",buckets:["Debit","Credit"],items:[["Accounts Receivable","Debit","An asset: increases with debits."],["Accumulated Depreciation","Credit","Contra-asset: it reduces PP&E, so it carries the opposite (credit) balance."],["Unearned Revenue","Credit","A liability: the company owes goods or services."],["Cost of Goods Sold","Debit","An expense: increases with debits."],["Retained Earnings","Credit","Equity account."],["Loss on Sale of Land","Debit","Losses behave like expenses."],["Allowance for Doubtful Debts","Credit","Contra-asset that reduces receivables."],["Prepaid Rent","Debit","An asset (future benefit)."],["Discount on Notes Payable","Debit","Contra-liability: reduces the note, so it is a debit."],["Premium on Notes Payable","Credit","Adjunct account: adds to a liability, so it shares the liability's credit balance."],["Treasury Stock","Debit","Contra-equity: it reduces stockholders' equity, so it has a debit balance."],["Sales Discount Forfeited","Credit","It is Other Revenue under the net method."]]},
classify:{title:"Where on the balance sheet?",intro:"Current means settled or converted to cash within one year or the operating cycle, whichever is LONGER. Everything else is non-current. Exceptions that catch people: cash that is restricted for a long-term purpose is NOT current; a short-term debt the company intends AND is able to refinance long-term is classified as long-term.",buckets:["Current asset","Non-current asset","Current liability","Long-term liability","Equity"],items:[["Inventory","Current asset","Expected to be sold within the operating cycle."],["Bonds payable due in 8 years","Long-term liability","Matures beyond one year."],["Additional paid-in capital","Equity","Amount paid by shareholders above par value."],["Wages payable","Current liability","Paid within days or weeks."],["Goodwill","Non-current asset","An intangible with an indefinite life."],["Current portion of long-term debt","Current liability","The slice of a long-term loan due within the next year is reclassified as current."],["Cash restricted for plant expansion","Non-current asset","Restricted for a long-term purpose, so it cannot pay current bills; shown under other assets."],["Unearned subscription revenue (next 6 months)","Current liability","The service is owed within the year."],["Short-term note with a non-cancelable long-term refinancing agreement","Long-term liability","Intent plus demonstrated ability to refinance moves it out of current liabilities."],["Marketable securities","Current asset","Readily convertible to cash."],["Deferred income tax liability","Long-term liability","Arises from ordinary operations but is settled beyond a year."],["Accumulated other comprehensive income","Equity","Gains and losses that bypass net income sit in equity."]]},
account:{title:"Permanent or temporary account?",intro:"Permanent (real) accounts live on the balance sheet and carry their balances into next year: every asset, liability and equity account, including contra-assets. Temporary (nominal) accounts measure ONE period and are closed to zero: revenues, expenses, gains, losses, dividends or drawings, and Income Summary.",buckets:["Permanent (real)","Temporary (nominal)"],items:[["Allowance for doubtful accounts","Permanent (real)","Contra-asset on the balance sheet; it is not closed."],["Interest expense","Temporary (nominal)","An expense for the period."],["Gain on retirement of asset","Temporary (nominal)","Gains are income-statement items."],["Owner's drawing","Temporary (nominal)","Withdrawals are closed to capital each period."],["Notes payable","Permanent (real)","A liability carried forward."],["Income summary","Temporary (nominal)","Exists only during closing, then goes to zero."],["Accumulated depreciation","Permanent (real)","Contra-asset; it keeps growing across years."],["Sales returns","Temporary (nominal)","Contra-revenue for the period."],["Retained earnings","Permanent (real)","Equity; it receives the closed net income."],["Capital stock","Permanent (real)","Equity account."]]},
indirect:{title:"Indirect method: add or subtract?",intro:"The indirect method starts from net income and fixes everything in it that was not cash. Three rules. (1) Non-cash expenses (depreciation, amortization, impairment) reduced profit but no cash left: ADD them back; non-cash losses likewise. (2) Gains on selling assets or paying off debt are shown in investing/financing, so SUBTRACT them to avoid double counting; losses are added. (3) Working capital: an INCREASE in an operating asset (receivables, inventory, prepaids) used cash, so subtract; a decrease is added. An INCREASE in an operating liability (payables, accrued wages) saved cash, so add; a decrease is subtracted. Items that are already cash, or that belong to investing/financing, get no adjustment.",buckets:["Add to net income","Subtract","No adjustment"],items:[["Depreciation expense","Add to net income","Non-cash expense: it lowered profit but no cash was paid."],["Gain on sale of equipment","Subtract","The sale proceeds sit in investing; the gain inside net income must be removed."],["Increase in accounts receivable","Subtract","Sales were booked that customers have not paid yet."],["Decrease in inventory","Add to net income","Goods sold came from stock already paid for, so cost of goods sold overstates cash spent."],["Increase in accounts payable","Add to net income","Expenses were recorded but suppliers have not been paid yet: cash stayed in the company."],["Decrease in accrued wages","Subtract","The company paid down wages owed from last year: cash out with no matching expense this year."],["Loss on early debt extinguishment","Add to net income","A non-cash loss tied to a financing transaction; add it back."],["Interest expense paid in cash","No adjustment","Already a cash item inside net income and classified as operating."],["Amortization of bond discount","Add to net income","Increases interest expense without any cash payment (QUC 1881)."],["Increase in prepaid insurance","Subtract","Cash went out this year for an expense that belongs to next year."],["Purchase of a machine for cash","No adjustment","Never in net income; it is an investing outflow."],["Impairment loss","Add to net income","A write-down with no cash effect."]]},
control:{title:"Which control duty is this?",intro:"Segregation of duties means no single person should control a transaction end to end. Four duties must sit with different people: AUTHORIZATION (approving that it may happen), RECORDKEEPING (writing it in the books), CUSTODY (physically holding the asset), and RECONCILIATION (comparing the records with the assets). If one person has two of these, they can both commit and hide a fraud.",buckets:["Authorization","Recordkeeping","Custody","Reconciliation"],items:[["Approving customer credit limits","Authorization","Deciding whether a sale on credit may happen."],["Posting payments to customer accounts","Recordkeeping","Entering transactions in the subsidiary ledger."],["Opening the mail and holding checks","Custody","Physical possession of cash."],["Comparing bank statement to cash ledger","Reconciliation","Records versus the bank's independent record."],["Signing purchase orders","Authorization","Approving a purchase."],["Counting physical inventory against records","Reconciliation","Assets versus what the books say."],["Keeping the securities in the safe","Custody","Physical possession of an asset."],["Preparing journal entries","Recordkeeping","Writing the books."]]},
costs:{title:"Inventory cost: capitalize or expense?",intro:"A product (inventory) cost is any cost of getting inventory ready for sale: the purchase price, freight IN, insurance in transit, and for manufacturers direct materials, direct labor and factory overhead. It sits on the balance sheet until the goods are sold. A period cost is expensed immediately: selling, general and administrative costs, freight OUT, and general interest.",buckets:["Inventory (product) cost","Period cost"],items:[["Freight-in","Inventory (product) cost","Cost of bringing goods to the warehouse."],["Freight-out to customers","Period cost","A selling cost incurred after the sale."],["Factory overhead","Inventory (product) cost","Indirect manufacturing cost attaches to the product."],["Officers' salaries","Period cost","General and administrative; not related to making goods."],["Insurance in transit","Inventory (product) cost","Part of getting the goods to the company."],["Advertising","Period cost","A selling expense."],["Direct labor","Inventory (product) cost","Wages of people making the product."],["General interest on borrowings","Period cost","Only interest on self-constructed or discrete-project assets can be capitalized."]]},
revenue:{title:"Revenue: over time or point in time?",intro:"Revenue is recognized when control transfers. It transfers OVER TIME if any one is true: the customer consumes the benefit as you perform (routine services), you are building or improving an asset the customer already controls, or the asset has no alternative use to you AND you have an enforceable right to be paid for work done so far. If none applies, revenue is recognized at a POINT IN TIME, when the customer gets control (title, possession, risks and rewards, acceptance).",buckets:["Over time","Point in time"],items:[["Three-year technical support contract","Over time","The customer consumes support as it is provided; recognize 37,500 per year in the example."],["Pizza sold at the counter","Point in time","Control passes when the pizza is handed over."],["Building on the customer's land","Over time","The customer controls the asset being enhanced."],["Custom machine, no alternative use, right to payment for work done","Over time","Both conditions of the third test are met."],["Warehouse with refundable deposit and payment only on completion","Point in time","No enforceable right to payment for work done, so the over-time test fails."],["Bill-and-hold furniture meeting all criteria","Point in time","Control passed at signing even though the goods stayed in the warehouse."],["Monthly lawn service paid annually in advance","Over time","Each monthly visit is a distinct obligation satisfied as performed (QUC 525)."],["Consigned goods sold by the dealer","Point in time","The consignor recognizes revenue when notified that the dealer sold the goods."]]},
ale:{title:"Asset, liability or equity?",intro:"Assets are what the company owns or controls with future benefit. Liabilities are what it owes. Equity is what is left for the owners: contributed capital plus retained earnings, minus treasury stock. Contra accounts belong to the section they reduce.",buckets:["Asset","Liability","Equity"],items:[["Accounts receivable","Asset","Customers owe the company: future cash."],["Unearned revenue","Liability","Cash received, goods or services still owed."],["Retained earnings","Equity","Profits kept in the business."],["Prepaid insurance","Asset","Paid ahead; future benefit."],["Accumulated depreciation","Asset","A contra-asset: it lives in the asset section reducing PP&E."],["Bonds payable","Liability","Long-term debt owed to bondholders."],["Additional paid-in capital","Equity","Amount shareholders paid above par."],["Treasury stock","Equity","Contra-equity: reduces stockholders' equity."],["Wages payable","Liability","Accrued expense owed to employees."],["Goodwill","Asset","Intangible bought with another company."],["Allowance for doubtful debts","Asset","Contra-asset reducing receivables."],["Current portion of long-term debt","Liability","Due within a year."],["Common stock","Equity","Par value of shares issued."],["Inventory","Asset","Goods held for sale."],["Income taxes payable","Liability","Tax owed, not yet paid."],["Accumulated other comprehensive income","Equity","Gains and losses that bypass net income."]]},
mixed:{title:"Mixed set (interleaved)",buckets:null,items:null}};
let sim={sel:null,placed:{},set:null};
function simSet(){if(pick.sim!=="mixed")return SIMS[pick.sim];if(!sim.set){const keys=Object.keys(SIMS).filter(k=>k!=="mixed");const k=shuffle(keys.slice()).slice(0,2);const it=[];k.forEach(x=>SIMS[x].items.forEach(i=>it.push([i[0],i[1],i[2]])));sim.set={title:"Mixed: "+k.map(x=>SIMS[x].title).join(" + "),intro:k.map(x=>SIMS[x].intro).join("  |  "),buckets:[].concat(...k.map(x=>SIMS[x].buckets)),items:shuffle(it).slice(0,12)};}return sim.set;}
function drawSim(){
  const s=simSet(),items=s.items,placed=sim.placed,left=items.map((it,i)=>i).filter(i=>placed[i]==null),score=Object.keys(placed).filter(i=>placed[i]===items[i][1]).length;
  const done=Object.keys(placed).map(Number).sort((a,b)=>a-b);
  return `<div class="vinfo"><div class="vt">${esc(s.title)}</div>${s.intro?`<div class="intro">${esc(s.intro)}</div>`:""}<div class="meta">Tap an item, then its bucket (drag also works). ${done.length}/${items.length} placed · ${score} correct</div></div>
  <div class="simtray">${left.map(i=>`<div class="simitem ${sim.sel===i?"sel":""}" draggable="true" data-i="${i}">${esc(items[i][0])}</div>`).join("")||`<div class="meta">All placed. ${score===items.length?"Perfect.":"Tap a red one to send it back and retry."}</div>`}</div>
  <div class="simb" style="grid-template-columns:repeat(${Math.min(s.buckets.length,5)},1fr)">${s.buckets.map(b=>`<div class="bucket" data-b="${esc(b)}"><div class="bh">${esc(b)}</div>${items.map((it,i)=>placed[i]===b?`<div class="simitem ${it[1]===b?"ok":"bad"}" data-i="${i}" data-back="1">${esc(it[0])}${it[1]===b?"":" ✗"}</div>`:"").join("")}</div>`).join("")}</div>
  ${done.length?`<div class="vinfo"><div class="vt">Why</div>${done.map(i=>`<div class="${placed[i]===items[i][1]?"ok":"no"}"><b>${esc(items[i][0])}</b> → ${esc(items[i][1])}. ${esc(items[i][2]||"")}</div>`).join("")}</div>`:""}
  <div class="controls"><button id="vreset">Reset</button></div>${method("categorisation with immediate feedback and an explanation for every item"+(pick.sim==="mixed"?", interleaved across topics":""))}`;
}
function bindSim(){const s=simSet();
  ctx.content.querySelectorAll(".simitem").forEach(el=>{const i=+el.dataset.i;el.onclick=()=>{if(el.dataset.back){delete sim.placed[i];sim.sel=null;}else sim.sel=sim.sel===i?null:i;render();};el.ondragstart=e=>{e.dataTransfer.setData("text",i);sim.sel=i;};});
  ctx.content.querySelectorAll(".bucket").forEach(b=>{const put=()=>{if(sim.sel==null)return;sim.placed[sim.sel]=b.dataset.b;sim.sel=null;const n=Object.keys(sim.placed).length;if(n===s.items.length){const sc=Object.keys(sim.placed).filter(i=>sim.placed[i]===s.items[i][1]).length;ctx.state.visual=ctx.state.visual||{};ctx.state.visual[pick.sim]=Math.max(ctx.state.visual[pick.sim]||0,Math.round(100*sc/n));ctx.save();}render();};
    b.onclick=put;b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();sim.sel=+e.dataTransfer.getData("text");put();};});
  const r=$("#vreset",ctx.content);if(r)r.onclick=()=>{sim={sel:null,placed:{},set:null};render();};}
// Matching game (Quizlet Match): 6 term/definition pairs from the flashcard deck, timed
let mt={tiles:[],sel:null,done:0,start:0,best:null,wrong:0,n:0,saved:false};
function newMatch(){let secs=ctx.state.secs.filter(x=>x!=="AB");if(!secs.length)secs=["A1","A2","A3","A4","A5","B1","B2","B3"];
  let pool_=(window.FMAA_CARDS||[]).map(c=>({sec:c[0],f:c[1],b:c[2]})).filter(c=>secs.includes(c.sec)&&c.f.length<70&&c.b.length<140);
  if(pool_.length<6)pool_=(window.FMAA_CARDS||[]).map(c=>({sec:c[0],f:c[1],b:c[2]})).filter(c=>c.f.length<70&&c.b.length<140);
  const cards=shuffle(pool_).slice(0,6);mt.n=cards.length;
  mt.tiles=shuffle([].concat(...cards.map((c,i)=>[{id:i,t:c.f,k:"f"},{id:i,t:c.b,k:"b"}])));mt.sel=null;mt.done=0;mt.start=Date.now();mt.wrong=0;}
function drawMatch(){if(!mt.tiles.length)newMatch();const t=((Date.now()-mt.start)/1000).toFixed(0);const finished=mt.n>0&&mt.done===mt.n;
  if(finished&&!mt.saved){mt.saved=true;ctx.state.visual=ctx.state.visual||{};const secs=(Date.now()-mt.start)/1000;if(!ctx.state.visual.matchBest||secs<ctx.state.visual.matchBest){ctx.state.visual.matchBest=Math.round(secs);ctx.save();}}
  return `<div class="vinfo"><div class="vt">Match · pair each prompt with its answer${finished?` · done in ${t}s (${mt.wrong} misses)`:""}${ctx.state.visual&&ctx.state.visual.matchBest?` · best ${ctx.state.visual.matchBest}s`:""}</div><div class="meta">Tap two tiles that belong together. Uses cards from the sections ticked in the sidebar.</div></div>
  <div class="mgrid">${mt.tiles.map((x,i)=>x.gone?`<div class="mtile gone"></div>`:`<div class="mtile ${x.k} ${mt.sel===i?"sel":""} ${x.flash||""}" data-i="${i}">${esc(x.t)}</div>`).join("")}</div>
  <div class="controls"><button class="primary" id="mnew">New set</button></div>${method("retrieval practice under light time pressure (matching)")}`;}
function bindMatch(){ctx.content.querySelectorAll(".mtile[data-i]").forEach(el=>el.onclick=()=>{const i=+el.dataset.i;if(mt.sel===null){mt.sel=i;render();return;}if(mt.sel===i){mt.sel=null;render();return;}
  const a=mt.tiles[mt.sel],b=mt.tiles[i];if(a.id===b.id&&a.k!==b.k){a.gone=b.gone=true;mt.done++;}else{mt.wrong++;a.flash=b.flash="bad";setTimeout(()=>{a.flash=b.flash="";render();},400);}mt.sel=null;render();});
  const n=$("#mnew",ctx.content);if(n)n.onclick=()=>{mt.saved=false;newMatch();render();};}


// ================= BUILD A MINI BALANCE SHEET =================
const ACC=[["Cash","A",1],["Accounts receivable","A",1],["Inventory","A",1],["Prepaid rent","A",1],["Marketable securities","A",1],["Supplies","A",1],["Equipment (net)","A",0],["Land","A",0],["Buildings (net)","A",0],["Patent","A",0],["Goodwill","A",0],["Investment in affiliate","A",0],
 ["Accounts payable","L",1],["Wages payable","L",1],["Unearned revenue","L",1],["Income taxes payable","L",1],["Notes payable (due in 6 months)","L",1],["Current portion of long-term debt","L",1],["Bonds payable (due in 10 years)","L",0],["Long-term notes payable","L",0],["Deferred tax liability","L",0],
 ["Common stock","E",0],["Additional paid-in capital","E",0],["Preferred stock","E",0],["Accumulated other comprehensive income","E",0]];
const AMT=()=>[2,3,4,5,6,8,10,12,15,18,20,25,30,40][Math.random()*14|0]*1000;
let SZ=(()=>{try{return Object.assign({build:8,story:5,bs:true,is:true,cf:true},JSON.parse(localStorage.getItem("fmaa_vis_size")||"{}"));}catch(e){return {build:8,story:5,bs:true,is:true,cf:true};}})();
function setSize(k,v){SZ[k]=v;try{localStorage.setItem("fmaa_vis_size",JSON.stringify(SZ));}catch(e){}}
const sizeSel=(id,k,lo,hi,unit)=>`<label class="meta szlab">Size <select id="${id}">${Array.from({length:hi-lo+1},(_,i)=>lo+i).map(n=>`<option value="${n}" ${SZ[k]===n?"selected":""}>${n} ${unit}</option>`).join("")}</select></label>`;
let bd={items:[],placed:{},stage:1,q:null,ans:"",res:null,score:0,total:0};
function newBuild(){
  const pick_=(cat,n)=>shuffle(ACC.filter(a=>a[1]===cat)).slice(0,n).map(a=>({n:a[0],c:a[1],cur:a[2],v:AMT()}));
  const N=SZ.build,nA=Math.max(2,Math.round(N*.5)),nL=Math.max(1,Math.round(N*.3)),nE=Math.max(1,N-nA-nL);const items=[...pick_("A",nA),...pick_("L",nL),...pick_("E",nE)];
  const A=items.filter(i=>i.c==="A").reduce((s,i)=>s+i.v,0),L=items.filter(i=>i.c==="L").reduce((s,i)=>s+i.v,0),E0=items.filter(i=>i.c==="E").reduce((s,i)=>s+i.v,0);
  let re=A-L-E0;if(re<=0){items.find(i=>i.n==="Cash"||i.c==="A").v+= -re+5000;re=5000;}
  items.push({n:"Retained earnings",c:"E",cur:0,v:re});
  bd.items=shuffle(items);bd.placed={};bd.stage=1;bd.ans="";bd.res=null;
  const ca=items.filter(i=>i.c==="A"&&i.cur).reduce((s,i)=>s+i.v,0),cl=items.filter(i=>i.c==="L"&&i.cur).reduce((s,i)=>s+i.v,0),TA=items.filter(i=>i.c==="A").reduce((s,i)=>s+i.v,0),TL=items.filter(i=>i.c==="L").reduce((s,i)=>s+i.v,0),TE=TA-TL;
  const qs=[["Total assets",TA,"Add every asset, including the non-current ones."],["Total liabilities",TL,"Add every liability, current and long-term."],["Total stockholders' equity",TE,"Assets − liabilities, or add the equity accounts."],["Total current assets",ca,"Only assets that turn into cash or get used within a year: cash, receivables, inventory, prepaids, securities, supplies."],["Net working capital",ca-cl,"Current assets − current liabilities."]];
  if(cl>0)qs.push(["Current ratio (2 decimals)",Math.round(100*ca/cl)/100,"Current assets ÷ current liabilities = "+fmt(ca)+" ÷ "+fmt(cl)+"."]);
  bd.q=qs[Math.random()*qs.length|0];
}
function drawBuild(){
  if(!bd.items.length)newBuild();
  const it=bd.items,pl=bd.placed,left=it.map((x,i)=>i).filter(i=>pl[i]==null),ok=Object.keys(pl).filter(i=>pl[i]===it[i].c).length;
  const cats={A:"Assets",L:"Liabilities",E:"Equity"};
  if(bd.stage===1){
    return `<div class="vinfo"><div class="vt">Build a balance sheet · step 1: sort the accounts</div><div class="meta">Tap an account, then the section it belongs in. ${Object.keys(pl).length}/${it.length} placed · ${ok} correct</div></div>
    <div class="simtray">${left.map(i=>`<div class="simitem ${bd.sel===i?"sel":""}" data-i="${i}">${esc(it[i].n)} <span class="amt">${fmt(it[i].v)}</span></div>`).join("")||`<div class="meta">${ok===it.length?"All correct. ":"Fix the red ones, then "}<b>Continue</b> to see the statement.</div>`}</div>
    <div class="simb" style="grid-template-columns:1fr 1fr 1fr">${["A","L","E"].map(b=>`<div class="bucket" data-b="${b}"><div class="bh">${cats[b]}</div>${it.map((x,i)=>pl[i]===b?`<div class="simitem ${x.c===b?"ok":"bad"}" data-i="${i}" data-back="1">${esc(x.n)} <span class="amt">${fmt(x.v)}</span>${x.c===b?"":" ✗"}</div>`:"").join("")}</div>`).join("")}</div>
    <div class="controls">${left.length===0&&ok===it.length?`<button class="primary" id="bdGo">Continue →</button>`:""}<button id="bdNew">New set</button>${sizeSel("bdSz","build",5,12,"accounts")}</div>${method("categorisation, then construction: classify the accounts, then assemble and read the statement")}`;
  }
  const sec=c=>it.filter(x=>x.c===c);const cur=x=>x.cur?"":" (non-current)";
  const row=x=>`<tr class="sl i1"><td class="lab">${esc(x.n)}<span class="meta"> ${x.c==="E"?"":cur(x)}</span></td><td class="num">${fmt(x.v)}</td></tr>`;
  const tot=(c)=>sec(c).reduce((s,x)=>s+x.v,0);
  return `<div class="stmt"><div class="sh"><b>Mini balance sheet</b><span class="meta">built from the accounts you sorted</span></div><table class="stab">
    <tr class="sl kh"><td>Assets</td><td></td></tr>${sec("A").sort((a,b)=>b.cur-a.cur).map(row).join("")}<tr class="sl kt"><td class="lab">Total assets</td><td class="num">${fmt(tot("A"))}</td></tr>
    <tr class="sl kh"><td>Liabilities</td><td></td></tr>${sec("L").sort((a,b)=>b.cur-a.cur).map(row).join("")}<tr class="sl ks"><td class="lab">Total liabilities</td><td class="num">${fmt(tot("L"))}</td></tr>
    <tr class="sl kh"><td>Equity</td><td></td></tr>${sec("E").map(row).join("")}<tr class="sl ks"><td class="lab">Total equity</td><td class="num">${fmt(tot("E"))}</td></tr>
    <tr class="sl kt"><td class="lab">Total liabilities and equity</td><td class="num">${fmt(tot("L")+tot("E"))}</td></tr></table></div>
    <div class="vinfo"><div class="vt">Step 2: read the statement · score ${bd.score}/${bd.total}</div><div>From the statement above, what is the <b>${esc(bd.q[0])}</b>?</div>
    <div class="pickrow"><input id="bdAns" type="number" step="any" placeholder="your answer" value="${bd.ans}"><button class="primary" id="bdChk">Check</button></div>
    ${bd.res===null?"":bd.res?`<div class="ok">Correct: ${fmt(bd.q[1])}. ${esc(bd.q[2])}</div>`:`<div class="no">Answer: ${fmt(bd.q[1])}. ${esc(bd.q[2])}</div>`}
    <div class="controls"><button id="bdBack">← Re-sort</button><button class="primary" id="bdNew">New set →</button></div></div>${method("worked example you built yourself, then a retrieval question on it")}`;
}
function bindBuild(){const c=ctx.content;
  c.querySelectorAll(".simitem").forEach(el=>{const i=+el.dataset.i;el.onclick=()=>{if(el.dataset.back){delete bd.placed[i];bd.sel=null;}else bd.sel=bd.sel===i?null:i;render();};});
  c.querySelectorAll(".bucket").forEach(b=>b.onclick=()=>{if(bd.sel==null)return;bd.placed[bd.sel]=b.dataset.b;bd.sel=null;render();});
  const g=$("#bdGo",c);if(g)g.onclick=()=>{bd.stage=2;render();};
  const nw=$("#bdNew",c);if(nw)nw.onclick=()=>{newBuild();render();};
  const sz=$("#bdSz",c);if(sz)sz.onchange=()=>{setSize("build",+sz.value);newBuild();render();};
  const bk=$("#bdBack",c);if(bk)bk.onclick=()=>{bd.stage=1;render();};
  const inp=$("#bdAns",c);if(inp){inp.oninput=e=>bd.ans=e.target.value;inp.onkeydown=e=>{if(e.key==="Enter")$("#bdChk",c).click();};
    $("#bdChk",c).onclick=()=>{const a=parseFloat(bd.ans);if(isNaN(a))return;const ok=Math.abs(a-bd.q[1])<=Math.max(0.011,Math.abs(bd.q[1])*0.005);if(bd.res===null){bd.total++;if(ok)bd.score++;}bd.res=ok;render();};}
}


// ================= STORY: build the balance sheet from a narrative =================
const R=(a,b,step)=>{step=step||1000;return a+Math.floor(Math.random()*((b-a)/step+1))*step;};
const NAMES=["Harbor Tools","Northwind Design","Maple Street Bakery","Cobalt Repairs","Summit Tutoring","Redwood Landscaping","Pixel Print Co.","Blue Fern Clinic"];
// each event: text, fx (account deltas), why. RE deltas are income-statement effects.
const EVENTS=[
 ()=>{const v=R(40000,90000,5000);return {t:`The owner invests $${fmt(v)} cash to start the business.`,s:"Owner invests",cf:"F",fx:{"Cash":v,"Owner's capital":v},why:"Cash up, owner's capital up. No income effect."};},
 ()=>{const m=R(2000,5000,500),n=[3,4,6][Math.random()*3|0];return {t:`It rents a building for $${fmt(m)} a month and pays ${n} months in advance.`,s:`Rent paid in advance (${n} × ${fmt(m)})`,fx:{"Cash":-m*n,"Prepaid rent":m*n},m,n,tag:"rent",why:`${n} × ${fmt(m)} = ${fmt(m*n)} leaves cash and becomes a prepaid asset (future benefit).`};},
 ()=>{const v=R(8000,30000,1000),c=Math.round(v*0.4/1000)*1000;return {t:`It buys equipment for $${fmt(v)}, paying $${fmt(c)} cash and signing a two-year note for the rest.`,s:"Equipment purchase",cf:"I",sx:{"Cash":"Equipment: cash part","Notes payable":"Equipment: financed part"},fx:{"Equipment":v,"Cash":-c,"Notes payable":v-c},why:`Equipment at full cost ${fmt(v)}; cash down ${fmt(c)}; the unpaid ${fmt(v-c)} is a note payable.`};},
 ()=>{const v=R(3000,12000,1000);return {t:`A customer pays $${fmt(v)} in advance for work to be done next quarter.`,s:"Customer pays in advance",fx:{"Cash":v,"Unearned revenue":v},why:"Cash received but nothing earned yet: a liability to perform, not revenue."};},
 ()=>{const v=R(4000,15000,1000);return {t:`It completes a job and sends the client an invoice for $${fmt(v)}; nothing has been collected yet.`,s:"Job invoiced (revenue)",fx:{"Accounts receivable":v,"Retained earnings":v},why:"Earned, so revenue is recognized (accrual basis) and a receivable is the asset. Revenue raises retained earnings."};},
 ()=>{const v=R(1000,4000,500);return {t:`It buys $${fmt(v)} of supplies on account.`,s:"Supplies bought on account",fx:{"Supplies":v,"Accounts payable":v},why:"Supplies are an asset until used; buying on credit creates a payable."};},
 ()=>{const v=R(3000,12000,1000);return {t:`It performs services for cash, $${fmt(v)}.`,s:"Services for cash (revenue)",fx:{"Cash":v,"Retained earnings":v},why:"Earned and collected: revenue, which raises retained earnings."};},
 ()=>{const v=R(1000,3000,500);return {t:`It pays employees $${fmt(v)} in wages for the period.`,s:"Wages paid (expense)",x:"Wages",fx:{"Cash":-v,"Retained earnings":-v},why:"An expense: cash down, retained earnings down."};},
 ()=>{const v=R(2000,6000,1000);return {t:`It pays $${fmt(v)} on the note payable.`,s:"Payment on note",cf:"F",fx:{"Cash":-v,"Notes payable":-v},dep:"Notes payable",why:"Paying down a liability: both cash and the note fall. No income effect."};},
 ()=>{const v=R(1000,3000,500);return {t:`It collects $${fmt(v)} from a client who was invoiced earlier.`,s:"Collected from client",fx:{"Cash":v,"Accounts receivable":-v},dep:"Accounts receivable",why:"Cash up, receivable down. Revenue was already recognized when invoiced, so no income effect now."};},
 ()=>{const v=R(500,2000,500);return {t:`It pays $${fmt(v)} of what it owes suppliers.`,s:"Paid suppliers",fx:{"Cash":-v,"Accounts payable":-v},dep:"Accounts payable",why:"Cash down, payable down. No income effect."};},
 ()=>{const v=R(2000,5000,1000);return {t:`The owner withdraws $${fmt(v)} cash for personal use.`,s:"Owner withdrawal",cf:"F",fx:{"Cash":-v,"Owner's capital":-v},why:"A withdrawal reduces owner's capital; it is not an expense."};}
];
const ADJ=[
 (st)=>{const e=st.find(x=>x.tag==="rent");if(!e)return null;return {t:`Year end: one month of the prepaid rent has been used up.`,s:"Rent used up (expense, no cash)",x:"Rent",fx:{"Prepaid rent":-e.m,"Retained earnings":-e.m},why:`Adjusting entry: rent expense ${fmt(e.m)}, prepaid rent falls by the same amount.`};},
 (st,bal)=>{const s=bal["Supplies"]||0;if(s<=0)return null;const u=Math.min(s,R(500,Math.max(500,s-500),500));return {t:`Year end: a count shows $${fmt(u)} of the supplies were used.`,s:"Supplies used (expense, no cash)",x:"Supplies",fx:{"Supplies":-u,"Retained earnings":-u},why:`Supplies expense ${fmt(u)}; the supplies asset falls to what is still on hand.`};},
 (st,bal)=>{const u=bal["Unearned revenue"]||0;if(u<=0)return null;const e=Math.round(u/2/500)*500||u;return {t:`Year end: half of the work paid for in advance has now been done.`,s:"Advance now earned (revenue, no cash)",fx:{"Unearned revenue":-e,"Retained earnings":e},why:`${fmt(e)} moves from the liability to revenue because it is now earned.`};},
 (st,bal)=>{const eq=bal["Equipment"]||0;if(eq<=0)return null;const d=Math.round(eq/5/100)*100;return {t:`Year end: the equipment has a five-year life and no salvage value; record straight-line depreciation.`,s:"Depreciation (expense, no cash)",x:"Depreciation",fx:{"Accumulated depreciation":-d,"Retained earnings":-d},why:`${fmt(eq)} ÷ 5 = ${fmt(d)} depreciation expense; accumulated depreciation (a contra-asset) grows by the same amount.`};}
];
const ORDER=[["Cash","A",1],["Accounts receivable","A",1],["Supplies","A",1],["Prepaid rent","A",1],["Equipment","A",0],["Accumulated depreciation","A",0],["Accounts payable","L",1],["Unearned revenue","L",1],["Notes payable","L",0],["Owner's capital","E",0],["Retained earnings","E",0]];
let sy={name:"",events:[],bal:{},inputs:{},checked:false,score:null};
function newStory(){
  sy.name=NAMES[Math.random()*NAMES.length|0];const ev=[EVENTS[0]()];const bal={};const apply=e=>{for(const k in e.fx)bal[k]=(bal[k]||0)+e.fx[k];};apply(ev[0]);
  const pool_=shuffle(EVENTS.slice(1));let n=0;
  for(const f of pool_){if(n>=SZ.story)break;const e=f();if(e.dep&&!(bal[e.dep]>0))continue;if(e.fx["Cash"]&&bal["Cash"]+e.fx["Cash"]<0)continue;if(e.fx["Notes payable"]<0&&bal["Notes payable"]+e.fx["Notes payable"]<0)continue;if(e.fx["Accounts receivable"]<0&&(bal["Accounts receivable"]||0)+e.fx["Accounts receivable"]<0)continue;if(e.fx["Accounts payable"]<0&&(bal["Accounts payable"]||0)+e.fx["Accounts payable"]<0)continue;ev.push(e);apply(e);n++;}
  shuffle(ADJ.slice()).slice(0,2).forEach(f=>{const e=f(ev,bal);if(e){ev.push(e);apply(e);}});
  // guarantee a profit: make sure one revenue event exists and is big enough
  let rev=ev.find(e=>e.fx["Retained earnings"]>0&&(e.fx["Cash"]>0||e.fx["Accounts receivable"]>0));
  if(!rev){const v=R(6000,15000,1000);rev={t:`It performs services for cash, $${fmt(v)}.`,s:"Services for cash (revenue)",fx:{"Cash":v,"Retained earnings":v},why:"Earned and collected: revenue, which raises retained earnings."};ev.splice(1,0,rev);apply(rev);}
  if((bal["Retained earnings"]||0)<=0){const d=-(bal["Retained earnings"]||0)+R(2000,6000,1000);const acct=rev.fx["Cash"]>0?"Cash":"Accounts receivable";const nv=rev.fx[acct]+d;
    rev.fx[acct]=nv;rev.fx["Retained earnings"]=nv;rev.t=rev.t.replace(/\$[\d,]+/,"$"+fmt(nv));bal[acct]+=d;bal["Retained earnings"]+=d;}
  sy.events=ev;sy.bal=bal;sy.inputs={};sy.checked=false;sy.score=null;
}
function drawStory(){
  if(!sy.events.length)newStory();
  const rows=ORDER.filter(o=>sy.bal[o[0]]!=null&&sy.bal[o[0]]!==0);
  const tot=c=>rows.filter(o=>o[1]===c).reduce((s,o)=>s+sy.bal[o[0]],0);
  const cell=o=>{const k=o[0],v=sy.bal[k],u=sy.inputs[k];const ok=sy.checked&&u!=null&&u!==""&&Math.abs(parseFloat(u)-Math.abs(v))<1;const bad=sy.checked&&!ok;
    const shown=k==="Accumulated depreciation"?"("+fmt(Math.abs(v))+")":fmt(v);
    return `<tr class="sl i1 ${bad?"srow-bad":ok?"srow-ok":""}"><td class="lab">${esc(k)}${k==="Accumulated depreciation"?' <span class="meta">(contra-asset: enter as a positive number)</span>':""}</td><td class="num"><div class="sycell"><input class="sin" data-k="${esc(k)}" type="number" step="any" value="${u==null?"":esc(u)}" ${sy.checked?"disabled":""}>${sy.checked?`<span class="syres ${ok?"good":"bad"}">${ok?"✓":"✗ "+shown}</span>`:""}</div></td></tr>`;};
  const sec=(c,title)=>`<tr class="sl kh"><td>${title}</td><td></td></tr>${rows.filter(o=>o[1]===c).map(cell).join("")}<tr class="sl kt"><td class="lab">Total ${title.toLowerCase()}</td><td class="num">${sy.checked?fmt(tot(c)):"?"}</td></tr>`;
  // generic signed line for IS / CFS: {k,l,v,src:[[label,delta]...],note}
  const sline=(x,ind)=>{const u=sy.inputs[x.k];const ok=sy.checked&&u!=null&&u!==""&&Math.abs(parseFloat(u)-x.v)<1;const bad=sy.checked&&!ok;
    const der=sy.checked&&x.src&&x.src.length?`<div class="sder">${x.src.map(([l,d])=>`${esc(l)} ${d<0?"−":"+"} ${fmt(Math.abs(d))}`).join(" · ")}${x.note?` <span class="meta">(${esc(x.note)})</span>`:""}</div>`:"";
    return `<tr class="sl i${ind||1} ${bad?"srow-bad":ok?"srow-ok":""}"><td class="lab">${esc(x.l)}${der}</td><td class="num"><div class="sycell"><input class="sin" data-k="${esc(x.k)}" type="number" step="any" value="${u==null?"":esc(u)}" ${sy.checked?"disabled":""}>${sy.checked?`<span class="syres ${ok?"good":"bad"}">${ok?"✓":"✗ "+(x.v<0?"("+fmt(-x.v)+")":fmt(x.v))}</span>`:""}</div></td></tr>`;};
  const trow=(l,v,cls)=>`<tr class="sl ${cls||"kt"}"><td class="lab">${esc(l)}</td><td class="num">${sy.checked?(v<0?"("+fmt(-v)+")":fmt(v)):"?"}</td></tr>`;
  const {IS,CF}=storyStmts();
  const allLines=[...(SZ.bs?rows.map(o=>({k:o[0],v:Math.abs(sy.bal[o[0]])})):[]),...(SZ.is?IS.lines:[]),...(SZ.cf?CF.lines:[])];
  const n=allLines.length,right=sy.checked?allLines.filter(x=>Math.abs(parseFloat(sy.inputs[x.k])-x.v)<1).length:0;
  const isHtml=SZ.is?`<div class="stmt sycol"><div class="sh"><b>Income statement for the year</b><span class="meta">${sy.checked?"net income "+fmt(IS.ni):"revenues, then expenses"}</span></div><table class="stab sytab"><tr class="sl kh"><td>Revenues</td><td></td></tr>${IS.rev.map(x=>sline(x)).join("")}<tr class="sl kh"><td>Expenses</td><td></td></tr>${IS.exp.map(x=>sline(x)).join("")}${trow("Total expenses",IS.texp,"kt")}${trow("Net income",IS.ni,"kt")}</table></div>`:"";
  const cfHtml=SZ.cf?`<div class="stmt sycol"><div class="sh"><b>Cash flow statement (indirect)</b><span class="meta">${sy.checked?"ends at cash "+fmt(sy.bal["Cash"]):"enter outflows as negatives"}</span></div><table class="stab sytab"><tr class="sl kh"><td>Operating activities</td><td></td></tr>${CF.op.map(x=>sline(x)).join("")}${trow("Cash from operating activities",CF.cfo)}<tr class="sl kh"><td>Investing activities</td><td></td></tr>${CF.inv.length?CF.inv.map(x=>sline(x)).join(""):'<tr class="sl i1"><td class="lab meta">none</td><td></td></tr>'}${trow("Cash from investing activities",CF.cfi)}<tr class="sl kh"><td>Financing activities</td><td></td></tr>${CF.fin.map(x=>sline(x)).join("")}${trow("Cash from financing activities",CF.cff)}${trow("Net change in cash (= ending cash, started at 0)",CF.cfo+CF.cfi+CF.cff)}</table></div>`:"";
  return `<div class="sywrap"><div class="vinfo sycol"><div class="vt">${esc(sy.name)}: the story</div>
  <ol class="story">${sy.events.map((e,i)=>`<li>${esc(e.t)}${sy.checked?`<div class="why small">${esc(e.why)}</div>`:""}</li>`).join("")}</ol>
  <div class="meta" style="text-align:left">Work out each line from the events. Retained earnings = net income (first year, no dividends). ${SZ.cf?"Cash flow uses the indirect method: start from net income, add back non-cash expenses, adjust for working-capital changes (an asset going up uses cash, a liability going up frees cash)":""} ${sy.checked?`<b>Score ${right}/${n}.</b>`:""}</div>
  <div class="controls" style="justify-content:flex-start">${sy.checked?`<button class="primary" id="syNew">New story →</button><button id="syRetry">Try again</button>`:`<button class="primary" id="syChk">Check</button><button id="syNew">New story</button>`}${sizeSel("sySz","story",2,8,"events")}</div>
  <div class="controls" style="justify-content:flex-start;gap:14px"><label class="meta"><input type="checkbox" id="syBS" ${SZ.bs?"checked":""}> Balance sheet</label><label class="meta"><input type="checkbox" id="syIS" ${SZ.is?"checked":""}> Income statement</label><label class="meta"><input type="checkbox" id="syCF" ${SZ.cf?"checked":""}> Cash flow statement</label></div></div>
  ${SZ.bs?`<div class="stmt sycol"><div class="sh"><b>Balance sheet at year end</b><span class="meta">${sy.checked?"A "+fmt(tot("A"))+" = L "+fmt(tot("L"))+" + E "+fmt(tot("E")):"fill in every line"}</span></div>
  <table class="stab sytab">${sec("A","Assets")}${sec("L","Liabilities")}${sec("E","Equity")}</table></div>`:""}${isHtml}${cfHtml}</div>
  ${sy.checked&&SZ.bs?howBuilt(rows):""}
  ${method("transfer: translate events in words into account balances, the way exam word problems do")}`;
}
function storyStmts(){
  const ev=sy.events,b=sy.bal,RE="Retained earnings";
  const revEv=ev.filter(e=>e.fx[RE]>0),expEv=ev.filter(e=>e.fx[RE]<0);
  const rev=[{k:"is:rev",l:"Service revenue",v:revEv.reduce((s,e)=>s+e.fx[RE],0),src:revEv.map(e=>[e.s,e.fx[RE]])}];
  const byX={};expEv.forEach(e=>{byX[e.x]=byX[e.x]||[];byX[e.x].push(e);});
  const exp=Object.keys(byX).map(x=>({k:"is:"+x,l:x+" expense",v:-byX[x].reduce((s,e)=>s+e.fx[RE],0),src:byX[x].map(e=>[e.s,-e.fx[RE]])}));
  const texp=exp.reduce((s,x)=>s+x.v,0),ni=rev[0].v-texp;
  const op=[{k:"cf:ni",l:"Net income",v:ni,src:[["Revenue",rev[0].v],["Total expenses",-texp]]}];
  if(b["Accumulated depreciation"])op.push({k:"cf:dep",l:"Add back: depreciation expense",v:-b["Accumulated depreciation"],src:[["Non-cash expense, add back",-b["Accumulated depreciation"]]]});
  [["Accounts receivable","A"],["Supplies","A"],["Prepaid rent","A"],["Accounts payable","L"],["Unearned revenue","L"]].forEach(([k,c])=>{const v=b[k]||0;if(!v)return;const d=c==="A"?-v:v;
    op.push({k:"cf:"+k,l:`${v>0?"Increase":"Decrease"} in ${k.toLowerCase()}`,v:d,src:[[k+" rose by "+fmt(v)+", so",d]],note:c==="A"?"asset up = cash tied up, subtract":"liability up = cash not yet paid out, add"});});
  const cfo=op.reduce((s,x)=>s+x.v,0);
  const inv=ev.filter(e=>e.cf==="I"&&e.fx["Cash"]).map((e,i)=>({k:"cf:inv"+i,l:"Purchase of equipment (cash part)",v:e.fx["Cash"],src:[[e.sx?e.sx["Cash"]:e.s,e.fx["Cash"]]]}));
  const fin=ev.filter(e=>e.cf==="F"&&e.fx["Cash"]).map((e,i)=>({k:"cf:fin"+i,l:e.s,v:e.fx["Cash"],src:[[e.s,e.fx["Cash"]]]}));
  const cfi=inv.reduce((s,x)=>s+x.v,0),cff=fin.reduce((s,x)=>s+x.v,0);
  return {IS:{rev,exp,texp,ni,lines:[...rev,...exp]},CF:{op,inv,fin,cfo,cfi,cff,lines:[...op,...inv,...fin]}};
}
const HOWNOTE={"Cash":"every cash in (+) and cash out (−), in order","Accounts receivable":"invoiced but not yet collected","Supplies":"bought − used = still on hand","Prepaid rent":"paid ahead − months used up","Equipment":"kept at original cost; wear goes to accumulated depreciation","Accumulated depreciation":"shown as a negative under assets (contra-asset)","Accounts payable":"bought on credit − paid to suppliers = still owed","Unearned revenue":"collected in advance − portion now earned","Notes payable":"amount financed − payments made","Owner's capital":"investments − withdrawals (withdrawals are not expenses)","Retained earnings":"revenues − expenses, including non-cash ones (supplies used, rent used, depreciation)"};
function howBuilt(rows){
  const sg=v=>(v<0?"− ":"+ ")+fmt(Math.abs(v));
  const cards=rows.map(o=>{const k=o[0],v=sy.bal[k],u=parseFloat(sy.inputs[k]);const ok=!isNaN(u)&&Math.abs(u-Math.abs(v))<1;
    const lines=sy.events.filter(e=>e.fx[k]).map(e=>{const lbl=(e.sx&&e.sx[k])||e.s||"Event";const d=k==="Accumulated depreciation"?-e.fx[k]:e.fx[k];return `<div class="hrow"><span>${esc(lbl)}</span><span class="num">${sg(d)}</span></div>`;}).join("");
    return `<div class="hcard ${ok?"hok":"hbad"}"><div class="ht"><b>${esc(k)}</b><span class="num">= ${fmt(Math.abs(v))}</span></div>${lines}<div class="hn">${esc(HOWNOTE[k]||"")}${ok?"":isNaN(u)?"<br>You left this blank.":`<br>You entered ${fmt(u)}.`}</div></div>`;}).join("");
  return `<div class="vinfo syhow"><div class="vt">How each number was built</div><div class="meta" style="text-align:left">Each balance is just the events that touch that account, added up. Non-cash entries change equity without touching cash.</div><div class="hgrid">${cards}</div></div>`;
}
function bindStory(){const c=ctx.content;
  c.querySelectorAll(".sin").forEach(i=>{i.oninput=e=>sy.inputs[i.dataset.k]=e.target.value;i.onkeydown=e=>{if(e.key==="Enter"){const b=$("#syChk",c);if(b)b.click();}};});
  const chk=$("#syChk",c);if(chk)chk.onclick=()=>{sy.checked=true;render();};
  const nw=$("#syNew",c);if(nw)nw.onclick=()=>{newStory();render();};
  const rt=$("#syRetry",c);if(rt)rt.onclick=()=>{sy.checked=false;render();};
  const sz=$("#sySz",c);if(sz)sz.onchange=()=>{setSize("story",+sz.value);newStory();render();};
  [["#syBS","bs"],["#syIS","is"],["#syCF","cf"]].forEach(([id,k])=>{const el=$(id,c);if(el)el.onchange=()=>{setSize(k,el.checked);if(!SZ.bs&&!SZ.is&&!SZ.cf)setSize(k,true);render();};});
}

// ================= MIND MAPS (with recall mode) =================
const MAPS={
A1:["A.1 Terminology",[["3 types of accounting",["Financial: external, GAAP/IFRS, past","Managerial: internal, no standards, past + future","Tax: beyond FMAA"]],["Business forms",["Sole prop: unlimited liability","Partnerships: general / limited / LLP","Corporation: separate entity, double tax","S-corp ≤ 75 holders · LLC · JV · nonprofit"]],["Accounting equation",["A = L + OE","Assets debit; L and OE credit"]],["Principles",["Accrual vs cash","Conservatism","Consistency","Matching"]]]],
A2:["A.2 Recording",[["Double entry",["Dr = Cr always","Contra and adjunct accounts"]],["Cycle",["Journal → ledger → trial balance","Adjust → adjusted TB → statements","Close → post-closing TB → reverse"]],["Adjusting entries",["Accrued revenue / expense","Prepaid expense / unearned revenue"]],["Real vs nominal",["Permanent: A, L, OE, contra-assets","Temporary: R, E, gains, losses, drawings"]]]],
A3:["A.3 Statements",[["Balance sheet",["Uses and 4 limitations","Current = 1 yr or op. cycle (longer)","Subsequent events: adjust vs disclose"]],["Income statement",["Single vs multiple step","Unusual items pre-tax","Discontinued ops net of tax","Change in estimate = prospective"]],["Changes in equity",["Beg ± PPA + NI + issues − dividends"]],["Cash flows",["Operating / investing / financing","Indirect: NI + noncash − gains ∓ WC","Interest paid = operating; dividends paid = financing"]]]],
A4:["A.4 Internal controls",[["Governance",["Board directs; management runs","Agency problem"]],["COSO",["Operations · Reporting · Compliance","Reasonable, not absolute assurance"]],["Risk",["Accept · Treat · Transfer · Avoid","Inherent → control → detection","Residual (net) risk earns profit"]],["Segregation",["Authorize · Record · Custody · Reconcile","Collusion still possible","Compensating controls"]],["Safeguards",["Physical: locks, badges, deadman doors","Logical: passwords, encryption, firewalls"]]]],
A5:["A.5 Daily finances",[["Working capital",["NWC = CA − CL","Aggressive / conservative / matching"]],["Cash",["Transaction · speculation · precautionary"]],["Receivables",["Credit period, standards, discounts","Factoring with / without recourse"]],["Inventory",["Order · carrying · stockout costs","JIT: less carrying, more stockout","MRP"]],["Payables",["10-step A/P cycle","3-way match"]]]],
B1:["B.1 Recognition & valuation",[["Receivables",["Gross vs net method","Allowance: % sales vs aging","Write-off, recovery"]],["Inventory",["Product vs period costs","Periodic vs perpetual","FOB, consignment","FIFO vs LIFO"]],["PP&E & intangibles",["Cost = ready for use","SL, SYD, DDB, activity","R&D expensed; goodwill only when bought"]],["Liabilities",["Refinance: intent + ability","Short-term sources"]],["Revenue",["5 steps","Over time vs point in time","Returns, repurchase, bill-and-hold, agent, consignment"]],["Equity",["Common / preferred / treasury","Cash vs stock dividends (small FMV, large par)","PPA vs change in principle vs estimate"]]]],
B2:["B.2 Basic analysis",[["Vertical",["% of total assets / net sales","Compare companies of any size"]],["Horizontal",["% of base year","Growth = index − 100"]],["Read together",["Margins sliding + inventory ballooning = warning"]]]],
B3:["B.3 Ratios",[["Liquidity",["Current, quick, cash, cash flow, NWC"]],["Leverage",["Debt/assets, D/E, LTD/E, TIE"]],["Activity",["Turnovers and days (360)","Operating cycle, cash cycle"]],["Profitability",["Margins, ROA, ROE","ROE > ROA = leverage works"]]]]};
function drawMap(){
  const [title,branches]=MAPS[pick.map],W=760,H=Math.max(360,branches.length*120),cx=150,cy=H/2,tw=Math.max(150,title.length*8+30);const recall=!!ui.recall;ui.open=ui.open||{};
  let svg=`<rect x="${cx-tw/2}" y="${cy-26}" width="${tw}" height="52" rx="26" fill="var(--accent)"/><text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#fff" font-weight="600">${esc(title)}</text>`;const gap=H/branches.length;
  branches.forEach(([b,leaves],i)=>{const by=gap*i+gap/2,bx=400;const open=!recall||ui.open[i];
    svg+=`<path d="M${cx+tw/2} ${cy} C ${cx+200} ${cy}, ${bx-120} ${by}, ${bx-70} ${by}" fill="none" stroke="var(--border)" stroke-width="2"/><g class="vn ${open?"":"closed"}" data-i="${i}"><rect x="${bx-70}" y="${by-18}" width="140" height="36" rx="18"/><text x="${bx}" y="${by+5}" text-anchor="middle" class="lb" font-weight="600">${esc(b)}</text></g>`;
    const lg=Math.min(22,(gap-10)/leaves.length);leaves.forEach((lf,j)=>{const ly=by-(leaves.length-1)*lg/2+j*lg;svg+=`<line x1="${bx+70}" y1="${by}" x2="${bx+95}" y2="${ly}" stroke="var(--border)"/><text x="${bx+100}" y="${ly+4}" class="lb" ${open?"":'opacity="0.12"'}>${open?esc(lf):"• • • • • •"}</text>`;});});
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div><div class="vinfo"><div class="controls" style="padding:0"><button class="${recall?"":"primary"}" id="mshow">Study mode</button><button class="${recall?"primary":""}" id="mrecall">Recall mode</button></div><div class="meta">${recall?"Say the leaves out loud for each branch, then tap the branch to check.":"Read the map once, then switch to Recall mode and rebuild it from memory."}</div></div>${method(recall?"retrieval practice: reconstruct the map before looking":"organisation: see the structure of the whole section at once")}`;
}

// ================= RENDER =================
function render(){
  const c=ctx.content;
  const opts=(o,cur,lab)=>`<select id="vpick">${Object.keys(o).map(k=>`<option value="${k}" ${cur===k?"selected":""}>${lab(k)}</option>`).join("")}</select>`;
  const ST=window.FMAA_STATEMENTS;const stMap=Object.fromEntries(ST.list);
  const picker={story:"",build:"",stmts:opts(stMap,pick.stmt,k=>stMap[k]),maps:opts(MAPS,pick.map,k=>MAPS[k][0]),diagrams:opts(D,pick.diagram,k=>D[k].title),anim:opts(ANIMS,pick.anim,k=>ANIMS[k][0]),charts:opts(CHARTS,pick.chart,k=>CHARTS[k][0]),sims:opts(SIMS,pick.sim,k=>SIMS[k].title+(ctx.state.visual&&ctx.state.visual[k]!=null?" · best "+ctx.state.visual[k]+"%":"")),match:""}[sub];
  const body={story:drawStory,build:drawBuild,stmts:()=>ST.render(pick.stmt,stSel,stQuiz)+`<div class="controls"><button id="stPrev">← Prev line</button><button class="primary" id="stNext">Next line →</button><button id="stQuiz" class="${stQuiz?"warn":""}">${stQuiz?"Show labels":"Hide labels (recall)"}</button></div>${method("worked example: read a complete statement line by line, then recall the labels from the numbers alone")}`,maps:drawMap,diagrams:drawDiagram,anim:()=>ANIMS[pick.anim][1](),charts:drawChart,sims:drawSim,match:drawMatch}[sub]();
  const TABS=[["stmts","Statements","read a full statement line by line"],["build","Build","sort accounts, assemble a mini balance sheet"],["story","Story","turn a word problem into statements"],["maps","Mind maps","see how topics connect"],["diagrams","Diagrams","process flows, step by step"],["anim","Examples","worked and faded examples"],["charts","Charts","ratios and trends as pictures"],["sims","Sort","drag items into categories"],["match","Match","pair terms with meanings"]];
  const cur=TABS.find(t=>t[0]===sub);
  c.innerHTML=`<div class="stage" style="justify-content:flex-start;padding-top:4px"><div class="vtop"><div class="vtabs">${TABS.map(([k,l])=>`<button class="${sub===k?"on":""}" data-v="${k}">${l}</button>`).join("")}</div><div class="vcrumb"><b>${esc(cur[1])}</b><span class="meta">${esc(cur[2])}</span></div>${picker}</div>${body}</div>`;
  const nav=document.getElementById("visNav");if(nav){nav.innerHTML=`<h3>Visual activities</h3>${TABS.map(([k,l,d])=>`<button class="vnav ${sub===k?"on":""}" data-v="${k}"><b>${l}</b><span>${d}</span></button>`).join("")}`;
    nav.querySelectorAll(".vnav").forEach(b=>b.onclick=()=>{sub=b.dataset.v;step=0;ui={};render();if(window.closeSide)window.closeSide();});}
  c.querySelectorAll(".vtabs button").forEach(b=>b.onclick=()=>{sub=b.dataset.v;step=0;ui={};render();});
  const vp=$("#vpick",c);if(vp)vp.onchange=e=>{pick[{stmts:"stmt",maps:"map",diagrams:"diagram",anim:"anim",charts:"chart",sims:"sim"}[sub]]=e.target.value;step=0;ui={};stSel=null;sim={sel:null,placed:{},set:null};render();};
  if(sub==="stmts"){c.querySelectorAll(".sl.click").forEach(r=>r.onclick=()=>{stSel=+r.dataset.i;render();});
    const n=ST.count(pick.stmt),step_=d=>{let i=stSel==null?(d>0?-1:n):stSel;for(let t=0;t<n;t++){i=(i+d+n)%n;if(ST.hasE(pick.stmt,i))break;}stSel=i;render();const el=c.querySelector(".sl.on");if(el)el.scrollIntoView({block:"nearest"});};
    $("#stNext",c).onclick=()=>step_(1);$("#stPrev",c).onclick=()=>step_(-1);$("#stQuiz",c).onclick=()=>{stQuiz=!stQuiz;render();};}
  c.querySelectorAll(".vn").forEach(n=>n.onclick=()=>{if(sub==="maps"){ui.open[+n.dataset.i]=!ui.open[+n.dataset.i];}else step=+n.dataset.i;render();});
  c.querySelectorAll("[data-fam]").forEach(b=>b.onclick=()=>{step=+b.dataset.fam;ui.r=0;render();});
  c.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{ui.r=+b.dataset.r;render();});
  const nx=$("#vnext",c),pv=$("#vprev",c);
  if(nx)nx.onclick=()=>{const max=sub==="diagrams"?(D[pick.diagram].nodes||[]).length||4:pick.anim==="bestport"?BP.length+1:pick.anim==="cashflow"?CF.length+1:99;step=(step+1)%max;render();};
  if(pv)pv.onclick=()=>{step=Math.max(0,step-1);render();};
  const rv=$("#vreveal",c);if(rv)rv.onclick=()=>{ui.reveal=1;render();};
  const ms=$("#mshow",c),mr=$("#mrecall",c);if(ms)ms.onclick=()=>{ui.recall=0;render();};if(mr)mr.onclick=()=>{ui.recall=1;ui.open={};render();};
  if(sub==="sims")bindSim();if(sub==="match")bindMatch();if(sub==="build")bindBuild();if(sub==="story")bindStory();
  if(sub==="anim"&&pick.anim==="faded"){$("#fdr",c).onchange=e=>fade.dr=e.target.value;$("#fcr",c).onchange=e=>fade.cr=e.target.value;
    $("#fchk",c).onclick=()=>{const a=BP[fade.i][1];const ok=a.some(x=>x[1]&&x[0]===fade.dr)&&a.some(x=>x[2]&&x[0]===fade.cr);if(fade.res===null&&ok)fade.score++;fade.res=ok;render();};
    $("#fnext",c).onclick=()=>{fade.i=(fade.i+1)%BP.length;fade.dr=fade.cr="";fade.res=null;render();};$("#fprev",c).onclick=()=>{fade.i=(fade.i+BP.length-1)%BP.length;fade.dr=fade.cr="";fade.res=null;render();};}
  if(sub==="anim"&&pick.anim==="workout"){const inp=$("#ranswer",c);inp.oninput=e=>rw.ans=e.target.value;inp.onkeydown=e=>{if(e.key==="Enter")$("#rchk",c).click();};
    $("#rchk",c).onclick=()=>{const r=RATIOS[rw.order[rw.i%rw.order.length]],v=r.v();let a=parseFloat(rw.ans);if(isNaN(a))return;if(r.fam==="Profitability"){if(a>1)a=a/100;}const ok=Math.abs(a-v)<=Math.max(0.02*Math.abs(v),r.den===""?1:0.011);if(rw.res===null&&ok)rw.score++;rw.res=ok;render();};
    $("#rhint",c).onclick=()=>{ui.hint=1;render();};$("#rnext",c).onclick=()=>{rw.i++;rw.ans="";rw.res=null;ui.hint=0;render();};}
}
window.renderVisual=function(c){ctx=c;render();};
})();
