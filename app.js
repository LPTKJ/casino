// app.js - 英皇娱乐核心逻辑
window.initApp = function(supabase) {
  window.SUPABASE = supabase;
  // 立即隐藏加载画面
  const loader = document.getElementById('loading');
  if (loader) loader.style.display = 'none';

  // 初始化基础UI
  initNav();
  syncUI();
  renderHome();
  updateMarquee();
  setInterval(updateMarquee, 12000);
};

// ============ 全局变量 ============
let currentUser = null;
let isLoggedIn = false;
const VIP_NAMES = {0:'VIP0',1:'VIP1',2:'VIP2',3:'VIP3',4:'VIP4',5:'荣耀VIP5',6:'伯爵VIP6',7:'至尊VIP7',8:'黑金VIP8',9:'SVIP9',10:'神豪SVIP10'};

// ============ Toast提示 ============
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// ============ UI同步 ============
function syncUI() {
  if (currentUser) {
    document.getElementById('displayNickname').textContent = currentUser.nickname || '玩家';
    document.getElementById('displayBalance').textContent = (currentUser.balance || 0).toFixed(2);
    const v = Math.min(currentUser.vip || 0, 10);
    document.getElementById('displayVip').textContent = VIP_NAMES[v];
    document.getElementById('avatarFrame').className = 'avatar-frame f' + v;
  } else {
    document.getElementById('displayNickname').textContent = '游客';
    document.getElementById('displayBalance').textContent = '0.00';
    document.getElementById('displayVip').textContent = '游客';
    document.getElementById('avatarFrame').className = 'avatar-frame f0';
  }
}

// ============ 页面切换 ============
function switchPage(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('page-' + p);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const m = {home:0, activity:1, earn:2, stage:3, night:4, room:5, deposit:6, profile:7};
  if (m[p] !== undefined) document.querySelectorAll('.nav-item')[m[p]].classList.add('active');
  if (p === 'home') renderHome();
  if (p === 'profile') renderProfile();
}

// ============ 底部导航 ============
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
  document.getElementById('bottomNav').addEventListener('click', function(e) {
    const nav = e.target.closest('.nav-item');
    if (!nav) return;
    const p = nav.dataset.page;
    if (p === 'deposit') { if (!currentUser) { showToast('请先登录'); return; } openDeposit(); }
    else switchPage(p);
    if (p === 'profile') {
      window._ac = (window._ac || 0) + 1;
      if (window._ac >= 5) { document.getElementById('pwdDialog').style.display = 'block'; window._ac = 0; }
    }
  });
}

// ============ 跑马灯 ============
function updateMarquee() {
  let h = '';
  for (let i = 0; i < 10; i++) h += '🎉' + ['张*明','李*芳'][i%2] + '赢得¥' + Math.floor(Math.random()*50000) + '  ';
  document.getElementById('marqueeText').textContent = h;
}

// ============ 首页 ============
function renderHome() {
  document.getElementById('page-home').innerHTML = `
    <div class="hero" onclick="openGame('dice')"><div style="font-size:36px;">🎲</div><h2>英皇娱乐·432.COM</h2><p>新人首存送8.8元</p><div class="cta">🔥 进入游戏大厅</div></div>
    <div class="game-grid">
      <div class="game-card" onclick="openGame('dice')"><div class="game-img">🎲</div><div class="game-name">摇骰子</div></div>
      <div class="game-card" onclick="openGame('slot')"><div class="game-img" style="background:linear-gradient(135deg,#101a2a,#182a3d)"><span class="hot">HOT</span>🎰</div><div class="game-name">老虎机</div></div>
      <div class="game-card" onclick="openGame('poker')"><div class="game-img" style="background:linear-gradient(135deg,#2a102a,#3d183d)">🃏</div><div class="game-name">扑克比点</div></div>
    </div>
    <div style="padding:6px 10px;color:#ffd700;font-weight:bold;">🎁 优惠</div>
    <div class="act-card" onclick="openRegister()"><span class="act-badge">🔥</span><b>新人首存</b></div>`;
}

// ============ 个人中心 ============
function renderProfile() {
  if (!currentUser) {
    document.getElementById('page-profile').innerHTML = '<div style="text-align:center;padding:30px;"><button class="btn-block" onclick="openRegister()">登录/注册</button></div>';
    return;
  }
  document.getElementById('page-profile').innerHTML = `
    <div style="text-align:center;padding:16px;">
      <h3 style="color:#ffd700;">${currentUser.nickname}</h3>
      <p>ID: ${currentUser.user_id}</p>
      <p>余额: ¥${(currentUser.balance||0).toFixed(2)}</p>
    </div>
    <div class="act-card" onclick="openDeposit()"><b>📥 存款</b></div>
    <div class="act-card" onclick="openWithdraw()"><b>📤 提现</b></div>
    <div class="act-card" onclick="openRegister()"><b>👤 切换账号</b></div>`;
}

