// app.js
// 英皇娱乐 · 432.COM 核心业务逻辑
// 请确保 index.html 中已引入 Supabase 客户端库

// ============== 全局变量 ==============
const VIP_NAMES = {
  0: 'VIP0', 1: 'VIP1', 2: 'VIP2', 3: 'VIP3', 4: 'VIP4',
  5: '荣耀VIP5', 6: '伯爵VIP6', 7: '至尊VIP7', 8: '黑金VIP8',
  9: 'SVIP9', 10: '神豪SVIP10'
};
const VIP_THRESHOLDS = [0, 200, 600, 1400, 3000, 6200, 12600, 25400, 50000, 100000, 200000];
let currentUser = null;
let isLoggedIn = false;
let SUPABASE;

// ============== 初始化入口 ==============
function initApp(supabase) {
  SUPABASE = supabase;
  window.SUPABASE = SUPABASE;

  startCamera();
  initNav();
  syncUI();
  renderHome();
  updateMarquee();
  setInterval(updateMarquee, 12000);
  switchRoute();
  setInterval(() => {
    document.getElementById('routeDelay').textContent = (Math.floor(Math.random() * 22) + 6) + 'ms';
  }, 5000);
  // 公告弹窗
  setTimeout(() => {
    const announce = localStorage.getItem('announce');
    if (announce) {
      const d = document.createElement('div');
      d.className = 'announce-modal';
      d.innerHTML = `<div class="announce-box"><h3>公告</h3><p>${announce}</p><button class="btn-block" onclick="this.closest('.announce-modal').remove()">知道了</button></div>`;
      document.body.appendChild(d);
    }
  }, 600);
}

// ============== UI 辅助函数 ==============
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function syncUI() {
  if (currentUser) {
    document.getElementById('displayNickname').textContent = currentUser.nickname;
    document.getElementById('displayBalance').textContent = (currentUser.balance || 0).toFixed(2);
    const v = Math.min(currentUser.vip || 0, 10);
    document.getElementById('displayVip').textContent = VIP_NAMES[v];
    const colors = ['#888','#cd7f32','#c0c0c0','#ffd700','linear-gradient(135deg,#ffd700,#ff8c00)','linear-gradient(135deg,#ff4500,#ff00ff)','linear-gradient(135deg,#8b00ff,#ff69b4)','linear-gradient(135deg,#000,#fff)','linear-gradient(135deg,#ffd700,#ff69b4)','linear-gradient(135deg,#ff0000,#ffd700)','linear-gradient(135deg,#000,#ffd700)'];
    document.getElementById('displayVip').style.background = colors[v];
    document.getElementById('avatarFrame').className = 'avatar-frame f' + v;
  } else {
    document.getElementById('displayNickname').textContent = '游客';
    document.getElementById('displayBalance').textContent = '0.00';
    document.getElementById('displayVip').textContent = '游客';
    document.getElementById('displayVip').style.background = '#888';
    document.getElementById('avatarFrame').className = 'avatar-frame f0';
  }
}

function isGuest() { return !currentUser; }
function requireLogin() { if (isGuest()) { showToast('请先登录'); openRegister(); return false; } return true; }

function zoomImg(src) {
  document.getElementById('imgZoomImg').src = src;
  document.getElementById('imgZoom').classList.add('show');
}

// ============== 页面切换 ==============
function switchPage(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const m = { home: 0, activity: 1, earn: 2, stage: 3, night: 4, room: 5, deposit: 6, profile: 7 };
  if (m[p] !== undefined) document.querySelectorAll('.nav-item')[m[p]].classList.add('active');
  if (p === 'home') renderHome();
  if (p === 'activity') renderActivity();
  if (p === 'earn') renderEarn();
  if (p === 'stage') renderStage();
  if (p === 'night') renderNight();
  if (p === 'room') renderRoom();
  if (p === 'profile') renderProfile();
}

