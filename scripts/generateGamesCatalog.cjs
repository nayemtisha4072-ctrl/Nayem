const fs = require('fs');

const ppGames = [
  { code: 'vs20olympx', title: 'Gates of Olympus 1000', bn: 'গেইটস অফ অলিম্পাস ১০০০', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20olympgate', title: 'Gates of Olympus', bn: 'গেইটস অফ অলিম্পাস', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20sweetbonz', title: 'Sweet Bonanza 1000', bn: 'সুইট বোনানজা ১০০০', rtp: '96.53%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20sweetbonanza', title: 'Sweet Bonanza', bn: 'সুইট বোনানজা', rtp: '96.48%', hot: true, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20sugarush', title: 'Sugar Rush 1000', bn: 'সুগার রাশ ১০০০', rtp: '96.53%', hot: true, img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20sugarrush', title: 'Sugar Rush', bn: 'সুগার রাশ', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20starlight', title: 'Starlight Princess 1000', bn: 'স্টারলাইট প্রিন্সেস ১০০০', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { code: 'vswaysdogs', title: 'The Dog House Megaways', bn: 'দ্য ডগ হাউস মেগাওয়েজ', rtp: '96.55%', hot: true, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs10bbhas', title: 'Big Bass Splash', bn: 'বিগ ব্যাস স্প্ল্যাশ', rtp: '96.71%', hot: true, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs10bbext', title: 'Big Bass Bonanza', bn: 'বিগ ব্যাস বোনানজা', rtp: '96.71%', hot: true, img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=80' },
  { code: 'vswaysmadame', title: 'Madame Destiny Megaways', bn: 'মাদাম ডেসটিনি মেগাওয়েজ', rtp: '96.56%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20fruitparty', title: 'Fruit Party', bn: 'ফ্রুট পার্টি', rtp: '96.47%', hot: true, img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20wolfgold', title: 'Wolf Gold', bn: 'উলফ গোল্ড', rtp: '96.01%', hot: true, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20wildwest', title: 'Wild West Gold', bn: 'ওয়াইল্ড ওয়েস্ট গোল্ড', rtp: '96.51%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { code: 'vswaysbufking', title: 'Buffalo King Megaways', bn: 'বাফেলো কিং মেগাওয়েজ', rtp: '96.52%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs50juicyfr', title: 'Juicy Fruits', bn: 'জুসি ফ্রুটস', rtp: '96.52%', hot: false, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' },
  { code: 'vswaysrhino', title: 'Great Rhino Megaways', bn: 'গ্রেট রাইনো মেগাওয়েজ', rtp: '96.58%', hot: false, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20fruitsw', title: 'Gems Bonanza', bn: 'জেমস বোনানজা', rtp: '96.51%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs25chilli', title: 'Chilli Heat', bn: 'চিলি হিট', rtp: '96.50%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { code: 'vs20bonzblst', title: 'Bonanza Billion', bn: 'বোনানজা বিলিয়ন', rtp: '96.00%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' }
];

const jiliSlots = [
  { slug: 'superace', title: 'Super Ace', bn: 'সুপার এইস', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'goldenempire', title: 'Golden Empire', bn: 'গোল্ডেন এম্পায়ার', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'boxingking', title: 'Boxing King', bn: 'বক্সিং কিং', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fortunegems', title: 'Fortune Gems', bn: 'ফরচুন জেমস', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fortunegems2', title: 'Fortune Gems 2', bn: 'ফরচুন জেমস ২', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'romax', title: 'Roma X', bn: 'রোমা এক্স', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'moneycoming', title: 'Money Coming', bn: 'মানি কামিং', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'alibaba', title: 'Ali Baba', bn: 'আলি বাবা', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'megaace', title: 'Mega Ace', bn: 'মেগা এইস', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'crazy777', title: 'Crazy 777', bn: 'ক্রেজি ৭৭৭', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'medusa', title: 'Medusa', bn: 'মেডুসা', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'chargebuffalo', title: 'Charge Buffalo', bn: 'চার্জ বাফেলো', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'magiclamp', title: 'Magic Lamp', bn: 'ম্যাজিক ল্যাম্প', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jungleking', title: 'Jungle King', bn: 'জঙ্গল কিং', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'chinshihuang', title: 'Chin Shi Huang', bn: 'চিন শি হুয়াং', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'sevensevenseven', title: 'Seven Seven Seven', bn: 'সেভেন সেভেন সেভেন', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'baoboonchin', title: 'Bao Boon Chin', bn: 'বাও বুন চিন', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fengshen', title: 'Feng Shen', bn: 'ফেং শেন', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'partynight', title: 'Party Night', bn: 'পার্টি নাইট', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' },
  { slug: 'xiyangyang', title: 'XiYangYang', bn: 'শি ইয়াং ইয়াং', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' }
];

const jiliFishing = [
  { slug: 'jackpotfishing', title: 'Jackpot Fishing', bn: 'জ্যাকপট ফিশিং', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'megafishing', title: 'Mega Fishing', bn: 'মেগা ফিশিং', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'bombingfishing', title: 'Bombing Fishing', bn: 'বম্বিং ফিশিং', rtp: '97.00%', hot: false, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80' }
];

const pgSlots = [
  { slug: 'mahjongways', title: 'Mahjong Ways', bn: 'মাহজং ওয়েজ', rtp: '96.92%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'mahjongways2', title: 'Mahjong Ways 2', bn: 'মাহজং ওয়েজ ২', rtp: '96.95%', hot: true, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fortuneox', title: 'Fortune Ox', bn: 'ফরচুন অক্স', rtp: '96.75%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fortunetiger', title: 'Fortune Tiger', bn: 'ফরচুন টাইগার', rtp: '96.81%', hot: true, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fortunerabbit', title: 'Fortune Rabbit', bn: 'ফরচুন র‍্যাবিট', rtp: '96.75%', hot: true, img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fortunemouse', title: 'Fortune Mouse', bn: 'ফরচুন মাউস', rtp: '96.96%', hot: true, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' },
  { slug: 'caishenwins', title: 'Caishen Wins', bn: 'কাইশেন উইনস', rtp: '96.92%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'treasuresofaztec', title: 'Treasures of Aztec', bn: 'ট্রেজার্স অফ অ্যাজটেক', rtp: '96.71%', hot: true, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'luckyneko', title: 'Lucky Neko', bn: 'লাকি নেকো', rtp: '96.73%', hot: true, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80' },
  { slug: 'ganeshagold', title: 'Ganesha Gold', bn: 'গণেশা গোল্ড', rtp: '96.08%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dreamsofmacau', title: 'Dreams of Macau', bn: 'ড্রিমস অফ ম্যাকাও', rtp: '96.71%', hot: false, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonhatch', title: 'Dragon Hatch', bn: 'ড্রাগন হ্যাচ', rtp: '96.83%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'waysoftheqilin', title: 'Ways of the Qilin', bn: 'ওয়েজ অফ দ্য কিলিন', rtp: '96.69%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'doublefortune', title: 'Double Fortune', bn: 'ডাবল ফরচুন', rtp: '96.22%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'queenofbounty', title: 'Queen of Bounty', bn: 'কুইন অফ বাউন্টি', rtp: '96.74%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'wildbandito', title: 'Wild Bandito', bn: 'ওয়াইল্ড বান্ডিতো', rtp: '96.73%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' }
];

const jdbSlots = [
  { slug: 'jdb-birdsparty', title: 'Birds Party', bn: 'বার্ডস পার্টি', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-kong', title: 'Kong', bn: 'কং', rtp: '96.20%', hot: true, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-dragonmaster', title: 'Dragon Master', bn: 'ড্রাগন মাস্টার', rtp: '96.80%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-opensesame', title: 'Open Sesame', bn: 'ওপেন সিসামি', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-winningmask', title: 'Winning Mask', bn: 'উইনিং মাস্ক', rtp: '96.10%', hot: false, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-coocoofarm', title: 'Coocoo Farm', bn: 'কুকু ফার্ম', rtp: '96.30%', hot: false, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-luckydragons', title: 'Lucky Dragons', bn: 'লাকি ড্রাগনস', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'jdb-superniubi', title: 'Super Niubi', bn: 'সুপার নিউবি', rtp: '96.50%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' }
];

const fcSlots = [
  { slug: 'fachai-goldenpanther', title: 'Golden Panther', bn: 'গোল্ডেন প্যান্থার', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-nightmarket', title: 'Night Market', bn: 'নাইট মার্কেট', rtp: '96.30%', hot: true, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-cny', title: 'Chinese New Year', bn: 'চাইনিজ নিউ ইয়ার', rtp: '96.70%', hot: true, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-luckyfortunes', title: 'Lucky Fortunes', bn: 'লাকি ফরচুনস', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-dafudagui', title: 'Da Fu Da Gui', bn: 'দা ফু দা গুই', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-hotpotparty', title: 'Hot Pot Party', bn: 'হট পট পার্টি', rtp: '96.20%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-starhunter', title: 'Star Hunter', bn: 'স্টার হান্টার', rtp: '96.50%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fachai-baochuan', title: 'Bao Chuan Fishing', bn: 'বাও চুয়ান ফিশিং', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80', isFish: true }
];

const fastspinSlots = [
  { slug: 'fastspin-rooster', title: 'The Roosters', bn: 'দ্য রুস্টার্স', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-royalkatt', title: 'Royal Katt', bn: 'রয়্যাল ক্যাট', rtp: '96.80%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-wildwetwin', title: 'Wild Wet Win', bn: 'ওয়াইল্ড ওয়েট উইন', rtp: '96.40%', hot: true, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-richcaishen', title: 'Rich Caishen', bn: 'রিচ কাইশেন', rtp: '96.70%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-goldenwar', title: 'Golden War', bn: 'গোল্ডেন ওয়ার', rtp: '96.20%', hot: false, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-safariheat', title: 'Safari Heat', bn: 'সাফারি হিট', rtp: '96.10%', hot: false, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-muaythai', title: 'Muay Thai Fighter', bn: 'মুয়াই থাই ফাইটার', rtp: '96.30%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fastspin-seaemperor', title: 'Sea Emperor', bn: 'সী এম্পায়ার', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=80' }
];

const spadegamingSlots = [
  { slug: 'spadegaming-heroes', title: 'Heroes: Rise of the Legend', bn: 'হিরোজ', rtp: '96.97%', hot: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'spadegaming-fishinggod', title: 'Fishing God', bn: 'ফিশিং গড', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80', isFish: true },
  { slug: 'spadegaming-5dragons', title: '5 Fortune Dragons', bn: '৫ ফরচুন ড্রাগন', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'spadegaming-goldenmonkey', title: 'Golden Monkey', bn: 'গোল্ডেন মাঙ্কি', rtp: '96.50%', hot: false, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'spadegaming-doubleflame', title: 'Double Flame', bn: 'ডাবল ফ্লেম', rtp: '96.50%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'spadegaming-moneymouse', title: 'Money Mouse', bn: 'মানি মাউস', rtp: '96.80%', hot: false, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' },
  { slug: 'spadegaming-candypop', title: 'Candy Pop', bn: 'ক্যান্ডি পপ', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'spadegaming-royalkatt', title: 'Royal Katt SG', bn: 'রয়্যাল ক্যাট এসজি', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' }
];

const yellowBatSlots = [
  { slug: 'yellowbat-dragons', title: "Dragon's Gate", bn: 'ড্রাগনস গেইট', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'yellowbat-goldenbat', title: 'Golden Bat', bn: 'গোল্ডেন ব্যাট', rtp: '96.80%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'yellowbat-fortunewheel', title: 'Fortune Wheel', bn: 'ফরচুন হুইল', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'yellowbat-mysticgems', title: 'Mystic Gems', bn: 'মিস্টিক জেমস', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'yellowbat-pharaohsgold', title: "Pharaoh's Gold", bn: 'ফারাওস গোল্ড', rtp: '96.20%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'yellowbat-samurai', title: 'Samurai Honor', bn: 'সামুরাই অনার', rtp: '96.50%', hot: false, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' }
];

const btgSlots = [
  { slug: 'bonanza', title: 'Bonanza Megaways', bn: 'বোনানজা মেগাওয়েজ', rtp: '96.00%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'extrachilli', title: 'Extra Chilli Megaways', bn: 'এক্সট্রা চিলি মেগাওয়েজ', rtp: '96.82%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'whowantstobeamillionaire', title: 'Who Wants to Be a Millionaire', bn: 'হু ওয়ান্টস টু বি আ মিলিয়নেয়ার', rtp: '96.24%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'whiterabbit', title: 'White Rabbit Megaways', bn: 'হোয়াইট র‍্যাবিট মেগাওয়েজ', rtp: '97.72%', hot: true, img: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dangerhighvoltage', title: 'Danger High Voltage', bn: 'ডেঞ্জার হাই ভোল্টেজ', rtp: '95.67%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'lildevil', title: 'Lil Devil', bn: 'লিল ডেভিল', rtp: '96.43%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' }
];

const nlcSlots = [
  { slug: 'tombstonerip', title: 'Tombstone RIP', bn: 'টুম্বস্টোন রিপ', rtp: '96.08%', hot: true, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'sanquentin', title: 'San Quentin xWays', bn: 'স্যান কুয়েন্টিন', rtp: '96.03%', hot: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fireinthehole', title: 'Fire in the Hole xBomb', bn: 'ফায়ার ইন দ্য হোল', rtp: '96.06%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'mental', title: 'Mental', bn: 'মেন্টাল', rtp: '96.08%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'deadwood', title: 'Deadwood xNudge', bn: 'ডেডউড', rtp: '96.03%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'punkrocker', title: 'Punk Rocker', bn: 'পাঙ্ক রকার', rtp: '96.01%', hot: false, img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80' }
];

const rtSlots = [
  { slug: 'piggyrichesmegaways', title: 'Piggy Riches Megaways', bn: 'পিগি রিচেস মেগাওয়েজ', rtp: '95.71%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'gonzosquestmegaways', title: "Gonzo's Quest Megaways", bn: 'গনজোস কোয়েস্ট মেগাওয়েজ', rtp: '95.77%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dynamiteriches', title: 'Dynamite Riches', bn: 'ডায়নামাইট রিচেস', rtp: '95.70%', hot: true, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonsfire', title: "Dragon's Fire Megaways", bn: 'ড্রাগনস ফায়ার', rtp: '95.72%', hot: true, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'mysteryreels', title: 'Mystery Reels', bn: 'মিস্ট্রি রিলস', rtp: '96.20%', hot: false, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'rainbowjackpots', title: 'Rainbow Jackpots', bn: 'রেইনবো জ্যাকপটস', rtp: '96.15%', hot: false, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' }
];

const ptSlots = [
  { slug: 'ageofthegods', title: 'Age of the Gods', bn: 'এইজ অফ দ্য গডস', rtp: '95.02%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'buffaloblitz', title: 'Buffalo Blitz', bn: 'বাফেলো ব্লিটজ', rtp: '95.96%', hot: true, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'gladiator', title: 'Gladiator', bn: 'গ্ল্যাডিয়েটর', rtp: '94.09%', hot: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'greatblue', title: 'Great Blue', bn: 'গ্রেট ব্লু', rtp: '96.03%', hot: false, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'epicape', title: 'Epic Ape', bn: 'এপিক এইপ', rtp: '95.96%', hot: false, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'halloweenfortune', title: 'Halloween Fortune', bn: 'হ্যালোউইন ফরচুন', rtp: '97.06%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' }
];

const netentSlots = [
  { slug: 'starburst', title: 'Starburst', bn: 'স্টারবার্স্ট', rtp: '96.09%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'gonzosquest', title: "Gonzo's Quest", bn: 'গনজোস কোয়েস্ট', rtp: '95.97%', hot: true, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'deadoralive2', title: 'Dead or Alive 2', bn: 'ডেড অর অ্যালাইভ ২', rtp: '96.82%', hot: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'twinspin', title: 'Twin Spin', bn: 'টুইন স্পিন', rtp: '96.55%', hot: true, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' },
  { slug: 'divinefortune', title: 'Divine Fortune', bn: 'ডিভাইন ফরচুন', rtp: '96.59%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'fruitshop', title: 'Fruit Shop', bn: 'ফ্রুট শপ', rtp: '96.71%', hot: false, img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' }
];

const dragonsoftSlots = [
  { slug: 'dragonsoft-pearl', title: "Dragon's Pearl", bn: 'ড্রাগনস পার্ল', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonsoft-dynasty', title: 'Dynasty Empire', bn: 'ডাইনেস্টি এম্পায়ার', rtp: '96.70%', hot: true, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonsoft-goldendragon', title: 'Golden Dragon', bn: 'গোল্ডেন ড্রাগন', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonsoft-threekingdoms', title: 'Three Kingdoms', bn: 'থ্রি কিংডমস', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonsoft-phoenix', title: 'Phoenix Rising', bn: 'ফিনিক্স রাইজিং', rtp: '96.30%', hot: false, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'dragonsoft-warlords', title: 'Warlords', bn: 'ওয়ারলর্ডস', rtp: '96.80%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' }
];

const play8Slots = [
  { slug: 'play8-oceanking', title: 'Ocean King', bn: 'ওশান কিং', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'play8-highwaykings', title: 'Highway Kings', bn: 'হাইওয়ে কিংস', rtp: '96.30%', hot: true, img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { slug: 'play8-captaintreasure', title: "Captain's Treasure", bn: 'ক্যাপ্টেন্স ট্রেজার', rtp: '96.70%', hot: false, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'play8-dolphinreef', title: 'Dolphin Reef', bn: 'ডলফিন রিফ', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'play8-safariheat', title: 'Safari Heat P8', bn: 'সাফারি হিট পি৮', rtp: '96.10%', hot: false, img: 'https://images.unsplash.com/photo-1564865878688-9a244444042a?w=600&auto=format&fit=crop&q=80' },
  { slug: 'play8-greatchina', title: 'Great China', bn: 'গ্রেট চায়না', rtp: '96.60%', hot: false, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' }
];

const jokerSlots = [
  { slug: 'joker-roma', title: 'Roma', bn: 'রোমা', rtp: '97.00%', hot: true, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80' },
  { slug: 'joker-horuseye', title: 'Horus Eye', bn: 'হোরাস আই', rtp: '96.50%', hot: true, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { slug: 'joker-goldenisland', title: 'Golden Island', bn: 'গোল্ডেন আইল্যান্ড', rtp: '96.80%', hot: false, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' },
  { slug: 'joker-blackbeard', title: 'Black Beard Legacy', bn: 'ব্ল্যাক বিয়ার্ড লেগ্যাসি', rtp: '96.30%', hot: false, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80' },
  { slug: 'joker-dragonpower', title: 'Dragon Power Flame', bn: 'ড্রাগন পাওয়ার ফ্লেম', rtp: '96.70%', hot: false, img: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=600&auto=format&fit=crop&q=80' },
  { slug: 'joker-luckygod', title: 'Lucky God', bn: 'লাকি গড', rtp: '96.40%', hot: false, img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&auto=format&fit=crop&q=80' }
];

const crashAndLive = [
  {
    id: 'acha_spribe_aviator',
    title: 'Aviator',
    titleBn: 'অ্যাভিয়েটর',
    category: 'crash',
    provider: 'Spribe',
    rtp: '97.00%',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    isHot: true,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/aviator',
    gameCode: 'spribe_aviator',
    apiProviderId: 'achagaming_spribe',
    minBetTk: 10,
    maxBetTk: 50000
  },
  {
    id: 'acha_evo_lightning_roulette',
    title: 'Lightning Roulette',
    titleBn: 'লাইটনিং রুলেট',
    category: 'live',
    provider: 'Evolution',
    rtp: '97.30%',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    isHot: true,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/lightning-roulette',
    gameCode: 'evo_lightning_roulette',
    apiProviderId: 'achagaming_evolution',
    minBetTk: 20,
    maxBetTk: 100000
  },
  {
    id: 'acha_evo_crazytime',
    title: 'Crazy Time',
    titleBn: 'ক্রেজি টাইম',
    category: 'live',
    provider: 'Evolution',
    rtp: '96.08%',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    isHot: true,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/crazy-time',
    gameCode: 'evo_crazytime',
    apiProviderId: 'achagaming_evolution',
    minBetTk: 20,
    maxBetTk: 100000
  },
  {
    id: 'acha_evo_speed_baccarat',
    title: 'Speed Baccarat',
    titleBn: 'স্পিড ব্যাকারাত',
    category: 'live',
    provider: 'Evolution',
    rtp: '98.94%',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    isHot: true,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/speed-baccarat',
    gameCode: 'evo_speed_baccarat',
    apiProviderId: 'achagaming_evolution',
    minBetTk: 50,
    maxBetTk: 200000
  },
  {
    id: 'acha_km_andarbahar',
    title: 'Andar Bahar',
    titleBn: 'আন্দর বাহার',
    category: 'table',
    provider: 'Kingmaker',
    rtp: '97.85%',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    isLive: false,
    isHot: true,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/andar-bahar',
    gameCode: 'km_andarbahar',
    apiProviderId: 'achagaming_kingmaker',
    minBetTk: 10,
    maxBetTk: 50000
  },
  {
    id: 'acha_km_teenpatti',
    title: 'Teen Patti',
    titleBn: 'তিন পাত্তি',
    category: 'table',
    provider: 'Kingmaker',
    rtp: '96.50%',
    thumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
    isLive: false,
    isHot: true,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/teen-patti',
    gameCode: 'km_teenpatti',
    apiProviderId: 'achagaming_kingmaker',
    minBetTk: 10,
    maxBetTk: 50000
  }
];

const allGames = [];

// 1. Pragmatic Play
ppGames.forEach(g => {
  allGames.push({
    id: 'acha_' + g.code,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Pragmatic Play',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=' + g.code + '&lang=en&cur=BDT',
    gameCode: g.code,
    apiProviderId: 'achagaming_pragmatic',
    minBetTk: 10,
    maxBetTk: 50000
  });
});

// 2. JILI Games
jiliSlots.forEach(g => {
  allGames.push({
    id: 'acha_jili_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'JILI Games',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'jili_' + g.slug,
    apiProviderId: 'achagaming_jili',
    minBetTk: 5,
    maxBetTk: 30000
  });
});

jiliFishing.forEach(g => {
  allGames.push({
    id: 'acha_jili_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'fish',
    provider: 'JILI Games',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'jili_' + g.slug,
    apiProviderId: 'achagaming_jili',
    minBetTk: 5,
    maxBetTk: 30000
  });
});

// 3. PG Soft
pgSlots.forEach(g => {
  allGames.push({
    id: 'acha_pg_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'PG Soft',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'pg_' + g.slug,
    apiProviderId: 'achagaming_pgsoft',
    minBetTk: 5,
    maxBetTk: 30000
  });
});

// 4. JDB
jdbSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'JDB',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_jdb',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 5. Fa Chai
fcSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: g.isFish ? 'fish' : 'slots',
    provider: 'Fa Chai',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_fc',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 6. FastSpin
fastspinSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'FastSpin',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_fastspin',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 7. Spadegaming
spadegamingSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: g.isFish ? 'fish' : 'slots',
    provider: 'Spadegaming',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_spadegaming',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 8. Yellow Bat
yellowBatSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Yellow Bat',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_yellowbat',
    minBetTk: 5,
    maxBetTk: 20000
  });
});

// 9. BTG
btgSlots.forEach(g => {
  allGames.push({
    id: 'acha_btg_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Big Time Gaming',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'btg_' + g.slug,
    apiProviderId: 'achagaming_btg',
    minBetTk: 10,
    maxBetTk: 40000
  });
});

// 10. NLC
nlcSlots.forEach(g => {
  allGames.push({
    id: 'acha_nlc_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'NoLimit City',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'nlc_' + g.slug,
    apiProviderId: 'achagaming_nlc',
    minBetTk: 10,
    maxBetTk: 40000
  });
});

// 11. RT
rtSlots.forEach(g => {
  allGames.push({
    id: 'acha_rt_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Red Tiger',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'rt_' + g.slug,
    apiProviderId: 'achagaming_redtiger',
    minBetTk: 10,
    maxBetTk: 40000
  });
});

// 12. PT
ptSlots.forEach(g => {
  allGames.push({
    id: 'acha_pt_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Playtech',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'pt_' + g.slug,
    apiProviderId: 'achagaming_playtech',
    minBetTk: 10,
    maxBetTk: 50000
  });
});

// 13. NetEnt
netentSlots.forEach(g => {
  allGames.push({
    id: 'acha_netent_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'NetEnt',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: 'netent_' + g.slug,
    apiProviderId: 'achagaming_netent',
    minBetTk: 10,
    maxBetTk: 50000
  });
});

// 14. Dragon Soft
dragonsoftSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Dragon Soft',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_dragonsoft',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 15. Play8
play8Slots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Play8',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_play8',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 16. Joker
jokerSlots.forEach(g => {
  allGames.push({
    id: 'acha_' + g.slug,
    title: g.title,
    titleBn: g.bn,
    category: 'slots',
    provider: 'Joker',
    rtp: g.rtp,
    thumbnail: g.img,
    isLive: false,
    isHot: g.hot,
    isAvailable: true,
    playMode: 'iframe',
    realLaunchUrl: 'https://playin.com/embed/v1/demo/' + g.slug,
    gameCode: g.slug,
    apiProviderId: 'achagaming_joker',
    minBetTk: 5,
    maxBetTk: 25000
  });
});

// 17. Crash & Live
crashAndLive.forEach(g => allGames.push(g));

console.log('Total seeded games generated:', allGames.length);

const output = `import type { GameItem } from '../src/types/index.ts';

export const SEEDED_GAMES: GameItem[] = ${JSON.stringify(allGames, null, 2)};
`;

fs.writeFileSync('server/gamesCatalog.ts', output, 'utf8');
console.log('Successfully wrote server/gamesCatalog.ts');
