let questions=[], answers={}, times={}, current=0, qStart=0, testStart=0, tick=null, participant="";
const $=id=>document.getElementById(id);
function show(id){["welcome","exam","results"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}
function fmt(sec){sec=Math.max(0,Math.round(sec));return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`}
function accrue(){if(qStart){times[questions[current].question_id]=(times[questions[current].question_id]||0)+(Date.now()-qStart)/1000;qStart=Date.now()}}
function render(){
 const q=questions[current];$("counter").textContent=`Question ${current+1} of ${questions.length}`;
 $("progressFill").style.width=`${(current+1)/questions.length*100}%`;
 $("category").textContent=q.category;$("difficulty").textContent=q.difficulty_level;
 $("questionText").textContent=q.question_text;$("options").innerHTML="";
 q.options.forEach(o=>{let label=document.createElement("label");label.className="option"+(answers[q.question_id]===o.key?" selected":"");
 let input=document.createElement("input");input.type="radio";input.name="answer";input.checked=answers[q.question_id]===o.key;
 input.addEventListener("change",()=>{answers[q.question_id]=o.key;renderOptions()});
 let span=document.createElement("span");span.textContent=`${o.key}. ${o.text}`;label.append(input,span);$("options").append(label)});
 $("prevBtn").disabled=current===0;$("nextBtn").classList.toggle("hidden",current===questions.length-1);$("finishBtn").classList.toggle("hidden",current!==questions.length-1);
 $("answeredCount").textContent=`${Object.keys(answers).length} of ${questions.length} answered`;
 qStart=Date.now();
}
function renderOptions(){[...$("options").children].forEach((el,i)=>el.classList.toggle("selected",answers[questions[current].question_id]===questions[current].options[i].key));$("answeredCount").textContent=`${Object.keys(answers).length} of ${questions.length} answered`}
function move(delta){accrue();current=Math.max(0,Math.min(questions.length-1,current+delta));render()}
function csvCell(v){return '"'+String(v??"").replace(/"/g,'""')+'"'}
function records(){return questions.map((q,i)=>({participant_id:participant,test_date:new Date().toISOString(),question_id:q.question_id,category:q.category,difficulty_level:q.difficulty_level,question_text:q.question_text,selected_answer:answers[q.question_id]||"",correct_answer:q.correct_answer,is_correct:answers[q.question_id]===q.correct_answer,marks_obtained:answers[q.question_id]===q.correct_answer?q.marks:0,time_taken_sec:Number((times[q.question_id]||0).toFixed(2)),question_order:i+1}))}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`}
function barRows(items,key,label){let max=Math.max(1,...items.map(x=>x[key]));return items.map(x=>`<div class="barline"><span class="barlabel">${x[label]}</span><span class="bar"><i style="width:${x[key]/max*100}%"></i></span><span class="barvalue">${Number(x[key]).toFixed(1)}</span></div>`).join("")}
function finish(){
 accrue();clearInterval(tick);
 const data=records(), correct=data.filter(r=>r.is_correct).length, totalTime=data.reduce((s,r)=>s+r.time_taken_sec,0);
 $("summaryCards").innerHTML=[["Score",`${correct}/20`],["Accuracy",`${(correct/20*100).toFixed(1)}%`],["Correct",correct],["Total time",fmt(totalTime)]].map(x=>`<div class="stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
 const cats=[...new Set(questions.map(q=>q.category))].map(cat=>{let a=data.filter(r=>r.category===cat);return {name:cat,correct:a.filter(x=>x.is_correct).length,total:a.length,accuracy:a.filter(x=>x.is_correct).length/a.length*100,avg:a.reduce((s,x)=>s+x.time_taken_sec,0)/a.length}});
 $("categoryTable").innerHTML=table(["Category","Score","Accuracy","Avg. time (sec)"],cats.map(x=>[x.name,`${x.correct}/${x.total}`,`${x.accuracy.toFixed(1)}%`,x.avg.toFixed(1)]))+barRows(cats,"accuracy","name");
 const diffs=["Easy","Medium","Hard"].map(name=>{let a=data.filter(r=>r.difficulty_level===name);return {name,correct:a.filter(x=>x.is_correct).length,total:a.length,accuracy:a.length?a.filter(x=>x.is_correct).length/a.length*100:0,avg:a.length?a.reduce((s,x)=>s+x.time_taken_sec,0)/a.length:0}});
 $("difficultyTable").innerHTML=table(["Difficulty","Score","Accuracy","Avg. time (sec)"],diffs.map(x=>[x.name,`${x.correct}/${x.total}`,`${x.accuracy.toFixed(1)}%`,x.avg.toFixed(1)]))+barRows(diffs,"accuracy","name");
 $("questionTable").innerHTML=table(["ID","Category","Difficulty","Selected","Correct","Result","Time (s)"],data.map(x=>[x.question_id,x.category,x.difficulty_level,x.selected_answer||"Skipped",x.correct_answer,x.is_correct?"Correct":"Incorrect",x.time_taken_sec.toFixed(1)]));
 let fastest=[...cats].sort((a,b)=>a.avg-b.avg)[0], slowest=[...cats].sort((a,b)=>b.avg-a.avg)[0], best=[...cats].sort((a,b)=>b.accuracy-a.accuracy)[0], low=[...cats].sort((a,b)=>a.accuracy-b.accuracy)[0];
 $("observations").innerHTML=[`Fastest average category: ${fastest.name} (${fastest.avg.toFixed(1)} seconds).`,`Slowest average category: ${slowest.name} (${slowest.avg.toFixed(1)} seconds).`,`Highest category accuracy: ${best.name} (${best.accuracy.toFixed(1)}%).`,`Lowest category accuracy: ${low.name} (${low.accuracy.toFixed(1)}%).`,`Difficulty-wise accuracy: ${diffs.map(x=>`${x.name} ${x.accuracy.toFixed(1)}%`).join("; ")}.`].map(x=>`<li>${x}</li>`).join("");
 window.finalRecords=data;show("results");
}
function downloadCSV(){let data=window.finalRecords, headers=Object.keys(data[0]);let content=[headers.join(","),...data.map(r=>headers.map(h=>csvCell(r[h])).join(","))].join("\r\n");let blob=new Blob(["\ufeff"+content],{type:"text/csv;charset=utf-8"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`Participant_${participant}_raw_data.csv`;a.click();URL.revokeObjectURL(a.href)}
async function init(){try{let res=await fetch("questions.json");questions=await res.json()}catch(e){alert("Could not load questions.json. Please run this app from the included folder using a local web server, or deploy the complete folder to a static host.");return}
 $("startBtn").onclick=()=>{participant=$("pid").value.trim();if(!participant){alert("Enter the anonymous participant ID.");return}testStart=Date.now();show("exam");render();tick=setInterval(()=>$("elapsed").textContent=fmt((Date.now()-testStart)/1000),500)};
 $("prevBtn").onclick=()=>move(-1);$("nextBtn").onclick=()=>move(1);$("finishBtn").onclick=()=>{let unanswered=questions.length-Object.keys(answers).length;if(unanswered&&!confirm(`${unanswered} question(s) are unanswered. Submit anyway?`))return;finish()};
 $("csvBtn").onclick=downloadCSV;$("pdfBtn").onclick=()=>window.print();
}
init();