function initNav() {
  document.getElementById('bottomNav').innerHTML = `
    <div class="nav-item active" data-page="home"><span class="nav-icon">🏠</span>首页</div>
    <div class="nav-item" data-page="activity"><span class="nav-icon">🎁</span>优惠</div>
    <div class="nav-item" data-page="earn"><span class="nav-icon">💼</span>赚钱</div>
    <div class="nav-item" data-page="stage"><span class="nav-icon">🎪</span>大舞台</div>
    <div class="nav-item" data-page="night"><span class="nav-icon">🌃</span>夜市</div>
    <div class="nav-item" data-page="room"><span class="nav-icon">💬</span>聊天室</div>
    <div class="nav-item" data-page="deposit"><span class="nav-icon">📥</span>存款</div>
    <div class="nav-item" data-page="profile"><span class="nav-icon">👤</span>我的</div>`;
  document.getElementById('bottomNav').addEventListener('click', function (e) {
    const nav = e.target.closest('.nav-item');
    if (!nav) return;
    const p = nav.dataset.page;
    if (p === 'deposit') { if (!requireLogin()) return; openDeposit(); }
    else switchPage(p);
    if (p === 'profile') {
      window._ac = (window._ac || 0) + 1;
      if (window._ac >= 5) { document.getElementById('pwdDialog').style.display = 'block'; window._ac = 0; }
    }
  });
}

function updateMarquee() {
  let h = '';
  for (let i = 0; i < 10; i++) h += '🎉' + ['张*明', '李*芳'][i % 2] + '赢得¥' + Math.floor(Math.random() * 50000) + '  ';
  document.getElementById('marqueeText').textContent = h;
}

function switchRoute() {
  S.routeIndex = (S.routeIndex || 0) + 1 % 3;
  const r = ['PG专线', 'JDB专线', 'CQ9备用'];
  document.getElementById('routeText').textContent = '线路0' + (S.routeIndex + 1) + '·' + r[S.routeIndex];
  document.getElementById('routeDelay').textContent = (Math.floor(Math.random() * 25) + 5) + 'ms';
}

// ============== 用户注册/登录 ==============
async function doRegister() {
  const ph = document.getElementById('regPhone').value.trim();
  const nn = document.getElementById('regNickname').value.trim();
  const pw = document.getElementById('regPassword').value.trim();
  if (!ph || !nn || !pw) return showToast('请填写完整');
  if (!/^1\d{10}$/.test(ph)) return showToast('手机号格式错误');
  const userId = 'JK' + Math.random().toString(36).substr(2, 6).toUpperCase();
  const { data, error } = await SUPABASE
    .from('users')
    .insert([{ user_id: userId, nickname: nn, password: pw, phone: ph, balance: 0, vip: 0, total_bet: 0 }])
    .select();
  if (error) return showToast('注册失败: ' + error.message);
  currentUser = data[0]; isLoggedIn = true;
  syncUI(); closeModal('registerModal'); switchPage('home');
  showToast('注册成功！' + nn);
}

async function doSwitchUser() {
  const uid = document.getElementById('switchUserSelect').value;
  const pw = document.getElementById('switchPassword').value.trim();
  const { data, error } = await SUPABASE.from('users').select('*').eq('user_id', uid);
  if (error || !data.length) return showToast('用户不存在');
  const u = data[0];
  if (u.password !== pw) return showToast('密码错误');
  currentUser = u; isLoggedIn = true;
  syncUI(); closeModal('registerModal'); switchPage('home');
  showToast('已切换至 ' + u.nickname);
}

function openRegister() {
  let html = '<div class="modal-header"><h4>注册/登录</h4><button class="modal-close" onclick="closeModal(\'registerModal\')">✕</button></div>';
  html += '<input class="input" id="regPhone" placeholder="手机号"><input class="input" id="regNickname" placeholder="昵称"><input class="input" id="regPassword" type="password" placeholder="密码">';
  html += '<button class="btn-block" onclick="doRegister()">注册</button><hr>';
  html += '<select class="input" id="switchUserSelect"></select><input class="input" id="switchPassword" type="password" placeholder="密码"><button class="btn-block" onclick="doSwitchUser()">切换</button>';
  document.getElementById('registerModalContent').innerHTML = html;
  document.getElementById('registerModal').classList.add('show');
  // 异步加载用户列表
  SUPABASE.from('users').select('user_id,nickname').then(({ data }) => {
    if (data) {
      document.getElementById('switchUserSelect').innerHTML = data.map(u => `<option value="${u.user_id}">${u.nickname}</option>`).join('');
    }
  });
}

