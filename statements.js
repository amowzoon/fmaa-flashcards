// Full-statement walkthroughs: click any line for its explanation.
// Exposed as window.FMAA_STATEMENTS = {list:[...], render(id, sel)}
(function(){
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
const fmt=n=>{const a=Math.abs(Math.round(n)).toLocaleString();return n<0?"("+a+")":a;};
// line: {l:label, v:amount|null, i:indent, k:kind(h=header,t=total,s=subtotal,n=normal,x=contra), e:{what, cls, bal, how, link, trap}}
const L=(l,v,e,o={})=>Object.assign({l,v,e,i:0,k:"n"},o);
const H=(l,o={})=>Object.assign({l,v:null,k:"h",i:0},o);

// ---------- BALANCE SHEET (Sylven Company, classified) ----------
const BS={id:"bs",title:"Balance sheet (classified)",sub:"Sylven Company · December 31, 20XX · a POINT in time",
intro:"Assets are listed in order of liquidity (how fast they turn into cash). Everything on the left must equal everything on the right: Assets = Liabilities + Equity. Current means within one year or the operating cycle, whichever is longer.",
cols:["",""],
lines:[
 H("ASSETS"),
 H("Current assets",{i:1,e:{what:"Cash and things that will become cash, be sold, or be used up within one year or the operating cycle, whichever is LONGER.",cls:"Balance-sheet group",bal:"Debit",how:"Listed in order of liquidity: cash first.",trap:"Restricted cash for a long-term purpose is NOT current, even though it is cash."}}),
 L("Cash",27000,{what:"Currency, bank balances and cash equivalents available to pay bills.",cls:"Current asset",bal:"Debit: increases with a debit.",how:"Face value.",link:"The cash flow statement explains how this number changed from last year (20,000 → 27,000).",trap:"Cash restricted for expanding a plant goes to Other assets, not here."},{i:2}),
 L("Marketable securities",8000,{what:"Short-term investments in other companies' stocks or bonds that can be sold quickly.",cls:"Current asset",bal:"Debit",how:"Fair value for trading securities.",link:"Part of the quick ratio numerator (cash + securities + receivables).",trap:"Buying or selling them is an INVESTING cash flow; the dividends they earn are OPERATING."},{i:2}),
 L("Accounts receivable",30000,{what:"Oral promises from customers to pay for goods or services already delivered.",cls:"Current asset (trade receivable)",bal:"Debit",how:"Gross amount owed. Recorded net of trade discounts.",link:"Reduced by the allowance below to net realizable value.",trap:"A NOTE receivable is a written promise; nontrade receivables (employee advances) are shown separately."},{i:2}),
 L("Less: Allowance for doubtful debts",-2000,{what:"The estimate of receivables that will never be collected.",cls:"CONTRA-asset: reduces receivables but sits in the asset section",bal:"CREDIT (opposite of the asset it reduces)",how:"Percentage of sales (expense = % × credit sales) or aging of receivables (required balance − existing balance).",link:"Created by Dr Bad Debt Expense / Cr Allowance. A write-off is Dr Allowance / Cr A/R and has no income effect.",trap:"It is a PERMANENT (real) account even though it lives beside a temporary-sounding estimate (QUC 12317)."},{i:2,k:"x"}),
 L("Accounts receivable, net",28000,{what:"Receivables at net realizable value: what the company actually expects to collect.",cls:"Current asset",bal:"Debit",how:"Gross receivables minus the allowance.",link:"Used in receivables turnover and days sales outstanding."},{i:3,k:"s"}),
 L("Inventory",34000,{what:"Goods held for sale (finished goods) or to be used in making goods (raw materials, work in process).",cls:"Current asset",bal:"Debit",how:"Cost, using FIFO or LIFO. Cost includes freight-in, insurance in transit, and for a manufacturer direct materials, direct labor and factory overhead. Freight-out and selling costs are NOT inventory.",link:"Becomes cost of goods sold when sold (matching). Consigned goods stay in the consignor's inventory; goods in transit FOB shipping point belong to the buyer.",trap:"Excluded from the quick ratio because it may take a long time to turn into cash."},{i:2}),
 L("Prepaid expenses",5000,{what:"Costs paid in advance that still have future benefit: rent, insurance.",cls:"Current asset (a deferral)",bal:"Debit",how:"Amount paid, reduced each period by an adjusting entry: Dr Expense / Cr Prepaid.",link:"BestPort paid 3,000 for three months' rent; after one month the prepaid is 2,000 and rent expense 1,000.",trap:"Excluded from the quick ratio along with inventory."},{i:2}),
 L("Total current assets",null,{what:"Everything above added up.",cls:"Subtotal",how:"Numerator of the current ratio; minus current liabilities = net working capital."},{i:1,k:"t",sum:["Cash","Marketable securities","Accounts receivable, net","Inventory","Prepaid expenses"]}),
 H("Long-term investments",{i:1}),
 L("Investment in affiliate",15000,{what:"Stock of another company held for the long run, or special funds and non-consolidated subsidiaries.",cls:"Non-current asset",bal:"Debit",how:"Cost or equity method.",link:"Undistributed equity-method earnings are a NON-CASH revenue subtracted in the indirect method."},{i:2}),
 H("Property, plant and equipment",{i:1,e:{what:"Tangible, durable assets used in operations.",cls:"Non-current asset group",how:"Recorded at cost: purchase price, taxes and duties, transport in, installation, trial runs, and interest during construction of a self-built asset."}}),
 L("Land",40000,{what:"Land used in the business.",cls:"Non-current asset",bal:"Debit",how:"Cost. NEVER depreciated.",trap:"Land held for resale by a real-estate firm would be inventory; land held for appreciation is an investment. Classification follows use."},{i:2}),
 L("Buildings and equipment",120000,{what:"Structures, machinery, furniture, vehicles.",cls:"Non-current asset",bal:"Debit (at original cost)",how:"Cost stays on the books; wear is tracked separately in accumulated depreciation.",link:"Buying or selling these is an INVESTING cash flow.",trap:"Gross fixed assets are identical whichever depreciation method is used."},{i:2}),
 L("Less: Accumulated depreciation",-45000,{what:"All depreciation charged on these assets since purchase.",cls:"CONTRA-asset",bal:"CREDIT",how:"Grows each year by the depreciation expense (straight-line, sum-of-years'-digits, double-declining, or activity).",link:"Depreciation expense on the income statement is added back in the indirect cash-flow method because no cash leaves. When an asset is sold, its share of this account is removed.",trap:"Accelerated methods make this larger early on, so book value and retained earnings are lower."},{i:2,k:"x"}),
 L("Net property, plant and equipment",75000,{what:"Book value: cost minus accumulated depreciation.",cls:"Subtotal",how:"Proceeds − book value = gain or loss on disposal (QUC 1478: book value 205,000 + gain 75,000 = selling price 280,000)."},{i:3,k:"s"}),
 H("Intangible assets",{i:1}),
 L("Patents and trademarks",12000,{what:"Legal rights without physical substance.",cls:"Non-current asset (finite life)",bal:"Debit",how:"Purchased: at cost. Internally created: only direct costs like legal fees. Amortized over the useful life.",trap:"Research and development is ALWAYS expensed, never capitalized here."},{i:2}),
 L("Goodwill",18000,{what:"The premium paid to acquire another company above the fair value of its net assets.",cls:"Non-current asset (indefinite life)",bal:"Debit",how:"Only recorded when another business is BOUGHT. Not amortized; tested for impairment at least yearly.",trap:"Internally generated goodwill (your own reputation) is never recorded."},{i:2}),
 H("Other assets",{i:1}),
 L("Cash restricted for plant expansion",10000,{what:"Cash set aside for a long-term purpose.",cls:"Other (non-current) asset",bal:"Debit",how:"Face value.",trap:"Classic exam item: it is cash, but it is NOT a current asset because it cannot pay current bills."},{i:2}),
 L("TOTAL ASSETS",null,{what:"Everything the company controls that has future benefit.",cls:"Grand total",how:"Base (100%) for a vertical common-size balance sheet (QUC 2419). Denominator of return on assets and asset turnover.",trap:"Fictitious inventory inflates this, so total asset turnover falls unexpectedly (QUC 140)."},{k:"t",sum:["Total current assets","Investment in affiliate","Land","Buildings and equipment","Less: Accumulated depreciation","Patents and trademarks","Goodwill","Cash restricted for plant expansion"]}),
 H("LIABILITIES"),
 H("Current liabilities",{i:1,e:{what:"Obligations to be settled within one year or the operating cycle using current assets or by creating other current liabilities.",cls:"Balance-sheet group",bal:"Credit"}}),
 L("Accounts payable",12000,{what:"Amounts owed to suppliers for goods bought on credit: trade credit.",cls:"Current liability",bal:"Credit",how:"Invoice amount after a three-way match (purchase order, receiving report, invoice).",link:"An INCREASE in payables is ADDED to net income in the indirect method (expenses recorded, cash not yet paid).",trap:"Using trade credit is borrowing; its cost is the cash discount you give up."},{i:2}),
 L("Wages payable",4000,{what:"Wages earned by employees but not yet paid: an accrued expense.",cls:"Current liability (accrual)",bal:"Credit",how:"Adjusting entry Dr Wages Expense / Cr Wages Payable.",link:"A DECREASE in accrued liabilities is SUBTRACTED in the indirect method."},{i:2}),
 L("Income taxes payable",3000,{what:"Tax owed on this year's income, not yet remitted.",cls:"Current liability",bal:"Credit",how:"Tax expense minus what has been paid."},{i:2}),
 L("Unearned revenue",6000,{what:"Cash received from customers BEFORE the goods or services are delivered: an obligation to perform.",cls:"Current liability (a deferral)",bal:"Credit",how:"Recorded when cash arrives: Dr Cash / Cr Unearned Revenue. Moves to revenue as control transfers.",link:"BestPort received 9,000 for future services; after one third was done, 3,000 became revenue.",trap:"It is a LIABILITY, not revenue, no matter how sure the sale is (revenue step 1 and 5)."},{i:2}),
 L("Current portion of long-term debt",5000,{what:"The slice of a long-term loan due within the next year.",cls:"Current liability",bal:"Credit",how:"Reclassified out of long-term debt each year.",trap:"Stays LONG-TERM if the company intends AND is able to refinance it long-term (QUC 546)."},{i:2}),
 L("Total current liabilities",null,{what:"Sum of the current obligations.",cls:"Subtotal",how:"Denominator of the current, quick and cash ratios."},{i:1,k:"t",sum:["Accounts payable","Wages payable","Income taxes payable","Unearned revenue","Current portion of long-term debt"]}),
 H("Long-term liabilities",{i:1}),
 L("Notes payable, due 20X5",25000,{what:"A written promise to a lender, maturing beyond one year.",cls:"Long-term liability",bal:"Credit",how:"Principal outstanding. A discount on notes payable is a contra-liability (debit); a premium is an adjunct (credit).",link:"Borrowing and repaying principal are FINANCING cash flows; the interest is OPERATING."},{i:2}),
 L("Bonds payable",60000,{what:"Certificates of debt sold to many investors; used by large, reputable firms.",cls:"Long-term liability",bal:"Credit",how:"Face value adjusted for unamortized discount or premium.",link:"Amortization of a bond discount is a non-cash expense added back in the indirect method (QUC 1881)."},{i:2}),
 L("Deferred income tax liability",3000,{what:"Tax that will be owed in the future because book income ran ahead of taxable income.",cls:"Long-term liability (arises from ordinary operations)",bal:"Credit"},{i:2}),
 L("Total liabilities",null,{what:"Everything owed to outsiders.",cls:"Subtotal",how:"Numerator of debt-to-assets and debt-to-equity."},{i:1,k:"t",sum:["Total current liabilities","Notes payable, due 20X5","Bonds payable","Deferred income tax liability"]}),
 H("STOCKHOLDERS' EQUITY",{e:{what:"The owners' residual claim: assets minus liabilities.",cls:"Equity",bal:"Credit"}}),
 L("Preferred stock, $100 par, 100 shares",10000,{what:"Shares with a dividend preference and priority in liquidation, usually without a vote.",cls:"Contributed capital",bal:"Credit",how:"Par value × shares issued.",trap:"Cumulative preferred dividends in arrears are NOT a liability until declared. Preferred dividends are subtracted from net income when computing return on COMMON equity."},{i:1}),
 L("Common stock, $5 par, 10,000 shares issued",50000,{what:"The basic ownership shares: voting rights and the residual claim.",cls:"Contributed capital",bal:"Credit",how:"Par (or stated) value × shares ISSUED. Disclose shares authorized, issued and outstanding.",link:"Issuing shares is a FINANCING inflow."},{i:1}),
 L("Additional paid-in capital",25000,{what:"What shareholders paid ABOVE par value.",cls:"Contributed capital",bal:"Credit",how:"Issue 1,000 shares of $50 par at $75: Cr Common Stock 50,000, Cr APIC 25,000.",link:"A small stock dividend credits APIC for the excess of market value over par."},{i:1}),
 L("Retained earnings",72000,{what:"All net income since inception that has not been paid out as dividends.",cls:"Earned capital",bal:"Credit",how:"Beginning + net income − dividends declared. Prior-period error corrections and changes in accounting principle adjust the OPENING balance, net of tax.",link:"Net income arrives from the income statement; dividends declared leave here (Dr Retained Earnings / Cr Dividends Payable).",trap:"Board may APPROPRIATE (restrict) part of it. A small stock dividend reduces it at market value, a large one at par (QUC 12115)."},{i:1}),
 L("Accumulated other comprehensive income",3000,{what:"Gains and losses that bypass net income (certain unrealized gains).",cls:"Equity",bal:"Credit",how:"Permanent account; never closed; does not touch retained earnings."},{i:1}),
 L("Less: Treasury stock, 1,000 shares at cost",-6000,{what:"The company's own shares bought back and held.",cls:"CONTRA-equity",bal:"DEBIT (opposite of equity)",how:"Recorded at cost: Dr Treasury Stock / Cr Cash. Reduces assets and equity; it is not an asset.",link:"Buying it is a FINANCING outflow (QUC 1960).",trap:"Treasury shares are ISSUED but NOT OUTSTANDING: no vote, no dividend. Outstanding = 10,000 − 1,000 = 9,000."},{i:1,k:"x"}),
 L("Total stockholders' equity",null,{what:"Owners' residual interest.",cls:"Subtotal",how:"Ties to the ending balance on the statement of changes in equity. Average equity is the denominator of return on equity."},{i:1,k:"t",sum:["Preferred stock, $100 par, 100 shares","Common stock, $5 par, 10,000 shares issued","Additional paid-in capital","Retained earnings","Accumulated other comprehensive income","Less: Treasury stock, 1,000 shares at cost"]}),
 L("TOTAL LIABILITIES AND EQUITY",null,{what:"Must equal total assets.",cls:"Grand total",how:"Assets = Liabilities + Equity. If it does not balance, an entry was posted to one side only."},{k:"t",sum:["Total liabilities","Total stockholders' equity"]})
]};

// ---------- INCOME STATEMENT (Sylven, multiple-step; PRC numbers) ----------
const IS={id:"is",title:"Income statement (multiple-step)",sub:"Sylven Company · for the year ended December 31, 20XX · a PERIOD of time",
intro:"Multiple-step means operating results are separated from non-operating items, so you can see gross profit and operating income before interest, taxes and unusual events. PRC's Sylven numbers.",
lines:[
 L("Sales revenue",2000000,{what:"Gross sales of the company's central product or service.",cls:"Revenue",bal:"Credit",how:"Recognized when control transfers to the customer (five-step model), not when cash arrives.",link:"Base (100%) of a vertical common-size income statement."},{}),
 L("Less: Sales discounts",-20000,{what:"Cash discounts customers took for paying early (2/10, n/30).",cls:"CONTRA-revenue",bal:"Debit",how:"Gross method: recorded when the discount is taken.",trap:"Under the NET method a forfeited discount is Other Revenue instead."},{i:1,k:"x"}),
 L("Less: Sales returns",-45000,{what:"Goods customers sent back.",cls:"CONTRA-revenue",bal:"Debit",how:"Expected returns are estimated at the time of sale (refund liability); only revenue for units expected to stay sold is recognized."},{i:1,k:"x"}),
 L("Net sales",null,{what:"Revenue the company actually keeps.",cls:"Subtotal",how:"Denominator of gross, operating and net margins; numerator of asset turnover; base for vertical analysis."},{k:"t",sum:["Sales revenue","Less: Sales discounts","Less: Sales returns"]}),
 L("Cost of sales",-1135000,{what:"The inventory cost of the goods sold: what it cost to buy or make them.",cls:"Expense (matching: recognized when the goods are sold)",bal:"Debit",how:"Periodic: beginning inventory + purchases − returns − ending inventory. Under rising prices FIFO gives a LOWER figure than LIFO.",link:"Numerator of inventory turnover."},{}),
 L("Gross profit",null,{what:"What is left after paying for the goods themselves.",cls:"Subtotal",how:"Gross margin = gross profit ÷ net sales = 800,000 ÷ 1,935,000 = 41.3%. Measures how well cost of goods is managed."},{k:"t",sum:["Net sales","Cost of sales"]}),
 H("Operating expenses",{i:0}),
 H("Selling expenses",{i:1}),
 L("Sales salaries",-120000,{what:"Pay for the sales force.",cls:"Selling expense (period cost)",bal:"Debit",how:"Expensed when incurred, not capitalized."},{i:2}),
 L("Advertising expense",-28000,{what:"Marketing and promotion.",cls:"Selling expense",bal:"Debit",how:"Conservatism: expensed immediately even if it may produce future sales."},{i:2}),
 L("Shipping expense",-55000,{what:"Freight-OUT: delivering goods to customers.",cls:"Selling expense",bal:"Debit",trap:"Freight-IN is an inventory cost; freight-OUT is a period cost, and it is NOT an inventory carrying cost (QUC 6214)."},{i:2}),
 L("Depreciation of sales equipment",-8000,{what:"Wear on equipment used by the sales function.",cls:"Selling expense (non-cash)",bal:"Debit",link:"Added back to net income in the indirect cash-flow method."},{i:2}),
 H("General and administrative expenses",{i:1}),
 L("Officers' salaries",-61000,{what:"Executive pay.",cls:"G&A expense (immediate recognition)",bal:"Debit",how:"No cause-and-effect link to any sale, so expensed as incurred."},{i:2}),
 L("Legal services",-16000,{what:"Lawyers' fees for running the business.",cls:"G&A expense",bal:"Debit",trap:"Legal fees to REGISTER a patent are capitalized as an intangible; ordinary legal costs are expensed."},{i:2}),
 L("Utilities expense",-12000,{what:"Power, water, telecom for the offices.",cls:"G&A expense",bal:"Debit"},{i:2}),
 L("Insurance expense",-14000,{what:"The portion of prepaid insurance used up this year.",cls:"G&A expense (systematic and rational allocation)",bal:"Debit",how:"Adjusting entry Dr Insurance Expense / Cr Prepaid Insurance."},{i:2}),
 L("Depreciation of office building and equipment",-17000,{what:"Allocation of office asset cost to this period.",cls:"G&A expense (non-cash)",bal:"Debit",link:"Non-cash: added back in the indirect method. Total depreciation this year = 8,000 + 17,000 = 25,000."},{i:2}),
 L("Total operating expenses",null,{cls:"Subtotal",what:"Selling plus general and administrative."},{i:1,k:"t",sum:["Sales salaries","Advertising expense","Shipping expense","Depreciation of sales equipment","Officers' salaries","Legal services","Utilities expense","Insurance expense","Depreciation of office building and equipment"]}),
 L("Income from operations",null,{what:"Profit from the core business before financing, investing side-effects and taxes.",cls:"Subtotal (operating income, EBIT)",how:"Operating margin = 469,000 ÷ 1,935,000 = 24.2%. If this margin falls while gross margin holds, the other operating costs are the problem.",link:"Numerator of times interest earned."},{k:"t",sum:["Gross profit","Total operating expenses"]}),
 H("Other revenues and gains",{i:0,e:{what:"Income from PERIPHERAL activities: not what the company is in business to do.",cls:"Non-operating"}}),
 L("Dividend and interest revenue",74000,{what:"Earnings on investments and loans to others.",cls:"Other revenue",bal:"Credit",link:"The CASH received is an OPERATING inflow on the cash flow statement.",trap:"Gains vs revenue: a laptop maker selling laptops earns revenue; selling its own machine above book value is a gain."},{i:1}),
 L("Rent revenue",29000,{what:"Rent earned on property leased to others.",cls:"Other revenue",bal:"Credit"},{i:1}),
 H("Other expenses and losses",{i:0}),
 L("Interest expense",-110000,{what:"The cost of borrowed money.",cls:"Other expense (non-operating)",bal:"Debit",how:"Recognized by passage of time.",link:"Interest PAID is an OPERATING cash outflow even though the loan is financing (QUC 6106). Denominator of times interest earned: 469,000 ÷ 110,000 = 4.3.",trap:"Tax deductible, unlike dividends: that is why leverage lowers the cost of capital."},{i:1}),
 L("Loss on sale of land",-28000,{what:"Land sold for less than its book value.",cls:"Loss (peripheral transaction)",bal:"Debit",how:"Proceeds − book value, negative.",link:"Added BACK to net income in the indirect method; the actual cash from the sale is an INVESTING inflow.",trap:"Unusual or infrequent items like this are shown BEFORE tax, not net of tax."},{i:1}),
 L("Income from continuing operations before income tax",null,{cls:"Subtotal",what:"All ordinary activity, before the tax bill."},{k:"t",sum:["Income from operations","Dividend and interest revenue","Rent revenue","Interest expense","Loss on sale of land"]}),
 L("Income taxes",-120000,{what:"Tax on continuing operations.",cls:"Expense",bal:"Debit",how:"Accrued: Dr Income Tax Expense / Cr Income Taxes Payable."},{}),
 L("Income from continuing operations",null,{what:"The profit a reader can expect to recur.",cls:"Subtotal",how:"Analysts start from here to predict future earnings."},{k:"t",sum:["Income from continuing operations before income tax","Income taxes"]}),
 H("Discontinued operations",{i:0,e:{what:"A whole segment or product line that has been or will be disposed of.",cls:"Separate section, NET OF TAX",how:"Both the operating results of the segment and the gain or loss on its disposal are shown here, after tax.",trap:"Disposing of PART of a line, relocating production, or phasing out a product is NOT a discontinued operation."}}),
 L("Income from operations of discontinued division (net of tax)",15000,{what:"What the sold division earned this year before it was disposed of.",cls:"Discontinued operations, net of tax",bal:"Credit"},{i:1}),
 L("Loss on disposal of discontinued division (net of tax)",-119000,{what:"Loss from selling the division.",cls:"Discontinued operations, net of tax",bal:"Debit"},{i:1}),
 L("Net income",null,{what:"The bottom line for the period.",cls:"Grand total",how:"Net margin = 210,000 ÷ 1,935,000 = 10.9%. Numerator of ROA and ROE.",link:"Flows to retained earnings on the statement of changes in equity, and is the starting point of the indirect cash-flow statement.",trap:"Profit is not cash: BestPort earned 7,800 but its cash rose 51,500."},{k:"t",sum:["Income from continuing operations","Income from operations of discontinued division (net of tax)","Loss on disposal of discontinued division (net of tax)"]})
]};

// ---------- STATEMENT OF CHANGES IN EQUITY (Sylven, PRC numbers) ----------
const SCE={id:"sce",title:"Statement of changes in equity",sub:"Sylven Company · for the year ended December 31, 20XX",
intro:"Reconciles each equity account from the beginning of the year to the end. It is the bridge: net income comes IN from the income statement, ending balances go OUT to the balance sheet.",
cols:["Common stock","Retained earnings","Total"],multi:true,
lines:[
 L("Beginning balance",[1000000,1250000,2250000],{what:"Last year's ending balances.",cls:"Opening equity",how:"Must equal the prior balance sheet.",trap:"A prior-period ERROR correction or a change in accounting PRINCIPLE is charged here, to the OPENING retained earnings, net of tax, not to this year's income."}),
 L("Net income",[0,210000,210000],{what:"This year's profit, from the income statement.",cls:"Increase in retained earnings",how:"Closing entries move revenues and expenses through Income Summary into Retained Earnings.",link:"The 210,000 is the last line of the Sylven income statement."}),
 L("Issuance of common stock",[100000,0,100000],{what:"New shares sold to investors.",cls:"Increase in contributed capital",how:"Par value goes to Common Stock; any excess to Additional Paid-in Capital.",link:"A FINANCING cash inflow."}),
 L("Less: dividends declared",[0,-60000,-60000],{what:"Distributions to shareholders approved by the board.",cls:"Decrease in retained earnings",how:"Becomes a LIABILITY at declaration: Dr Retained Earnings / Cr Dividends Payable. Paying it later does not touch equity.",link:"Dividends PAID are a FINANCING outflow.",trap:"A STOCK dividend or a split moves amounts within equity and never changes the total (QUC 11813)."}),
 L("Ending balance",[1100000,1400000,2500000],{what:"Balances carried to the balance sheet.",cls:"Closing equity",how:"Beginning + net income + shares issued − dividends declared.",link:"QUC 325 uses the same logic for a proprietorship: ending equity = beginning + investments − withdrawals + net income."},{k:"t"})
]};

// ---------- CASH FLOW STATEMENT (PRC indirect-method illustration) ----------
const CFS={id:"cfs",title:"Statement of cash flows (indirect method)",sub:"PRC illustration · for the year ended December 31, Year 2",
intro:"Explains why cash went from 20,000 to 27,000. Operating cash starts from net income and undoes everything in it that was not cash. Only the indirect method is tested.",
lines:[
 H("Cash flows from operating activities"),
 L("Net income",40000,{what:"Starting point: accrual-basis profit.",cls:"Operating",how:"From the income statement.",trap:"Every adjustment below exists because net income is not cash."},{i:1}),
 H("Adjustments to reconcile net income to net cash from operations",{i:1}),
 L("Depreciation expense",18000,{what:"Non-cash expense: it reduced profit but no cash left.",cls:"Operating: ADD",how:"Change in accumulated depreciation (12,000) plus the accumulated depreciation removed on the machine sold (20,000 cost − 14,000 book value = 6,000).",trap:"Same treatment for amortization, impairment and bond-discount amortization (QUC 1881)."},{i:2}),
 L("Gain on sale of machine",-4000,{what:"The machine sold for 18,000 against a 14,000 book value.",cls:"Operating: SUBTRACT",how:"The full 18,000 cash is shown in investing; leaving the gain in net income would count it twice.",trap:"A LOSS would be ADDED back."},{i:2}),
 L("Decrease in accounts receivable",5000,{what:"Customers paid down 5,000 more than this year's sales added.",cls:"Operating: ADD",how:"Decrease in an operating asset = cash came in."},{i:2}),
 L("Increase in inventory",-10000,{what:"Cash was tied up buying more stock than was sold.",cls:"Operating: SUBTRACT",how:"Increase in an operating asset = cash went out."},{i:2}),
 L("Increase in prepaid expenses",-3000,{what:"Paid ahead for next year's costs.",cls:"Operating: SUBTRACT",how:"Increase in an operating asset."},{i:2}),
 L("Decrease in accounts payable",-8000,{what:"Paid suppliers down beyond this year's expenses.",cls:"Operating: SUBTRACT",how:"Decrease in an operating liability = cash went out. An INCREASE would be added."},{i:2}),
 L("Net cash provided by operating activities",null,{what:"Cash the core business generated.",cls:"Subtotal",how:"Most important figure for judging SOLVENCY. Numerator of the cash flow ratio.",link:"Compare with net income 40,000: profit is not cash."},{i:1,k:"t",sum:["Net income","Depreciation expense","Gain on sale of machine","Decrease in accounts receivable","Increase in inventory","Increase in prepaid expenses","Decrease in accounts payable"]}),
 H("Cash flows from investing activities"),
 L("Sale of a machine",18000,{what:"Full proceeds from selling a long-lived asset.",cls:"Investing inflow",how:"Cost 20,000, book value 14,000, sold for 18,000."},{i:1}),
 L("Purchase of a machine",-60000,{what:"Cash paid for a new long-lived asset.",cls:"Investing outflow",trap:"Buying equipment is investing; borrowing to pay for it is financing (QUC 6104)."},{i:1}),
 L("Net cash used in investing activities",null,{cls:"Subtotal",what:"Spending on future capacity."},{i:1,k:"t",sum:["Sale of a machine","Purchase of a machine"]}),
 H("Cash flows from financing activities"),
 L("Issuance of common stock",41000,{what:"Cash from selling shares.",cls:"Financing inflow",how:"Common stock rose 38,000 → 79,000."},{i:1}),
 L("Redemption of debt",-20000,{what:"Loan principal repaid.",cls:"Financing outflow",trap:"The INTEREST on that loan was operating."},{i:1}),
 L("Payment of dividends",-10000,{what:"Cash dividends paid to shareholders.",cls:"Financing outflow",how:"Derived: net income 40,000 − increase in retained earnings 30,000.",trap:"Dividends PAID are financing; dividends RECEIVED are operating."},{i:1}),
 L("Net cash provided by financing activities",null,{cls:"Subtotal",what:"Net money raised from owners and lenders."},{i:1,k:"t",sum:["Issuance of common stock","Redemption of debt","Payment of dividends"]}),
 L("Net increase in cash",null,{cls:"Total",what:"Operating + investing + financing."},{k:"t",sum:["Net cash provided by operating activities","Net cash used in investing activities","Net cash provided by financing activities"]}),
 L("Cash, beginning of year",20000,{what:"Last year's balance-sheet cash.",cls:"Reconciliation"},{}),
 L("Cash, end of year",null,{what:"Must equal cash on this year's balance sheet.",cls:"Reconciliation",how:"20,000 + 7,000 = 27,000."},{k:"t",sum:["Net increase in cash","Cash, beginning of year"]})
]};

const ALL=[BS,IS,SCE,CFS];
// compute sums
ALL.forEach(st=>{const byL={};st.lines.forEach(x=>byL[x.l]=x);st.lines.forEach(x=>{if(x.sum){x.v=x.sum.reduce((a,n)=>a+(byL[n]&&typeof byL[n].v==="number"?byL[n].v:0),0);}});});

function render(id,sel,quiz){
  const st=ALL.find(s=>s.id===id);
  const rows=st.lines.map((x,i)=>{
    const cls=`sl k${x.k} i${x.i} ${i===sel?"on":""} ${x.e?"click":""}`;
    let vals="";
    if(st.multi){vals=(x.v||[]).map(v=>`<td class="num">${v===0?"":fmt(v)}</td>`).join("");}
    else vals=`<td class="num">${x.v===null||x.v===undefined?"":fmt(x.v)}</td>`;
    const lab=quiz&&x.k!=="h"&&x.k!=="t"&&x.k!=="s"&&i!==sel?`<span class="blur">${esc(x.l)}</span>`:esc(x.l);
    return `<tr class="${cls}" data-i="${i}"><td class="lab">${lab}</td>${vals}</tr>`;});
  const head=st.multi?`<tr><th></th>${st.cols.map(c=>`<th class="num">${c}</th>`).join("")}</tr>`:"";
  const x=sel!=null?st.lines[sel]:null;
  const info=x&&x.e?`<div class="vinfo"><div class="vt">${esc(x.l)}${typeof x.v==="number"?` · ${fmt(x.v)}`:""}</div>
    <table class="vtab exp">${[["What it is",x.e.what],["Classification",x.e.cls],["Normal balance",x.e.bal],["How it is measured",x.e.how],["Links to",x.e.link]].filter(r=>r[1]).map(r=>`<tr><th>${r[0]}</th><td>${esc(r[1])}</td></tr>`).join("")}</table>
    ${x.e.trap?`<div class="vtrap">Exam trap: ${esc(x.e.trap)}</div>`:""}</div>`:`<div class="vinfo"><div class="vt">${esc(st.title)}</div><div>${esc(st.intro)}</div><div class="meta">Click any line to see what it is, where it belongs, its normal balance, how it is measured, and the trap the exam sets.</div></div>`;
  return `<div class="stmt"><div class="sh"><b>${esc(st.title)}</b><span class="meta">${esc(st.sub)}</span></div><table class="stab">${head}${rows.join("")}</table></div>${info}`;
}
window.FMAA_STATEMENTS={list:ALL.map(s=>[s.id,s.title]),render,count:id=>ALL.find(s=>s.id===id).lines.length,hasE:(id,i)=>!!ALL.find(s=>s.id===id).lines[i].e};
})();
