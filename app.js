const byId = id => document.getElementById(id);
const elements = Object.fromEntries(['word-card','word-category','word-count','word','pronunciation','meaning','example','empty-state','progress-label','progress-fill','progress-note','mastered-total','search','sound','skip','know'].map(id => [id, byId(id)]));
const dailyTarget = 100;
let words = [];
let wordFilter = 'all';
let currentIndex = 0;
let studiedToday = Number(localStorage.getItem('vocab-studied-today') || 0);
const savedMastery = readStore('vocab-mastered', []);
let mastered = new Set(Array.isArray(savedMastery) ? savedMastery : []);
const today = new Date().toLocaleDateString('en-CA');
if (localStorage.getItem('vocab-studied-date') !== today) {
  studiedToday = 0;
  localStorage.setItem('vocab-studied-date', today);
  localStorage.setItem('vocab-studied-today', '0');
}
function readStore(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}
function sourcesOf(item) { return item.sources || (item.source ? [item.source] : []); }
function normalizeWordAtlas(data) {
  const posMap = { 'n.':'noun','v.':'verb','adj.':'adjective','adv.':'adverb','pron.':'pronoun','prep.':'preposition','conj.':'conjunction','det.':'determiner','aux.':'auxiliary','phr.':'phrase','num.':'numeral','int.':'interjection' };
  return (data.words || []).map(row => {
    const gloss = String(row[2] || '');
    const match = gloss.match(/^([a-z]+\.)\s*/i);
    return { word: row[1], exam: 'IELTS', exams: ['IELTS'], pos: match ? (posMap[match[1].toLowerCase()] || match[1]) : '', pronunciation: row[3] || '', meaning: match ? gloss.slice(match[0].length) : gloss, example: '', source: 'Word Atlas', sources: ['Word Atlas'], cefr: data.cefr?.[row[4]] || '', topic: data.topics?.[row[5]]?.[1] || '' };
  });
}
function mergeWordLists(base, extra) {
  const merged = new Map();
  for (const item of [...base, ...extra]) {
    const key = String(item.word || '').trim().toLowerCase();
    if (!key) continue;
    const current = merged.get(key);
    if (!current) { merged.set(key, { ...item, sources: [...new Set(sourcesOf(item))], exams: [...new Set(item.exams || [])] }); continue; }
    current.sources = [...new Set([...sourcesOf(current), ...sourcesOf(item)])];
    current.exams = [...new Set([...(current.exams || []), ...(item.exams || [])])];
    if (!current.meaning && item.meaning) current.meaning = item.meaning;
    if (!current.pos && item.pos) current.pos = item.pos;
    if (!current.pronunciation && item.pronunciation) current.pronunciation = item.pronunciation;
    if (!current.example && item.example) current.example = item.example;
    if (!current.cefr && item.cefr) current.cefr = item.cefr;
    if (!current.topic && item.topic) current.topic = item.topic;
  }
  return [...merged.values()];
}
function visibleWords() {
  const query = elements.search.value.trim().toLowerCase();
  return words.filter(item => {
    const matchesFilter = wordFilter === 'all' || item.exam === wordFilter || (item.exams || []).includes(wordFilter) || sourcesOf(item).includes(wordFilter);
    const haystack = [item.word,item.meaning,item.example,item.topic,item.cefr,sourcesOf(item).join(' ')].join(' ').toLowerCase();
    return matchesFilter && (!query || haystack.includes(query));
  });
}
function setText(element, value) { element.textContent = value || ''; }
function renderWords() {
  const list = visibleWords();
  setText(elements['mastered-total'], '已掌握 ' + mastered.size + ' 个词');
  setText(elements['progress-label'], Math.min(studiedToday, dailyTarget) + ' / ' + dailyTarget);
  elements['progress-fill'].style.width = Math.min(studiedToday / dailyTarget, 1) * 100 + '%';
  setText(elements['progress-note'], studiedToday >= dailyTarget ? '今天的目标完成了' : '每天 100 个词，按自己的节奏复习');
  if (!list.length) {
    elements['word-card'].classList.add('empty');
    elements['empty-state'].hidden = false;
    setText(elements['empty-state'], words.length ? '没有找到匹配词条，试试其他筛选或搜索词。' : '词库正在载入，请稍候。');
    setText(elements['word-count'], '—');
    return;
  }
  elements['word-card'].classList.remove('empty');
  elements['empty-state'].hidden = true;
  currentIndex = ((currentIndex % list.length) + list.length) % list.length;
  const item = list[currentIndex];
  setText(elements['word-category'], sourcesOf(item).join(' · ') || item.exam);
  setText(elements['word-count'], String(currentIndex + 1).padStart(2,'0') + ' / ' + list.length);
  setText(elements.word, item.word);
  elements.pronunciation.replaceChildren(document.createTextNode(item.pronunciation || ''));
  if (item.pos) { const pos = document.createElement('span'); pos.textContent = item.pos; elements.pronunciation.append(' ', pos); }
  setText(elements.meaning, item.meaning || '此词条暂未提供释义。');
  setText(elements.example, item.example || '');
  elements.example.parentElement.hidden = !item.example;
}
function advance(countAsStudied) {
  const list = visibleWords(); if (!list.length) return;
  if (countAsStudied) { studiedToday += 1; localStorage.setItem('vocab-studied-today', String(studiedToday)); }
  currentIndex = (currentIndex + 1) % list.length; renderWords();
}
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  wordFilter = button.dataset.exam; currentIndex = 0;
  document.querySelector('.filter.active')?.classList.remove('active'); button.classList.add('active'); renderWords();
}));
elements.search.addEventListener('input', () => { currentIndex = 0; renderWords(); });
elements.skip.addEventListener('click', () => advance(false));
elements.know.addEventListener('click', () => {
  const item = visibleWords()[currentIndex];
  if (item) { mastered.add(item.word); localStorage.setItem('vocab-mastered', JSON.stringify([...mastered])); }
  advance(true);
});
elements.sound.addEventListener('click', () => {
  const item = visibleWords()[currentIndex]; if (!item || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(item.word); utterance.lang = 'en-US'; speechSynthesis.speak(utterance);
});
function setView(name) {
  document.querySelectorAll('.workspace').forEach(section => { section.hidden = section.id !== 'workspace-' + name; });
  document.querySelectorAll('.nav-button').forEach(button => { const active = button.dataset.view === name; button.classList.toggle('active', active); button.setAttribute('aria-current', active ? 'page' : 'false'); });
  if (name === 'speaking') renderSpeaking();
}
document.querySelectorAll('.nav-button').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelector('[data-open-speaking]').addEventListener('click', () => setView('speaking'));
document.addEventListener('keydown', event => {
  const vocab = byId('workspace-vocabulary'), tag = document.activeElement?.tagName;
  if (!vocab.hidden && event.code === 'Space' && !['INPUT','TEXTAREA','SELECT','BUTTON'].includes(tag)) { event.preventDefault(); advance(false); }
});

const questionKey='english-lab-questions',planKey='english-lab-plans',answerKey='english-lab-answers',phraseKey='english-lab-phrases',selectedKey='english-lab-selected-question';
let questions=readStore(questionKey,[]),plans=readStore(planKey,{}),answers=readStore(answerKey,[]),customPhrases=readStore(phraseKey,[]),selectedQuestionId=localStorage.getItem(selectedKey)||'';
const starterPhrases=[
 {category:'表达观点',phrase:'I’d say that…',note:'自然引出个人看法。'},
 {category:'补充理由',phrase:'Part of the reason is that…',note:'接着回答补充原因。'},
 {category:'强调重点',phrase:'What stands out to me is…',note:'描述最突出的特点或印象。'},
 {category:'举例说明',phrase:'A good example of that would be…',note:'把观点落到具体例子。'},
 {category:'个人经历',phrase:'I first got into it when…',note:'讲兴趣或习惯如何开始。'},
 {category:'表达变化',phrase:'Over time, I’ve come to…',note:'描述态度或习惯的变化。'},
 {category:'补充细节',phrase:'One small detail I remember is…',note:'补充生动、具体的细节。'},
 {category:'比较',phrase:'Compared with a few years ago,…',note:'引出过去与现在的差异。'},
 {category:'表达条件',phrase:'It depends a lot on…',note:'说明答案会随情况而变化。'},
 {category:'收束观点',phrase:'That’s probably why…',note:'总结前面的原因或经历。'}
];
function activeQuestion() { return questions.find(q => q.id === selectedQuestionId) || null; }
function updateSpeakingStats() {
  byId('question-total').textContent=questions.length;
  byId('answer-total').textContent=answers.length;
  byId('phrase-total').textContent=starterPhrases.length+customPhrases.length;
  byId('question-list-count').textContent=questions.length+' 条';
  byId('answer-list-count').textContent=answers.length+' 条';
}
function makeEmpty(text) { const p=document.createElement('p');p.className='empty-list';p.textContent=text;return p; }
function renderQuestions() {
  const list=byId('question-list');list.replaceChildren();
  if(!questions.length){list.append(makeEmpty('题库还没有题目。把确认过的真题、话题和来源录入这里，逐步建立自己的口语语料库。'));return;}
  questions.forEach(q=>{
    const row=document.createElement('article');row.className='question-row'+(q.id===selectedQuestionId?' selected':'');
    const info=document.createElement('div');info.className='question-info';
    const title=document.createElement('h4');title.textContent=q.prompt;
    const meta=document.createElement('p');meta.textContent=[q.part,q.topic,q.source].filter(Boolean).join(' · ');
    info.append(title,meta);
    const actions=document.createElement('div');actions.className='question-actions';
    const select=document.createElement('button');select.type='button';select.className='small-button'+(q.id===selectedQuestionId?' active':'');select.textContent=q.id===selectedQuestionId?'当前题目':'设为当前题目';select.dataset.selectQuestion=q.id;
    actions.append(select);row.append(info,actions);list.append(row);
  });
}
function updateSelectedPrompts() {
  const q=activeQuestion(),label=q?(q.part+(q.topic?' · '+q.topic:'')):'尚未选择题目';
  byId('planning-selected').textContent=q?'当前题目：'+label:'先从题库选择一道题，或使用下面的通用框架。';
  byId('planning-prompt').textContent=q?q.prompt:'尚未选择题目';
  byId('answer-prompt').textContent=q?(label+'：'+q.prompt):'先从真题收集里选择一道题。';
  document.querySelectorAll('.framework-card').forEach(card=>card.classList.toggle('current',!!q&&card.dataset.partGuide===q.part));
  const saved=plans[selectedQuestionId||'general']||'';
  if(document.activeElement!==byId('plan-notes'))byId('plan-notes').value=saved;
}
function renderPhrases() {
  const list=byId('phrase-list'),query=byId('phrase-search').value.trim().toLowerCase();list.replaceChildren();
  [...starterPhrases,...customPhrases].filter(p=>(p.phrase+' '+p.category+' '+p.note).toLowerCase().includes(query)).forEach(p=>{
    const card=document.createElement('article');card.className='phrase-card';
    const top=document.createElement('div');top.className='phrase-card-top';
    const category=document.createElement('span');category.textContent=p.category;top.append(category);
    if(p.custom){const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','删除自定义表达');remove.dataset.removePhrase=p.id;top.append(remove);}
    const phrase=document.createElement('blockquote');phrase.textContent=p.phrase;
    const note=document.createElement('p');note.textContent=p.note||'自定义表达';
    card.append(top,phrase,note);list.append(card);
  });
  if(!list.children.length)list.append(makeEmpty('没有找到匹配的表达。'));
}
function renderAnswers() {
  const list=byId('answer-list');list.replaceChildren();
  const relevant=answers.filter(a=>!selectedQuestionId||a.questionId===selectedQuestionId);
  relevant.forEach(a=>{
    const row=document.createElement('article');row.className='answer-row';
    const info=document.createElement('div');info.className='question-info';
    const title=document.createElement('h4');title.textContent=new Date(a.savedAt).toLocaleString()+(a.part?' · '+a.part:'');
    const prompt=document.createElement('p');prompt.textContent=a.prompt||'个人练习';
    const answer=document.createElement('blockquote');answer.textContent=a.text;
    info.append(title,prompt,answer);
    const load=document.createElement('button');load.type='button';load.className='small-button';load.textContent='载入编辑';load.dataset.loadAnswer=a.id;
    row.append(info,load);list.append(row);
  });
  if(!list.children.length)list.append(makeEmpty(selectedQuestionId?'这道题还没有保存过答案。':'选择一道题后，这里会显示对应的练习记录。'));
}
function renderSpeaking() { updateSpeakingStats();renderQuestions();updateSelectedPrompts();renderPhrases();renderAnswers(); }
byId('question-form').addEventListener('submit',event=>{
  event.preventDefault();const prompt=byId('question-prompt').value.trim();if(!prompt)return;
  const q={id:globalThis.crypto?.randomUUID?.()||String(Date.now()),part:byId('question-part').value,topic:byId('question-topic').value.trim(),prompt,source:byId('question-source').value.trim(),createdAt:new Date().toISOString()};
  questions.unshift(q);selectedQuestionId=q.id;localStorage.setItem(selectedKey,q.id);localStorage.setItem(questionKey,JSON.stringify(questions));event.target.reset();renderSpeaking();
});
byId('question-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-select-question]');if(!button)return;
  selectedQuestionId=button.dataset.selectQuestion;localStorage.setItem(selectedKey,selectedQuestionId);
  byId('answer-draft').value=answers.find(a=>a.questionId===selectedQuestionId)?.text||'';renderSpeaking();
});
byId('save-plan').addEventListener('click',()=>{
  plans[selectedQuestionId||'general']=byId('plan-notes').value.trim();localStorage.setItem(planKey,JSON.stringify(plans));byId('plan-status').textContent='已保存到当前浏览器';
});
byId('phrase-form').addEventListener('submit',event=>{
  event.preventDefault();const phrase=byId('phrase-text').value.trim();if(!phrase)return;
  customPhrases.unshift({id:globalThis.crypto?.randomUUID?.()||String(Date.now()),phrase,category:byId('phrase-category').value.trim()||'自定义',note:byId('phrase-note').value.trim(),custom:true});
  localStorage.setItem(phraseKey,JSON.stringify(customPhrases));event.target.reset();renderSpeaking();
});
byId('phrase-search').addEventListener('input',renderPhrases);
byId('phrase-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-remove-phrase]');if(!button)return;
  customPhrases=customPhrases.filter(p=>p.id!==button.dataset.removePhrase);localStorage.setItem(phraseKey,JSON.stringify(customPhrases));renderSpeaking();
});
byId('save-answer').addEventListener('click',()=>{
  const text=byId('answer-draft').value.trim();if(!text){byId('answer-draft').focus();return;}
  const q=activeQuestion();answers.unshift({id:globalThis.crypto?.randomUUID?.()||String(Date.now()),questionId:q?.id||'',prompt:q?.prompt||'',part:q?.part||'',text,savedAt:new Date().toISOString()});
  localStorage.setItem(answerKey,JSON.stringify(answers));renderSpeaking();
});
byId('answer-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-load-answer]');if(!button)return;
  const answer=answers.find(a=>a.id===button.dataset.loadAnswer);if(answer)byId('answer-draft').value=answer.text;
});
document.querySelectorAll('[data-speaking-tab]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.module-tab').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  document.querySelectorAll('.speaking-panel').forEach(panel=>{panel.hidden=panel.dataset.speakingPanel!==button.dataset.speakingTab;});
}));
Promise.all([
  fetch('./vocabulary.json?v=20261029-5').then(response=>{if(!response.ok)throw new Error('词库读取失败');return response.json();}),
  fetch('./word-atlas.json?v=20261029-1').then(response=>{if(!response.ok)throw new Error('IELTS 词库读取失败');return response.json();})
]).then(([base,atlas])=>{
  words=mergeWordLists(base,normalizeWordAtlas(atlas));
  const available=new Set(words.map(item=>item.word.toLowerCase()));mastered=new Set([...mastered].filter(word=>available.has(String(word).toLowerCase())));
  renderWords();renderSpeaking();
}).catch(()=>{
  elements['word-card'].classList.add('empty');elements['empty-state'].hidden=false;setText(elements['empty-state'],'词库暂时无法载入，请刷新页面后重试。');
});
setView('vocabulary');
