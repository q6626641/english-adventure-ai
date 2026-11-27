import type { Lesson } from './lessons';

type Phrase = [english: string, chinese: string];
type Scene = {
  id: string;
  category: Lesson['category'];
  title: string;
  task: string;
  phrases: [Phrase, Phrase, Phrase];
  choice: [prompt: string, answer: Phrase, ...alternatives: Phrase[]];
  spelling: Phrase;
};

const scenes: Scene[] = [
  { id: 'greetings', category: '日常口语', title: '第一次见面', task: '打招呼并自然地结束一次见面。',
    phrases: [['Nice to meet you.', '很高兴见到你。'], ['See you later.', '回头见。'], ['Have a good day.', '祝你今天愉快。']],
    choice: ['初次见面时怎么问候？', ['Nice to meet you.', '很高兴见到你。'], ['See you later.', '回头见。'], ['Good night.', '晚安。']], spelling: ['later', '稍后'] },
  { id: 'restaurant', category: '日常口语', title: '餐厅里买单', task: '请服务员拿账单，并询问能否刷卡。',
    phrases: [['Could we get the bill, please?', '请给我们账单好吗？'], ['Can I pay by card?', '我可以刷卡吗？'], ['The service charge is included.', '已包含服务费。']],
    choice: ['想让服务员拿账单，你会怎么说？', ['Could we get the bill, please?', '请给我们账单好吗？'], ['Could we get a table, please?', '能给我们安排一张桌子吗？'], ['Is the kitchen still open?', '厨房还营业吗？']], spelling: ['bill', '账单'] },
  { id: 'pharmacy', category: '日常口语', title: '在药店询问', task: '描述不舒服的地方，向店员确认说明。',
    phrases: [['I have a sore throat.', '我喉咙痛。'], ['Does this contain sugar?', '这个含糖吗？'], ['Could I read the instructions?', '我可以看看说明吗？']],
    choice: ['怎么表示喉咙痛？', ['I have a sore throat.', '我喉咙痛。'], ['I have a runny nose.', '我流鼻涕。'], ['My back hurts.', '我背疼。']], spelling: ['throat', '喉咙'] },
  { id: 'airport', category: '日常口语', title: '找到登机口', task: '核对登机口、开始登机时间和行李。',
    phrases: [['Where is gate twelve?', '12 号登机口在哪里？'], ['When does boarding start?', '什么时候开始登机？'], ['I only have carry-on luggage.', '我只有随身行李。']],
    choice: ['哪句话能问开始登机的时间？', ['When does boarding start?', '什么时候开始登机？'], ['When does the flight land?', '航班什么时候降落？'], ['Where can I collect my luggage?', '我在哪里取行李？']], spelling: ['boarding', '登机'] },
  { id: 'ride', category: '日常口语', title: '搭出租车', task: '说明目的地，并请司机在指定位置停车。',
    phrases: [['Could you take me to the station?', '能送我去车站吗？'], ['Please stop by the entrance.', '请在入口旁停车。'], ['Is this the fastest route?', '这是最快的路线吗？']],
    choice: ['想请司机在入口旁停车，你会说什么？', ['Please stop by the entrance.', '请在入口旁停车。'], ['Please wait outside the station.', '请在车站外等候。'], ['Please turn at the next light.', '请在下一个红绿灯处转弯。']], spelling: ['entrance', '入口'] },
  { id: 'trade-show', category: '外贸英语', title: '展会接待买家', task: '邀请客户体验展品并交换联系方式。',
    phrases: [['Would you like to see a sample?', '您想看看样品吗？'], ['May I have your business card?', '能给我一张您的名片吗？'], ['Our booth is near the entrance.', '我们的展位在入口附近。']],
    choice: ['想交换名片，先怎么问？', ['May I have your business card?', '能给我一张您的名片吗？'], ['Could you send a purchase order?', '您能发一份采购订单吗？'], ['Would you like a larger carton?', '您想要一个更大的纸箱吗？']], spelling: ['booth', '展位'] },
  { id: 'towels', category: '外贸英语', title: '介绍超细纤维毛巾', task: '介绍材质、吸水性和克重。',
    phrases: [['These towels are made of microfiber.', '这些毛巾由超细纤维制成。'], ['The fabric is highly absorbent.', '这款面料吸水性很强。'], ['It weighs three hundred grams per square meter.', '它每平方米重三百克。']],
    choice: ['客户问吸水性，哪一句最切题？', ['The fabric is highly absorbent.', '这款面料吸水性很强。'], ['We pack twelve pieces per carton.', '每箱装十二件。'], ['The label is on the back.', '标签在背面。']], spelling: ['microfiber', '超细纤维'] },
  { id: 'price-break', category: '外贸英语', title: '讨论数量阶梯价', task: '在增加订量前先确认单价和折扣。',
    phrases: [['Is there a discount for larger orders?', '订单量更大时有折扣吗？'], ['The price depends on the quantity.', '价格取决于数量。'], ['Please quote for five thousand pieces.', '请按五千件报价。']],
    choice: ['哪句话询问大订单有没有折扣？', ['Is there a discount for larger orders?', '订单量更大时有折扣吗？'], ['Is freight included in the price?', '价格包含运费吗？'], ['Can we split the shipment?', '可以分批发货吗？']], spelling: ['discount', '折扣'] },
  { id: 'packing', category: '外贸英语', title: '确认外箱与包装', task: '核实每箱数量、箱规和货运唛头。',
    phrases: [['How many pieces are in each carton?', '每个外箱装多少件？'], ['Please confirm the carton dimensions.', '请确认外箱尺寸。'], ['We can print your shipping marks.', '我们可以印上你方的货运唛头。']],
    choice: ['客户需要外箱长宽高，你会说什么？', ['Please confirm the carton dimensions.', '请确认外箱尺寸。'], ['Please confirm the sample color.', '请确认样品颜色。'], ['Please confirm the payment date.', '请确认付款日期。']], spelling: ['carton', '外箱'] },
  { id: 'documents', category: '外贸英语', title: '核对出货文件', task: '跟进装箱单、商业发票和提单草稿。',
    phrases: [['Please send the packing list.', '请发送装箱单。'], ['We need the commercial invoice.', '我们需要商业发票。'], ['Could you check the draft bill of lading?', '请核对提单草稿好吗？']],
    choice: ['怎么向同事索要装箱单？', ['Please send the packing list.', '请发送装箱单。'], ['Please send the product catalog.', '请发送产品目录。'], ['Please send the color chart.', '请发送色卡。']], spelling: ['invoice', '发票'] },
  { id: 'prepositions', category: '英语语法', title: '用 at、on、in 约时间', task: '在同一组场景里区分几点、星期几和月份。',
    phrases: [['The meeting starts at nine.', '会议九点开始。'], ['The samples arrive on Monday.', '样品星期一到达。'], ['The fair opens in April.', '展会四月开幕。']],
    choice: ['说“会议在星期五举行”时，选哪个介词？', ['on', '用于某一天'], ['at', '用于时刻'], ['in', '用于月份等较长时间']], spelling: ['Monday', '星期一'] },
  { id: 'much-many', category: '英语语法', title: '区分 how much 和 how many', task: '询问可数物品数量和不可数名词的量。',
    phrases: [['How many boxes do you need?', '你需要多少箱？'], ['How much water is left?', '还剩多少水？'], ['There are only a few boxes left.', '只剩几箱了。']],
    choice: ['用不可数名词 time 来问“还剩多少时间”，选哪一句？', ['How much time is left?', '还剩多少时间？'], ['How many minutes are left?', '还剩多少分钟？'], ['What time does it start?', '什么时候开始？']], spelling: ['water', '水'] },
  { id: 'hotel-change', category: '综合实战', title: '实战 · 修改酒店预订', task: '根据前台反馈确认可用日期和改期费用。',
    phrases: [['I would like to change my reservation.', '我想修改预订。'], ['Is the room available on Friday?', '星期五有房吗？'], ['Is there an extra charge?', '需要额外收费吗？']],
    choice: ['改到周五之前，如何确认有房？', ['Is the room available on Friday?', '星期五有房吗？'], ['Can I leave my bags here?', '我可以把行李放在这里吗？'], ['Is breakfast served on this floor?', '早餐在这一层供应吗？']], spelling: ['reservation', '预订'] },
  { id: 'delay-call', category: '综合实战', title: '实战 · 通知交货延期', task: '向买家解释延期，给出新日期并确认是否接受。',
    phrases: [['The shipment has been delayed.', '这批货物延迟了。'], ['We can ship next Thursday.', '我们可以下星期四发货。'], ['Would that date work for you?', '这个日期您方便吗？']],
    choice: ['给出新日期后，怎么确认买家是否接受？', ['Would that date work for you?', '这个日期您方便吗？'], ['Could you confirm your address?', '请确认您的地址好吗？'], ['Have you received our invoice?', '您收到我们的发票了吗？']], spelling: ['shipment', '这批货；发货'] },
  { id: 'web-settings', category: '网站英语', title: '设置与保存', task: '更改语言前，先找到设置和保存按钮。',
    phrases: [["Settings","设置"],["Language","语言"],["Save changes","保存更改"]],
    choice: ["想调整网站偏好，应该打开哪个菜单？",["Settings","设置"],["Language","语言"],["Save changes","保存更改"]], spelling: ["settings","设置（复数菜单名）"] },
  { id: 'web-network', category: '网站英语', title: '网络状态与连接', task: '查看网络状态，识别连接和断开连接两个操作。',
    phrases: [["Network status","网络状态"],["Connect","连接"],["Disconnect","断开连接"]],
    choice: ["要查看当前网络是否在线，应选哪一项？",["Network status","网络状态"],["Connect","连接"],["Disconnect","断开连接"]], spelling: ["connect","连接（动词）"] },
  { id: 'web-query', category: '网站英语', title: '服务与查询', task: '从服务列表找到查询入口，再读懂查询结果。',
    phrases: [["Services","服务"],["Run query","执行查询"],["Query results","查询结果"]],
    choice: ["在哪个菜单可以查看可用服务？",["Services","服务"],["Run query","执行查询"],["Query results","查询结果"]], spelling: ["query","查询"] },
  { id: 'web-rules', category: '网站英语', title: '规则与日志', task: '分清管理规则、查看日志和筛选记录的入口。',
    phrases: [["Rules","规则"],["View logs","查看日志"],["Filter records","筛选记录"]],
    choice: ["想修改一条已有规则，先进入哪个菜单？",["Rules","规则"],["View logs","查看日志"],["Filter records","筛选记录"]], spelling: ["logs","日志（复数）"] },
  { id: 'web-test', category: '网站英语', title: '连接测试与重试', task: '运行连接测试，读懂结果，找到重试按钮。',
    phrases: [["Test connection","测试连接"],["Test passed","测试通过"],["Retry","重试"]],
    choice: ["要检查连接能否正常工作，选哪个按钮？",["Test connection","测试连接"],["Test passed","测试通过"],["Retry","重试"]], spelling: ["test","测试"] },
];

export const sceneLessons: (Lesson & { translations: Phrase[] })[] = scenes.map((scene) => {
  const { id, category, title, task, phrases, spelling } = scene;
  const [prompt, answer, ...alternatives] = scene.choice;
  return {
    id, category, title, description: task, phrases,
    exercises: [
      { kind: 'choice', prompt, answer: answer[0], options: [answer[0], ...alternatives.map(([text]) => text)] },
      { kind: 'listen', prompt: '听录音，选择你听到的内容。', audio: phrases[1][0], answer: phrases[1][0], options: phrases.map(([text]) => text) },
      { kind: 'spell', prompt: '请拼写英文：' + spelling[1], answer: spelling[0] },
      { kind: 'speak', prompt: '听一遍，再用英文跟读。', answer: phrases[2][0] },
    ],
    translations: [answer, ...alternatives, spelling],
  };
});