// ============== 首页 ==============
function renderHome() {
  document.getElementById('page-home').innerHTML = `
    <div class="hero" onclick="${isGuest() ? 'openRegister()' : "openGame('dice')"}"><div style="font-size:36px;">🎲</div><h2>英皇娱乐·432.COM</h2><p>新人首存送8.8元</p><div class="cta">🔥 进入游戏大厅</div></div>
    <div class="game-grid">
      <div class="game-card" onclick="${isGuest() ? 'openRegister()' : "openGame('dice')"}"><div class="game-img">🎲</div><div class="game-name">摇骰子</div></div>
      <div class="game-card" onclick="${isGuest() ? 'openRegister()' : "openGame('slot')"}"><div class="game-img" style="background:linear-gradient(135deg,#101a2a,#182a3d)"><span class="hot">HOT</span>🎰</div><div class="game-name">老虎机</div></div>
      <div class="game-card" onclick="${isGuest() ? 'openRegister()' : "openGame('poker')"}"><div class="game-img" style="background:linear-gradient(135deg,#2a102a,#3d183d)">🃏</div><div class="game-name">扑克比点</div></div>
      <div class="game-card" onclick="${isGuest() ? 'openRegister()' : "openGame('fish')"}"><div class="game-img" style="background:linear-gradient(135deg,#2a2a10,#3d3d18)">🐟</div><div class="game-name">财神捕鱼</div></div>
      <div class="game-card" onclick="${isGuest() ? 'openRegister()' : "openGame('wheel')"}"><div class="game-img" style="background:linear-gradient(135deg,#101a2a,#182a3d)">🎡</div><div class="game-name">大转盘</div></div>
      <div class="game-card" onclick="${isGuest() ? 'openRegister()' : "openGame('live')"}"><div class="game-img" style="background:linear-gradient(135deg,#102a2a,#183d3d)">🎥</div><div class="game-name">真人视讯</div></div>
    </div>
    <div style="padding:6px 10px;color:#ffd700;font-weight:bold;">🎁 优惠</div>
    <div class="act-card" onclick="claimActivity('newbie')"><span class="act-badge">🔥</span><b>新人首存</b></div>
    <div class="act-card" onclick="openLottery()"><span class="act-badge">🎪</span><b>免费抽奖</b></div>`;
}

function renderActivity() {
  document.getElementById('page-activity').innerHTML = `
    <div style="padding:6px 10px;color:#ffd700;font-weight:bold;">优惠活动</div>
    <div class="act-card" onclick="claimActivity('newbie')"><b>新人首存</b></div>
    <div class="act-card" onclick="openLottery()"><b>免费大转盘</b></div>
    <div class="act-card" onclick="grabRedPacket()"><b>红包雨</b></div>`;
}

function renderEarn() {
  if (isGuest()) return;
  document.getElementById('page-earn').innerHTML = `
    <div style="padding:6px 10px;color:#ffd700;font-weight:bold;">赚钱任务</div>
    <div class="act-card" onclick="doSignIn()"><b>📅 每日签到 +3元</b></div>
    <div class="act-card" onclick="showToast('已复制邀请链接')"><b>👥 邀请好友 +15元</b></div>`;
}

async function doSignIn() {
  if (!requireLogin()) return;
  const today = new Date().toDateString();
  const key = today + '_signin';
  // 使用本地记录简单判断
  if (localStorage.getItem(key)) return showToast('已签到');
  localStorage.setItem(key, '1');
  currentUser.balance += 3;
  await SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
  syncUI();
  showToast('签到+3元');
}

async function claimActivity(type) {
  if (!requireLogin()) return;
  if (type === 'newbie') {
    const key = 'newbie_' + currentUser.user_id;
    if (localStorage.getItem(key)) return showToast('已领取');
    localStorage.setItem(key, '1');
    currentUser.balance += 8.8;
    await SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
    syncUI();
    showToast('获得8.8元');
  }
}

