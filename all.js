// 全域變數
let currentYear = 2025;
let currentMonth = 10; // 0-11，10代表11月
let employees = [];
let holidays = [];
let closedDays = [];
let adjustedHours = [];
let scheduleData = {};
let historyData = [];

// 初始化應用
document.addEventListener("DOMContentLoaded", function () {
  loadData();
  initializeUI();
  generateSchedule();
  updateStats();
});

// 載入儲存的資料
function loadData() {
  // 從localStorage載入資料，如果沒有則使用預設值
  const savedEmployees = localStorage.getItem("employees");
  const savedHolidays = localStorage.getItem("holidays");
  const savedClosedDays = localStorage.getItem("closedDays");
  const savedAdjustedHours = localStorage.getItem("adjustedHours");
  const savedSchedule = localStorage.getItem("scheduleData");
  const savedHistory = localStorage.getItem("historyData");

  // 員工資料
  if (savedEmployees) {
    employees = JSON.parse(savedEmployees);
  } else {
    // 預設員工資料
    employees = [
      {
        id: "A",
        name: "正職A",
        type: "full-time",
        fixedDaysOff: [3, 4], // 週三、週四
        unavailableDates: [
          "2025-11-10",
          "2025-11-11",
          "2025-11-12",
          "2025-11-13",
          "2025-11-14",
        ],
        preferredShifts: ["day"],
        color: "employee-a",
      },
      {
        id: "B",
        name: "兼職B",
        type: "part-time",
        fixedDaysOff: [0, 1], // 週日、週一
        unavailableDates: ["2025-11-26"],
        preferredShifts: ["day"],
        color: "employee-b",
      },
      {
        id: "C",
        name: "兼職C",
        type: "part-time",
        fixedDaysOff: [],
        unavailableDates: ["2025-11-16", "2025-11-17"],
        preferredShifts: ["night"],
        specialDates: {
          "2025-11-13": "night",
          "2025-11-14": "night",
        },
        color: "employee-c",
      },
      {
        id: "D",
        name: "兼職D",
        type: "part-time",
        fixedDaysOff: [],
        unavailableDates: [],
        preferredShifts: ["night"],
        availableDates: ["2025-11-08", "2025-11-22", "2025-11-29"],
        color: "employee-d",
        priority: 1, // 優先排班
      },
      {
        id: "E",
        name: "兼職E",
        type: "part-time",
        fixedDaysOff: [],
        unavailableDates: [
          "2025-11-04",
          "2025-11-14",
          "2025-11-20",
          "2025-11-21",
          "2025-11-23",
        ],
        preferredShifts: ["day", "short"],
        color: "employee-e",
        shortShiftPriority: 1, // 短班優先
      },
      {
        id: "F",
        name: "兼職F",
        type: "part-time",
        fixedDaysOff: [],
        unavailableDates: [
          "2025-11-01",
          "2025-11-02",
          "2025-11-10",
          "2025-11-11",
          "2025-11-21",
          "2025-11-22",
        ],
        preferredShifts: ["night"],
        color: "employee-f",
        shortShiftPriority: 2, // 短班第二順位
        minNightShifts: 2,
        maxNightShifts: 2,
      },
    ];
  }

  // 特殊日期資料
  if (savedHolidays) {
    holidays = JSON.parse(savedHolidays);
  }

  if (savedClosedDays) {
    closedDays = JSON.parse(savedClosedDays);
  }

  if (savedAdjustedHours) {
    adjustedHours = JSON.parse(savedAdjustedHours);
  } else {
    // 預設調整營業時段
    adjustedHours = [
      {
        date: "2025-11-07",
        type: "early-close",
        description: "晚上18:30後提早打烊",
      },
      {
        date: "2025-11-17",
        type: "late-open",
        description: "下午13:00才開門",
        dayShift: "13:00-18:30",
        dayHours: 5,
      },
      {
        date: "2025-11-30",
        type: "late-open",
        description: "下午13:00才開門",
        shortShift: "13:00-16:00",
        shortHours: 3,
      },
    ];
  }

  // 排班資料
  if (savedSchedule) {
    scheduleData = JSON.parse(savedSchedule);
  }

  // 歷史紀錄
  if (savedHistory) {
    historyData = JSON.parse(savedHistory);
  }
}

// 初始化UI元件
function initializeUI() {
  // 設定月份和年份選擇器
  setupMonthYearSelectors();

  // 設定事件監聽器
  document
    .getElementById("month-select")
    .addEventListener("change", function () {
      currentMonth = parseInt(this.value);
      generateSchedule();
    });

  document
    .getElementById("year-select")
    .addEventListener("change", function () {
      currentYear = parseInt(this.value);
      generateSchedule();
    });

  document
    .getElementById("auto-generate")
    .addEventListener("click", autoGenerateSchedule);
  document
    .getElementById("validate-schedule")
    .addEventListener("click", validateSchedule);
  document
    .getElementById("check-continuous")
    .addEventListener("click", checkContinuousWork);
  document
    .getElementById("export-image")
    .addEventListener("click", exportScheduleImage);
  document
    .getElementById("save-schedule")
    .addEventListener("click", saveSchedule);
  document
    .getElementById("load-schedule")
    .addEventListener("click", loadSchedule);

  // 規則設定分頁的事件
  document
    .getElementById("add-employee")
    .addEventListener("click", addEmployeeForm);
  document
    .getElementById("save-rules")
    .addEventListener("click", saveEmployeeRules);

  // 特殊日期分頁的事件
  document
    .getElementById("add-holiday")
    .addEventListener("click", addHolidayForm);
  document
    .getElementById("add-closed-day")
    .addEventListener("click", addClosedDayForm);
  document
    .getElementById("add-adjusted-hours")
    .addEventListener("click", addAdjustedHoursForm);
  document
    .getElementById("save-special-dates")
    .addEventListener("click", saveSpecialDates);

  // 編輯班表模態框的事件
  document
    .getElementById("save-shift")
    .addEventListener("click", saveEditedShift);

  // 初始化規則設定分頁
  renderEmployeeRules();

  // 初始化特殊日期分頁
  renderSpecialDates();

  // 初始化歷史紀錄分頁
  renderHistory();

  // 設定分頁切換事件
  setupTabEvents();
}

