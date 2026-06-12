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
let activeDay = 0;

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

const rooms = [
  { number: "201", type: "庭院双床房", detail: "2 张单人床 · 独立卫浴", members: ["lulu", "jiajia"] },
  { number: "202", type: "韩屋榻榻米房", detail: "2 套地铺 · 庭院景观", members: ["xiaobei", "ahuang"] },
  { number: "203", type: "阁楼双人房", detail: "1 张双人床 · 独立卫浴", members: ["momo", "anan"] }
];

const activities = [
  { who: "嘉嘉", initial: "嘉", tone: "yellow", text: "添加了一笔「明洞烤肉预订」", time: "2 分钟前" },
  { who: "阿黄", initial: "黄", tone: "blue", text: "上传了 N 首尔塔门票", time: "18 分钟前" },
  { who: "小北", initial: "北", tone: "mint", text: "把汉江野餐加入共同安排", time: "1 小时前" }
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
    title: expense.title,
    amount: Number(expense.amount),
    payer: expense.payer,
    category: expense.category,
    participants: expense.participants,
    date: formatSharedDate(expense.created_at)
  }));
  renderAllExpenseData();
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

  const myPaid = expenses.filter(e => e.payer === "lulu").reduce((sum,e) => sum + e.amount, 0);
  const myBalance = calculateBalances().lulu;
  byId("myPaid").textContent = money(myPaid);
  byId("myBalance").textContent = `${myBalance >= 0 ? "+" : "-"}${money(Math.abs(myBalance))}`;
  byId("balanceHint").textContent = myBalance >= 0 ? "其他人需要付给我" : "我最终还需要支付";

  const mySettlement = getSettlements().find(item => item.from === "lulu" || item.to === "lulu");
  if (!mySettlement) {
    byId("quickSettlementTitle").textContent = "你目前已经完全平账";
    byId("quickSettlement").textContent = "没有待处理的转账";
  } else if (mySettlement.from === "lulu") {
    byId("quickSettlementTitle").textContent = `你需要付给${memberById(mySettlement.to).name}`;
    byId("quickSettlement").textContent = `${money(mySettlement.amount)} · 等旅行结束再转也可以`;
  } else {
    byId("quickSettlementTitle").textContent = `${memberById(mySettlement.from).name}需要付给你`;
    byId("quickSettlement").textContent = `${money(mySettlement.amount)} · 已合并多笔往来`;
  }
}

function renderActivities() {
  byId("activityList").innerHTML = activities.map(item => `
    <div class="activity">${avatar({ initial: item.initial, tone: item.tone })}
      <div class="activity-copy"><p><strong>${item.who}</strong> ${item.text}</p><small>${item.time}</small></div>
    </div>
  `).join("");
}

function renderSchedule() {
  byId("dayTabs").innerHTML = schedules.map((day, index) => `
    <button class="day-tab ${index === activeDay ? "active" : ""}" data-day="${index}" type="button"><strong>${day.day} · ${day.title}</strong><small>${day.date}</small></button>
  `).join("");
  byId("scheduleList").innerHTML = schedules[activeDay].items.map(item => `
    <article class="schedule-item">
      <span class="schedule-time">${item.time}</span>
      <span class="schedule-icon">${item.icon}</span>
      <div><h3>${item.title}</h3><p>${item.detail}</p></div>
      <div class="schedule-members">${item.people.slice(0,4).map(id => avatar(memberById(id))).join("")}</div>
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
  document.querySelectorAll("[data-room-member]").forEach(button => button.addEventListener("click", () => showToast("调整分房功能已准备好，可以拖动交换成员")));
}

function renderLedger() {
  const filter = byId("expenseFilter").value;
  const filtered = filter === "all" ? expenses : expenses.filter(expense => expense.category === filter);
  byId("ledgerList").innerHTML = filtered.length ? filtered.slice().reverse().map(expense => {
    const payer = memberById(expense.payer);
    const meta = categoryMeta[expense.category];
    return `<div class="ledger-item">
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
  byId("expensePayer").value = "lulu";
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
    title: byId("expenseTitle").value.trim(),
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

  activities.unshift({ who: memberById(newExpense.payer).name, initial: memberById(newExpense.payer).initial, tone: memberById(newExpense.payer).tone, text: `添加了一笔「${newExpense.title}」`, time: "刚刚" });
  renderActivities();
  closeExpenseModal();
  await loadSharedExpenses({ quiet: true });
  showToast("开销已同步给所有同行朋友");
});

byId("inviteButton").addEventListener("click", () => openSimpleModal("邀请朋友加入", "把下面的网址发给朋友，他们打开后就能看到并共同记录账单。", `<div class="invite-code">${TRIP_CODE}</div><button class="button button-primary full-button" id="copyInviteLink" type="button">复制邀请网址</button>`));
byId("inviteRound").addEventListener("click", () => byId("inviteButton").click());
byId("addPlanButton").addEventListener("click", () => openSimpleModal("添加共同安排", "完整产品中可以录入时间、地点、参与者和提醒。这个原型已经把入口和同步体验准备好了。", `<button class="button button-primary full-button" onclick="document.getElementById('simpleModal').classList.remove('open');">知道了</button>`));
byId("editRoomsButton").addEventListener("click", () => showToast("分房编辑模式已开启，点击成员即可调整"));
byId("settleAllButton").addEventListener("click", () => openSimpleModal("结算单已生成", "系统已合并全部往来。确认后会分别提醒需要转账的朋友。", `<button class="button button-primary full-button" onclick="document.getElementById('simpleModal').classList.remove('open');">通知大家结算</button>`));

[byId("expenseModal"), byId("simpleModal")].forEach(modal => modal.addEventListener("click", event => {
  if (event.target === modal) modal.classList.remove("open");
}));
byId("simpleModalContent").addEventListener("click", event => {
  if (event.target.id !== "copyInviteLink") return;
  navigator.clipboard?.writeText(SHARE_URL);
  byId("simpleModal").classList.remove("open");
  showToast("邀请网址已复制");
});

renderMembers();
renderActivities();
renderSchedule();
renderRooms();
renderAllExpenseData();
loadSharedExpenses();
subscribeToSharedExpenses();
