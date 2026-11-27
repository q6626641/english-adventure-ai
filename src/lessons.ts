import { sceneLessons } from './scenes.ts';

export type Exercise =
  | { kind: 'choice' | 'listen'; prompt: string; answer: string; options: string[]; audio?: string }
  | { kind: 'spell' | 'speak'; prompt: string; answer: string };

export type Lesson = {
  id: string;
  title: string;
  category: '日常口语' | '外贸英语' | '英语语法' | '综合实战' | '网站英语';
  description: string;
  phrases: [string, string][];
  exercises: Exercise[];
};

const choice = (prompt: string, answer: string, ...alternatives: string[]): Exercise =>
  ({ kind: 'choice', prompt, answer, options: [answer, ...alternatives] });
const listen = (audio: string, answer: string, ...alternatives: string[]): Exercise =>
  ({ kind: 'listen', prompt: '听录音，选择你听到的内容。', audio, answer, options: [answer, ...alternatives] });
const spell = (prompt: string, answer: string): Exercise => ({ kind: 'spell', prompt, answer });
const speak = (answer: string): Exercise => ({ kind: 'speak', prompt: '听一遍，再用英文跟读。', answer });

const introductoryLessons: Lesson[] = [
  {
    id: 'coffee', title: '在咖啡店点单', category: '日常口语', description: '用一句礼貌的英文点一杯咖啡。',
    phrases: [['Could I have a latte, please?', '请给我一杯拿铁。'], ['For here or to go?', '在这里喝还是外带？'], ['To go, please.', '外带，谢谢。']],
    exercises: [
      choice('哪一句适合礼貌点单？', 'Could I have a latte, please?', 'Where is the nearest station?', 'Could I see the invoice?'),
      listen('For here or to go?', 'For here or to go?', 'How much does it cost?', 'Do you have a receipt?'),
      spell('拼写「拿铁」。', 'latte'),
      speak('To go, please.'),
    ],
  },
  {
    id: 'directions', title: '问路与出行', category: '日常口语', description: '问路、认方向，找到最近的车站。',
    phrases: [['Where is the nearest station?', '最近的车站在哪里？'], ['Go straight and turn left.', '直走，然后左转。'], ['Is it far from here?', '离这里远吗？']],
    exercises: [
      choice('「离这里远吗？」怎么说？', 'Is it far from here?', 'Is the train on time?', 'Can I sit here?'),
      listen('Go straight and turn left.', 'Go straight and turn left.', 'Go straight and turn right.', 'Turn left at the station.'),
      spell('拼写「车站」。', 'station'),
      speak('Where is the nearest station?'),
    ],
  },
  {
    id: 'inquiry', title: '询盘与报价', category: '外贸英语', description: '开口问价格、起订量和交货时间。',
    phrases: [['Could you send us a quotation?', '能给我们发一份报价吗？'], ['What is your minimum order quantity?', '你们的最低起订量是多少？'], ['What is the lead time?', '交货周期是多久？']],
    exercises: [
      choice('客户问 MOQ，想知道什么？', 'Minimum order quantity', 'Method of payment', 'Estimated delivery date'),
      listen('What is the lead time?', 'What is the lead time?', 'What is the unit price?', 'What is the total weight?'),
      spell('拼写「报价单」。', 'quotation'),
      speak('Could you send us a quotation?'),
    ],
  },
  {
    id: 'shipping', title: 'FOB 与 CIF 报价', category: '外贸英语', description: '读懂海运报价中的运费和保险。',
    phrases: [['Please quote FOB Shanghai.', '请按上海港 FOB 报价。'], ['Does your CIF price include insurance?', '你们的 CIF 报价包含保险吗？'], ['Please confirm the port of destination.', '请确认目的港。']],
    exercises: [
      choice('CIF 的字母 I 代表什么？', 'Insurance', 'Inspection', 'Invoice'),
      listen('Please quote FOB Shanghai.', 'Please quote FOB Shanghai.', 'Please quote CIF Shanghai.', 'Please ship to Shanghai.'),
      spell('拼写「保险」。', 'insurance'),
      speak('Please confirm the port of destination.'),
    ],
  },
  {
    id: 'textile', title: '纺织品与样品', category: '外贸英语', description: '确认面料成分并向供应商索样。',
    phrases: [['Could you send us a fabric sample?', '能给我们寄一份布样吗？'], ['What is the fabric composition?', '这款面料的成分是什么？'], ['It is one hundred percent cotton.', '它是百分之百纯棉。']],
    exercises: [
      choice('「面料成分」怎么说？', 'Fabric composition', 'Shipping schedule', 'Payment terms'),
      listen('It is one hundred percent cotton.', 'It is one hundred percent cotton.', 'It is one hundred percent linen.', 'It is one hundred percent wool.'),
      spell('拼写「样品」。', 'sample'),
      speak('What is the fabric composition?'),
    ],
  },
  {
    id: 'present', title: '一般现在时', category: '英语语法', description: '用正确的动词形式描述日常习惯。',
    phrases: [['I work from home.', '我在家工作。'], ['She works from home.', '她在家工作。'], ['Does she work on Fridays?', '她星期五上班吗？']],
    exercises: [
      choice('She ___ from home every Monday.', 'works', 'work', 'working'),
      listen('Does she work on Fridays?', 'Does she work on Fridays?', 'Did she work on Fridays?', 'Does she work on Sundays?'),
      spell('填空：I ___ coffee every morning.（喝）', 'drink'),
      speak('She works from home.'),
    ],
  },
  {
    id: 'past', title: '一般过去时', category: '英语语法', description: '练习叙述昨天发生的事。',
    phrases: [['We shipped the order yesterday.', '我们昨天发了这笔订单。'], ['I went to the office.', '我去了办公室。'], ['Did you send the email?', '你发那封邮件了吗？']],
    exercises: [
      choice('I ___ to the office yesterday.', 'went', 'go', 'going'),
      listen('Did you send the email?', 'Did you send the email?', 'Do you send the email?', 'Did you read the email?'),
      spell('填空：She ___ the price yesterday.（确认）', 'confirmed'),
      speak('We shipped the order yesterday.'),
    ],
  },
];