function grabRedPacket() {
  const h = new Date().getHours();
  if ([15,20,22].includes(h)) {
    const today = new Date().toDateString();
    const key = today + '_redpacket';
    if (localStorage.getItem(key)) return showToast('已抢过');
    localStorage.setItem(key, '1');
    const amt = Math.floor(Math.random() * 12) + 3;
    currentUser.balance += amt;
    SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
    syncUI();
    showToast('抢到¥' + amt);
  } else showToast('红包雨在15/20/22点');
}

function openLottery() {
  if (!requireLogin()) return;
  const today = new Date().toDateString();
  if (localStorage.getItem(today + '_lotto')) return showToast('今天已抽');
  localStorage.setItem(today + '_lotto', '1');
  const reward = Math.floor(Math.random() * 15) + 5;
  currentUser.balance += reward;
  SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
  syncUI();
  showToast('抽中 ¥' + reward);
}

// ============== 大舞台 ==============
async function renderStage() {
  const { data: posts, error } = await SUPABASE.from('stage_posts').select('*').order('created_at', { ascending: false }).limit(30);
  if (error) return;
  let html = '<div style="padding:6px 10px;color:#ffd700;font-weight:bold;">🎪 大舞台</div>';
  html += '<textarea id="stageText" class="input" placeholder="分享动态..."></textarea>';
  html += '<input type="file" accept="image/*" id="stageImg" style="display:none" onchange="uploadStageImg(this)">';
  html += '<button class="btn-sm" onclick="document.getElementById(\'stageImg\').click()">📷</button> ';
  html += '<button class="btn-sm" onclick="postStage()">发布</button>';
  posts.forEach(p => {
    const isOwner = currentUser && currentUser.user_id === p.user_id;
    const comments = p.comments || [];
    html += `<div class="stage-post"><b>${p.nickname}</b>${isOwner ? `<span onclick="deletePost('${p.post_id}')" style="color:#c92a2a;"> 删除</span>` : ''}<p>${p.content}</p>${p.image ? `<img src="${p.image}" onclick="zoomImg('${p.image}')">` : ''}<div style="display:flex;gap:8px;"><span onclick="tipPost('${p.post_id}')" style="color:#f0b830;">💰打赏</span><span onclick="commentPost('${p.post_id}')" style="color:#60a5fa;">💬评论(${comments.length})</span></div>${comments.map(c => `<div class="comment-item">${c.nickname}: ${c.text}</div>`).join('')}</div>`;
  });
  document.getElementById('page-stage').innerHTML = html;
}

function uploadStageImg(input) {
  if (input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => window._stageImg = e.target.result;
    reader.readAsDataURL(input.files[0]);
  }
}

async function postStage() {
  if (!requireLogin()) return;
  const txt = document.getElementById('stageText').value.trim();
  if (!txt && !window._stageImg) return showToast('内容不能为空');
  const { error } = await SUPABASE.from('stage_posts').insert([{
    post_id: 'sp_' + Date.now(),
    user_id: currentUser.user_id,
    nickname: currentUser.nickname,
    content: txt,
    image: window._stageImg || '',
    comments: [],
    tips: []
  }]);
  if (!error) {
    window._stageImg = null;
    renderStage();
    showToast('发布成功');
  }
}

async function deletePost(postId) {
  await SUPABASE.from('stage_posts').delete().eq('post_id', postId);
  renderStage();
}

async function tipPost(postId) {
  if (!currentUser) return showToast('请登录');
  const amt = parseFloat(prompt('打赏金额:'));
  if (!amt || amt <= 0 || currentUser.balance < amt) return showToast('余额不足');
  currentUser.balance -= amt;
  await SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
  const { data: posts } = await SUPABASE.from('stage_posts').select('user_id,tips').eq('post_id', postId);
  if (posts.length > 0) {
    const tips = posts[0].tips || [];
    tips.push({ nickname: currentUser.nickname, amount: amt });
    await SUPABASE.from('stage_posts').update({ tips }).eq('post_id', postId);
    const { data: author } = await SUPABASE.from('users').select('balance').eq('user_id', posts[0].user_id);
    if (author.length > 0) {
      const newBal = (author[0].balance || 0) + amt;
      await SUPABASE.from('users').update({ balance: newBal }).eq('user_id', posts[0].user_id);
    }
  }
  syncUI();
  renderStage();
  showToast('打赏¥' + amt);
}

