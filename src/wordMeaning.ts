// Alternatives are checked against the course's own sentence translation.
const glossary = new Map<string, string[]>();
for (const line of `a 一个/一份/一杯/一件/一张/不定冠词
absorbent 吸水性/吸水
address 地址
after 后
already 已经/已
amount 金额
an 一个/不定冠词
and 然后/和
april 四月
are 是/系动词
arrive 到达/到
at 在/表示时间或地点
attached 附上
available 有房/可用
back 背面/背
bags 行李
balance 尾款
been 完成时助动词
before 前
bill 账单
blue 蓝色
boarding 登机
booth 展位
box,boxes 箱
breakfast 早餐
bus 公交车/公共汽车
business 商务
by 通过
can,could 可以/能够/能
cannot,can't 不能/不会
card 卡
carry-on 随身
carton 外箱/纸箱/箱
catalog 目录
change 改期/修改/改
charge 费用/收费
chart 图表
cheaper 更便宜/便宜
check 核对/确认/查看
checkout 退房
cif CIF/成本加保险费加运费
coffee 咖啡
collect 取
color 颜色/色
commercial 商业
composition 成分
confirm,confirmed 确认
contain 含
cost 价格/花费
cotton 棉
date 日期
day 一天/天
defect,defects 瑕疵
delay,delayed 延期/延迟/延误
delivery 交货
depends 取决于
deposit 预付款/定金
destination 目的
did 表示过去的助动词
dimensions 尺寸
discount 折扣
do,does 疑问句助动词
draft 草稿
drink 喝
due 应付/须/到期
each 每个/每
elevator 电梯
email 邮件
english 英语/英文
entrance 入口
estimated 预计
every 每
exchange 换
expect 预计
extra 额外
fabric 面料/布
fair 展会
far 远
faster 更快/快
fastest 最快
few 几
finish,finished,finishing 完成/写完
five 五
flight 航班
floor 层
fob FOB/船上交货
for 为/用于
found 发现
free 免费
freight 运费
friday,fridays 星期五/周五
from 来自/从/离
gate 登机口
get 得到/拿
go,going,went 去
good 好
grams 克
guangzhou 广州
hangzhou 杭州
has,have 有/完成时助动词
heavier 更重/重
heaviest 最重
heavy 重
help 帮
here 这里
highly 很强/非常
home 家
how 如何/怎么
hundred 百
hurts 疼
i,i'm,i've 我
if 如果/如
in 在/用
include,included 包含/包括
inspection 检验
instructions 说明
insurance 保险
invoice 发票
is 是/系动词
it 它
item,items 商品
i'd 我想
kitchen 厨房
know 知道
label 标签
lading 装载
land 降落
larger 更大/大一点/大
late 迟到
later 稍后/回头
latte 拿铁
lead 提前
leave 放/离开
left 剩下/还剩/左
let 让
li 李
light 红绿灯/灯
like 想/喜欢
linen 亚麻
list 单/清单
luggage 行李
made 制成
many 多少/许多
marks 唛头
may 可以/能
me 我
meet 见到
meeting 会议
menu 菜单
meter 米
method 方式
microfiber 超细纤维
minimum 最低
minutes 分钟
monday 星期一/周一
morning 早上
much 多少
my 我的/我
near 附近/旁
nearest 最近
need,require 需要/要求
negotiable 可以商量/可协商
next 下一个/下
nice 高兴/愉快
night 晚上
nine 九
no 没有/无
nose 鼻子
now 现在
of 的/表示所属
office 办公室
on 在/介词
one 一
only 只有/只
open,opens 营业/开幕/开放
or 还是/或
order,orders 订单/订量
our 我们的
outside 外
pack 装
packing 装箱/包装
paid 已支付/支付
pay 支付/付款
payment 付款/货款
per 每
percent 百分之
photos 照片
pieces 件
please 请/谢谢
port 港
price 单价/价格/报价
print 印
product 产品
production 生产
purchase 采购
quantity 数量/订量
quotation 报价单/报价
quote 报价
read 看/阅读
receipt 收据
received 收到
refund 退款
remaining 剩余
replacements 替换品
report 报告
reservation 预订
right 右
room 房间/房
route 路线
runny 流
sales 销售
sample,samples 样品/布样
schedule 安排/计划
see 看看/看/见
send,sent 发/寄
served 供应
service 服务
several 几
shanghai 上海
she 她
ship,shipped 发货/运/发
shipment 这批货物/这批货/货物/发货
shipping 货运/发货
sing 唱歌
sit 坐
size 尺码
slower 更慢/慢
smaller 小一点/更小
sore 痛
sorry 抱歉
speak,speaking,speaks 说
split 分批/分开
square 平方
start,starts 开始
station 车站
still 还
stop 停车/停
straight 直
sugar 糖
sundays 星期天/星期日
swim 游泳
table 桌子
take 送/带
terms 条件
than 比
that 那个/那个日期
the 定冠词
there 有/那里
these 这些
thirty 三十
this 这
thousand 千
three 三
throat 喉咙
thursday 星期四
time 时间
to 到/向/不定式标记
tomorrow 明天
total 总
towels 毛巾
train 火车
try 尝试
turn 转
twelve 十二/12
under 以…名义/在…下
unit 单位
us 我们
wait 等候
water 水
we 我们
week 周
weighs 重
weight 重量
what 什么
when 什么时候
where 哪里
wool 羊毛
work,working,works 工作/上班
would 表示委婉请求
yesterday 昨天
yet 已经/还
you 您/你
your 您的/你方的/你们的/你的
to go 外带
for here 在这里喝
how much 多少钱/多少
how many 多少
lead time 交货周期
order quantity 起订量
unit price 单价
on time 准点
go straight 直走
turn left 左转
turn right 右转
check in 办理入住
by card 刷卡
business card 名片
bill of lading 提单
packing list 装箱单
color chart 色卡
free of charge 免费
shipping marks 货运唛头
runny nose 流鼻涕
sore throat 喉咙痛
see you later 回头见
good night 晚安
one hundred percent 百分之百
would like 想
i'd like 我想
let us know 告知我们
on schedule 按计划
square meter 平方米
a few 几
work for you 您方便
try this on 试穿这件
how much time 多少时间
from home 在家
next week 下周
next thursday 下星期四
this week 本周`.split('\n')) {
  const separator = line.lastIndexOf(' ');
  const meanings = line.slice(separator + 1).split('/');
  for (const term of line.slice(0, separator).split(',')) glossary.set(term, meanings);
}
const words = /[A-Za-z]+(?:[’'-][A-Za-z]+)*/g;
export function wordMeaning(text: string, index: number, chinese: string) {
  const tokens = Array.from(text.matchAll(words));
  const word = tokens[index]?.[0].toLowerCase().replaceAll('’', "'");
  if (!word) return;
  for (let size = Math.min(4, tokens.length); size > 0; size--) {
    for (let start = Math.max(0, index - size + 1); start <= index && start + size <= tokens.length; start++) {
      const last = tokens[start + size - 1];
      const term = text.slice(tokens[start].index, last.index! + last[0].length).toLowerCase().replaceAll('’', "'");
      const match = glossary.get(term)?.find(value => chinese.includes(value));
      if (match) return { meaning: match, matched: true };
    }
  }
  if (tokens.length === 1 && chinese) return { meaning: chinese, matched: true };
  const meaning = glossary.get(word)?.[0];
  if (meaning) return { meaning, matched: false };
}
