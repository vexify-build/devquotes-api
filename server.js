const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const QUOTES = [
  { id: 1,  text: "Debugging is twice as hard as writing the code in the first place.", author: "Brian Kernighan", tags: ["debugging", "code-quality"] },
  { id: 2,  text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", tags: ["readability", "best-practices"] },
  { id: 3,  text: "First, solve the problem. Then, write the code.", author: "John Johnson", tags: ["problem-solving", "planning"] },
  { id: 4,  text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House", tags: ["readability", "clean-code"] },
  { id: 5,  text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", tags: ["simplicity", "performance"] },
  { id: 6,  text: "The best error message is the one that never shows up.", author: "Thomas Fuchs", tags: ["ux", "error-handling"] },
  { id: 7,  text: "Make it work, make it right, make it fast.", author: "Kent Beck", tags: ["development", "performance"] },
  { id: 8,  text: "Deleted code is debugged code.", author: "Jeff Sickel", tags: ["debugging", "refactoring"] },
  { id: 9,  text: "Programming isn't about what you know; it's about what you can figure out.", author: "Chris Pine", tags: ["learning", "problem-solving"] },
  { id: 10, text: "The most important property of a program is whether it accomplishes the intention of its user.", author: "C.A.R. Hoare", tags: ["design", "usability"] },
  { id: 11, text: "Weeks of coding can save you hours of planning.", author: "Anonymous", tags: ["planning", "workflow"] },
  { id: 12, text: "It's not a bug — it's an undocumented feature.", author: "Anonymous", tags: ["humor", "debugging"] },
  { id: 13, text: "The best code is no code at all.", author: "Jeff Atwood", tags: ["simplicity", "best-practices"] },
  { id: 14, text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", tags: ["action", "pragmatism"] },
  { id: 15, text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry", tags: ["design", "simplicity"] },
  { id: 16, text: "Debugging is like being the detective in a crime movie where you are also the murderer.", author: "Filipe Fortes", tags: ["debugging", "humor"] },
  { id: 17, text: "Walking on water and developing software from a specification are easy if both are frozen.", author: "Edward V. Berard", tags: ["planning", "agile"] },
  { id: 18, text: "A language that doesn't affect the way you think about programming is not worth knowing.", author: "Alan Perlis", tags: ["languages", "thinking"] },
  { id: 19, text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie", tags: ["learning", "practice"] },
  { id: 20, text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: "Dan Salomon", tags: ["humor", "debugging"] },
  { id: 21, text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates", tags: ["productivity", "metrics"] },
  { id: 22, text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch", tags: ["design", "ux"] },
  { id: 23, text: "Java is to JavaScript what car is to carpet.", author: "Chris Heilmann", tags: ["humor", "languages"] },
  { id: 24, text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke", tags: ["technology", "philosophy"] },
  { id: 25, text: "Always code as if the person who ends up maintaining your code will be a violent psychopath who knows where you live.", author: "John Woods", tags: ["best-practices", "maintainability"] },
];

const startTime = Date.now();

function json(data, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data, null, 2),
  };
}

function html(content, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: content,
  };
}

function send(res, response) {
  res.writeHead(response.status, response.headers);
  res.end(response.body);
}

function getRandomQuote(authorFilter) {
  let pool = QUOTES;
  if (authorFilter) {
    const q = authorFilter.toLowerCase();
    pool = QUOTES.filter(x => x.author.toLowerCase().includes(q));
    if (!pool.length) pool = QUOTES;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

const HTML_HOME = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevQuotes API 🌐</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0d1117; color: #e6edf3; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 16px; padding: 40px; max-width: 640px; width: 100%; }
  h1 { font-size: 1.5rem; margin-bottom: 24px; color: #58a6ff; }
  .quote { font-size: 1.2rem; line-height: 1.7; margin-bottom: 16px; font-style: italic; }
  .author { color: #7d8590; font-size: 0.9rem; }
  .endpoints { margin-top: 32px; }
  .endpoints h2 { font-size: 1rem; margin-bottom: 12px; color: #bc8cff; }
  .endpoint { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
  .endpoint span { color: #3fb950; }
  .refresh { margin-top: 24px; }
  .refresh a { color: #58a6ff; text-decoration: none; font-size: 0.9rem; }
  .refresh a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="card">
  <h1>🌐 DevQuotes API</h1>
  <div id="quote-area">
    <p class="quote">Loading...</p>
    <p class="author">— </p>
  </div>
  <div class="endpoints">
    <h2>API Endpoints</h2>
    <div class="endpoint"><span>GET</span>  /quote          → Random quote</div>
    <div class="endpoint"><span>GET</span>  /quote?author=X → Filter by author</div>
    <div class="endpoint"><span>GET</span>  /all            → All quotes</div>
    <div class="endpoint"><span>GET</span>  /stats          → Stats</div>
    <div class="endpoint"><span>GET</span>  /health         → Health check</div>
  </div>
  <div class="refresh"><a href="/">🔄 New random quote</a></div>
</div>
<script>
  fetch('/quote').then(r => r.json()).then(q => {
    document.getElementById('quote-area').innerHTML =
      '<p class="quote">"' + q.text + '"</p><p class="author">— ' + q.author + ' [' + q.tags.join(', ') + ']</p>';
  });
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const authorFilter = parsed.query.author;

  if (pathname === '/' || pathname === '/index.html') {
    const quote = getRandomQuote(authorFilter);
    // For the HTML home, embed the random quote
    const homeHtml = HTML_HOME;
    send(res, html(homeHtml));
  } else if (pathname === '/quote') {
    send(res, json(getRandomQuote(authorFilter)));
  } else if (pathname === '/all') {
    send(res, json(QUOTES));
  } else if (pathname === '/stats') {
    const authors = new Set(QUOTES.map(q => q.author));
    send(res, json({ total: QUOTES.length, authors: authors.size, uptime_seconds: Math.floor((Date.now() - startTime) / 1000) }));
  } else if (pathname === '/health') {
    send(res, json({
      status: 'ok',
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    }));
  } else {
    send(res, json({ error: 'Not found' }, 404));
  }
});

server.listen(PORT, () => {
  console.log(`🌐 DevQuotes API running at http://localhost:${PORT}`);
  console.log(`   GET /quote  — random developer quote`);
  console.log(`   GET /all    — all ${QUOTES.length} quotes`);
  console.log(`   GET /stats  — stats`);
  console.log(`   GET /health — health check`);
});