// 設定分頁切換事件
function setupTabEvents() {
  const tabLinks = document.querySelectorAll('.nav-link[data-bs-toggle="tab"]');

  tabLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // 移除所有分頁的active類別
      tabLinks.forEach((tab) => {
        tab.classList.remove("active");
      });

      // 添加當前分頁的active類別
      this.classList.add("active");

      // 顯示對應的分頁內容
      const target = this.getAttribute("href");
      const tabPanes = document.querySelectorAll(".tab-pane");

      tabPanes.forEach((pane) => {
        pane.classList.remove("show", "active");
      });

      document.querySelector(target).classList.add("show", "active");
    });
  });
}

// 設定月份和年份選擇器
function setupMonthYearSelectors() {
  const monthSelect = document.getElementById("month-select");
  const yearSelect = document.getElementById("year-select");

  // 清空現有選項
  monthSelect.innerHTML = "";
  yearSelect.innerHTML = "";

  // 添加月份選項 (0-11)
  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];
  for (let i = 0; i < 12; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = monthNames[i];
    if (i === currentMonth) option.selected = true;
    monthSelect.appendChild(option);
  }

  // 添加年份選項 (2023-2027)
  for (let year = 2023; year <= 2027; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year + "年";
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

// 生成排班表
function generateSchedule() {
  const scheduleTable = document.getElementById("schedule-table");
  const scheduleTitle = document.getElementById("schedule-title");

  // 更新標題
  scheduleTitle.textContent = `${currentYear}年${currentMonth + 1}月排班表`;

  // 清空表格
  scheduleTable.innerHTML = "";

  // 創建表頭
  const headerRow = document.createElement("tr");
  headerRow.className = "calendar-header";
  const daysOfWeek = ["一", "二", "三", "四", "五", "六", "日"];
  daysOfWeek.forEach((day) => {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });
  scheduleTable.appendChild(headerRow);

  // 獲取該月的第一天和最後一天
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  // 計算該月第一天是星期幾 (0=星期日, 1=星期一, ..., 6=星期六)
  let firstDayOfWeek = firstDay.getDay();
  // 調整為星期一為0的格式
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // 計算該月總天數
  const totalDays = lastDay.getDate();

  // 創建月曆格子
  let date = 1;
  for (let i = 0; i < 6; i++) {
    // 最多6週
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");
      cell.className = "calendar-cell";

      if (i === 0 && j < firstDayOfWeek) {
        // 上個月的日期，留空
        cell.innerHTML = "&nbsp;";
      } else if (date > totalDays) {
        // 下個月的日期，留空
        cell.innerHTML = "&nbsp;";
      } else {
        // 當前月份的日期
        const currentDate = new Date(currentYear, currentMonth, date);
        const dateString = formatDate(currentDate);
        const dayOfWeek = currentDate.getDay();

        // 添加日期數字
        const dateNumber = document.createElement("div");
        dateNumber.className = "date-number";
        dateNumber.textContent = date;
        cell.appendChild(dateNumber);

        // 判斷是否為假日 (週六或週日)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          cell.classList.add("holiday");
        }

        // 檢查是否為國定假日
        const isHoliday = holidays.some((h) => h.date === dateString);
        if (isHoliday) {
          cell.classList.add("holiday-red");
        }

        // 檢查是否為公休日
        const isClosed = closedDays.some((d) => d.date === dateString);
        if (isClosed) {
          cell.classList.add("closed");
        }

        // 檢查是否有調整營業時段
        const adjustedHour = adjustedHours.find((a) => a.date === dateString);

        // 顯示排班資訊
        if (!isClosed) {
          const shiftInfo = document.createElement("div");
          shiftInfo.className = "shift-info";

          // 從scheduleData獲取排班資訊
          const daySchedule = scheduleData[dateString];
          if (daySchedule) {
            // 白天班
            if (daySchedule.day) {
              const dayShift = document.createElement("div");
              dayShift.className = `editable-shift ${daySchedule.day.color}`;
              const shiftTime = getShiftTime("day", adjustedHour, dayOfWeek);
              const shiftHours = getShiftHours("day", adjustedHour, dayOfWeek);
              dayShift.textContent = `${daySchedule.day.id} ${shiftTime}(${shiftHours})`;
              dayShift.setAttribute("data-date", dateString);
              dayShift.setAttribute("data-shift-type", "day");
              shiftInfo.appendChild(dayShift);
            }

            // 晚班
            if (daySchedule.night) {
              const nightHours = getShiftHoursNumber(
                "night",
                adjustedHour,
                dayOfWeek
              );
              if (nightHours > 0) {
                const nightShift = document.createElement("div");
                nightShift.className = `editable-shift ${daySchedule.night.color}`;
                const shiftTime = getShiftTime(
                  "night",
                  adjustedHour,
                  dayOfWeek
                );
                const shiftHours = getShiftHours(
                  "night",
                  adjustedHour,
                  dayOfWeek
                );
                nightShift.textContent = `${daySchedule.night.id} ${shiftTime}(${shiftHours})`;
                nightShift.setAttribute("data-date", dateString);
                nightShift.setAttribute("data-shift-type", "night");
                shiftInfo.appendChild(nightShift);
              }
            }

            // 短班 (僅假日)
            if (daySchedule.short && (dayOfWeek === 0 || dayOfWeek === 6)) {
              const shortShift = document.createElement("div");
              shortShift.className = `editable-shift ${daySchedule.short.color}`;
              const shiftTime = getShiftTime("short", adjustedHour, dayOfWeek);
              const shiftHours = getShiftHours(
                "short",
                adjustedHour,
                dayOfWeek
              );
              shortShift.textContent = `${daySchedule.short.id} ${shiftTime}(${shiftHours})`;
              shortShift.setAttribute("data-date", dateString);
              shortShift.setAttribute("data-shift-type", "short");
              shiftInfo.appendChild(shortShift);
            }
          } else {
            // 如果沒有排班資料，顯示空白
            shiftInfo.textContent = "未排班";
          }

          cell.appendChild(shiftInfo);
        } else {
          // 公休日
          const closedText = document.createElement("div");
          closedText.className = "shift-info";
          closedText.textContent = "公休";
          cell.appendChild(closedText);
        }

        // 添加點擊事件用於編輯
        cell.addEventListener("click", function (e) {
          if (e.target.classList.contains("editable-shift")) {
            const date = e.target.getAttribute("data-date");
            const shiftType = e.target.getAttribute("data-shift-type");
            openEditShiftModal(date, shiftType);
          }
        });

        date++;
      }

      row.appendChild(cell);
    }

    scheduleTable.appendChild(row);

    // 如果已經顯示完所有日期，則跳出循環
    if (date > totalDays) break;
  }

  // 更新統計資訊
  updateStats();
}