async function commentPost(postId) {
  if (!currentUser) return showToast('请登录');
  const txt = prompt('输入评论:');
  if (!txt) return;
  const { data: posts } = await SUPABASE.from('stage_posts').select('comments').eq('post_id', postId);
  if (posts.length > 0) {
    const comments = posts[0].comments || [];
    comments.push({ nickname: currentUser.nickname, text: txt });
    await SUPABASE.from('stage_posts').update({ comments }).eq('post_id', postId);
  }
  renderStage();
}

// ============== 聊天室 ==============
let currentRoom = 'main';
async function renderRoom() {
  const { data: messages, error } = await SUPABASE.from('chat_messages').select('*').eq('room_id', currentRoom).order('created_at', { ascending: false }).limit(50);
  if (error) return;
  const vipColors = ['#888','#cd7f32','#c0c0c0','#ffd700','#ff8c00','#ff00ff','#ff69b4','#fff','#ffd700','#ff0000','#000'];
  let html = `<div style="padding:6px 10px;color:#ffd700;font-weight:bold;">💬 聊天室</div>`;
  html += `<select class="input" onchange="switchRoom(this.value)"><option value="main">主聊天室</option></select>`;
  html += '<div class="chat-box" id="roomBox">';
  messages.reverse().forEach(m => {
    if (m.type === 'redpacket') {
      html += `<div class="room-msg"><b>${m.nickname}</b> 发了一个红包 <span class="red-packet" onclick="claimRedPacket('${m.redpacket_id}')">🧧¥${m.redpacket_amount}</span></div>`;
    } else {
      html += `<div class="room-msg"><b>${m.nickname}</b> <span class="vip-tag" style="background:${vipColors[Math.min(m.vip,10)]}">VIP${m.vip}</span>: ${m.text||''}${m.image?`<img src="${m.image}" onclick="zoomImg('${m.image}')">`:''}</div>`;
    }
  });
  html += '</div><input class="input" id="roomInput" placeholder="消息..."><input type="file" accept="image/*" id="roomImg" style="display:none" onchange="sendRoomImage(this)">';
  html += '<button class="btn-sm" onclick="document.getElementById(\'roomImg\').click()">📷</button> <button class="btn-sm" onclick="sendRoomMsg()">发送</button> <button class="btn-sm" style="background:#c92a2a;color:#fff;" onclick="sendRedPacket()">🧧发红包</button>';
  document.getElementById('page-room').innerHTML = html;
}

function switchRoom(id) { currentRoom = id; renderRoom(); }
async function sendRoomMsg() {
  if (!requireLogin()) return;
  const txt = document.getElementById('roomInput').value.trim();
  if (!txt) return;
  await SUPABASE.from('chat_messages').insert([{ room_id: currentRoom, user_id: currentUser.user_id, nickname: currentUser.nickname, vip: currentUser.vip, text: txt }]);
  renderRoom();
}
async function sendRoomImage(input) {
  if (!requireLogin() || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    await SUPABASE.from('chat_messages').insert([{ room_id: currentRoom, user_id: currentUser.user_id, nickname: currentUser.nickname, vip: currentUser.vip, image: e.target.result }]);
    renderRoom();
  };
  reader.readAsDataURL(input.files[0]);
}
async function sendRedPacket() {
  if (!requireLogin()) return;
  const amt = parseFloat(prompt('红包金额'));
  if (!amt || amt <= 0 || currentUser.balance < amt) return showToast('余额不足');
  currentUser.balance -= amt;
  await SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
  const packetId = 'rp_' + Date.now();
  await SUPABASE.from('chat_messages').insert([{ room_id: currentRoom, nickname: currentUser.nickname, vip: currentUser.vip, type: 'redpacket', redpacket_id: packetId, redpacket_amount: amt }]);
  await SUPABASE.from('red_packets').insert([{ packet_id: packetId, room_id: currentRoom, sender_id: currentUser.user_id, sender_name: currentUser.nickname, total_amount: amt, remaining_amount: amt, claimed_by: [] }]);
  syncUI();
  renderRoom();
}
async function claimRedPacket(packetId) {
  if (!requireLogin()) return;
  const { data: packets } = await SUPABASE.from('red_packets').select('*').eq('packet_id', packetId);
  if (!packets.length) return;
  const pkt = packets[0];
  if (pkt.claimed_by.includes(currentUser.user_id)) return showToast('已抢过');
  const got = Math.min(Math.floor(Math.random() * pkt.remaining_amount * 0.6) + 1, pkt.remaining_amount);
  pkt.remaining_amount -= got;
  pkt.claimed_by.push(currentUser.user_id);
  await SUPABASE.from('red_packets').update({ remaining_amount: pkt.remaining_amount, claimed_by: pkt.claimed_by }).eq('packet_id', packetId);
  currentUser.balance += got;
  await SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.userId);
  syncUI();
  renderRoom();
  showToast('抢到¥' + got);
}