// ============ 注册/登录 ============
function openRegister() {
  document.getElementById('registerModalContent').innerHTML = `
    <div class="modal-header"><h4>注册/登录</h4><button class="modal-close" onclick="closeModal('registerModal')">✕</button></div>
    <input class="input" id="regPhone" placeholder="手机号"><input class="input" id="regNickname" placeholder="昵称"><input class="input" id="regPassword" type="password" placeholder="密码">
    <button class="btn-block" onclick="doRegister()">注册</button><hr>
    <input class="input" id="switchPassword" type="password" placeholder="密码"><button class="btn-block" onclick="doSwitchUser()">切换</button>`;
  document.getElementById('registerModal').classList.add('show');
}

async function doRegister() {
  const ph = document.getElementById('regPhone').value.trim();
  const nn = document.getElementById('regNickname').value.trim();
  const pw = document.getElementById('regPassword').value.trim();
  if (!ph || !nn || !pw) return showToast('请填写完整');
  if (!/^1\d{10}$/.test(ph)) return showToast('手机号格式错误');
  const { data, error } = await window.SUPABASE.from('users').insert([{user_id:'JK'+Math.random().toString(36).substr(2,6),nickname:nn,password:pw,phone:ph,balance:0,vip:0,total_bet:0}]).select();
  if (error) return showToast('注册失败: '+error.message);
  currentUser = data[0]; isLoggedIn = true;
  syncUI(); closeModal('registerModal'); switchPage('home');
  showToast('注册成功！'+nn);
}

async function doSwitchUser() {
  const pw = document.getElementById('switchPassword').value.trim();
  const { data, error } = await window.SUPABASE.from('users').select('*');
  if (error) return showToast('查询失败');
  const u = data.find(user => user.password === pw);
  if (!u) return showToast('密码错误或用户不存在');
  currentUser = u; isLoggedIn = true;
  syncUI(); closeModal('registerModal'); switchPage('home');
  showToast('登录成功');
}

// ============ 游戏 ============
function openGame(type) {
  if (!currentUser) return showToast('请先登录');
  const c = document.getElementById('gameModalContent');
  if (type === 'dice') {
    c.innerHTML = `<div class="modal-header"><h4>🎲 摇骰子</h4><button class="modal-close" onclick="closeModal('gameModal')">✕</button></div>
      <div class="dice-cube" id="diceCube"><div class="dice-face">⚀</div><div class="dice-face">⚁</div><div class="dice-face">⚂</div><div class="dice-face">⚃</div><div class="dice-face">⚄</div><div class="dice-face">⚅</div></div>
      <p id="diceRes">下注</p><button class="btn-block" onclick="playDice(10)">¥10</button><button class="btn-block" onclick="playDice(50)">¥50</button>`;
    document.getElementById('gameModal').classList.add('show');
  }
}

async function playDice(bet) {
  if (currentUser.balance < bet) return showToast('余额不足');
  currentUser.balance -= bet;
  currentUser.total_bet = (currentUser.total_bet||0) + bet;
  document.getElementById('diceCube').classList.add('rolling');
  setTimeout(async () => {
    document.getElementById('diceCube').classList.remove('rolling');
    const p = Math.floor(Math.random()*6)+1, a = Math.floor(Math.random()*6)+1;
    document.getElementById('diceRes').textContent = `你:${p} AI:${a}`;
    if (p > a) { currentUser.balance += bet*2; document.getElementById('diceRes').textContent += ' 赢¥'+bet*2; }
    else if (p === a) { currentUser.balance += bet; document.getElementById('diceRes').textContent += ' 平'; }
    updateVip();
    await window.SUPABASE.from('users').update({balance:currentUser.balance,total_bet:currentUser.total_bet,vip:currentUser.vip}).eq('user_id',currentUser.user_id);
    syncUI();
  }, 700);
}

function updateVip() {
  let old = currentUser.vip || 0;
  const thresholds = [0,200,600,1400,3000,6200,12600,25400,50000,100000,200000];
  for (let i=thresholds.length-1; i>=0; i--) { if ((currentUser.total_bet||0) >= thresholds[i]) { currentUser.vip = i; break; } }
  if (currentUser.vip > old) showToast('晋升 '+VIP_NAMES[currentUser.vip]);
}