// 獲取班別時間
function getShiftTime(shiftType, adjustedHour, dayOfWeek) {
  const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;

  // 如果有調整營業時段
  if (adjustedHour) {
    if (shiftType === "day") {
      if (adjustedHour.dayShift) return adjustedHour.dayShift;
      if (adjustedHour.type === "late-open") {
        return "13:00-18:30"; // 延後開門的預設時間
      }
    } else if (shiftType === "short") {
      if (adjustedHour.shortShift) return adjustedHour.shortShift;
      if (adjustedHour.type === "late-open") {
        return "13:00-16:00"; // 延後開門的短班時間
      }
    } else if (shiftType === "night") {
      if (adjustedHour.type === "early-close") {
        return "不需排班"; // 提早打烊
      }
    }
  }

  // 沒有調整營業時段或沒有指定時間，使用預設時間
  if (shiftType === "day") {
    return isHoliday ? "09:50-17:50" : "10:30-18:30";
  } else if (shiftType === "night") {
    return isHoliday ? "16:15-24:15" : "18:15-24:15";
  } else if (shiftType === "short") {
    return "12:00-16:00";
  }

  return "";
}

// 獲取班別時數 (顯示用)
function getShiftHours(shiftType, adjustedHour, dayOfWeek) {
  const hours = getShiftHoursNumber(shiftType, adjustedHour, dayOfWeek);
  const currentDate = new Date(currentYear, currentMonth, dayOfWeek);
  const dateString = formatDate(currentDate);
  const isNationalHoliday = holidays.some((h) => h.date === dateString);

  // 如果是國定假日，時數加倍
  if (isNationalHoliday && hours > 0) {
    return `${hours}*2`;
  }

  return hours > 0 ? hours.toString() : "0";
}

// 獲取班別時數 (數字)
function getShiftHoursNumber(shiftType, adjustedHour, dayOfWeek) {
  const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;

  let hours = 0;

  // 如果有調整營業時段
  if (adjustedHour) {
    if (shiftType === "day") {
      if (adjustedHour.dayHours !== undefined) {
        hours = adjustedHour.dayHours;
      } else if (adjustedHour.type === "late-open") {
        // 延後開門但沒有指定時數，使用預設值
        hours = isHoliday ? 8 : 8;
      } else {
        hours = isHoliday ? 8 : 8;
      }
    } else if (shiftType === "night") {
      // 晚班不受延後開門影響，但受提早打烊影響
      if (adjustedHour.type === "early-close") {
        hours = 0; // 提早打烊不需要晚班
      } else {
        hours = isHoliday ? 8 : 6;
      }
    } else if (shiftType === "short") {
      if (adjustedHour.shortHours !== undefined) {
        hours = adjustedHour.shortHours;
      } else {
        hours = 4; // 短班預設時數
      }
    }
  } else {
    // 沒有調整營業時段，使用預設時數
    if (shiftType === "day") {
      hours = isHoliday ? 8 : 8;
    } else if (shiftType === "night") {
      hours = isHoliday ? 8 : 6;
    } else if (shiftType === "short") {
      hours = 4;
    }
  }

  return hours;
}

// 自動生成排班表
function autoGenerateSchedule() {
  // 清空現有排班資料
  scheduleData = {};

  // 獲取該月的第一天和最後一天
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDay.getDate();

  // 為每一天排班
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(currentYear, currentMonth, day);
    const dateString = formatDate(currentDate);
    const dayOfWeek = currentDate.getDay();

    // 檢查是否為公休日
    const isClosed = closedDays.some((d) => d.date === dateString);
    if (isClosed) continue;

    // 檢查是否有調整營業時段
    const adjustedHour = adjustedHours.find((a) => a.date === dateString);

    // 初始化當天的排班資料
    scheduleData[dateString] = {};

    // 判斷是否為假日 (週六或週日)
    const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;

    // 排白天班
    if (!adjustedHour || adjustedHour.type !== "late-open") {
      scheduleDayShift(dateString, dayOfWeek, isHoliday);
    } else if (adjustedHour.type === "late-open") {
      // 如果有延後開門，仍然需要排白天班，但時間調整
      scheduleDayShift(dateString, dayOfWeek, isHoliday);
    }

    // 排晚班 (如果不是提早打烊)
    if (!adjustedHour || adjustedHour.type !== "early-close") {
      const nightHours = getShiftHoursNumber("night", adjustedHour, dayOfWeek);
      if (nightHours > 0) {
        scheduleNightShift(dateString, dayOfWeek, isHoliday);
      }
    }

    // 如果是假日，排短班
    if (isHoliday) {
      scheduleShortShift(dateString);
    }
  }

  // 重新生成排班表
  generateSchedule();

  // 顯示成功訊息
  alert("自動排班完成！");
}

