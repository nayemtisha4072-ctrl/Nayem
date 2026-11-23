import fs from 'fs';

const rawGames = JSON.parse(fs.readFileSync('scripts/jili_games_extracted.json', 'utf8'));

// Bengali translations and categories mapping for JILI games
const bnNames = {
  "2": "চিন শি হুয়াং",
  "5": "হট চিলি",
  "6": "ফরচুন ট্রি",
  "13": "লাকি বল",
  "16": "জঙ্গল কিং",
  "17": "সাংহাই বিউটি",
  "21": "ফা ফা ফা",
  "35": "ক্রেজি ৭৭৭",
  "36": "বাও বুন চিন",
  "38": "ফেংশেন",
  "40": "ক্রেজি ফা ফা ফা",
  "47": "চার্জ বাফেলো",
  "49": "সুপার এইস",
  "58": "গোল্ডেন কুইন",
  "67": "মাঙ্কি পার্টি",
  "76": "পার্টি নাইট",
  "77": "বক্সিং কিং",
  "85": "ফারাও ট্রেজার",
  "87": "বুক অফ গোল্ড",
  "91": "লাকি কামিং",
  "100": "সুপার রিচ",
  "102": "রোমা এক্স",
  "103": "গোল্ডেন এম্পায়ার",
  "108": "ম্যাজিক ল্যাম্প",
  "109": "ফরচুন জেমস",
  "110": "আলী বাবা",
  "115": "এজেন্ট এইস",
  "116": "হ্যাপি ট্যাক্সি",
  "126": "বোন ফরচুন",
  "130": "থর এক্স",
  "134": "মেগা এইস",
  "135": "মায়ান এম্পায়ার",
  "137": "গোল্ড রাশ",
  "142": "বোনাস হান্টার",
  "144": "জিলি ক্যাশেন",
  "145": "নেকো ফরচুন",
  "146": "ওয়ার্ল্ড কাপ",
  "164": "পাইরেট কুইন",
  "166": "ওয়াইল্ড রেসার",
  "171": "সিন সিটি",
  "176": "মাস্টার টাইগার",
  "180": "লেগ্যাসি অফ ইজিপ্ট",
  "181": "ওয়াইল্ড এইস",
  "183": "গোল্ডেন জোকার",
  "191": "গোল্ডেন টেম্পল",
  "193": "ডেভিল ফায়ার",
  "198": "সুইট ল্যান্ড",
  "208": "ট্রায়াল অফ ফিনিক্স",
  "209": "অ্যাজটেক প্রিস্টেস",
  "223": "ফরচুন জেমস ২",
  "225": "ক্রিকেট কিং ১৮",
  "226": "উইচেস নাইট",
  "230": "ক্রিকেট এসএএইচ ৭৫",
  "238": "বাংলা বিউটি",
  "239": "দাবাংগ",
  "240": "পার্টি স্টার",
  "252": "জিউস",
  "264": "ইজিপ্টস গ্লো",
  "299": "পোশন উইজার্ড",
  "300": "ফরচুন জেমস ৩",
  "303": "ফরচুন মাঙ্কি",
  "374": "লাকি ডগি",
  "375": "পসেইডন",
  "376": "শোগুন",
  "379": "মানি পট",
  "403": "সুপার এইস ডিলাক্স",
  "421": "লাকি জাগুয়ার"
};

// Popular / Hot games
const hotCodes = new Set([
  "49", "109", "103", "77", "134", "35", "223", "225", "230", "238", "239", "300", "403", "6", "110", "144", "13"
]);

const jiliSeededGames = rawGames.map(g => {
  const code = String(g.game_code);
  const isHot = hotCodes.has(code);
  const rtp = "97.00%";
  const title = g.game_name_en;
  const titleBn = bnNames[code] || g.game_name_en;
  const thumbnail = `https://ik.imagekit.io/pangamesoft/tr:w-480,q-80,f-webp,cm-extract/jili/game/${code}.png`;
  
  return {
    id: `jili_${code}_${g.game_report_name}`,
    title,
    titleBn,
    category: "slots",
    provider: "JILI",
    rtp,
    thumbnail,
    isLive: false,
    isHot,
    isAvailable: true,
    playMode: "iframe",
    realLaunchUrl: `https://m.jiligamesoft.com/${g.game_report_name}/?gameId=${code}&be=moc.tfosemagilij.ipa&domain_platform=moc.tfosemagilij.ipa&domain_gs=tfosemagilij&apiId=2&legalLang=true`,
    gameCode: code,
    gameReportName: g.game_report_name,
    apiProviderId: "jili_official",
    minBetTk: 5,
    maxBetTk: 30000
  };
});

console.log('Generated jiliSeededGames count:', jiliSeededGames.length);
fs.writeFileSync('scripts/generated_jili_games.json', JSON.stringify(jiliSeededGames, null, 2));
console.log('Saved to scripts/generated_jili_games.json');
