const members = [
  { id: "lulu", name: "露露", initial: "露", tone: "dark", role: "发起人" },
  { id: "jiajia", name: "嘉嘉", initial: "嘉", tone: "yellow", role: "美食雷达" },
  { id: "xiaobei", name: "小北", initial: "北", tone: "mint", role: "路线担当" },
  { id: "ahuang", name: "阿黄", initial: "黄", tone: "blue", role: "摄影担当" },
  { id: "momo", name: "默默", initial: "默", tone: "lilac", role: "气氛担当" },
  { id: "anan", name: "安安", initial: "安", tone: "coral", role: "韩语担当" }
];

const SUPABASE_URL = "https://lrijrkyqdwlqxcgdjdvk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mSBTilZy3x8QlIOAtiy5CA_ThMsMwQO";
const TRIP_CODE = "SEOUL630";
const SHARE_URL = "https://1035052845-sketch.github.io/tripmate/";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const defaultExpenses = [
  { id: 1, title: "安国站韩屋民宿", amount: 4680, payer: "lulu", category: "lodging", participants: members.map(m => m.id), date: "6 月 2 日" },
  { id: 2, title: "仁川机场接送", amount: 438, payer: "xiaobei", category: "transport", participants: members.map(m => m.id), date: "6 月 8 日" },
  { id: 3, title: "明洞烤肉预订", amount: 1200, payer: "jiajia", category: "food", participants: members.map(m => m.id), date: "6 月 10 日" },
  { id: 4, title: "N 首尔塔门票", amount: 516, payer: "ahuang", category: "fun", participants: members.map(m => m.id), date: "6 月 11 日" },
  { id: 5, title: "电话卡 6 张", amount: 288, payer: "anan", category: "transport", participants: members.map(m => m.id), date: "6 月 12 日" }
];

let expenses = defaultExpenses;
let selectedCategory = "food";
let selectedParticipants = new Set(members.map(m => m.id));
let selectedPlanParticipants = new Set(members.map(m => m.id));
let activeDay = 0;
let currentUserId = "lulu";
let sharedPlans = [];
let sharedChecklist = { visa: true, sim: true, cash: true, map: false, luggage: false };

const schedules = [
  {
    day: "D1", date: "6 月 30 日", title: "抵达首尔",
    items: [
      { time: "07:45", icon: "飞", title: "浦东机场 T1 集合", detail: "上海浦东国际机场 · 2 号门", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "10:15", icon: "航", title: "MU5041 飞往首尔", detail: "预计 13:20 抵达仁川机场", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "15:00", icon: "住", title: "安国站韩屋民宿入住", detail: "入住凭证已由露露上传", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "18:30", icon: "吃", title: "明洞烤肉晚餐", detail: "已订位 · 6 人 · 保留 15 分钟", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] }
    ]
  },
  {
    day: "D2", date: "7 月 1 日", title: "圣水洞散步",
    items: [
      { time: "09:30", icon: "咖", title: "London Bagel Museum", detail: "早点出发，现场可能排队", people: ["lulu","jiajia","momo","anan"] },
      { time: "13:00", icon: "逛", title: "圣水洞品牌店巡游", detail: "ADER ERROR · Tamburins · Dior", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "19:00", icon: "吃", title: "汉江炸鸡野餐", detail: "天气预报晴，阿黄带野餐布", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] }
    ]
  },
  {
    day: "D3", date: "7 月 2 日", title: "北村与弘大",
    items: [
      { time: "10:00", icon: "拍", title: "北村韩屋村拍照", detail: "从民宿步行约 10 分钟", people: ["lulu","xiaobei","ahuang","momo"] },
      { time: "15:30", icon: "逛", title: "弘大自由活动", detail: "可以分组行动，晚餐前汇合", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "20:00", icon: "唱", title: "弘大练歌房", detail: "地点待定，由默默负责", people: ["jiajia","xiaobei","ahuang","momo","anan"] }
    ]
  },
  {
    day: "D4", date: "7 月 3 日", title: "南山夜景",
    items: [
      { time: "11:00", icon: "逛", title: "新世界百货逛街", detail: "午餐在附近自由解决", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "17:30", icon: "景", title: "N 首尔塔看日落", detail: "门票已购买，记得带证件", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] }
    ]
  },
  {
    day: "D5", date: "7 月 4 日", title: "返程",
    items: [
      { time: "09:00", icon: "住", title: "整理行李并退房", detail: "最晚 11:00 前退房", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "12:30", icon: "飞", title: "前往仁川机场", detail: "机场接送已预约", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] },
      { time: "17:30", icon: "航", title: "MU5042 返回上海", detail: "预计 18:50 抵达浦东", people: ["lulu","jiajia","xiaobei","ahuang","momo","anan"] }
    ]
  }
];