// 排白天班
function scheduleDayShift(dateString, dayOfWeek, isHoliday) {
  // 過濾可上白天班的員工
  let availableEmployees = employees.filter((emp) => {
    // 檢查是否為正職或偏好白天班
    if (emp.type === "full-time" && !emp.preferredShifts.includes("day"))
      return false;
    if (emp.type === "part-time" && !emp.preferredShifts.includes("day"))
      return false;

    // 檢查固定休息日
    if (emp.fixedDaysOff.includes(dayOfWeek)) return false;

    // 檢查不可上班日期
    if (emp.unavailableDates.includes(dateString)) return false;

    // 檢查特殊日期限制
    if (
      emp.specialDates &&
      emp.specialDates[dateString] &&
      emp.specialDates[dateString] !== "day"
    ) {
      return false;
    }

    return true;
  });

  // 如果有可用的員工，選擇一個
  if (availableEmployees.length > 0) {
    // 簡單的選擇邏輯：優先選擇正職，然後隨機選擇
    const fullTimeEmployees = availableEmployees.filter(
      (emp) => emp.type === "full-time"
    );
    if (fullTimeEmployees.length > 0) {
      scheduleData[dateString].day = fullTimeEmployees[0];
    } else {
      // 隨機選擇一個兼職員工
      const randomIndex = Math.floor(Math.random() * availableEmployees.length);
      scheduleData[dateString].day = availableEmployees[randomIndex];
    }
  }
}

// 排晚班
function scheduleNightShift(dateString, dayOfWeek, isHoliday) {
  // 過濾可上晚班的員工
  let availableEmployees = employees.filter((emp) => {
    // 正職不能上晚班
    if (emp.type === "full-time") return false;

    // 檢查是否偏好晚班
    if (!emp.preferredShifts.includes("night")) return false;

    // 檢查固定休息日
    if (emp.fixedDaysOff.includes(dayOfWeek)) return false;

    // 檢查不可上班日期
    if (emp.unavailableDates.includes(dateString)) return false;

    // 檢查特殊日期限制
    if (
      emp.specialDates &&
      emp.specialDates[dateString] &&
      emp.specialDates[dateString] !== "night"
    ) {
      return false;
    }

    // 檢查是否有特定日期可上晚班
    if (emp.availableDates && !emp.availableDates.includes(dateString)) {
      return false;
    }

    return true;
  });

  // 優先排兼職D
  const employeeD = availableEmployees.find((emp) => emp.id === "D");
  if (
    employeeD &&
    employeeD.availableDates &&
    employeeD.availableDates.includes(dateString)
  ) {
    scheduleData[dateString].night = employeeD;
    return;
  }

  // 如果有可用的員工，選擇一個
  if (availableEmployees.length > 0) {
    // 隨機選擇一個員工
    const randomIndex = Math.floor(Math.random() * availableEmployees.length);
    scheduleData[dateString].night = availableEmployees[randomIndex];
  }
}

// 排短班
function scheduleShortShift(dateString) {
  // 過濾可上短班的員工
  let availableEmployees = employees.filter((emp) => {
    // 正職不能上短班
    if (emp.type === "full-time") return false;

    // 檢查是否偏好短班
    if (!emp.preferredShifts.includes("short")) return false;

    // 檢查不可上班日期
    if (emp.unavailableDates.includes(dateString)) return false;

    return true;
  });

  // 優先排兼職E
  const employeeE = availableEmployees.find((emp) => emp.id === "E");
  if (employeeE) {
    scheduleData[dateString].short = employeeE;
    return;
  }

  // 其次排兼職F
  const employeeF = availableEmployees.find((emp) => emp.id === "F");
  if (employeeF) {
    scheduleData[dateString].short = employeeF;
    return;
  }

  // 如果有其他可用的員工，選擇一個
  if (availableEmployees.length > 0) {
    // 隨機選擇一個員工
    const randomIndex = Math.floor(Math.random() * availableEmployees.length);
    scheduleData[dateString].short = availableEmployees[randomIndex];
  }
}

// 驗證班表
function validateSchedule() {
  const warnings = [];

  // 檢查每一天的排班
  for (const date in scheduleData) {
    const daySchedule = scheduleData[date];
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;

    // 檢查是否有調整營業時段
    const adjustedHour = adjustedHours.find((a) => a.date === date);

    // 檢查白天班
    if (daySchedule.day) {
      const employee = daySchedule.day;

      // 檢查員工是否可上該班別
      if (
        employee.type === "full-time" &&
        !employee.preferredShifts.includes("day")
      ) {
        warnings.push(`${date}：${employee.name} 是正職但被排在非白天班`);
      }

      // 檢查固定休息日
      if (employee.fixedDaysOff.includes(dayOfWeek)) {
        warnings.push(`${date}：${employee.name} 固定休息但被排班`);
      }

      // 檢查不可上班日期
      if (employee.unavailableDates.includes(date)) {
        warnings.push(`${date}：${employee.name} 不可上班但被排班`);
      }
    } else if (!adjustedHour || adjustedHour.type !== "late-open") {
      // 如果沒有排白天班且不是延後開門，則警告
      warnings.push(`${date}：缺少白天班`);
    }

    // 檢查晚班
    if (daySchedule.night) {
      const employee = daySchedule.night;

      // 檢查員工是否可上晚班
      if (!employee.preferredShifts.includes("night")) {
        warnings.push(`${date}：${employee.name} 不偏好晚班但被排在晚班`);
      }

      // 檢查固定休息日
      if (employee.fixedDaysOff.includes(dayOfWeek)) {
        warnings.push(`${date}：${employee.name} 固定休息但被排班`);
      }

      // 檢查不可上班日期
      if (employee.unavailableDates.includes(date)) {
        warnings.push(`${date}：${employee.name} 不可上班但被排班`);
      }
    } else if (!adjustedHour || adjustedHour.type !== "early-close") {
      // 如果沒有排晚班且不是提早打烊，則警告
      warnings.push(`${date}：缺少晚班`);
    }

    // 檢查短班 (僅假日)
    if (isHoliday && !daySchedule.short) {
      warnings.push(`${date}：假日缺少短班`);
    }
  }

  // 顯示驗證結果
  if (warnings.length === 0) {
    alert("班表驗證通過！");
  } else {
    alert("班表驗證發現以下問題：\n\n" + warnings.join("\n"));
  }
}

