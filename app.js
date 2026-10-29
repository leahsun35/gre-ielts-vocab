const elements = Object.fromEntries(['word-card','word-category','word-count','word','pronunciation','meaning','example','empty-state','progress-label','progress-fill','progress-note','mastered-total','search','sound','skip','know'].map(id => [id, document.getElementById(id)]));
const dailyTarget = 100;
let words = [];
let exam = 'all';
let currentIndex = 0;
let studiedToday = Number(localStorage.getItem('vocab-studied-today') || 0);
let mastered = new Set(JSON.parse(localStorage.getItem('vocab-mastered') || '[]'));
const today = new Date().toLocaleDateString('en-CA');
if (localStorage.getItem('vocab-studied-date') !== today) {
  studiedToday = 0;
  localStorage.setItem('vocab-studied-date', today);
  localStorage.setItem('vocab-studied-today', '0');
}

function sourcesOf(item) { return item.sources || (item.source ? [item.source] : []); }
function visibleWords() {
  const query = elements.search.value.trim().toLowerCase();
  return words.filter(item => {
    const inSet = exam === 'all' || item.exam === exam || sourcesOf(item).includes(exam);
    return inSet && (!query || `${item.word} ${item.meaning} ${item.example} ${sourcesOf(item).join(' ')}`.toLowerCase().includes(query));
  });
}
function render() {
  const list = visibleWords();
  elements['mastered-total'].textContent = `已掌握 ${mastered.size} 个词`;
  elements['progress-label'].textContent = `${Math.min(studiedToday, dailyTarget)} / ${dailyTarget}`;
  elements['progress-fill'].style.width = `${Math.min(studiedToday / dailyTarget, 1) * 100}%`;
  elements['progress-note'].textContent = studiedToday >= dailyTarget ? '今天的目标完成了，做得很好！' : '开始今天的第一张卡片吧';
  if (!list.length) {
    elements['word-card'].classList.add('empty');
    elements['empty-state'].hidden = false;
    elements['word-count'].textContent = '—';
    return;
  }
  elements['word-card'].classList.remove('empty');
  elements['empty-state'].hidden = true;
  currentIndex = ((currentIndex % list.length) + list.length) % list.length;
  const item = list[currentIndex];
  elements['word-category'].textContent = sourcesOf(item).join(' · ') || item.exam;
  elements['word-count'].textContent = `${String(currentIndex + 1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;
  elements.word.textContent = item.word;
  elements.pronunciation.innerHTML = `${item.pronunciation || ''} <span>${item.pos || ''}</span>`;
  elements.meaning.textContent = item.meaning || '此词表仅提供词目和词性，释义待补充。';
  elements.example.textContent = item.example || '';
  elements.example.parentElement.hidden = !item.example;
}
function advance(countAsStudied) {
  const list = visibleWords();
  if (!list.length) return;
  if (countAsStudied) {
    studiedToday += 1;
    localStorage.setItem('vocab-studied-today', String(studiedToday));
  }
  currentIndex = (currentIndex + 1) % list.length;
  render();
}
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  exam = button.dataset.exam;
  currentIndex = 0;
  document.querySelector('.filter.active').classList.remove('active');
  button.classList.add('active');
  render();
}));
elements.search.addEventListener('input', () => { currentIndex = 0; render(); });
elements.skip.addEventListener('click', () => advance(false));
elements.know.addEventListener('click', () => {
  const item = visibleWords()[currentIndex];
  if (item) {
    mastered.add(item.word);
    localStorage.setItem('vocab-mastered', JSON.stringify([...mastered]));
  }
  advance(true);
});
elements.sound.addEventListener('click', () => {
  const item = visibleWords()[currentIndex];
  if (!item || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.word);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
});
document.addEventListener('keydown', event => {
  if (event.code === 'Space' && document.activeElement !== elements.search) {
    event.preventDefault();
    advance(false);
  }
});
fetch('./vocabulary.json?v=20261029-2').then(response => {
  if (!response.ok) throw new Error('词库读取失败');
  return response.json();
}).then(data => { words = data; render(); }).catch(() => {
  elements['word-card'].classList.add('empty');
  elements['empty-state'].hidden = false;
  elements['empty-state'].textContent = '暂时无法读取词库，请通过网页地址打开此页面。';
});