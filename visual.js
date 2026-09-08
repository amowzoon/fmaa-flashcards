// Visual learning module: diagrams, animated examples, simulators, mind maps
(function(){
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const $=(s,r)=>(r||document).querySelector(s);
const fmt=n=>n.toLocaleString();
let sub="diagrams",pick={diagram:"cycle",anim:"bestport",sim:"cashflow",map:"A1"},step=0;
let ctx=null; // {content,state,save}

// ===================== DIAGRAMS =====================
const DIAGRAMS={
cycle:{title:"The accounting cycle",hint:"Click a step. Order is tested: posting → adjusting → closing → reversing.",
 nodes:[
  ["Identify & measure","Spot events that change financial position and measure them in money.","Only economic events with a monetary value enter the books."],
  ["Journalize","Record each event as a journal entry: date, debit(s), credit(s), equal amounts, description.","The journal is the book of ORIGINAL entry, kept in date order."],
  ["Post to ledger","Copy journal amounts into individual accounts (T-accounts) in the general ledger.","Ledger = book of FINAL entry. Subsidiary ledgers feed the general ledger."],
  ["Unadjusted trial balance","List every account balance; total debits must equal total credits.","NOT a financial statement. Only catches errors where Dr ≠ Cr."],
  ["Adjusting entries","Bring accruals and deferrals up to date so revenue is earned and expense incurred in the right period.","Four kinds: accrued revenue, accrued expense, prepaid expense, unearned revenue."],
  ["Adjusted trial balance","Re-prove Dr = Cr after adjustments; source for the statements.","BestPort: still 87,300 = 87,300 after adjustments."],
  ["Financial statements","Income statement → statement of changes in equity → balance sheet → cash flows.","Net income links the income statement to retained earnings."],
  ["Closing entries","Zero out revenues, expenses, dividends via Income Summary into Retained Earnings.","Temporary accounts close; permanent (assets, liabilities, equity, contra-assets) do not."],
  ["Post-closing trial balance","Only permanent accounts remain, carried into the next period.","BestPort post-closing total: 86,100 (Income Summary gone, RE now 7,800)."],
  ["Reversing entries (optional)","At the START of the next period, reverse prior accruals to simplify the next cash entries.","Exact opposite of the adjusting entry. Optional, not mandatory (QUC 319)."]]},
statements:{title:"How the four statements connect",hint:"Click a block to see what lives there and how it links to the others.",
 nodes:[
  ["Income statement","Revenues − expenses ± gains/losses = net income for the PERIOD. Multiple-step: net sales → gross profit → operating income → income before tax → income from continuing ops ± discontinued ops (net of tax) → net income.","Unusual/infrequent items are NOT net of tax; discontinued operations ARE."],
  ["Statement of changes in equity","Beginning equity ± prior-period adjustment + net income + share issues − dividends declared = ending equity.","Net income flows in from the income statement; ending balance flows to the balance sheet."],
  ["Balance sheet","Assets = Liabilities + Equity at a POINT in time. Current vs non-current split by one year or operating cycle, whichever is longer.","Historical cost, estimates, omitted items (people), snapshot: the four limitations."],
  ["Statement of cash flows","Explains the change in the balance-sheet cash account: operating (indirect: start at net income) + investing + financing.","Interest paid/received and dividends received = operating; dividends PAID = financing."]]},
cashflow:{title:"Cash flow classification",hint:"Three buckets. Click one to see what goes in and the traps.",
 nodes:[
  ["Operating","Collections from customers · payments to suppliers and employees · taxes · INTEREST PAID · interest and dividends RECEIVED. Indirect method: net income + non-cash expenses − gains + losses ∓ changes in operating assets/liabilities.","Trap: interest paid is operating even though the loan itself is financing (QUC 6106, 1475)."],
  ["Investing","Buy/sell PP&E and long-lived assets · buy/sell other companies' securities · loans made to others and their collection.","Only the principal of loans to others; the interest received is operating."],
  ["Financing","Issue stock · repurchase treasury stock · borrow · repay principal · PAY DIVIDENDS.","Trap: purchase of treasury stock = financing (QUC 1960); dividends paid = financing, dividends received = operating."]]},
ratios:{title:"Ratio tree",hint:"Four families. Click a family, then a ratio for its formula.",
 nodes:[
  ["Liquidity","Current = CA ÷ CL · Quick = (CA − Inventory − Prepaids) ÷ CL · Cash = (Cash + Marketable securities) ÷ CL · Cash flow = CFO ÷ Avg CL · NWC = CA − CL · NWC ratio = NWC ÷ Total assets","Quick beats current because inventory may take long to liquidate (library, department store)."],
  ["Leverage","Debt/Assets = Total debt ÷ Total assets · Debt/Equity = Total debt ÷ Common equity · LTD/Equity = (Total debt − CL) ÷ Common equity · TIE = EBIT ÷ Interest","Lenders prefer high TIE with high debt over low TIE with low debt."],
  ["Activity","Inventory turnover = COGS ÷ Avg inventory · Days in inventory = 360 ÷ turnover · A/R turnover = Credit sales ÷ Avg A/R · DSO = 360 ÷ A/R turnover · A/P turnover = Credit purchases ÷ Avg A/P · Operating cycle = DSI + DSO · Cash cycle = DSI + DSO − DPO · Asset turnover = Sales ÷ Avg assets","Fictitious inventory → total assets turnover unexpectedly FALLS (QUC 140)."],
  ["Profitability","Gross margin = GP ÷ Net sales · Operating margin = Operating income ÷ Net sales · Net margin = NI ÷ Net sales · ROA = NI ÷ Avg total assets · ROE = (NI − Preferred div) ÷ Avg common equity","ROE > ROA means leverage is working for shareholders."]]},
revenue:{title:"Five-step revenue recognition",hint:"Click a step. Control transfer is the heart of step 5.",
 nodes:[
  ["1 · Identify the contract","Approved and committed · rights identifiable · payment terms identifiable · commercial substance · collection probable.","Cash received before a valid contract/performance = liability (unearned revenue)."],
  ["2 · Identify performance obligations","Each DISTINCT good or service (customer can benefit separately AND it is separately identifiable).","Software + separately sold support = 2 obligations; software + heavy customization = 1."],
  ["3 · Determine the transaction price","Variable consideration (expected value or most likely amount) · significant financing (> 1 year) · noncash consideration at fair value · consideration payable to customer reduces price.","Expected value: 50%×360k + 30%×320k + 20%×300k = 336,000."],
  ["4 · Allocate the price","Relative standalone selling prices. 300k contract, SSP 250k + 150k → license 187,500; support 112,500.","If SSP is not observable, estimate it."],
  ["5 · Recognize revenue","When (point in time) or as (over time) control transfers. Over time if: customer consumes as you perform, you build an asset the customer controls, or no alternative use + enforceable right to payment.","Agent = commission only; consignor waits for notification; bill-and-hold needs 4 extra criteria."]]}
};
function drawDiagram(){
  const d=DIAGRAMS[pick.diagram],n=d.nodes.length,sel=step%n;
  const W=760,H=pick.diagram==="cycle"?420:260;
  let svg="";
  if(pick.diagram==="cycle"){
    const cx=W/2,cy=H/2,r=160;
    svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="4 6"/>`;
    d.nodes.forEach((nd,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);
      svg+=`<g class="vn ${i===sel?"on":""}" data-i="${i}"><circle cx="${x}" cy="${y}" r="24"/><text x="${x}" y="${y+5}" text-anchor="middle">${i+1}</text><text class="lb" x="${x+(Math.cos(a)>0.3?32:Math.cos(a)<-0.3?-32:0)}" y="${y+(Math.sin(a)>0.3?40:Math.sin(a)<-0.3?-32:5)}" text-anchor="${Math.cos(a)>0.3?"start":Math.cos(a)<-0.3?"end":"middle"}">${esc(nd[0].replace(" (optional)",""))}</text></g>`;});
  }else{
    const w=(W-20*(n+1))/n;
    d.nodes.forEach((nd,i)=>{const x=20+i*(w+20);
      svg+=`<g class="vn ${i===sel?"on":""}" data-i="${i}"><rect x="${x}" y="40" width="${w}" height="150" rx="10"/><foreignObject x="${x}" y="40" width="${w}" height="150"><div xmlns="http://www.w3.org/1999/xhtml" class="vbox">${esc(nd[0])}</div></foreignObject></g>`;
      if(i<n-1&&pick.diagram!=="statements")svg+=`<path d="M${x+w} 115 l14 0 m-5 -5 l5 5 l-5 5" stroke="var(--muted)" stroke-width="2" fill="none"/>`;});
    if(pick.diagram==="statements"){const c=i=>20+i*(w+20)+w/2;
      svg+=`<path d="M${c(0)} 190 Q ${c(0)} 230 ${c(1)} 230 Q ${c(1)} 230 ${c(1)} 190" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="${(c(0)+c(1))/2}" y="248" text-anchor="middle" class="lb">net income</text>
      <path d="M${c(1)} 190 Q ${c(1)} 230 ${c(2)} 230 Q ${c(2)} 230 ${c(2)} 190" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="${(c(1)+c(2))/2}" y="248" text-anchor="middle" class="lb">ending equity</text>
      <path d="M${c(2)} 190 Q ${c(2)} 230 ${c(3)} 230 Q ${c(3)} 230 ${c(3)} 190" fill="none" stroke="var(--accent)" stroke-width="2"/><text x="${(c(2)+c(3))/2}" y="248" text-anchor="middle" class="lb">Δ cash</text>`;}
  }
  const nd=d.nodes[sel];
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">${esc(nd[0])}</div><div>${esc(nd[1])}</div><div class="vtrap">Exam angle: ${esc(nd[2])}</div>
  <div class="controls"><button id="vprev">← Prev</button><button class="primary" id="vnext">Next →</button></div></div>`;
}

// ===================== ANIMATED EXAMPLES =====================
const BP=[ // BestPort entries [desc, [[acct,dr,cr],...]]
 ["Dec 1 · Owner invests $60,000 cash",[["Cash",60000,0],["Capital",0,60000]]],
 ["Dec 1 · Pay 3 months' rent in advance",[["Prepaid Rent",3000,0],["Cash",0,3000]]],
 ["Dec 5 · Buy equipment for cash",[["Equipment",10000,0],["Cash",0,10000]]],
 ["Dec 10 · Receive $9,000 for future services",[["Cash",9000,0],["Unearned Revenue",0,9000]]],
 ["Dec 12 · Buy supplies on credit",[["Supplies",800,0],["Accounts Payable",0,800]]],
 ["Dec 20 · Buy land: $7,000 cash + $13,000 note",[["Land",20000,0],["Cash",0,7000],["Notes Payable",0,13000]]],
 ["Dec 25 · Pay $3,000 of the note",[["Notes Payable",3000,0],["Cash",0,3000]]],
 ["Dec 27 · Cash for services performed",[["Cash",4000,0],["Revenue",0,4000]]],
 ["Dec 29 · Invoice client for services",[["Accounts Receivable",2000,0],["Revenue",0,2000]]],
 ["Dec 30 · Receive $1,500 for next month's services",[["Cash",1500,0],["Unearned Revenue",0,1500]]],
 ["Dec 31 ADJ · One month of rent used",[["Rent Expense",1000,0],["Prepaid Rent",0,1000]]],
 ["Dec 31 ADJ · $200 of supplies used",[["Supplies Expense",200,0],["Supplies",0,200]]],
 ["Dec 31 ADJ · One third of $9,000 earned",[["Unearned Revenue",3000,0],["Revenue",0,3000]]],
 ["Dec 31 CLOSE · Revenue → Income Summary",[["Revenue",9000,0],["Income Summary",0,9000]]],
 ["Dec 31 CLOSE · Expenses → Income Summary",[["Income Summary",1200,0],["Rent Expense",0,1000],["Supplies Expense",0,200]]],
 ["Dec 31 CLOSE · Net income → Retained Earnings",[["Income Summary",7800,0],["Retained Earnings",0,7800]]]];
const DRACC=new Set(["Cash","Prepaid Rent","Equipment","Supplies","Land","Accounts Receivable","Rent Expense","Supplies Expense"]);
function animBestport(){
  const k=Math.min(step,BP.length);const bal={};
  BP.slice(0,k).forEach(e=>e[1].forEach(([a,d,c])=>{bal[a]=bal[a]||{d:0,c:0};bal[a].d+=d;bal[a].c+=c;}));
  const cur=k>0?BP[k-1]:null;const touched=new Set(cur?cur[1].map(x=>x[0]):[]);
  const order=["Cash","Accounts Receivable","Supplies","Prepaid Rent","Equipment","Land","Accounts Payable","Notes Payable","Unearned Revenue","Capital","Retained Earnings","Revenue","Rent Expense","Supplies Expense","Income Summary"];
  let td=0,tc=0;const rows=order.filter(a=>bal[a]).map(a=>{const b=bal[a],net=b.d-b.c;const dr=net>0?net:0,cr=net<0?-net:0;td+=dr;tc+=cr;
    return `<div class="tacc ${touched.has(a)?"hit":""}"><div class="th">${esc(a)}</div><div class="tb"><span>${b.d?fmt(b.d):""}</span><span>${b.c?fmt(b.c):""}</span></div><div class="tf"><span>${dr?fmt(dr):""}</span><span>${cr?fmt(cr):""}</span></div></div>`;}).join("");
  const phase=k===0?"Start":k<=10?"Journalizing & posting":k<=13?"Adjusting entries":"Closing entries";
  return `<div class="vinfo"><div class="vt">BestPort Company · ${phase} · step ${k}/${BP.length}</div>
  ${cur?`<div class="je">${esc(cur[0])}<table>${cur[1].map(([a,d,c])=>`<tr><td style="padding-left:${c?18:0}px">${esc(a)}</td><td class="num">${d?fmt(d):""}</td><td class="num">${c?fmt(c):""}</td></tr>`).join("")}</table></div>`:`<div>Step through the 16 entries. Watch each one land in its T-account; balances update live and the totals prove Dr = Cr at every step.</div>`}
  <div class="controls"><button id="vprev">← Back</button><button class="primary" id="vnext">${k<BP.length?"Next entry →":"Restart"}</button></div></div>
  <div class="tgrid">${rows}</div>
  <div class="meta">Trial balance check: debits ${fmt(td)} · credits ${fmt(tc)} ${td===tc?"✓":"✗"}${k===10?" · unadjusted TB = 87,300":k===13?" · adjusted TB = 87,300":k===16?" · post-closing TB = 86,100 (only permanent accounts)":""}</div>`;
}
const CF=[["Net income",40000,"start"],["+ Depreciation (non-cash expense)",18000,"add"],["− Gain on machine sale (belongs to investing)",-4000,"sub"],["+ Decrease in A/R (collected more than sold)",5000,"add"],["− Increase in inventory (cash tied up)",-10000,"sub"],["− Increase in prepaids",-3000,"sub"],["− Decrease in A/P (paid suppliers down)",-8000,"sub"],["= Operating cash flow",38000,"total"],["+ Sale of machine",18000,"add"],["− Purchase of machine",-60000,"sub"],["= Investing",-42000,"total"],["+ Stock issued",41000,"add"],["− Loan repaid",-20000,"sub"],["− Dividends paid",-10000,"sub"],["= Financing",11000,"total"],["= Net change in cash (20,000 → 27,000)",7000,"total"]];
function animCashflow(){
  const k=Math.min(step,CF.length);const W=760,H=300,pad=40;const min=-45000,max=60000;const sy=v=>pad+ (max-v)/(max-min)*(H-2*pad);
  let run=0,x=20,svg=`<line x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}" stroke="var(--border)"/>`;
  const bw=(W-40)/CF.length-6;
  CF.slice(0,k).forEach((r,i)=>{const [lab,v,t]=r;let y0,y1,col;
    if(t==="start"){y0=sy(0);y1=sy(v);run=v;col="var(--accent)";}
    else if(t==="total"){run=v;y0=sy(0);y1=sy(v);col=v>=0?"var(--good)":"var(--bad)";}
    else{y0=sy(run);run+=v;y1=sy(run);col=v>=0?"var(--good)":"var(--bad)";}
    const top=Math.min(y0,y1),h=Math.max(2,Math.abs(y1-y0));
    const up=(t==="start"||t==="total")?v>=0:v>=0;const ly=up?top-5:top+h+13;
    svg+=`<rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="${col}" opacity="${i===k-1?1:.7}" rx="2"/><text x="${x+bw/2}" y="${ly}" text-anchor="middle" class="lb" font-size="11">${fmt(Math.abs(v))}</text>`;x+=bw+6;});
  const cur=k?CF[k-1]:null;
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">Indirect-method bridge · step ${k}/${CF.length}</div><div>${cur?esc(cur[0])+" · running total "+fmt(run):"Start at net income and add back what did not use cash, subtract what did. Then investing, then financing."}</div>
  <div class="vtrap">${k===3?"Gain is subtracted because the cash from the sale (18,000) is shown in investing; leaving the gain in would double count.":k===2?"Depreciation reduced net income but no cash left the company.":k===8?"38,000 vs net income 40,000: profit is not cash.":k===16?"20,000 + 7,000 = 27,000 ending cash, matching the balance sheet.":"Sign rule: ↑ operating asset = subtract, ↓ = add; ↑ operating liability = add, ↓ = subtract."}</div>
  <div class="controls"><button id="vprev">← Back</button><button class="primary" id="vnext">${k<CF.length?"Next →":"Restart"}</button></div></div>`;
}
function animDepr(){
  const C=1000000,S=100000,N=5;const yrs=[1,2,3,4,5];
  const sl=yrs.map(()=>180000);const syd=yrs.map(y=>900000*(N-y+1)/15);let bv=C;const ddb=yrs.map(y=>{let d=bv*0.4;if(bv-d<S)d=bv-S;bv-=d;return d;});
  const series={"Straight-line":sl,"Sum-of-years'-digits":syd,"Double-declining":ddb};const cols={"Straight-line":"var(--accent)","Sum-of-years'-digits":"var(--warn)","Double-declining":"var(--bad)"};
  const W=760,H=300,pad=40;const sy=v=>pad+(1-v/450000)*(H-2*pad),sx=y=>60+(y-1)*(W-120)/4;
  let svg="";[100000,200000,300000,400000].forEach(g=>svg+=`<line x1="50" x2="${W-40}" y1="${sy(g)}" y2="${sy(g)}" stroke="var(--border)"/><text x="46" y="${sy(g)+4}" text-anchor="end" class="lb">${g/1000}k</text>`);
  yrs.forEach(y=>svg+=`<text x="${sx(y)}" y="${H-14}" text-anchor="middle" class="lb">Year ${y}</text>`);
  const names=Object.keys(series);const show=step%(names.length+1);
  names.forEach((nm,i)=>{if(show&&i!==show-1)return;const pts=series[nm].map((v,j)=>`${sx(j+1)},${sy(v)}`).join(" ");
    svg+=`<polyline points="${pts}" fill="none" stroke="${cols[nm]}" stroke-width="3"/>`+series[nm].map((v,j)=>`<circle cx="${sx(j+1)}" cy="${sy(v)}" r="4" fill="${cols[nm]}"/><text x="${sx(j+1)}" y="${sy(v)-8}" text-anchor="middle" class="lb">${fmt(Math.round(v))}</text>`).join("");});
  const bvs=names.map(nm=>{let b=C;return series[nm].map(v=>b-=v);});
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">Annual depreciation expense · Poor Co. machine (cost 1,000,000, salvage 100,000, 5 years)</div>
  <div class="legend">${names.map(n=>`<span><i style="background:${cols[n]}"></i>${n}</span>`).join("")}</div>
  <table class="vtab"><tr><th>Book value end of year</th>${yrs.map(y=>`<th>Y${y}</th>`).join("")}</tr>${names.map((nm,i)=>`<tr><td style="color:${cols[nm]}">${nm}</td>${bvs[i].map(v=>`<td class="num">${fmt(Math.round(v))}</td>`).join("")}</tr>`).join("")}</table>
  <div class="vtrap">Accelerated methods front-load expense: lower early net income, higher accumulated depreciation, lower retained earnings; gross fixed assets identical. DDB ignores salvage until the floor (year 5 charge = 29,600 to land exactly on 100,000). Activity method would be 45/hour × hours used.</div>
  <div class="controls"><button class="primary" id="vnext">${show?"Show "+(show<names.length?names[show]:"all"):"Isolate straight-line"}</button></div></div>`;
}
function animInv(){
  const layers=[["Opening",2000,5.00],["Ship 1",1500,5.40],["Ship 2",400,5.65]];const sales=[["Sales A",700,"after Ship 1"],["Sales B",1300,"after Ship 2"]];
  const method=step%2?"LIFO (periodic)":"FIFO";
  // compute consumption
  let rem=layers.map(l=>({n:l[0],u:l[1],c:l[2]}));const sold=[];let need=2000;
  const order=method==="FIFO"?rem:rem.slice().reverse();
  order.forEach(l=>{const t=Math.min(need,l.u);if(t>0){sold.push([l.n,t,l.c]);l.u-=t;need-=t;}});
  const cogs=sold.reduce((a,[,u,c])=>a+u*c,0),ei=rem.reduce((a,l)=>a+l.u*l.c,0);
  const W=760,H=260;let svg="",y=200;const scale=0.045;
  layers.forEach((l,i)=>{const h=l[1]*scale;const left=rem[i].u;const soldU=l[1]-left;
    svg+=`<rect x="260" y="${y-h}" width="200" height="${h}" fill="var(--panel2)" stroke="var(--border)"/>`;
    if(soldU>0){const sh=soldU*scale;const sy0=method==="FIFO"?y-h:y-sh;svg+=`<rect x="260" y="${sy0}" width="200" height="${sh}" fill="var(--bad)" opacity=".55"/>`;}
    svg+=`<text x="20" y="${y-h/2+4}" text-anchor="start" class="lb">${l[0]}: ${fmt(l[1])} @ $${l[2].toFixed(2)}</text>`;y-=h+4;});
  svg+=`<text x="490" y="60" class="lb" font-weight="600">${method}</text><text x="490" y="85" class="lb">Units sold: 2,000 (red)</text><text x="490" y="110" class="lb">Cost of sales: $${fmt(cogs)}</text><text x="490" y="135" class="lb">Ending inventory: 1,900 units = $${fmt(ei)}</text>`;
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div>
  <div class="vinfo"><div class="vt">Inventory cost layers · Parts Co. WS-34</div><div>${method==="FIFO"?"FIFO eats the OLDEST layers first (bottom up). Ending inventory is the newest costs.":"LIFO eats the NEWEST layers first (top down). Ending inventory is the old $5.00 units."}</div>
  <div class="vtrap">Rising prices: FIFO → lowest COGS, highest income, highest ending inventory. LIFO → the reverse. FIFO gives the same answer periodic or perpetual; LIFO can differ.</div>
  <div class="controls"><button class="primary" id="vnext">Switch to ${method==="FIFO"?"LIFO":"FIFO"}</button></div></div>`;
}
const ANIMS={bestport:["BestPort: entries → T-accounts → closing",animBestport],cashflow:["Indirect cash-flow bridge",animCashflow],depr:["Depreciation methods compared",animDepr],inventory:["FIFO vs LIFO layers",animInv]};

// ===================== SIMULATORS =====================
const SIMS={
cashflow:{title:"Sort the cash flows",buckets:["Operating","Investing","Financing"],items:[["Interest paid on bank loan","Operating"],["Dividends paid to shareholders","Financing"],["Purchase of equipment","Investing"],["Dividends received on investments","Operating"],["Repurchase of treasury stock","Financing"],["Collection of a loan made to another company","Investing"],["Cash paid to suppliers","Operating"],["Issuance of common stock","Financing"],["Sale of a trademark","Investing"],["Interest received","Operating"],["Repayment of loan principal","Financing"],["Income taxes paid","Operating"]]},
balance:{title:"Normal balance: debit or credit?",buckets:["Debit","Credit"],items:[["Accounts Receivable","Debit"],["Accumulated Depreciation","Credit"],["Unearned Revenue","Credit"],["Cost of Goods Sold","Debit"],["Retained Earnings","Credit"],["Loss on Sale of Land","Debit"],["Allowance for Doubtful Debts","Credit"],["Prepaid Rent","Debit"],["Discount on Notes Payable","Debit"],["Premium on Notes Payable","Credit"],["Treasury Stock","Debit"],["Sales Discount Forfeited","Credit"]]},
classify:{title:"Current or long-term?",buckets:["Current asset","Non-current asset","Current liability","Long-term liability","Equity"],items:[["Inventory","Current asset"],["Bonds payable due in 8 years","Long-term liability"],["Additional paid-in capital","Equity"],["Wages payable","Current liability"],["Goodwill","Non-current asset"],["Current portion of long-term debt","Current liability"],["Cash restricted for plant expansion","Non-current asset"],["Unearned subscription revenue (next 6 months)","Current liability"],["Short-term note with a non-cancelable long-term refinancing agreement","Long-term liability"],["Marketable securities","Current asset"],["Deferred income tax liability","Long-term liability"],["Accumulated other comprehensive income","Equity"]]},
account:{title:"Real or temporary account?",buckets:["Permanent (real)","Temporary (nominal)"],items:[["Allowance for doubtful accounts","Permanent (real)"],["Interest expense","Temporary (nominal)"],["Gain on retirement of asset","Temporary (nominal)"],["Owner's drawing","Temporary (nominal)"],["Notes payable","Permanent (real)"],["Income summary","Temporary (nominal)"],["Accumulated depreciation","Permanent (real)"],["Sales returns","Temporary (nominal)"],["Retained earnings","Permanent (real)"],["Capital stock","Permanent (real)"]]},
indirect:{title:"Indirect method: add or subtract from net income?",buckets:["Add","Subtract","No adjustment"],items:[["Depreciation expense","Add"],["Gain on sale of equipment","Subtract"],["Increase in accounts receivable","Subtract"],["Decrease in inventory","Add"],["Increase in accounts payable","Add"],["Decrease in accrued wages","Subtract"],["Loss on early debt extinguishment","Add"],["Interest expense paid in cash","No adjustment"],["Amortization of bond discount","Add"],["Increase in prepaid insurance","Subtract"],["Purchase of a machine for cash","No adjustment"],["Impairment loss","Add"]]},
control:{title:"Which duty must be separated from which?",buckets:["Authorization","Recordkeeping","Custody","Reconciliation"],items:[["Approving customer credit limits","Authorization"],["Posting payments to customer accounts","Recordkeeping"],["Opening the mail and holding checks","Custody"],["Comparing bank statement to cash ledger","Reconciliation"],["Signing purchase orders","Authorization"],["Counting physical inventory against records","Reconciliation"],["Keeping the securities in the safe","Custody"],["Preparing journal entries","Recordkeeping"]]}
};
let simState={sel:null,placed:{},done:false};
function drawSim(){
  const s=SIMS[pick.sim];const items=s.items;const placed=simState.placed;
  const left=items.map((it,i)=>i).filter(i=>placed[i]==null);
  const score=Object.keys(placed).filter(i=>placed[i]===items[i][1]).length;
  return `<div class="vinfo"><div class="vt">${esc(s.title)}</div><div class="meta">Tap an item, then tap its bucket (or drag on desktop). ${Object.keys(placed).length}/${items.length} placed · ${score} correct</div></div>
  <div class="simtray">${left.map(i=>`<div class="simitem ${simState.sel===i?"sel":""}" draggable="true" data-i="${i}">${esc(items[i][0])}</div>`).join("")||`<div class="meta">All placed. ${score===items.length?"Perfect.":"Fix the red ones by tapping them back."}</div>`}</div>
  <div class="simb" style="grid-template-columns:repeat(${Math.min(s.buckets.length,5)},1fr)">${s.buckets.map(b=>`<div class="bucket" data-b="${esc(b)}"><div class="bh">${esc(b)}</div>${items.map((it,i)=>placed[i]===b?`<div class="simitem ${it[1]===b?"ok":"bad"}" data-i="${i}" data-back="1">${esc(it[0])}${it[1]===b?"":" ✗"}</div>`:"").join("")}</div>`).join("")}</div>
  <div class="controls"><button id="vreset">Reset</button></div>`;
}
function bindSim(){
  const s=SIMS[pick.sim];
  ctx.content.querySelectorAll(".simitem").forEach(el=>{
    const i=+el.dataset.i;
    el.onclick=()=>{if(el.dataset.back){delete simState.placed[i];simState.sel=null;}else simState.sel=simState.sel===i?null:i;render();};
    el.ondragstart=e=>{e.dataTransfer.setData("text",i);simState.sel=i;};
  });
  ctx.content.querySelectorAll(".bucket").forEach(b=>{
    const put=()=>{if(simState.sel==null)return;simState.placed[simState.sel]=b.dataset.b;simState.sel=null;
      const n=Object.keys(simState.placed).length;if(n===s.items.length){const sc=Object.keys(simState.placed).filter(i=>simState.placed[i]===s.items[i][1]).length;ctx.state.visual=ctx.state.visual||{};ctx.state.visual[pick.sim]=Math.max(ctx.state.visual[pick.sim]||0,Math.round(100*sc/n));ctx.save();}
      render();};
    b.onclick=put;b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();simState.sel=+e.dataTransfer.getData("text");put();};
  });
  const r=$("#vreset",ctx.content);if(r)r.onclick=()=>{simState={sel:null,placed:{},done:false};render();};
}

// ===================== MIND MAPS =====================
const MAPS={
A1:["A.1 Terminology",[["3 types of accounting",["Financial: external, GAAP/IFRS, past","Managerial: internal, no standards, past+future","Tax: beyond FMAA"]],["Business forms",["Sole prop: unlimited liability","Partnerships: general / limited / LLP","Corporation: separate entity, double tax","S-corp ≤75 holders, LLC, JV, nonprofit"]],["Accounting equation",["A = L + OE","Assets Dr; L and OE Cr"]],["Principles",["Accrual vs cash","Conservatism","Consistency","Matching"]]]],
A2:["A.2 Recording",[["Double entry",["Dr = Cr always","Contra & adjunct accounts"]],["Cycle",["Journal → ledger → TB","Adjust → adjusted TB → statements","Close → post-closing TB → reverse"]],["Adjusting entries",["Accrued revenue / expense","Prepaid expense / unearned revenue"]],["Real vs nominal",["Permanent: A, L, OE, contra-assets","Temporary: R, E, gains, losses, drawings"]]]],
A3:["A.3 Statements",[["Balance sheet",["Uses & 4 limitations","Current = 1 yr or op. cycle (longer)","Subsequent events: adjust vs disclose"]],["Income statement",["Single vs multiple step","Unusual items pre-tax","Discontinued ops net of tax","Change in estimate = prospective"]],["Changes in equity",["Beg ± PPA + NI + issues − dividends"]],["Cash flows",["Operating / investing / financing","Indirect: NI + noncash − gains ∓ WC","Interest paid = operating; dividends paid = financing"]]]],
A4:["A.4 Internal controls",[["Governance",["Board directs; management runs","Agency problem"]],["COSO",["Operations · Reporting · Compliance","Reasonable, not absolute assurance"]],["Risk",["Accept · Treat · Transfer · Avoid","Inherent → control → detection","Residual (net) risk earns profit"]],["Segregation",["Authorize · Record · Custody · Reconcile","Collusion still possible","Compensating controls"]],["Safeguards",["Physical: locks, badges, deadman doors","Logical: passwords, encryption, firewalls"]]]],
A5:["A.5 Daily finances",[["Working capital",["NWC = CA − CL","Aggressive / conservative / matching"]],["Cash",["Transaction · speculation · precautionary"]],["Receivables",["Credit period, standards, discounts","Factoring with / without recourse"]],["Inventory",["Order · carrying · stockout costs","JIT: ↓carrying ↑stockout","MRP"]],["Payables",["10-step A/P cycle","3-way match"]]]],
B1:["B.1 Recognition & valuation",[["Receivables",["Gross vs net method","Allowance: % sales vs aging","Write-off, recovery"]],["Inventory",["Product vs period costs","Periodic vs perpetual","FOB, consignment","FIFO vs LIFO"]],["PP&E & intangibles",["Cost = ready for use","SL, SYD, DDB, activity","R&D expensed; goodwill only bought"]],["Liabilities",["Refinance: intent + ability","Short-term sources"]],["Revenue",["5 steps","Over time vs point in time","Returns, repurchase, bill-and-hold, agent, consignment"]],["Equity",["Common / preferred / treasury","Cash vs stock dividends (small FMV, large par)","PPA vs change in principle vs estimate"]]]],
B2:["B.2 Basic analysis",[["Vertical",["% of total assets / net sales","Compare companies of any size"]],["Horizontal",["% of base year","Growth = index − 100"]],["Read together",["Margins sliding + inventory ballooning = warning"]]]],
B3:["B.3 Ratios",[["Liquidity",["Current, quick, cash, cash flow, NWC"]],["Leverage",["Debt/assets, D/E, LTD/E, TIE"]],["Activity",["Turnovers and days (360)","Operating cycle, cash cycle"]],["Profitability",["Margins, ROA, ROE","ROE > ROA = leverage works"]]]]};
function drawMap(){
  const [title,branches]=MAPS[pick.map];const W=760,H=Math.max(360,branches.length*120);const cx=150,cy=H/2;const tw=Math.max(150,title.length*8+30);
  let svg=`<rect x="${cx-tw/2}" y="${cy-26}" width="${tw}" height="52" rx="26" fill="var(--accent)"/><text x="${cx}" y="${cy+5}" text-anchor="middle" fill="#fff" font-weight="600">${esc(title)}</text>`;
  const gap=H/branches.length;
  branches.forEach(([b,leaves],i)=>{const by=gap*i+gap/2,bx=400;
    svg+=`<path d="M${cx+tw/2} ${cy} C ${cx+200} ${cy}, ${bx-120} ${by}, ${bx-70} ${by}" fill="none" stroke="var(--border)" stroke-width="2"/>
    <rect x="${bx-70}" y="${by-18}" width="140" height="36" rx="18" fill="var(--panel2)" stroke="var(--border)"/><text x="${bx}" y="${by+5}" text-anchor="middle" class="lb" font-weight="600">${esc(b)}</text>`;
    const lg=Math.min(22,(gap-10)/leaves.length);
    leaves.forEach((lf,j)=>{const ly=by-(leaves.length-1)*lg/2+j*lg;
      svg+=`<line x1="${bx+70}" y1="${by}" x2="${bx+95}" y2="${ly}" stroke="var(--border)"/><text x="${bx+100}" y="${ly+4}" class="lb">${esc(lf)}</text>`;});});
  return `<div class="vwrap"><svg viewBox="0 0 ${W} ${H}" class="vsvg">${svg}</svg></div><div class="meta">One-line memory hooks. Use it before a section to see the shape, and after to check nothing is missing.</div>`;
}

// ===================== RENDER =====================
function render(){
  const c=ctx.content;const secs=Object.keys(MAPS);
  const picker={diagrams:`<select id="vpick">${Object.keys(DIAGRAMS).map(k=>`<option value="${k}" ${pick.diagram===k?"selected":""}>${DIAGRAMS[k].title}</option>`).join("")}</select>`,
    anim:`<select id="vpick">${Object.keys(ANIMS).map(k=>`<option value="${k}" ${pick.anim===k?"selected":""}>${ANIMS[k][0]}</option>`).join("")}</select>`,
    sims:`<select id="vpick">${Object.keys(SIMS).map(k=>`<option value="${k}" ${pick.sim===k?"selected":""}>${SIMS[k].title}${ctx.state.visual&&ctx.state.visual[k]!=null?" · best "+ctx.state.visual[k]+"%":""}</option>`).join("")}</select>`,
    maps:`<select id="vpick">${secs.map(k=>`<option value="${k}" ${pick.map===k?"selected":""}>${MAPS[k][0]}</option>`).join("")}</select>`}[sub];
  let body="";
  if(sub==="diagrams")body=drawDiagram();else if(sub==="anim")body=ANIMS[pick.anim][1]();else if(sub==="sims")body=drawSim();else body=drawMap();
  c.innerHTML=`<div class="stage" style="justify-content:flex-start;padding-top:4px"><div class="vtop"><div class="vtabs">${[["diagrams","Diagrams"],["anim","Worked examples"],["sims","Practice"],["maps","Mind maps"]].map(([k,l])=>`<button class="${sub===k?"on":""}" data-v="${k}">${l}</button>`).join("")}</div>${picker}</div>${body}</div>`;
  c.querySelectorAll(".vtabs button").forEach(b=>b.onclick=()=>{sub=b.dataset.v;step=0;render();});
  $("#vpick",c).onchange=e=>{pick[{diagrams:"diagram",anim:"anim",sims:"sim",maps:"map"}[sub]]=e.target.value;step=0;simState={sel:null,placed:{},done:false};render();};
  c.querySelectorAll(".vn").forEach(n=>n.onclick=()=>{step=+n.dataset.i;render();});
  const nx=$("#vnext",c),pv=$("#vprev",c);
  if(nx)nx.onclick=()=>{const max=sub==="diagrams"?DIAGRAMS[pick.diagram].nodes.length:sub==="anim"?(pick.anim==="bestport"?BP.length+1:pick.anim==="cashflow"?CF.length+1:99):99;step=(step+1)%max;render();};
  if(pv)pv.onclick=()=>{step=Math.max(0,step-1);render();};
  if(sub==="sims")bindSim();
}
window.renderVisual=function(c){ctx=c;render();};
})();