// ============== 游戏 ==============
function openGame(type) {
  if (!requireLogin()) return;
  const c = document.getElementById('gameModalContent');
  if (type === 'dice') {
    c.innerHTML = `<div class="modal-header"><h4>🎲 摇骰子</h4><button class="modal-close" onclick="closeModal('gameModal')">✕</button></div><div class="dice-cube" id="diceCube"><div class="dice-face">⚀</div><div class="dice-face">⚁</div><div class="dice-face">⚂</div><div class="dice-face">⚃</div><div class="dice-face">⚄</div><div class="dice-face">⚅</div></div><p id="diceRes">下注</p><button class="btn-block" onclick="playDice(10)">¥10</button><button class="btn-block" onclick="playDice(50)">¥50</button><input class="input" id="diceCustom" type="number" placeholder="自定义金额"><button class="btn-block" onclick="playDice(parseFloat(document.getElementById('diceCustom').value)||0)">自定义</button>`;
    document.getElementById('gameModal').classList.add('show');
  }
  // 其他游戏类似...
}

async function playDice(bet) {
  if (bet <= 0 || currentUser.balance < bet) return showToast('余额不足');
  currentUser.balance -= bet;
  currentUser.total_bet = (currentUser.total_bet || 0) + bet;
  document.getElementById('diceCube').classList.add('rolling');
  setTimeout(async () => {
    document.getElementById('diceCube').classList.remove('rolling');
    const p = Math.floor(Math.random() * 6) + 1;
    const a = Math.floor(Math.random() * 6) + 1;
    document.getElementById('diceRes').textContent = `你:${p} AI:${a}`;
    if (p > a) {
      const win = bet * 2;
      currentUser.balance += win;
      document.getElementById('diceRes').textContent += ' 赢¥' + win;
    } else if (p === a) {
      currentUser.balance += bet;
      document.getElementById('diceRes').textContent += ' 平';
    }
    updateVip();
    await SUPABASE.from('users').update({ balance: currentUser.balance, total_bet: currentUser.total_bet, vip: currentUser.vip }).eq('user_id', currentUser.user_id);
    syncUI();
  }, 700);
}

function updateVip() {
  let old = currentUser.vip || 0;
  for (let i = VIP_THRESHOLDS.length - 1; i >= 0; i--) {
    if ((currentUser.total_bet || 0) >= VIP_THRESHOLDS[i]) {
      currentUser.vip = i; break;
    }
  }
  if (currentUser.vip > old) showToast('🎉 晋升 ' + VIP_NAMES[currentUser.vip]);
}

// ============== 支付 ==============
function openDeposit() {
  if (!requireLogin()) return;
  const qr = localStorage.getItem('admin_qr_wechat') || '';
  document.getElementById('payModalContent').innerHTML = `
    <div class="modal-header"><h4>📥 存款</h4><button class="modal-close" onclick="closeModal('payModal')">✕</button></div>
    <img src="${qr}" class="qr-img" id="payQr">
    <input class="input" id="depAmt" type="number" min="50" value="50" placeholder="最低50元">
    <input class="input" id="depPhone" placeholder="确认手机号">
    <button class="btn-block" onclick="submitDeposit()">我已支付</button>
    <hr><p style="font-size:10px;">管理员上传收款码</p>
    <input type="file" accept="image/*" id="qrUpload" onchange="uploadAdminQr(this)"><span id="qrStatus"></span>`;
  document.getElementById('payModal').classList.add('show');
}