// 檢查連續上班
function checkContinuousWork() {
  const warnings = [];
  const employeeWorkDays = {};

  // 初始化員工工作天數記錄
  employees.forEach((emp) => {
    employeeWorkDays[emp.id] = [];
  });

  // 記錄每個員工的工作日期
  for (const date in scheduleData) {
    const daySchedule = scheduleData[date];

    if (daySchedule.day) {
      employeeWorkDays[daySchedule.day.id].push(new Date(date));
    }

    if (daySchedule.night) {
      employeeWorkDays[daySchedule.night.id].push(new Date(date));
    }

    if (daySchedule.short) {
      employeeWorkDays[daySchedule.short.id].push(new Date(date));
    }
  }

  // 檢查每個員工的連續工作天數
  for (const empId in employeeWorkDays) {
    const workDays = employeeWorkDays[empId].sort((a, b) => a - b);

    if (workDays.length === 0) continue;

    let consecutiveDays = 1;
    let currentStreak = 1;

    for (let i = 1; i < workDays.length; i++) {
      const prevDate = workDays[i - 1];
      const currentDate = workDays[i];

      // 計算兩天之間的時間差 (以天為單位)
      const timeDiff = currentDate.getTime() - prevDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24);

      if (dayDiff === 1) {
        // 連續工作
        currentStreak++;
        consecutiveDays = Math.max(consecutiveDays, currentStreak);
      } else {
        // 中斷連續工作
        currentStreak = 1;
      }
    }

    if (consecutiveDays > 5) {
      const employee = employees.find((emp) => emp.id === empId);
      warnings.push(`${employee.name} 連續工作 ${consecutiveDays} 天`);
    }
  }

  // 顯示檢查結果
  if (warnings.length === 0) {
    alert("連續上班檢查通過！沒有員工連續工作超過5天。");
  } else {
    alert("連續上班檢查發現以下問題：\n\n" + warnings.join("\n"));
  }
}