let rooms = [
  { number: "201", type: "庭院双床房", detail: "2 张单人床 · 独立卫浴", members: ["lulu", "jiajia"] },
  { number: "202", type: "韩屋榻榻米房", detail: "2 套地铺 · 庭院景观", members: ["xiaobei", "ahuang"] },
  { number: "203", type: "阁楼双人房", detail: "1 张双人床 · 独立卫浴", members: ["momo", "anan"] }
];

const categoryMeta = {
  lodging: { label: "住宿", icon: "住" },
  food: { label: "吃喝", icon: "吃" },
  transport: { label: "交通", icon: "行" },
  fun: { label: "玩乐", icon: "玩" }
};

const byId = id => document.getElementById(id);
const money = amount => `¥${Number(amount).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
const memberById = id => members.find(member => member.id === id);
const avatar = (member, extra = "") => `<span class="avatar avatar-${member.tone} ${extra}">${member.initial}</span>`;
const cleanProfileText = value => String(value || "").replace(/[<>"'&]/g, "").trim();
const escapeHtml = value => String(value || "").replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
})[character]);

function loadProfile() {
  try {
    const savedProfile = JSON.parse(localStorage.getItem("tripmate-profile") || "null");
    if (!savedProfile || !memberById(savedProfile.memberId)) return;
    currentUserId = savedProfile.memberId;
    const currentMember = memberById(currentUserId);
    currentMember.name = cleanProfileText(savedProfile.name) || currentMember.name;
    currentMember.role = cleanProfileText(savedProfile.role) || currentMember.role;
    currentMember.initial = currentMember.name.trim().slice(0, 1) || currentMember.initial;
  } catch (error) {
    console.warn("Could not load local profile:", error);
  }
}

function renderProfile() {
  const currentMember = memberById(currentUserId);
  byId("profileAvatar").className = `avatar avatar-${currentMember.tone}`;
  byId("profileAvatar").textContent = currentMember.initial;
  byId("mobileProfileAvatar").textContent = currentMember.initial;
  byId("profileName").textContent = currentMember.name;
  byId("profileRole").textContent = `旅行${currentMember.role}`;
  byId("myIdentityHint").textContent = `以${currentMember.name}的身份查看`;
}

function openProfileModal() {
  const currentMember = memberById(currentUserId);
  openSimpleModal("编辑我的旅行资料", "选择你在这次旅行中的身份，并修改自己的显示资料。", `
    <form class="profile-form" id="profileForm">
      <label>我是谁
        <select id="profileMemberId">${members.map(member => `<option value="${member.id}" ${member.id === currentUserId ? "selected" : ""}>${member.name}</option>`).join("")}</select>
      </label>
      <label>显示昵称<input id="profileDisplayName" maxlength="12" value="${currentMember.name}" required /></label>
      <label>旅行分工<input id="profileDisplayRole" maxlength="16" value="${currentMember.role}" placeholder="例如：路线担当" required /></label>
      <p class="profile-form-note">个人资料保存在这台设备上，不会修改其他朋友设备上的昵称。</p>
      <button class="button button-primary full-button" type="submit">保存个人资料</button>
    </form>
  `);
}

function saveProfile() {
  const memberId = byId("profileMemberId").value;
  const currentMember = memberById(memberId);
  currentUserId = memberId;
  currentMember.name = cleanProfileText(byId("profileDisplayName").value) || currentMember.name;
  currentMember.role = cleanProfileText(byId("profileDisplayRole").value) || currentMember.role;
  currentMember.initial = currentMember.name.slice(0, 1) || currentMember.initial;
  localStorage.setItem("tripmate-profile", JSON.stringify({
    memberId: currentUserId,
    name: currentMember.name,
    role: currentMember.role
  }));
  renderMembers();
  renderProfile();
  renderSchedule();
  renderRooms();
  renderAllExpenseData();
  byId("simpleModal").classList.remove("open");
  showToast("个人资料已保存");
}

function setSyncStatus(message, connected = true) {
  byId("syncTime").textContent = message;
  document.querySelector(".sync-card strong").textContent = connected ? "多人同步已连接" : "等待数据库设置";
}

function formatSharedDate(value) {
  if (!value) return "刚刚";
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date(value));
}

async function loadSharedExpenses({ quiet = false } = {}) {
  if (!supabaseClient) {
    setSyncStatus("无法加载同步服务", false);
    return false;
  }

  const { data, error } = await supabaseClient
    .from("shared_expenses")
    .select("*")
    .eq("trip_code", TRIP_CODE)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase load error:", error);
    setSyncStatus("请先运行设置脚本", false);
    if (!quiet) showToast("数据库还未初始化，请先运行设置脚本");
    return false;
  }

  expenses = data.map(expense => ({
    id: expense.id,
    title: escapeHtml(expense.title),
    amount: Number(expense.amount),
    payer: expense.payer,
    category: expense.category,
    participants: expense.participants,
    date: formatSharedDate(expense.created_at),
    createdAt: expense.created_at
  }));
  renderAllExpenseData();
  renderActivities();
  setSyncStatus("刚刚同步");
  return true;
}

function subscribeToSharedExpenses() {
  if (!supabaseClient) return;
  supabaseClient
    .channel(`tripmate-${TRIP_CODE}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shared_expenses", filter: `trip_code=eq.${TRIP_CODE}` },
      () => loadSharedExpenses({ quiet: true })
    )
    .subscribe(status => {
      if (status === "SUBSCRIBED") setSyncStatus("实时同步中");
    });
}