function uploadAdminQr(input) {
  if (input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => { localStorage.setItem('admin_qr_wechat', e.target.result); document.getElementById('qrStatus').textContent = '✅'; };
    reader.readAsDataURL(input.files[0]);
  }
}

async function submitDeposit() {
  const amt = parseFloat(document.getElementById('depAmt').value);
  const phone = document.getElementById('depPhone').value.trim();
  if (amt < 50) return showToast('最低50元');
  if (phone !== currentUser.phone) return showToast('手机号不匹配');
  await SUPABASE.from('recharges').insert([{ recharge_id: 'R' + Date.now(), user_id: currentUser.user_id, nickname: currentUser.nickname, amount: amt, status: 'pending' }]);
  closeModal('payModal');
  showToast('充值申请已提交');
}

function openWithdraw() {
  if (!requireLogin()) return;
  if (currentUser.balance < 100) return showToast('最低提现100元');
  document.getElementById('payModalContent').innerHTML = `
    <div class="modal-header"><h4>📤 提现</h4></div>
    <input class="input" id="wdAmt" type="number" min="100" placeholder="最低100元">
    <input class="input" id="wdName" placeholder="真实姓名">
    <input type="file" accept="image/*" id="wdQr" onchange="prevQr(this)"><img id="wdPreview" style="max-height:80px;display:none;">
    <input class="input" id="wdIdCard" placeholder="身份证号">
    <button class="btn-block" onclick="submitWithdraw()">提交</button>`;
  document.getElementById('payModal').classList.add('show');
}

function prevQr(input) {
  if (input.files[0]) {
    const r = new FileReader();
    r.onload = e => { document.getElementById('wdPreview').src = e.target.result; document.getElementById('wdPreview').style.display = 'block'; window._wdQr = e.target.result; };
    r.readAsDataURL(input.files[0]);
  }
}

async function submitWithdraw() {
  const amt = parseFloat(document.getElementById('wdAmt').value);
  if (amt < 100 || amt > currentUser.balance) return showToast('金额无效');
  const name = document.getElementById('wdName').value.trim();
  const idCard = document.getElementById('wdIdCard').value.trim();
  if (!name || !idCard || !/^\d{17}[\dXx]$/.test(idCard)) return showToast('信息不完整');
  if (!window._wdQr) return showToast('请上传收款码');
  currentUser.balance -= amt;
  await SUPABASE.from('users').update({ balance: currentUser.balance }).eq('user_id', currentUser.user_id);
  await SUPABASE.from('withdrawals').insert([{ withdraw_id: 'W' + Date.now(), user_id: currentUser.user_id, nickname: currentUser.nickname, amount: amt, qr_image: window._wdQr, real_name: name, id_card: idCard, status: 'pending' }]);
  syncUI();
  closeModal('payModal');
  showToast('提现申请已提交');
}

// ============== 管理员后台 ==============
function checkAdminPwd() {
  if (document.getElementById('pwdInput').value === 'LPTKJ') {
    document.getElementById('pwdDialog').style.display = 'none';
    openAdmin();
  } else showToast('密码错误');
}

function openAdmin() {
  document.getElementById('adminPanel').classList.add('show');
  document.getElementById('adminTabs').innerHTML = `
    <div class="admin-tab active" data-tab="users">👥用户</div>
    <div class="admin-tab" data-tab="recharge">💰充值</div>
    <div class="admin-tab" data-tab="withdraw">📤提现</div>
    <div class="admin-tab" data-tab="config">⚙️配置</div>
    <button class="btn-sm" style="background:#c92a2a;color:#fff;margin-left:auto;" onclick="closeAdmin()">关闭</button>`;
  switchAdminTab('users');
}

function closeAdmin() { document.getElementById('adminPanel').classList.remove('show'); }