// 匯出班表圖片
function exportScheduleImage() {
  const scheduleTable = document.getElementById("schedule-table");

  html2canvas(scheduleTable).then((canvas) => {
    // 創建下載連結
    const link = document.createElement("a");
    link.download = `${currentYear}年${currentMonth + 1}月排班表.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
}

// 儲存班表
function saveSchedule() {
  const key = `schedule_${currentYear}_${currentMonth + 1}`;
  localStorage.setItem(key, JSON.stringify(scheduleData));

  // 添加到歷史紀錄
  const historyEntry = {
    date: new Date().toISOString(),
    year: currentYear,
    month: currentMonth + 1,
    action: "儲存",
    data: scheduleData,
  };

  historyData.push(historyEntry);
  localStorage.setItem("historyData", JSON.stringify(historyData));

  // 更新歷史紀錄顯示
  renderHistory();

  alert("班表已儲存！");
}

// 載入班表
function loadSchedule() {
  const key = `schedule_${currentYear}_${currentMonth + 1}`;
  const savedSchedule = localStorage.getItem(key);

  if (savedSchedule) {
    scheduleData = JSON.parse(savedSchedule);
    generateSchedule();
    alert("班表已載入！");
  } else {
    alert("找不到該月份的班表資料！");
  }
}

// 更新統計資訊
function updateStats() {
  const statsBody = document.getElementById("stats-body");
  statsBody.innerHTML = "";

  // 初始化統計資料
  const stats = {};
  employees.forEach((emp) => {
    stats[emp.id] = {
      name: emp.name,
      type: emp.type,
      workDays: 0,
      offDays: 0,
      shiftCount: 0,
      totalHours: 0,
      holidayHours: 0,
    };
  });

  // 計算統計資料
  for (const date in scheduleData) {
    const daySchedule = scheduleData[date];
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;
    const isNationalHoliday = holidays.some((h) => h.date === date);

    // 檢查是否有調整營業時段
    const adjustedHour = adjustedHours.find((a) => a.date === date);

    if (daySchedule.day) {
      const emp = daySchedule.day;
      stats[emp.id].workDays++;
      stats[emp.id].shiftCount++;

      const hours = getShiftHoursNumber("day", adjustedHour, dayOfWeek);
      stats[emp.id].totalHours += hours;

      if (isNationalHoliday) {
        stats[emp.id].holidayHours += hours;
      }
    }

    if (daySchedule.night) {
      const emp = daySchedule.night;
      stats[emp.id].shiftCount++;

      const hours = getShiftHoursNumber("night", adjustedHour, dayOfWeek);
      stats[emp.id].totalHours += hours;

      if (isNationalHoliday) {
        stats[emp.id].holidayHours += hours;
      }
    }

    if (daySchedule.short) {
      const emp = daySchedule.short;
      stats[emp.id].shiftCount++;

      const hours = getShiftHoursNumber("short", adjustedHour, dayOfWeek);
      stats[emp.id].totalHours += hours;

      if (isNationalHoliday) {
        stats[emp.id].holidayHours += hours;
      }
    }
  }

  // 計算休假天數
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDay.getDate();

  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(currentYear, currentMonth, day);
    const dateString = formatDate(currentDate);
    const dayOfWeek = currentDate.getDay();

    // 檢查是否為公休日
    const isClosed = closedDays.some((d) => d.date === dateString);
    if (isClosed) continue;

    employees.forEach((emp) => {
      // 如果員工當天沒有班，且不是固定休息日，且沒有不可上班的限制，則計為休假
      const hasShift =
        (scheduleData[dateString] &&
          scheduleData[dateString].day &&
          scheduleData[dateString].day.id === emp.id) ||
        (scheduleData[dateString] &&
          scheduleData[dateString].night &&
          scheduleData[dateString].night.id === emp.id) ||
        (scheduleData[dateString] &&
          scheduleData[dateString].short &&
          scheduleData[dateString].short.id === emp.id);

      if (
        !hasShift &&
        !emp.fixedDaysOff.includes(dayOfWeek) &&
        !emp.unavailableDates.includes(dateString)
      ) {
        stats[emp.id].offDays++;
      }
    });
  }

  // 顯示統計資料
  for (const empId in stats) {
    const empStats = stats[empId];
    const row = document.createElement("tr");

    row.innerHTML = `
                <td>${empStats.name}</td>
                <td>${
                  empStats.type === "full-time" ? empStats.workDays : "-"
                }</td>
                <td>${
                  empStats.type === "full-time" ? empStats.offDays : "-"
                }</td>
                <td>${
                  empStats.type === "part-time" ? empStats.shiftCount : "-"
                }</td>
                <td>${
                  empStats.type === "part-time" ? empStats.totalHours : "-"
                }</td>
                <td>${
                  empStats.type === "part-time" ? empStats.holidayHours : "-"
                }</td>
            `;

    statsBody.appendChild(row);
  }
}

// 格式化日期為 YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 渲染員工規則設定
function renderEmployeeRules() {
  const employeeRulesContainer = document.getElementById("employee-rules");
  employeeRulesContainer.innerHTML = "";

  employees.forEach((employee, index) => {
    const employeeCard = document.createElement("div");
    employeeCard.className = "card mb-3";

    employeeCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${employee.name} (${employee.id})</h5>
                    <button type="button" class="btn btn-sm btn-danger delete-employee" data-index="${index}">刪除</button>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">員工代號</label>
                                <input type="text" class="form-control employee-id" value="${
                                  employee.id
                                }" data-index="${index}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">員工姓名</label>
                                <input type="text" class="form-control employee-name" value="${
                                  employee.name
                                }" data-index="${index}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">員工類型</label>
                                <select class="form-select employee-type" data-index="${index}">
                                    <option value="full-time" ${
                                      employee.type === "full-time"
                                        ? "selected"
                                        : ""
                                    }>正職</option>
                                    <option value="part-time" ${
                                      employee.type === "part-time"
                                        ? "selected"
                                        : ""
                                    }>兼職</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">偏好班別</label>
                                <div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input preferred-shift" type="checkbox" value="day" ${
                                          employee.preferredShifts.includes(
                                            "day"
                                          )
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">白天班</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input preferred-shift" type="checkbox" value="night" ${
                                          employee.preferredShifts.includes(
                                            "night"
                                          )
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">晚班</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input preferred-shift" type="checkbox" value="short" ${
                                          employee.preferredShifts.includes(
                                            "short"
                                          )
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">短班</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">固定休息日</label>
                                <div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="1" ${
                                          employee.fixedDaysOff.includes(1)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週一</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="2" ${
                                          employee.fixedDaysOff.includes(2)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週二</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="3" ${
                                          employee.fixedDaysOff.includes(3)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週三</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="4" ${
                                          employee.fixedDaysOff.includes(4)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週四</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="5" ${
                                          employee.fixedDaysOff.includes(5)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週五</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="6" ${
                                          employee.fixedDaysOff.includes(6)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週六</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input fixed-day-off" type="checkbox" value="0" ${
                                          employee.fixedDaysOff.includes(0)
                                            ? "checked"
                                            : ""
                                        } data-index="${index}">
                                        <label class="form-check-label">週日</label>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">不可上班日期 (YYYY-MM-DD，多個日期用逗號分隔)</label>
                                <input type="text" class="form-control unavailable-dates" value="${employee.unavailableDates.join(
                                  ", "
                                )}" data-index="${index}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">特定日期可上班 (YYYY-MM-DD，多個日期用逗號分隔)</label>
                                <input type="text" class="form-control available-dates" value="${
                                  employee.availableDates
                                    ? employee.availableDates.join(", ")
                                    : ""
                                }" data-index="${index}">
                            </div>
                        </div>
                    </div>
                </div>
            `;

    employeeRulesContainer.appendChild(employeeCard);
  });

  // 添加刪除員工的事件監聽器
  document.querySelectorAll(".delete-employee").forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      if (confirm(`確定要刪除 ${employees[index].name} 嗎？`)) {
        employees.splice(index, 1);
        renderEmployeeRules();
      }
    });
  });
}

// 新增員工表單
function addEmployeeForm() {
  const newEmployee = {
    id: "NEW",
    name: "新員工",
    type: "part-time",
    fixedDaysOff: [],
    unavailableDates: [],
    preferredShifts: ["day"],
    color: "employee-new",
  };

  employees.push(newEmployee);
  renderEmployeeRules();
}

// 儲存員工規則
function saveEmployeeRules() {
  // 更新員工資料
  document.querySelectorAll(".employee-id").forEach((input) => {
    const index = parseInt(input.getAttribute("data-index"));
    employees[index].id = input.value;
  });

  document.querySelectorAll(".employee-name").forEach((input) => {
    const index = parseInt(input.getAttribute("data-index"));
    employees[index].name = input.value;
  });

  document.querySelectorAll(".employee-type").forEach((select) => {
    const index = parseInt(select.getAttribute("data-index"));
    employees[index].type = select.value;
  });

  document.querySelectorAll(".preferred-shift").forEach((checkbox) => {
    const index = parseInt(checkbox.getAttribute("data-index"));
    const shiftType = checkbox.value;

    if (checkbox.checked) {
      if (!employees[index].preferredShifts.includes(shiftType)) {
        employees[index].preferredShifts.push(shiftType);
      }
    } else {
      employees[index].preferredShifts = employees[
        index
      ].preferredShifts.filter((s) => s !== shiftType);
    }
  });

  document.querySelectorAll(".fixed-day-off").forEach((checkbox) => {
    const index = parseInt(checkbox.getAttribute("data-index"));
    const dayOff = parseInt(checkbox.value);

    if (checkbox.checked) {
      if (!employees[index].fixedDaysOff.includes(dayOff)) {
        employees[index].fixedDaysOff.push(dayOff);
      }
    } else {
      employees[index].fixedDaysOff = employees[index].fixedDaysOff.filter(
        (d) => d !== dayOff
      );
    }
  });

  document.querySelectorAll(".unavailable-dates").forEach((input) => {
    const index = parseInt(input.getAttribute("data-index"));
    employees[index].unavailableDates = input.value
      .split(",")
      .map((date) => date.trim())
      .filter((date) => date !== "");
  });

  document.querySelectorAll(".available-dates").forEach((input) => {
    const index = parseInt(input.getAttribute("data-index"));
    employees[index].availableDates = input.value
      .split(",")
      .map((date) => date.trim())
      .filter((date) => date !== "");
  });

  // 儲存到localStorage
  localStorage.setItem("employees", JSON.stringify(employees));

  alert("員工規則已儲存！");
}