// ============ 充值/提现 ============
function openDeposit() {
  const qr = localStorage.getItem('admin_qr_wechat') || '';
  document.getElementById('payModalContent').innerHTML = `
    <div class="modal-header"><h4>📥 存款</h4></div>
    <img src="${qr}" class="qr-img"><input class="input" id="depAmt" type="number" min="50" value="50">
    <input class="input" id="depPhone" placeholder="确认手机号"><button class="btn-block" onclick="submitDeposit()">我已支付</button>`;
  document.getElementById('payModal').classList.add('show');
}
async function submitDeposit() {
  const amt = parseFloat(document.getElementById('depAmt').value);
  const phone = document.getElementById('depPhone').value.trim();
  if (amt < 50) return showToast('最低50元');
  if (phone !== currentUser.phone) return showToast('手机号不匹配');
  await window.SUPABASE.from('recharges').insert([{recharge_id:'R'+Date.now(),user_id:currentUser.user_id,nickname:currentUser.nickname,amount:amt,status:'pending'}]);
  closeModal('payModal'); showToast('充值申请已提交');
}

function openWithdraw() {
  if (currentUser.balance < 100) return showToast('最低提现100元');
  document.getElementById('payModalContent').innerHTML = `
    <div class="modal-header"><h4>📤 提现</h4></div>
    <input class="input" id="wdAmt" type="number" min="100" placeholder="最低100元">
    <input class="input" id="wdName" placeholder="真实姓名"><input type="file" accept="image/*" id="wdQr" onchange="prevQr(this)"><img id="wdPreview" style="max-height:80px;display:none;">
    <input class="input" id="wdIdCard" placeholder="身份证号"><button class="btn-block" onclick="submitWithdraw()">提交</button>`;
  document.getElementById('payModal').classList.add('show');
}
function prevQr(input) { if (input.files[0]) { const r=new FileReader(); r.onload=e=>{document.getElementById('wdPreview').src=e.target.result;document.getElementById('wdPreview').style.display='block';window._wdQr=e.target.result}; r.readAsDataURL(input.files[0]); } }
async function submitWithdraw() {
  const amt = parseFloat(document.getElementById('wdAmt').value);
  if (amt<100||amt>currentUser.balance) return showToast('金额无效');
  const name=document.getElementById('wdName').value.trim(), idCard=document.getElementById('wdIdCard').value.trim();
  if (!name||!idCard||!/^\d{17}[\dXx]$/.test(idCard)) return showToast('信息不完整');
  if (!window._wdQr) return showToast('请上传收款码');
  currentUser.balance -= amt;
  await window.SUPABASE.from('users').update({balance:currentUser.balance}).eq('user_id',currentUser.user_id);
  await window.SUPABASE.from('withdrawals').insert([{withdraw_id:'W'+Date.now(),user_id:currentUser.user_id,nickname:currentUser.nickname,amount:amt,qr_image:window._wdQr,real_name:name,id_card:idCard,status:'pending'}]);
  syncUI(); closeModal('payModal'); showToast('提现申请已提交');
}

// ============ 管理员 ============
function openAdmin() {
  document.getElementById('adminPanel').classList.add('show');
  document.getElementById('adminTabs').innerHTML = `
    <div class="admin-tab active" data-tab="users">用户</div><div class="admin-tab" data-tab="recharge">充值</div>
    <button class="btn-sm" style="background:#c92a2a;color:#fff;margin-left:auto;" onclick="document.getElementById('adminPanel').classList.remove('show')">关闭</button>`;
  switchAdminTab('users');
}
async function switchAdminTab(tab) {
  const c = document.getElementById('adminContent');
  if (tab==='users') {
    const {data:users}=await window.SUPABASE.from('users').select('*');
    const rows=users.map(u=>`<tr><td>${u.nickname}</td><td>${u.phone}</td><td>¥${(u.balance||0).toFixed(2)}</td><td>VIP${u.vip}</td></tr>`).join('');
    c.innerHTML=`<table class="user-table"><tr><th>昵称</th><th>手机</th><th>余额</th><th>VIP</th></tr>${rows}</table>`;
  }
  if (tab==='recharge') {
    const {data:recharges}=await window.SUPABASE.from('recharges').select('*').order('created_at',{ascending:false});
    const rows=recharges.map(r=>`<tr><td>${r.nickname}</td><td>¥${r.amount}</td><td>${r.status==='pending'?`<button class="btn-sm" onclick="confirmRecharge('${r.recharge_id}')">确认</button>`:'已到账'}</td></tr>`).join('');
    c.innerHTML=`<table class="user-table"><tr><th>用户</th><th>金额</th><th>操作</th></tr>${rows}</table>`;
  }
}
async function confirmRecharge(id) {
  await window.SUPABASE.from('recharges').update({status:'confirmed'}).eq('recharge_id',id);
  switchAdminTab('recharge');
}

// ============ 辅助函数 ============
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function switchRoute() {}