async function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.admin-tab[data-tab="${tab}"]`).classList.add('active');
  const c = document.getElementById('adminContent');
  if (tab === 'users') {
    const { data: users } = await SUPABASE.from('users').select('*');
    const rows = users.map(u => `<tr><td>${u.nickname}</td><td>${u.phone}</td><td>¥${(u.balance||0).toFixed(2)}</td><td>VIP${u.vip}</td><td><button class="btn-sm" onclick="adminSetVip('${u.user_id}')">VIP</button><button class="btn-sm" onclick="adminBan('${u.user_id}')">${u.banned?'解封':'封禁'}</button></td></tr>`).join('');
    c.innerHTML = `<h4>用户列表</h4><table class="user-table"><tr><th>昵称</th><th>手机</th><th>余额</th><th>VIP</th><th>操作</th></tr>${rows}</table>`;
  } else if (tab === 'recharge') {
    const { data: recharges } = await SUPABASE.from('recharges').select('*').order('created_at', { ascending: false });
    const rows = recharges.map(r => `<tr><td>${r.nickname}</td><td>¥${r.amount}</td><td>${r.status==='pending'?`<button class="btn-sm" onclick="confirmRecharge('${r.recharge_id}')">确认</button>`:'已到账'}</td></tr>`).join('');
    c.innerHTML = `<h4>充值管理</h4><table class="user-table"><tr><th>用户</th><th>金额</th><th>操作</th></tr>${rows}</table>`;
  } else if (tab === 'withdraw') {
    const { data: withdrawals } = await SUPABASE.from('withdrawals').select('*').order('created_at', { ascending: false });
    const rows = withdrawals.map(w => `<tr><td>${w.nickname}</td><td>¥${w.amount}</td><td><img src="${w.qr_image}" style="width:40px;height:40px;" onclick="zoomImg('${w.qr_image}')"></td><td>${w.status==='pending'?`<button class="btn-sm" onclick="confirmWithdraw('${w.withdraw_id}')">打款</button>`:w.status}</td></tr>`).join('');
    c.innerHTML = `<h4>提现审核</h4><table class="user-table"><tr><th>用户</th><th>金额</th><th>收款码</th><th>操作</th></tr>${rows}</table>`;
  } else if (tab === 'config') {
    c.innerHTML = `<textarea id="cfgAnnounce" class="input" placeholder="公告内容">${localStorage.getItem('announce')||''}</textarea><button class="btn-block" onclick="saveConfig()">保存公告</button>`;
  }
}

async function confirmRecharge(id) {
  await SUPABASE.from('recharges').update({ status: 'confirmed' }).eq('recharge_id', id);
  const { data: rec } = await SUPABASE.from('recharges').select('*').eq('recharge_id', id);
  if (rec.length > 0) {
    const { data: user } = await SUPABASE.from('users').select('balance,total_bet').eq('user_id', rec[0].user_id);
    if (user.length > 0) {
      const newBal = (user[0].balance||0) + rec[0].amount;
      const newBet = (user[0].total_bet||0) + rec[0].amount;
      await SUPABASE.from('users').update({ balance: newBal, total_bet: newBet }).eq('user_id', rec[0].user_id);
    }
  }
  switchAdminTab('recharge');
}

async function confirmWithdraw(id) {
  await SUPABASE.from('withdrawals').update({ status: 'confirmed' }).eq('withdraw_id', id);
  switchAdminTab('withdraw');
}

async function adminSetVip(uid) {
  const v = parseInt(prompt('VIP等级(0-10):'));
  if (!isNaN(v)) {
    await SUPABASE.from('users').update({ vip: Math.min(10, Math.max(0, v)) }).eq('user_id', uid);
    switchAdminTab('users');
  }
}

async function adminBan(uid) {
  const { data: user } = await SUPABASE.from('users').select('banned').eq('user_id', uid);
  if (user.length > 0) {
    await SUPABASE.from('users').update({ banned: !user[0].banned }).eq('user_id', uid);
    switchAdminTab('users');
  }
}

function saveConfig() {
  const txt = document.getElementById('cfgAnnounce').value.trim();
  localStorage.setItem('announce', txt);
  showToast('公告已保存');
}

// ============== 初始化 ==============
initNav();
syncUI();
renderHome();
updateMarquee();