// 渲染特殊日期設定
function renderSpecialDates() {
  renderHolidays();
  renderClosedDays();
  renderAdjustedHours();
}

// 渲染國定假日
function renderHolidays() {
  const holidaysContainer = document.getElementById("holidays-container");
  holidaysContainer.innerHTML = "";

  holidays.forEach((holiday, index) => {
    const holidayItem = document.createElement("div");
    holidayItem.className = "input-group mb-2";

    holidayItem.innerHTML = `
                <input type="date" class="form-control holiday-date" value="${
                  holiday.date
                }">
                <input type="text" class="form-control holiday-name" value="${
                  holiday.name || ""
                }" placeholder="假日名稱">
                <button class="btn btn-outline-danger delete-holiday" type="button" data-index="${index}">刪除</button>
            `;

    holidaysContainer.appendChild(holidayItem);
  });
}

// 渲染公休日
function renderClosedDays() {
  const closedDaysContainer = document.getElementById("closed-days-container");
  closedDaysContainer.innerHTML = "";

  closedDays.forEach((closedDay, index) => {
    const closedDayItem = document.createElement("div");
    closedDayItem.className = "input-group mb-2";

    closedDayItem.innerHTML = `
                <input type="date" class="form-control closed-date" value="${
                  closedDay.date
                }">
                <input type="text" class="form-control closed-reason" value="${
                  closedDay.reason || ""
                }" placeholder="公休原因">
                <button class="btn btn-outline-danger delete-closed-day" type="button" data-index="${index}">刪除</button>
            `;

    closedDaysContainer.appendChild(closedDayItem);
  });
}

// 渲染調整營業時段
function renderAdjustedHours() {
  const adjustedHoursContainer = document.getElementById(
    "adjusted-hours-container"
  );
  adjustedHoursContainer.innerHTML = "";

  adjustedHours.forEach((adjusted, index) => {
    const adjustedItem = document.createElement("div");
    adjustedItem.className = "card mb-3";

    adjustedItem.innerHTML = `
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">日期</label>
                                <input type="date" class="form-control adjusted-date" value="${
                                  adjusted.date
                                }">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">調整類型</label>
                                <select class="form-select adjusted-type">
                                    <option value="early-close" ${
                                      adjusted.type === "early-close"
                                        ? "selected"
                                        : ""
                                    }>提早打烊</option>
                                    <option value="late-open" ${
                                      adjusted.type === "late-open"
                                        ? "selected"
                                        : ""
                                    }>延後開門</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label">描述</label>
                                <input type="text" class="form-control adjusted-description" value="${
                                  adjusted.description || ""
                                }">
                            </div>
                        </div>
                    </div>
                    <div class="row adjusted-details" style="${
                      adjusted.type === "late-open" ? "" : "display: none;"
                    }">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">白天班時間</label>
                                <input type="text" class="form-control adjusted-day-shift" value="${
                                  adjusted.dayShift || ""
                                }" placeholder="例如: 13:00-18:30">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="mb-3">
                                <label class="form-label">白天班時數</label>
                                <input type="number" class="form-control adjusted-day-hours" value="${
                                  adjusted.dayHours || ""
                                }">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="mb-3">
                                <label class="form-label">短班時數</label>
                                <input type="number" class="form-control adjusted-short-hours" value="${
                                  adjusted.shortHours || ""
                                }">
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-outline-danger delete-adjusted-hours" data-index="${index}">刪除</button>
                </div>
            `;

    adjustedHoursContainer.appendChild(adjustedItem);
  });

  // 添加調整類型變更事件
  document.querySelectorAll(".adjusted-type").forEach((select) => {
    select.addEventListener("change", function () {
      const details =
        this.closest(".card-body").querySelector(".adjusted-details");
      if (this.value === "late-open") {
        details.style.display = "block";
      } else {
        details.style.display = "none";
      }
    });
  });

  // 添加刪除事件
  document.querySelectorAll(".delete-adjusted-hours").forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      adjustedHours.splice(index, 1);
      renderAdjustedHours();
    });
  });
}

// 新增國定假日表單
function addHolidayForm() {
  holidays.push({ date: "", name: "" });
  renderHolidays();
}

// 新增公休日表單
function addClosedDayForm() {
  closedDays.push({ date: "", reason: "" });
  renderClosedDays();
}

// 新增調整營業時段表單
function addAdjustedHoursForm() {
  adjustedHours.push({
    date: "",
    type: "early-close",
    description: "",
    dayShift: "",
    dayHours: "",
    shortHours: "",
  });
  renderAdjustedHours();
}