const additionalLessons: (Lesson & { translations: [string, string][] })[] = [
  {
    id: 'introductions', title: '开口自我介绍', category: '日常口语', description: '介绍名字、来自哪里，以及自己的工作。',
    phrases: [['Nice to meet you.', '很高兴认识你。'], ['I’m from Hangzhou.', '我来自杭州。'], ['I work in sales.', '我从事销售工作。']],
    exercises: [
      choice('初次见面，怎么说「很高兴认识你」？', 'Nice to meet you.', 'See you tomorrow.', 'I’m sorry I’m late.'),
      listen('I’m from Hangzhou.', 'I’m from Hangzhou.', 'I’m from Guangzhou.', 'I’m going to Hangzhou.'),
      spell('拼写「销售」这个英文单词。', 'sales'),
      speak('I work in sales.'),
    ],
    translations: [
      ['See you tomorrow.', '明天见。'], ['I’m sorry I’m late.', '抱歉，我迟到了。'],
      ['I’m from Guangzhou.', '我来自广州。'], ['I’m going to Hangzhou.', '我要去杭州。'], ['sales', '销售'],
    ],
  },
  {
    id: 'hotel', title: '酒店办理入住', category: '日常口语', description: '报预订信息、问供应早餐的时间。',
    phrases: [['I have a reservation under Li.', '我用李这个姓预订了房间。'], ['What time is breakfast?', '早餐几点开始？'], ['Could I check in now?', '我现在可以办理入住吗？']],
    exercises: [
      choice('哪一句是在询问能否办理入住？', 'Could I check in now?', 'Could I have the menu?', 'Could I pay by card?'),
      listen('What time is breakfast?', 'What time is breakfast?', 'What time is checkout?', 'Where is the elevator?'),
      spell('拼写「预订」这个英文名词。', 'reservation'),
      speak('I have a reservation under Li.'),
    ],
    translations: [
      ['Could I have the menu?', '可以给我菜单吗？'], ['Could I pay by card?', '我可以刷卡吗？'],
      ['What time is checkout?', '几点退房？'], ['Where is the elevator?', '电梯在哪里？'], ['reservation', '预订'],
    ],
  },
  {
    id: 'returns', title: '买衣服与退换货', category: '日常口语', description: '询问尺码、试穿、换货和退款。',
    phrases: [['Do you have this in a larger size?', '这件有大一点的尺码吗？'], ['Could I try this on?', '我可以试穿这件吗？'], ['I’d like to exchange this, please.', '我想换一下这件商品。']],
    exercises: [
      choice('想要试穿这件衣服，应该怎么问？', 'Could I try this on?', 'Could I see the invoice?', 'Could I sit here?'),
      listen('Do you have this in a larger size?', 'Do you have this in a larger size?', 'Do you have this in a smaller size?', 'Do you have this in blue?'),
      spell('拼写「退款」这个英文名词。', 'refund'),
      speak('I’d like to exchange this, please.'),
    ],
    translations: [
      ['Could I sit here?', '我可以坐这里吗？'], ['Do you have this in a smaller size?', '这件有小一点的尺码吗？'],
      ['Do you have this in blue?', '这件有蓝色的吗？'], ['refund', '退款'],
    ],
  },
  {
    id: 'payment', title: '确认付款条件', category: '外贸英语', description: '沟通预付款、尾款和分期节点。',
    phrases: [['We require a thirty percent deposit.', '我们要求支付百分之三十的预付款。'], ['The balance is due before shipment.', '尾款须在发货前付清。'], ['Could you confirm the payment terms?', '您能确认一下付款条件吗？']],
    exercises: [
      choice('这单的 balance 指什么？', 'The remaining amount to pay', 'The amount already paid', 'The total shipping weight'),
      listen('The balance is due before shipment.', 'The balance is due before shipment.', 'The balance is due after shipment.', 'The deposit is due before shipment.'),
      spell('拼写「定金、预付款」对应的英文词。', 'deposit'),
      speak('Could you confirm the payment terms?'),
    ],
    translations: [
      ['The remaining amount to pay', '剩余应付金额'], ['The amount already paid', '已支付金额'],
      ['The total shipping weight', '货件总重量'], ['The balance is due after shipment.', '尾款须在发货后支付。'],
      ['The deposit is due before shipment.', '预付款须在发货前支付。'], ['deposit', '定金；预付款'],
    ],
  },
  {
    id: 'production', title: '跟进生产进度', category: '外贸英语', description: '确认预计完工时间，并请供应商通知延期。',
    phrases: [['Is production on schedule?', '生产按计划进行吗？'], ['We expect to finish production next week.', '我们预计下周完成生产。'], ['Please let us know if there is a delay.', '如有延期，请告知我们。']],
    exercises: [
      choice('「生产按计划进行吗？」怎么说？', 'Is production on schedule?', 'Is this price negotiable?', 'Is the sample free of charge?'),
      listen('We expect to finish production next week.', 'We expect to finish production next week.', 'We expect to start production next week.', 'We expect to finish production this week.'),
      spell('拼写「延误、延期」这个英文单词。', 'delay'),
      speak('Please let us know if there is a delay.'),
    ],
    translations: [
      ['Is this price negotiable?', '这个价格可以商量吗？'], ['Is the sample free of charge?', '样品免费吗？'],
      ['We expect to start production next week.', '我们预计下周开始生产。'],
      ['We expect to finish production this week.', '我们预计本周完成生产。'], ['delay', '延误；延期'],
    ],
  },
  {
    id: 'quality', title: '反馈质量问题', category: '外贸英语', description: '报告瑕疵、提供照片并协商补发。',
    phrases: [['We found defects in several items.', '我们发现有几件商品存在瑕疵。'], ['I’ve attached photos of the defects.', '我附上了瑕疵照片。'], ['Could you send replacements?', '您能补发替换品吗？']],
    exercises: [
      choice('哪一句是在请求补发替换品？', 'Could you send replacements?', 'Could you send us a quotation?', 'Could you change the delivery date?'),
      listen('We found defects in several items.', 'We found defects in several items.', 'We found no defects in the items.', 'We found defects in one item.'),
      spell('拼写「瑕疵」这个英文名词的单数形式。', 'defect'),
      speak('I’ve attached photos of the defects.'),
    ],
    translations: [
      ['Could you change the delivery date?', '您能改一下交货日期吗？'],
      ['We found no defects in the items.', '我们没有发现商品有瑕疵。'],
      ['We found defects in one item.', '我们发现有一件商品存在瑕疵。'], ['defect', '瑕疵'],
    ],
  },
  {
    id: 'modal-can', title: '用 can 表示能力', category: '英语语法', description: '练习 can、can’t，以及其后使用动词原形。',
    phrases: [['She can speak English.', '她会说英语。'], ['I can’t swim.', '我不会游泳。'], ['Can you help me?', '你能帮我吗？']],
    exercises: [
      choice('She can ___ English.', 'speak', 'speaks', 'speaking'),
      listen('I can’t swim.', 'I can’t swim.', 'I can swim.', 'I can’t sing.'),
      spell('写出 can 的否定形式，不用缩写。', 'cannot'),
      speak('Can you help me?'),
    ],
    translations: [
      ['She can ___ English.', '她会说英语。'], ['speak', '说'], ['speaks', '说'], ['speaking', '正在说'],
      ['I can swim.', '我会游泳。'], ['I can’t sing.', '我不会唱歌。'], ['cannot', '不能；不会'],
    ],
  },
  {
    id: 'comparatives', title: '用比较级作比较', category: '英语语法', description: '用 than 比较价格、速度和尺寸。',
    phrases: [['This one is cheaper than that one.', '这个比那个便宜。'], ['This box is heavier than that one.', '这个箱子比那个重。'], ['The train is faster than the bus.', '火车比公交车快。']],
    exercises: [
      choice('This box is ___ than that one.', 'heavier', 'heavy', 'heaviest'),
      listen('The train is faster than the bus.', 'The train is faster than the bus.', 'The bus is faster than the train.', 'The train is slower than the bus.'),
      spell('写出 cheap 的比较级。', 'cheaper'),
      speak('This one is cheaper than that one.'),
    ],
    translations: [
      ['This box is ___ than that one.', '这个箱子比那个重。'], ['heavier', '更重的'], ['heavy', '重的'], ['heaviest', '最重的'],
      ['The bus is faster than the train.', '公交车比火车快。'],
      ['The train is slower than the bus.', '火车比公交车慢。'], ['cheaper', '更便宜的'],
    ],
  },
  {
    id: 'present-perfect', title: '用现在完成时说进展', category: '英语语法', description: '用 have 或 has 加过去分词说明事情是否已经完成。',
    phrases: [['I have sent the email.', '我已经发了邮件。'], ['She has finished the report.', '她已经写完了报告。'], ['Have you received the samples yet?', '你已经收到样品了吗？']],
    exercises: [
      choice('She has ___ the report.', 'finished', 'finish', 'finishing'),
      listen('Have you received the samples yet?', 'Have you received the samples yet?', 'Have you received the payment yet?', 'Have you sent the samples yet?'),
      spell('写出 send 的过去分词。', 'sent'),
      speak('I have sent the email.'),
    ],
    translations: [
      ['She has ___ the report.', '她已经写完了报告。'], ['finished', '完成了'], ['finish', '完成'], ['finishing', '正在完成'],
      ['Have you received the payment yet?', '你已经收到货款了吗？'], ['Have you sent the samples yet?', '你已经寄出样品了吗？'],
      ['sent', '已发送'],
    ],
  },
];