async function loadSharedPlans({ quiet = false } = {}) {
  if (!supabaseClient) return false;

  const { data, error } = await supabaseClient
    .from("shared_plans")
    .select("*")
    .eq("trip_code", TRIP_CODE)
    .order("plan_time", { ascending: true });

  if (error) {
    console.error("Supabase plan load error:", error);
    if (!quiet) showToast("共享安排尚未初始化，请重新运行设置脚本");
    return false;
  }

  sharedPlans = data.map(plan => ({
    id: plan.id,
    dayIndex: plan.day_index,
    time: plan.plan_time,
    icon: escapeHtml(plan.icon || "行"),
    title: escapeHtml(plan.title),
    detail: escapeHtml(plan.detail || "由同行朋友添加"),
    people: plan.participants.filter(id => memberById(id)),
    shared: true,
    createdBy: plan.created_by,
    createdAt: plan.created_at
  }));
  renderSchedule();
  renderActivities();
  return true;
}

function subscribeToSharedPlans() {
  if (!supabaseClient) return;
  supabaseClient
    .channel(`tripmate-plans-${TRIP_CODE}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shared_plans", filter: `trip_code=eq.${TRIP_CODE}` },
      () => loadSharedPlans({ quiet: true })
    )
    .subscribe();
}

async function loadSharedRooms({ quiet = false } = {}) {
  if (!supabaseClient) return false;
  const { data, error } = await supabaseClient
    .from("shared_rooms")
    .select("*")
    .eq("trip_code", TRIP_CODE)
    .order("room_number", { ascending: true });

  if (error) {
    console.error("Supabase room load error:", error);
    if (!quiet) showToast("共享分房尚未初始化，请重新运行设置脚本");
    return false;
  }
  if (data.length) {
    rooms = data.map(room => ({
      number: room.room_number,
      type: escapeHtml(room.room_type),
      detail: escapeHtml(room.room_detail),
      members: room.members.filter(id => memberById(id))
    }));
    renderRooms();
  }
  return true;
}

async function loadSharedChecklist({ quiet = false } = {}) {
  if (!supabaseClient) return false;
  const { data, error } = await supabaseClient
    .from("shared_checklist")
    .select("*")
    .eq("trip_code", TRIP_CODE);

  if (error) {
    console.error("Supabase checklist load error:", error);
    if (!quiet) showToast("共享清单尚未初始化，请重新运行设置脚本");
    return false;
  }
  data.forEach(item => { sharedChecklist[item.item_id] = item.completed; });
  renderChecklist();
  return true;
}

function subscribeToTripDetails() {
  if (!supabaseClient) return;
  supabaseClient
    .channel(`tripmate-details-${TRIP_CODE}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "shared_rooms", filter: `trip_code=eq.${TRIP_CODE}` }, () => loadSharedRooms({ quiet: true }))
    .on("postgres_changes", { event: "*", schema: "public", table: "shared_checklist", filter: `trip_code=eq.${TRIP_CODE}` }, () => loadSharedChecklist({ quiet: true }))
    .subscribe();
}

function renderMembers() {
  byId("heroMembers").innerHTML = members.map(member => avatar(member)).join("");
  byId("peopleList").innerHTML = members.map(member => `
    <div class="person">${avatar(member)}<strong>${member.name}</strong><small>${member.role}</small></div>
  `).join("");
  byId("expensePayer").innerHTML = members.map(member => `<option value="${member.id}">${member.name}</option>`).join("");
  byId("splitPeople").innerHTML = members.map(member => `
    <button class="split-person" data-person="${member.id}" type="button">${avatar(member)}<span>${member.name}</span></button>
  `).join("");
}

function calculateBalances() {
  const balances = Object.fromEntries(members.map(member => [member.id, 0]));
  expenses.forEach(expense => {
    balances[expense.payer] += expense.amount;
    const share = expense.amount / expense.participants.length;
    expense.participants.forEach(id => { balances[id] -= share; });
  });
  return balances;
}