// 儲存特殊日期
function saveSpecialDates() {
  // 更新國定假日
  holidays = [];
  document.querySelectorAll(".holiday-date").forEach((input, index) => {
    const nameInput = document.querySelectorAll(".holiday-name")[index];
    if (input.value) {
      holidays.push({
        date: input.value,
        name: nameInput.value,
      });
    }
  });

  // 更新公休日
  closedDays = [];
  document.querySelectorAll(".closed-date").forEach((input, index) => {
    const reasonInput = document.querySelectorAll(".closed-reason")[index];
    if (input.value) {
      closedDays.push({
        date: input.value,
        reason: reasonInput.value,
      });
    }
  });

  // 更新調整營業時段
  adjustedHours = [];
  document.querySelectorAll(".adjusted-date").forEach((input, index) => {
    const typeSelect = document.querySelectorAll(".adjusted-type")[index];
    const descriptionInput = document.querySelectorAll(".adjusted-description")[
      index
    ];
    const dayShiftInput = document.querySelectorAll(".adjusted-day-shift")[
      index
    ];
    const dayHoursInput = document.querySelectorAll(".adjusted-day-hours")[
      index
    ];
    const shortHoursInput = document.querySelectorAll(".adjusted-short-hours")[
      index
    ];

    if (input.value) {
      const adjusted = {
        date: input.value,
        type: typeSelect.value,
        description: descriptionInput.value,
      };

      if (typeSelect.value === "late-open") {
        adjusted.dayShift = dayShiftInput.value;
        adjusted.dayHours = parseInt(dayHoursInput.value) || 0;
        adjusted.shortHours = parseInt(shortHoursInput.value) || 0;
      }

      adjustedHours.push(adjusted);
    }
  });

  // 儲存到localStorage
  localStorage.setItem("holidays", JSON.stringify(holidays));
  localStorage.setItem("closedDays", JSON.stringify(closedDays));
  localStorage.setItem("adjustedHours", JSON.stringify(adjustedHours));

  alert("特殊日期已儲存！");
}

// 渲染歷史紀錄
function renderHistory() {
  const historyBody = document.getElementById("history-body");
  historyBody.innerHTML = "";

  // 只顯示最近10筆紀錄
  const recentHistory = historyData.slice(-10).reverse();

  recentHistory.forEach((entry) => {
    const row = document.createElement("tr");

    const date = new Date(entry.date);
    const dateString =
      date.toLocaleDateString("zh-TW") +
      " " +
      date.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });

    row.innerHTML = `
                <td>${dateString}</td>
                <td>${entry.year}年${entry.month}月</td>
                <td>系統</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary load-history" data-date="${entry.date}">載入</button>
                </td>
            `;

    historyBody.appendChild(row);
  });

  // 添加載入歷史紀錄的事件
  document.querySelectorAll(".load-history").forEach((button) => {
    button.addEventListener("click", function () {
      const date = this.getAttribute("data-date");
      const historyEntry = historyData.find((entry) => entry.date === date);

      if (historyEntry) {
        scheduleData = historyEntry.data;
        currentYear = historyEntry.year;
        currentMonth = historyEntry.month - 1;

        // 更新選擇器
        document.getElementById("year-select").value = currentYear;
        document.getElementById("month-select").value = currentMonth;

        generateSchedule();
        alert("歷史紀錄已載入！");
      }
    });
  });
}

// 開啟編輯班表模態框
function openEditShiftModal(date, shiftType) {
  const modal = new bootstrap.Modal(document.getElementById("editShiftModal"));
  const editDate = document.getElementById("edit-date");
  const editShiftType = document.getElementById("edit-shift-type");
  const editEmployee = document.getElementById("edit-employee");

  // 設定日期和班別
  editDate.value = date;
  editShiftType.value = shiftType;

  // 清空員工選項
  editEmployee.innerHTML = "";

  // 添加員工選項
  const currentDate = new Date(date);
  const dayOfWeek = currentDate.getDay();
  const isHoliday = dayOfWeek === 0 || dayOfWeek === 6;

  // 過濾可上該班別的員工
  let availableEmployees = employees.filter((emp) => {
    // 檢查班別限制
    if (shiftType === "day" && !emp.preferredShifts.includes("day"))
      return false;
    if (shiftType === "night" && !emp.preferredShifts.includes("night"))
      return false;
    if (shiftType === "short" && !emp.preferredShifts.includes("short"))
      return false;

    // 正職只能上白天班
    if (emp.type === "full-time" && shiftType !== "day") return false;

    // 檢查固定休息日
    if (emp.fixedDaysOff.includes(dayOfWeek)) return false;

    // 檢查不可上班日期
    if (emp.unavailableDates.includes(date)) return false;

    // 檢查特殊日期限制
    if (
      emp.specialDates &&
      emp.specialDates[date] &&
      emp.specialDates[date] !== shiftType
    ) {
      return false;
    }

    return true;
  });

  // 添加"無"選項
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "無";
  editEmployee.appendChild(noneOption);

  // 添加員工選項
  availableEmployees.forEach((emp) => {
    const option = document.createElement("option");
    option.value = emp.id;
    option.textContent = `${emp.name} (${emp.id})`;

    // 如果當前已經排了該員工，則預設選中
    if (
      scheduleData[date] &&
      scheduleData[date][shiftType] &&
      scheduleData[date][shiftType].id === emp.id
    ) {
      option.selected = true;
    }

    editEmployee.appendChild(option);
  });

  // 顯示模態框
  modal.show();
}

// 儲存編輯的班表
function saveEditedShift() {
  const date = document.getElementById("edit-date").value;
  const shiftType = document.getElementById("edit-shift-type").value;
  const employeeId = document.getElementById("edit-employee").value;

  // 確保scheduleData[date]存在
  if (!scheduleData[date]) {
    scheduleData[date] = {};
  }

  // 更新班表
  if (employeeId) {
    const employee = employees.find((emp) => emp.id === employeeId);
    scheduleData[date][shiftType] = employee;
  } else {
    // 如果選擇"無"，則移除該班別
    delete scheduleData[date][shiftType];
  }

  // 關閉模態框
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editShiftModal")
  );
  modal.hide();

  // 重新生成排班表
  generateSchedule();
}