export const lessons: Lesson[] = [...introductoryLessons, ...additionalLessons, ...sceneLessons];

const practiceTranslations = new Map<string, string>([
  ...lessons.flatMap(({ phrases }) => phrases),
  ...additionalLessons.flatMap(({ translations }) => translations),
  ...sceneLessons.flatMap(({ translations }) => translations),
  ['Could I see the invoice?', '我可以看看发票吗？'],
  ['How much does it cost?', '多少钱？'],
  ['Do you have a receipt?', '你有收据吗？'],
  ['latte', '拿铁'],
  ['Is the train on time?', '火车准点吗？'],
  ['Can I sit here?', '我可以坐这里吗？'],
  ['Go straight and turn right.', '直走，然后右转。'],
  ['Turn left at the station.', '在车站左转。'],
  ['station', '车站'],
  ['Minimum order quantity', '最低起订量'],
  ['Method of payment', '付款方式'],
  ['Estimated delivery date', '预计交货日期'],
  ['What is the unit price?', '单价是多少？'],
  ['What is the total weight?', '总重量是多少？'],
  ['quotation', '报价单'],
  ['Insurance', '保险'],
  ['Inspection', '检验'],
  ['Invoice', '发票'],
  ['Please quote CIF Shanghai.', '请按上海港 CIF 报价。'],
  ['Please ship to Shanghai.', '请将货物运到上海。'],
  ['insurance', '保险'],
  ['Fabric composition', '面料成分'],
  ['Shipping schedule', '发货安排'],
  ['Payment terms', '付款条件'],
  ['It is one hundred percent linen.', '它是百分之百纯亚麻。'],
  ['It is one hundred percent wool.', '它是百分之百纯羊毛。'],
  ['sample', '样品'],
  ['She ___ from home every Monday.', '她每周一都在家工作。'],
  ['works', '工作'],
  ['work', '工作'],
  ['working', '正在工作'],
  ['Did she work on Fridays?', '她以前星期五上班吗？'],
  ['Does she work on Sundays?', '她星期天上班吗？'],
  ['填空：I ___ coffee every morning.（喝）', '我每天早上喝咖啡。'],
  ['drink', '喝'],
  ['I ___ to the office yesterday.', '我昨天去了办公室。'],
  ['went', '去了'],
  ['go', '去'],
  ['going', '正在去'],
  ['Do you send the email?', '这封邮件是你发的吗？'],
  ['Did you read the email?', '你看了那封邮件吗？'],
  ['填空：She ___ the price yesterday.（确认）', '她昨天确认了价格。'],
  ['confirmed', '确认了'],
]);

export function translatePracticeText(english: string) {
  return practiceTranslations.get(english);
}