function getSettlements() {
  const balances = calculateBalances();
  const creditors = Object.entries(balances).filter(([, amount]) => amount > .01).map(([id, amount]) => ({ id, amount })).sort((a,b) => b.amount - a.amount);
  const debtors = Object.entries(balances).filter(([, amount]) => amount < -.01).map(([id, amount]) => ({ id, amount: -amount })).sort((a,b) => b.amount - a.amount);
  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    settlements.push({ from: debtors[i].id, to: creditors[j].id, amount });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < .01) i++;
    if (creditors[j].amount < .01) j++;
  }
  return settlements;
}

function renderMoney() {
  const totals = expenses.reduce((acc, expense) => {
    acc.total += expense.amount;
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, { total: 0, lodging: 0, food: 0, transport: 0, fun: 0 });
  byId("totalExpense").textContent = money(totals.total);
  byId("expensePageTotal").textContent = money(totals.total);
  byId("expenseCount").textContent = `共 ${expenses.length} 笔开销`;
  byId("lodgingTotal").textContent = money(totals.lodging);
  byId("foodTotal").textContent = money(totals.food);
  byId("otherTotal").textContent = money(totals.transport + totals.fun);
  byId("expenseBadge").textContent = expenses.length;

  const lodgingP = totals.total ? totals.lodging / totals.total * 100 : 0;
  const foodP = totals.total ? totals.food / totals.total * 100 : 0;
  byId("donut").style.background = `conic-gradient(var(--coral) 0 ${lodgingP}%, var(--yellow) ${lodgingP}% ${lodgingP + foodP}%, var(--mint) ${lodgingP + foodP}% 100%)`;

  const myPaid = expenses.filter(e => e.payer === currentUserId).reduce((sum,e) => sum + e.amount, 0);
  const myBalance = calculateBalances()[currentUserId];
  byId("myPaid").textContent = money(myPaid);
  byId("myBalance").textContent = `${myBalance >= 0 ? "+" : "-"}${money(Math.abs(myBalance))}`;
  byId("balanceHint").textContent = myBalance >= 0 ? "其他人需要付给我" : "我最终还需要支付";

  const mySettlement = getSettlements().find(item => item.from === currentUserId || item.to === currentUserId);
  if (!mySettlement) {
    byId("quickSettlementTitle").textContent = "你目前已经完全平账";
    byId("quickSettlement").textContent = "没有待处理的转账";
  } else if (mySettlement.from === currentUserId) {
    byId("quickSettlementTitle").textContent = `你需要付给${memberById(mySettlement.to).name}`;
    byId("quickSettlement").textContent = `${money(mySettlement.amount)} · 等旅行结束再转也可以`;
  } else {
    byId("quickSettlementTitle").textContent = `${memberById(mySettlement.from).name}需要付给你`;
    byId("quickSettlement").textContent = `${money(mySettlement.amount)} · 已合并多笔往来`;
  }
}

function renderActivities() {
  const recent = [
    ...expenses.filter(item => item.createdAt).map(item => ({ memberId: item.payer, text: `添加了一笔「${item.title}」`, createdAt: item.createdAt })),
    ...sharedPlans.filter(item => item.createdAt).map(item => ({ memberId: item.createdBy, text: `添加了共同安排「${item.title}」`, createdAt: item.createdAt }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const items = recent.length ? recent : [
    { memberId: "jiajia", text: "添加了一笔「明洞烤肉预订」", time: "最近" },
    { memberId: "ahuang", text: "确认了 N 首尔塔门票", time: "最近" },
    { memberId: "xiaobei", text: "把汉江野餐加入共同安排", time: "最近" }
  ];
  byId("activityList").innerHTML = items.map(item => {
    const member = memberById(item.memberId) || memberById("lulu");
    return `<div class="activity">${avatar(member)}
      <div class="activity-copy"><p><strong>${member.name}</strong> ${item.text}</p><small>${item.time || formatSharedDate(item.createdAt)}</small></div>
    </div>`;
  }).join("");
}

function renderSchedule() {
  const dayItems = [
    ...schedules[activeDay].items,
    ...sharedPlans.filter(plan => Number(plan.dayIndex) === activeDay)
  ].sort((a, b) => a.time.localeCompare(b.time));
  byId("dayTabs").innerHTML = schedules.map((day, index) => `
    <button class="day-tab ${index === activeDay ? "active" : ""}" data-day="${index}" type="button"><strong>${day.day} · ${day.title}</strong><small>${day.date}</small></button>
  `).join("");
  byId("scheduleList").innerHTML = dayItems.map(item => `
    <article class="schedule-item ${item.shared ? "shared-plan" : ""}">
      <span class="schedule-time">${item.time}</span>
      <span class="schedule-icon">${item.icon}</span>
      <div><h3>${item.title}${item.shared ? '<span class="shared-plan-label">共同添加</span>' : ""}</h3><p>${item.detail}</p></div>
      <div class="schedule-members">${item.people.slice(0,4).map(id => avatar(memberById(id))).join("")}</div>
      ${item.shared ? `<div class="item-actions"><button class="item-action" data-delete-plan="${item.id}" type="button" title="删除安排">删</button></div>` : ""}
    </article>
  `).join("");
  document.querySelectorAll(".day-tab").forEach(button => button.addEventListener("click", () => {
    activeDay = Number(button.dataset.day);
    renderSchedule();
  }));
}

function renderRooms() {
  byId("roomGrid").innerHTML = rooms.map(room => `
    <article class="room-card">
      <div class="room-top"><span class="room-number">${room.number}</span><div><strong>${room.type}</strong><p>${room.detail}</p></div></div>
      <div class="room-bottom"><p>入住成员</p>${room.members.map(id => {
        const member = memberById(id);
        return `<button class="room-member" data-room-member="${id}" type="button">${avatar(member)}<strong>${member.name}</strong><span>⇄</span></button>`;
      }).join("")}</div>
    </article>
  `).join("");
  document.querySelectorAll("[data-room-member]").forEach(button => button.addEventListener("click", openRoomEditor));
}

function renderChecklist() {
  const checkboxes = [...document.querySelectorAll("[data-checklist-id]")];
  checkboxes.forEach(checkbox => {
    checkbox.checked = Boolean(sharedChecklist[checkbox.dataset.checklistId]);
  });
  const completed = Object.values(sharedChecklist).filter(Boolean).length;
  const count = document.querySelector(".checklist-card .panel-title span");
  if (count) count.textContent = `${completed} / ${checkboxes.length}`;
  byId("prepProgress").style.width = `${checkboxes.length ? completed / checkboxes.length * 100 : 0}%`;
  byId("prepProgressLabel").textContent = `行前准备 ${completed} / ${checkboxes.length} 项已完成`;
}

function renderLedger() {
  const filter = byId("expenseFilter").value;
  const filtered = filter === "all" ? expenses : expenses.filter(expense => expense.category === filter);
  byId("ledgerList").innerHTML = filtered.length ? filtered.slice().reverse().map(expense => {
    const payer = memberById(expense.payer);
    const meta = categoryMeta[expense.category];
    return `<div class="ledger-item clickable" data-expense-id="${expense.id}">
      <span class="ledger-icon">${meta.icon}</span>
      <span class="ledger-copy"><strong>${expense.title}</strong><small>${payer.name} 支付 · ${expense.date}</small></span>
      <span class="ledger-split"><strong>${expense.participants.length} 人均摊</strong><small>每人 ${money(expense.amount / expense.participants.length)}</small></span>
      <strong class="ledger-amount">${money(expense.amount)}</strong>
    </div>`;
  }).join("") : `<div class="empty-state">这个分类还没有开销</div>`;
}

function renderSettlements() {
  const settlements = getSettlements();
  byId("settlementList").innerHTML = settlements.length ? settlements.map(item => {
    const from = memberById(item.from), to = memberById(item.to);
    return `<div class="settlement-row">${avatar(from)}<p><strong>${from.name} → ${to.name}</strong><small>合并后的最终转账</small></p><strong>${money(item.amount)}</strong></div>`;
  }).join("") : `<div class="empty-state">现在每个人都已结清</div>`;
}

function renderAllExpenseData() {
  renderMoney();
  renderLedger();
  renderSettlements();
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => section.classList.toggle("active", section.id === page));
  document.querySelectorAll(".nav-item[data-page]").forEach(item => item.classList.toggle("active", item.dataset.page === page));
  const titles = { overview: "首尔吃喝小分队", schedule: "共同安排", stay: "住宿与房间", expenses: "花费与结算" };
  byId("pageTitle").textContent = titles[page];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  const toast = byId("toast");
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function openExpenseModal() {
  selectedParticipants = new Set(members.map(m => m.id));
  selectedCategory = "food";
  byId("expenseForm").reset();
  byId("expensePayer").value = currentUserId;
  document.querySelectorAll(".category-choice").forEach(choice => choice.classList.toggle("selected", choice.dataset.category === selectedCategory));
  document.querySelectorAll(".split-person").forEach(person => person.classList.remove("excluded"));
  updateSplitPreview();
  byId("expenseModal").classList.add("open");
  byId("expenseModal").setAttribute("aria-hidden", "false");
  setTimeout(() => byId("expenseAmount").focus(), 100);
}

function closeExpenseModal() {
  byId("expenseModal").classList.remove("open");
  byId("expenseModal").setAttribute("aria-hidden", "true");
}

function updateSplitPreview() {
  const amount = Number(byId("expenseAmount").value) || 0;
  byId("splitPreview").textContent = money(selectedParticipants.size ? amount / selectedParticipants.size : 0);
}

function openSimpleModal(title, body, extra = "") {
  byId("simpleModalContent").innerHTML = `<p class="eyebrow">TRIPMATE</p><h2>${title}</h2><p>${body}</p>${extra}`;
  byId("simpleModal").classList.add("open");
  byId("simpleModal").setAttribute("aria-hidden", "false");
}

function openPlanModal() {
  selectedPlanParticipants = new Set(members.map(member => member.id));
  openSimpleModal("添加共同安排", "保存后，所有同行朋友都能立即看到。", `
    <form class="profile-form" id="planForm">
      <div class="form-grid">
        <label>哪一天
          <select id="planDay">${schedules.map((day, index) => `<option value="${index}" ${index === activeDay ? "selected" : ""}>${day.day} · ${day.date}</option>`).join("")}</select>
        </label>
        <label>开始时间<input id="planTime" type="time" value="10:00" required /></label>
      </div>
      <div class="form-grid">
        <label>安排名称<input id="planTitle" maxlength="40" placeholder="例如：汉江野餐" required /></label>
        <label>图标文字<input id="planIcon" maxlength="1" value="行" required /></label>
      </div>
      <label>地点或备注<input id="planDetail" maxlength="80" placeholder="例如：汝矣岛汉江公园集合" /></label>
      <label>参与成员
        <div class="plan-participants">${members.map(member => `
          <button class="split-person selected" data-plan-person="${member.id}" type="button">${avatar(member)}<span>${member.name}</span></button>
        `).join("")}</div>
      </label>
      <button class="button button-primary full-button" type="submit">保存并同步安排</button>
    </form>
  `);
}

async function saveSharedPlan(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "正在同步...";
  const plan = {
    trip_code: TRIP_CODE,
    day_index: Number(byId("planDay").value),
    plan_time: byId("planTime").value,
    title: cleanProfileText(byId("planTitle").value),
    detail: cleanProfileText(byId("planDetail").value),
    icon: cleanProfileText(byId("planIcon").value).slice(0, 1) || "行",
    participants: [...selectedPlanParticipants],
    created_by: currentUserId
  };

  const { error } = supabaseClient
    ? await supabaseClient.from("shared_plans").insert(plan)
    : { error: new Error("同步服务未加载") };

  submitButton.disabled = false;
  submitButton.textContent = "保存并同步安排";
  if (error) {
    console.error("Supabase plan insert error:", error);
    showToast("保存失败，请重新运行数据库设置脚本");
    return;
  }

  activeDay = plan.day_index;
  byId("simpleModal").classList.remove("open");
  await loadSharedPlans({ quiet: true });
  showToast("共同安排已同步");
}

function openTripInfo() {
  openSimpleModal("首尔吃喝小分队", "这是当前唯一的旅行空间。把邀请网址发给朋友即可共同使用。", `
    <div class="voucher-details">
      <div><span>旅行日期</span><strong>2026 年 6 月 30 日 – 7 月 4 日</strong></div>
      <div><span>同行人数</span><strong>${members.length} 人</strong></div>
      <div><span>旅行代码</span><strong>${TRIP_CODE}</strong></div>
    </div>
    <button class="button button-primary full-button" id="copyInviteLink" type="button">复制邀请网址</button>
  `);
}

function openVoucher() {
  openSimpleModal("安国站韩屋民宿入住凭证", "入住时向前台出示以下信息。", `
    <div class="voucher-details">
      <div><span>预订确认号</span><strong>AGH-SEOUL-0630</strong></div>
      <div><span>预订人</span><strong>露露</strong></div>
      <div><span>入住时间</span><strong>6 月 30 日 15:00 后</strong></div>
      <div><span>退房时间</span><strong>7 月 4 日 11:00 前</strong></div>
      <div><span>地址</span><strong>首尔钟路区北村路 12 街 8</strong></div>
    </div>
    <button class="button button-primary full-button" id="copyVoucherButton" type="button">复制入住信息</button>
  `);
}

function openRoomEditor() {
  const assignedRoom = memberId => rooms.find(room => room.members.includes(memberId))?.number || rooms[0].number;
  openSimpleModal("调整房间分配", "选择每位成员入住的房间，保存后会同步给大家。", `
    <form class="profile-form" id="roomForm">
      <div class="room-editor">${members.map(member => `
        <label>${avatar(member)}<strong>${member.name}</strong>
          <select data-room-select="${member.id}">
            ${rooms.map(room => `<option value="${room.number}" ${assignedRoom(member.id) === room.number ? "selected" : ""}>${room.number} · ${room.type}</option>`).join("")}
          </select>
        </label>
      `).join("")}</div>
      <button class="button button-primary full-button" type="submit">保存分房安排</button>
    </form>
  `);
}

async function saveRoomAssignments(form) {
  const assignments = Object.fromEntries(rooms.map(room => [room.number, []]));
  form.querySelectorAll("[data-room-select]").forEach(select => {
    assignments[select.value].push(select.dataset.roomSelect);
  });
  const rows = rooms.map(room => ({
    trip_code: TRIP_CODE,
    room_number: room.number,
    room_type: room.type,
    room_detail: room.detail,
    members: assignments[room.number]
  }));
  const { error } = supabaseClient
    ? await supabaseClient.from("shared_rooms").upsert(rows, { onConflict: "trip_code,room_number" })
    : { error: new Error("同步服务未加载") };
  if (error) {
    console.error("Supabase room save error:", error);
    showToast("保存失败，请重新运行数据库设置脚本");
    return;
  }
  byId("simpleModal").classList.remove("open");
  await loadSharedRooms({ quiet: true });
  showToast("分房安排已同步");
}

async function saveChecklistItem(checkbox) {
  const itemId = checkbox.dataset.checklistId;
  sharedChecklist[itemId] = checkbox.checked;
  renderChecklist();
  const { error } = supabaseClient
    ? await supabaseClient.from("shared_checklist").upsert({
        trip_code: TRIP_CODE,
        item_id: itemId,
        completed: checkbox.checked,
        updated_by: currentUserId
      }, { onConflict: "trip_code,item_id" })
    : { error: new Error("同步服务未加载") };
  if (error) {
    checkbox.checked = !checkbox.checked;
    sharedChecklist[itemId] = checkbox.checked;
    renderChecklist();
    showToast("清单同步失败，请重新运行数据库设置脚本");
  }
}

function openExpenseDetail(expenseId) {
  const expense = expenses.find(item => String(item.id) === String(expenseId));
  if (!expense) return;
  const payer = memberById(expense.payer);
  openSimpleModal(expense.title, "共同开销详情", `
    <div class="voucher-details">
      <div><span>金额</span><strong>${money(expense.amount)}</strong></div>
      <div><span>付款人</span><strong>${payer.name}</strong></div>
      <div><span>分类</span><strong>${categoryMeta[expense.category].label}</strong></div>
      <div><span>均摊成员</span><strong>${expense.participants.map(id => memberById(id)?.name).filter(Boolean).join("、")}</strong></div>
    </div>
    <button class="button button-secondary full-button" data-delete-expense="${expense.id}" type="button">删除这笔开销</button>
  `);
}

async function deleteExpense(expenseId) {
  if (!window.confirm("确认删除这笔开销吗？删除后所有人都会看不到它。")) return;
  const { error } = supabaseClient
    ? await supabaseClient.from("shared_expenses").delete().eq("id", expenseId).eq("trip_code", TRIP_CODE)
    : { error: new Error("同步服务未加载") };
  if (error) {
    console.error("Supabase expense delete error:", error);
    showToast("删除失败，请重新运行数据库设置脚本");
    return;
  }
  byId("simpleModal").classList.remove("open");
  await loadSharedExpenses({ quiet: true });
  showToast("开销已删除");
}

async function deletePlan(planId) {
  if (!window.confirm("确认删除这项共同安排吗？")) return;
  const { error } = supabaseClient
    ? await supabaseClient.from("shared_plans").delete().eq("id", planId).eq("trip_code", TRIP_CODE)
    : { error: new Error("同步服务未加载") };
  if (error) {
    console.error("Supabase plan delete error:", error);
    showToast("删除失败，请重新运行数据库设置脚本");
    return;
  }
  await loadSharedPlans({ quiet: true });
  showToast("共同安排已删除");
}

function copySettlementSummary() {
  const settlements = getSettlements();
  const text = settlements.length
    ? `首尔旅行结算清单\n${settlements.map(item => `${memberById(item.from).name} → ${memberById(item.to).name}：${money(item.amount)}`).join("\n")}`
    : "首尔旅行结算清单\n所有人已结清";
  navigator.clipboard?.writeText(text);
  showToast("结算清单已复制，可以发到群里");
}

document.querySelectorAll(".nav-item[data-page], [data-jump]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.page || button.dataset.jump)));
document.querySelectorAll(".add-expense-trigger").forEach(button => button.addEventListener("click", openExpenseModal));
document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeExpenseModal));
document.querySelectorAll("[data-close-simple]").forEach(button => button.addEventListener("click", () => byId("simpleModal").classList.remove("open")));
byId("expenseAmount").addEventListener("input", updateSplitPreview);
byId("expenseFilter").addEventListener("change", renderLedger);

document.querySelectorAll(".category-choice").forEach(choice => choice.addEventListener("click", () => {
  selectedCategory = choice.dataset.category;
  document.querySelectorAll(".category-choice").forEach(item => item.classList.toggle("selected", item === choice));
}));

byId("splitPeople").addEventListener("click", event => {
  const button = event.target.closest(".split-person");
  if (!button) return;
  const id = button.dataset.person;
  if (selectedParticipants.has(id) && selectedParticipants.size > 1) selectedParticipants.delete(id);
  else selectedParticipants.add(id);
  button.classList.toggle("excluded", !selectedParticipants.has(id));
  updateSplitPreview();
});

byId("expenseForm").addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = event.submitter;
  submitButton.disabled = true;
  submitButton.textContent = "正在同步...";
  const newExpense = {
    trip_code: TRIP_CODE,
    title: cleanProfileText(byId("expenseTitle").value),
    amount: Number(byId("expenseAmount").value),
    payer: byId("expensePayer").value,
    category: selectedCategory,
    participants: [...selectedParticipants]
  };

  const { error } = supabaseClient
    ? await supabaseClient.from("shared_expenses").insert(newExpense)
    : { error: new Error("同步服务未加载") };

  submitButton.disabled = false;
  submitButton.textContent = "保存并自动同步";
  if (error) {
    console.error("Supabase insert error:", error);
    showToast("保存失败，请先运行数据库设置脚本");
    return;
  }

  closeExpenseModal();
  await loadSharedExpenses({ quiet: true });
  showToast("开销已同步给所有同行朋友");
});

byId("inviteButton").addEventListener("click", () => openSimpleModal("邀请朋友加入", "把下面的网址发给朋友，他们打开后就能看到并共同记录账单。", `<div class="invite-code">${TRIP_CODE}</div><button class="button button-primary full-button" id="copyInviteLink" type="button">复制邀请网址</button>`));
byId("inviteRound").addEventListener("click", () => byId("inviteButton").click());
byId("profileButton").addEventListener("click", openProfileModal);
byId("mobileProfileButton").addEventListener("click", openProfileModal);
byId("addPlanButton").addEventListener("click", openPlanModal);
byId("editRoomsButton").addEventListener("click", openRoomEditor);
byId("voucherButton").addEventListener("click", openVoucher);
byId("tripInfoButton").addEventListener("click", openTripInfo);
byId("settleAllButton").addEventListener("click", copySettlementSummary);
document.querySelectorAll("[data-checklist-id]").forEach(checkbox => checkbox.addEventListener("change", () => saveChecklistItem(checkbox)));
byId("ledgerList").addEventListener("click", event => {
  const item = event.target.closest("[data-expense-id]");
  if (item) openExpenseDetail(item.dataset.expenseId);
});
byId("scheduleList").addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete-plan]");
  if (deleteButton) deletePlan(deleteButton.dataset.deletePlan);
});

