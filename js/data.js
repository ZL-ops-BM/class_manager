// 内置示例班级数据（首次启动时写入 localStorage）
export const seedData = {
  classInfo: { name: '高二（3）班', teacher: '王老师', motto: '厚德博学 · 笃行致远' },

  students: [
    { id: 's1', name: '陈宇航', no: '20230301', gender: '男', phone: '13800000001', parentPhone: '13900000001', role: '班长', note: '组织能力强，学习自觉。' },
    { id: 's2', name: '林思彤', no: '20230302', gender: '女', phone: '13800000002', parentPhone: '13900000002', role: '学习委员', note: '成绩优异，乐于帮助同学。' },
    { id: 's3', name: '张子昂', no: '20230303', gender: '男', phone: '13800000003', parentPhone: '13900000003', role: '体育委员', note: '篮球队主力，课堂纪律需加强。' },
    { id: 's4', name: '王雨桐', no: '20230304', gender: '女', phone: '13800000004', parentPhone: '13900000004', role: '文艺委员', note: '善于组织文艺活动。' },
    { id: 's5', name: '刘一鸣', no: '20230305', gender: '男', phone: '13800000005', parentPhone: '13900000005', role: '', note: '近期数学进步明显。' },
    { id: 's6', name: '赵梦琪', no: '20230306', gender: '女', phone: '13800000006', parentPhone: '13900000006', role: '生活委员', note: '' },
    { id: 's7', name: '孙浩然', no: '20230307', gender: '男', phone: '13800000007', parentPhone: '13900000007', role: '', note: '住校生，性格内向，多关注。' },
    { id: 's8', name: '周欣怡', no: '20230308', gender: '女', phone: '13800000008', parentPhone: '13900000008', role: '团支书', note: '' },
    { id: 's9', name: '吴俊杰', no: '20230309', gender: '男', phone: '13800000009', parentPhone: '13900000009', role: '', note: '作业偶有拖欠，已约谈家长。' },
    { id: 's10', name: '郑晓萌', no: '20230310', gender: '女', phone: '13800000010', parentPhone: '13900000010', role: '', note: '' }
  ],

  // 考勤: { 'YYYY-MM-DD': { s1: 'present'|'late'|'leave'|'absent', ... } }
  attendance: {},

  // 请假记录
  leaves: [
    { id: 'l1', studentId: 's7', date: '2026-07-27', reason: '感冒发烧，家长已请假', days: 1 }
  ],

  // 积分规则
  pointRules: [
    { id: 'r1', name: '作业优秀', type: 'add', score: 2 },
    { id: 'r2', name: '课堂积极发言', type: 'add', score: 1 },
    { id: 'r3', name: '乐于助人', type: 'add', score: 2 },
    { id: 'r4', name: '卫生表现好', type: 'add', score: 1 },
    { id: 'r5', name: '竞赛获奖', type: 'add', score: 5 },
    { id: 'r6', name: '迟到', type: 'sub', score: 1 },
    { id: 'r7', name: '作业未交', type: 'sub', score: 2 },
    { id: 'r8', name: '课堂违纪', type: 'sub', score: 2 }
  ],

  // 积分流水: { id, studentId, ruleName, delta, note, time }
  pointLogs: [
    { id: 'p1', studentId: 's2', ruleName: '作业优秀', delta: 2, note: '数学作业全对', time: '2026-07-27 08:30' },
    { id: 'p2', studentId: 's1', ruleName: '乐于助人', delta: 2, note: '帮助同学讲题', time: '2026-07-27 10:12' },
    { id: 'p3', studentId: 's9', ruleName: '作业未交', delta: -2, note: '英语作业未交', time: '2026-07-27 14:05' },
    { id: 'p4', studentId: 's4', ruleName: '课堂积极发言', delta: 1, note: '', time: '2026-07-28 09:20' },
    { id: 'p5', studentId: 's2', ruleName: '竞赛获奖', delta: 5, note: '市数学竞赛二等奖', time: '2026-07-28 15:40' },
    { id: 'p6', studentId: 's3', ruleName: '迟到', delta: -1, note: '早自习迟到', time: '2026-07-28 07:35' }
  ],

  // 考试: { id, name, date, subjects: [], scores: { sid: { 语文: 100, ... } } }
  exams: [
    {
      id: 'e1', name: '期末考试', date: '2026-07-05',
      subjects: ['语文', '数学', '英语', '物理', '化学'],
      scores: {
        s1: { 语文: 112, 数学: 128, 英语: 118, 物理: 82, 化学: 76 },
        s2: { 语文: 121, 数学: 135, 英语: 129, 物理: 88, 化学: 85 },
        s3: { 语文: 98, 数学: 102, 英语: 95, 物理: 70, 化学: 62 },
        s4: { 语文: 116, 数学: 108, 英语: 122, 物理: 71, 化学: 74 },
        s5: { 语文: 105, 数学: 121, 英语: 101, 物理: 78, 化学: 72 },
        s6: { 语文: 109, 数学: 99, 英语: 112, 物理: 65, 化学: 68 },
        s7: { 语文: 101, 数学: 115, 英语: 96, 物理: 80, 化学: 75 },
        s8: { 语文: 118, 数学: 112, 英语: 125, 物理: 76, 化学: 79 },
        s9: { 语文: 92, 数学: 88, 英语: 84, 物理: 58, 化学: 55 },
        s10: { 语文: 110, 数学: 106, 英语: 117, 物理: 72, 化学: 70 }
      }
    },
    {
      id: 'e2', name: '七月月考', date: '2026-07-25',
      subjects: ['语文', '数学', '英语', '物理', '化学'],
      scores: {
        s1: { 语文: 115, 数学: 125, 英语: 120, 物理: 85, 化学: 78 },
        s2: { 语文: 123, 数学: 138, 英语: 131, 物理: 90, 化学: 88 },
        s3: { 语文: 100, 数学: 108, 英语: 92, 物理: 74, 化学: 66 },
        s4: { 语文: 118, 数学: 111, 英语: 124, 物理: 73, 化学: 76 },
        s5: { 语文: 108, 数学: 126, 英语: 104, 物理: 82, 化学: 75 },
        s6: { 语文: 111, 数学: 103, 英语: 114, 物理: 68, 化学: 70 },
        s7: { 语文: 104, 数学: 118, 英语: 99, 物理: 83, 化学: 77 },
        s8: { 语文: 120, 数学: 115, 英语: 127, 物理: 79, 化学: 81 },
        s9: { 语文: 95, 数学: 92, 英语: 88, 物理: 62, 化学: 58 },
        s10: { 语文: 112, 数学: 109, 英语: 119, 物理: 75, 化学: 72 }
      }
    }
  ],

  // 值日排班: 每天一组
  duty: {
    groups: [
      { day: '周一', members: ['s1', 's5', 's9'] },
      { day: '周二', members: ['s2', 's6', 's10'] },
      { day: '周三', members: ['s3', 's7'] },
      { day: '周四', members: ['s4', 's8'] },
      { day: '周五', members: ['s1', 's2', 's3'] }
    ]
  },

  // 座位表 8排8列（2-4-2：左2列 / 过道 / 中4列 / 过道 / 右2列）
  seating: {
    rows: 8, cols: 8,
    map: {
      '0-0': 's9', '0-1': 's5', '0-2': 's2', '0-3': 's8', '0-4': 's10',
      '1-0': 's3', '1-1': 's1', '1-2': 's4', '1-3': 's6', '1-4': 's7'
    }
  },

  // 班务备忘
  memos: [
    { id: 'm1', text: '周五班会：期末总结与暑期安全教育', done: false, time: '2026-07-27 20:00' },
    { id: 'm2', text: '联系孙浩然家长，了解身体恢复情况', done: false, time: '2026-07-28 08:10' },
    { id: 'm3', text: '收齐社会实践活动回执单', done: true, time: '2026-07-26 16:30' }
  ]
};