[byId("expenseModal"), byId("simpleModal")].forEach(modal => modal.addEventListener("click", event => {
  if (event.target === modal) modal.classList.remove("open");
}));
byId("simpleModalContent").addEventListener("click", event => {
  if (event.target.id === "copyInviteLink") {
    navigator.clipboard?.writeText(SHARE_URL);
    byId("simpleModal").classList.remove("open");
    showToast("邀请网址已复制");
    return;
  }
  if (event.target.id === "copyVoucherButton") {
    navigator.clipboard?.writeText("安国站韩屋民宿\n确认号：AGH-SEOUL-0630\n入住：6 月 30 日 15:00 后\n地址：首尔钟路区北村路 12 街 8");
    showToast("入住信息已复制");
    return;
  }
  const deleteExpenseButton = event.target.closest("[data-delete-expense]");
  if (deleteExpenseButton) {
    deleteExpense(deleteExpenseButton.dataset.deleteExpense);
    return;
  }
  const planPerson = event.target.closest("[data-plan-person]");
  if (!planPerson) return;
  const id = planPerson.dataset.planPerson;
  if (selectedPlanParticipants.has(id) && selectedPlanParticipants.size > 1) selectedPlanParticipants.delete(id);
  else selectedPlanParticipants.add(id);
  planPerson.classList.toggle("selected", selectedPlanParticipants.has(id));
  planPerson.classList.toggle("excluded", !selectedPlanParticipants.has(id));
});
byId("simpleModalContent").addEventListener("change", event => {
  if (event.target.id !== "profileMemberId") return;
  const member = memberById(event.target.value);
  byId("profileDisplayName").value = member.name;
  byId("profileDisplayRole").value = member.role;
});
byId("simpleModalContent").addEventListener("submit", async event => {
  if (event.target.id === "planForm") {
    event.preventDefault();
    await saveSharedPlan(event.target);
    return;
  }
  if (event.target.id === "roomForm") {
    event.preventDefault();
    await saveRoomAssignments(event.target);
    return;
  }
  if (event.target.id !== "profileForm") return;
  event.preventDefault();
  saveProfile();
});

loadProfile();
renderMembers();
renderProfile();
renderActivities();
renderSchedule();
renderRooms();
renderChecklist();
renderAllExpenseData();
loadSharedExpenses();
subscribeToSharedExpenses();
loadSharedPlans();
subscribeToSharedPlans();
loadSharedRooms();
loadSharedChecklist();
subscribeToTripDetails();
