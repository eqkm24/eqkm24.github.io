/* ==========================================================================
   data.js — 기린월드 위키 기준 고정 데이터
   출처: https://giraffemc.com/wiki/life/proficiency/cook
         https://giraffemc.com/wiki/life/proficiency/alchemist
         https://giraffemc.com/wiki/life/proficiency/alchemist/elixir
   패치로 수치가 바뀌면 이 파일만 고치면 됩니다.
   ========================================================================== */

/* ── 공통: 숙련도 → 차수 / 설비 개수 / 작업당 개수 ── */
export const TIERS = [
  { tier: 1, fromLv: 1,  perTask: 1 },
  { tier: 2, fromLv: 10, perTask: 3 },
  { tier: 3, fromLv: 20, perTask: 4 },
  { tier: 4, fromLv: 30, perTask: 6 },
];

/* 조리대·연금대 설치 개수 (두 직업 동일) */
export const STATIONS_BY_LV = [
  { lv: 1, count: 1 }, { lv: 5, count: 2 }, { lv: 10, count: 3 },
  { lv: 20, count: 4 }, { lv: 30, count: 7 },
];

/* 연금술사 대기열 칸 */
export const QUEUE_BY_LV = [
  { lv: 1, slots: 2 }, { lv: 5, slots: 3 }, { lv: 10, slots: 3 }, { lv: 20, slots: 4 },
  { lv: 30, slots: 5 }, { lv: 40, slots: 6 }, { lv: 50, slots: 7 }, { lv: 55, slots: 8 },
  { lv: 60, slots: 9 },
];

export const MAX_LV = 60;

/* ── 요리사 ── */
export const COOK_TIME = { vanilla: 30, normal: 86 };   // 초 (1분 26초)
export const COOK_EXP  = { vanilla: 74, 1: 210, 2: 420, 3: 420, lemonade: 210 };
export const COOK_RULES = {
  burnBase: 10,          // 탄 요리 기본 확률 %
  burnPerPrep: 1,        // 손질한 재료 종류마다 -1%p (10 → 7)
  timePerPrep: 5,        // 손질한 재료 종류마다 -5%
  timePrepMax: 15,
};

/* fish: [이름, 개수] | null · veg: 바닐라 작물 · farm: 농부 작물(희귀) */
export const RECIPES = [
  { stage: 1, name: '감자 수프',       lv: 1,  vanilla: true, fish: null,            veg: [['감자', 8], ['당근', 4]], farm: [], season: '' },
  { stage: 1, name: '호박죽',          lv: 1,  vanilla: true, fish: null,            veg: [['호박', 2], ['밀', 4], ['사탕수수', 2]], farm: [], season: '' },
  { stage: 1, name: '송어 버터구이',   lv: 1,  fish: ['송어', 1],       veg: [['감자', 16]],      farm: [['양파', 1], ['상추', 1]], season: '봄' },
  { stage: 1, name: '무조림',          lv: 1,  fish: ['고등어', 1],     veg: [['당근', 16]],      farm: [['무', 1], ['양파', 1]],   season: '겨울' },
  { stage: 1, name: '우렁 쌈밥',       lv: 1,  fish: ['우렁이', 1],     veg: [['밀', 8]],         farm: [['상추', 1], ['양파', 1]], season: '봄' },
  { stage: 1, name: '옥수수전',        lv: 10, fish: ['강꼬치고기', 1], veg: [['밀', 8]],         farm: [['옥수수', 4], ['상추', 4]], season: '여름' },
  { stage: 1, name: '피라니아 튀김',   lv: 10, fish: ['피라니아', 1],   veg: [['감자', 16]],      farm: [['옥수수', 4], ['무', 4]],   season: '가을' },
  { stage: 1, name: '비트 샐러드',     lv: 10, fish: ['깃대돔', 1],     veg: [['비트', 8]],       farm: [['상추', 4], ['옥수수', 4]], season: '여름' },
  { stage: 1, name: '해마 맑은국',     lv: 10, fish: ['해마', 1],       veg: [['당근', 16]],      farm: [['무', 4], ['양파', 4]],     season: '겨울' },
  { stage: 2, name: '애호박볶음',      lv: 10, fish: ['오징어', 1],     veg: [['당근', 16]],      farm: [['애호박', 4], ['옥수수', 4]], season: '여름·가을' },
  { stage: 2, name: '오이냉국',        lv: 10, fish: ['날치', 1],       veg: [['사탕수수', 8]],   farm: [['오이', 4], ['상추', 4]],   season: '봄·여름' },
  { stage: 2, name: '양배추찜',        lv: 10, fish: ['거북복', 1],     veg: [['감자', 16]],      farm: [['양배추', 4], ['무', 4]],   season: '가을·겨울' },
  { stage: 2, name: '레몬구이',        lv: 10, fish: ['개복치', 1],     veg: [['감자', 16]],      farm: [['레몬', 4], ['양파', 4]],   season: '봄·겨울' },
  { stage: 2, name: '호박전',          lv: 10, fish: ['배스', 1],       veg: [['호박', 4]],       farm: [['애호박', 4], ['옥수수', 4]], season: '여름·가을' },
  { stage: 2, name: '오이 샐러드',     lv: 10, fish: ['연어', 1],       veg: [['비트', 8]],       farm: [['오이', 4], ['양파', 4]],   season: '봄' },
  { stage: 2, name: '양배추전골',      lv: 10, fish: ['비단잉어', 1],   veg: [['당근', 16]],      farm: [['양배추', 4], ['양파', 4]], season: '겨울' },
  { stage: 2, name: '레몬 세비체',     lv: 10, fish: ['쏠배감펭', 1],   veg: [['달콤한 열매', 8]], farm: [['레몬', 4], ['상추', 4]],  season: '봄' },
  { stage: 2, name: '레몬에이드',      lv: 10, lemonade: true, fish: null, veg: [['사탕수수', 8]], farm: [['레몬', 4]],               season: '봄·겨울' },
  { stage: 3, name: '쑤기미 매운탕',   lv: 20, fish: ['쑤기미', 1],     veg: [['감자', 16]],      farm: [['고추', 4], ['무', 4]],     season: '가을' },
  { stage: 3, name: '토마토 파스타',   lv: 20, fish: ['왕게', 1],       veg: [['밀', 8]],         farm: [['토마토', 4], ['양파', 4]], season: '봄' },
  { stage: 3, name: '고구마 조림',     lv: 20, fish: ['해삼', 1],       veg: [['당근', 16]],      farm: [['고구마', 4], ['양배추', 4]], season: '가을·겨울' },
  { stage: 3, name: '키위 소스 구이',  lv: 20, fish: ['철갑상어', 1],   veg: [['달콤한 열매', 8]], farm: [['키위', 4], ['레몬', 4]],  season: '봄·겨울' },
  { stage: 3, name: '청새치 스테이크', lv: 20, fish: ['청새치', 1],     veg: [['감자', 16]],      farm: [['토마토', 4], ['오이', 4]], season: '봄·여름' },
  { stage: 3, name: '고추튀김',        lv: 20, fish: ['복어', 1],       veg: [['밀', 8]],         farm: [['고추', 4], ['옥수수', 4]], season: '여름·가을' },
  { stage: 3, name: '키위 카르파초',   lv: 20, fish: ['실러캔스', 1],   veg: [['비트', 8]],       farm: [['키위', 4], ['양파', 4]],   season: '봄·겨울' },
  { stage: 3, name: '바다거북 수프',   lv: 20, fish: ['바다거북', 1],   veg: [['호박', 4]],       farm: [['고구마', 4], ['고추', 4]], season: '가을' },
];

/* ── 연금술사 ── */
export const ALCH_TIME = { vanilla: 30, normal: 56 };   // 초, 감소 적용 전
export const ALCH_EXP  = { vanilla: 77, normal: 255 };
export const ALCH_RULES = {
  powderTimeEach: 5,     // 가루 종류마다 -5%
  powderTimeMax: 10,
  waterBottle: 1,        // 모든 비약에 물병 1개 추가
  durationMin: 10,
  stackMaxMin: 60,
  sellDeadlineH: 12,
};

/* 숙련도 구간별 누적 효과 (구간 끝 레벨 기준, 위키 표) */
export const ALCH_LV_CURVE = [
  // [구간 시작, 구간 끝, 끝에서 누적 시간감소%, 끝에서 누적 재료손실방지%]
  [1, 9,   0.9,  0.5],
  [10, 10, 41,   0.5],
  [11, 20, 42.5, 1.5],
  [21, 30, 45.5, 3],
  [31, 40, 47,   6],
  [41, 50, 47,   11],
  [51, 60, 47,   13],
];

/* vals: [일반, 고급, 희귀] · unit: 수치 뒤에 붙는 단위 */
export const ELIXIRS = [
  { name: '이슬',     lv: 0,  vanilla: true, effect: '마나 회복',          vals: [5, 7.5, 10],     unit: '',   ings: [['수박 조각', 12]] },
  { name: '산들바람', lv: 0,  vanilla: true, effect: '마나 회복 속도',     vals: [5, 7.5, 10],     unit: '%',  ings: [['설탕', 12]] },
  { name: '활력',     lv: 1,  effect: '마나 회복',          vals: [25, 37.5, 50],   unit: '',   ings: [['참나무 심재(등급무관)', 1], ['강화된 다이아몬드 이상', 1], ['꿀병', 1]] },
  { name: '풍요',     lv: 1,  effect: '가이아의 축복 확률', vals: [4.5, 6.75, 9],   unit: '%p', ings: [['자작나무 심재', 1], ['강화된 구리 이상', 1], ['수박 조각', 8]] },
  { name: '물결',     lv: 1,  effect: '기척 · 입질 단축',   vals: [10, 15, 20],     unit: '%',  ings: [['가문비나무 심재', 1], ['강화된 청금석 이상', 1], ['말린 켈프', 8]] },
  { name: '숲',       lv: 1,  effect: '고다마의 축복 확률', vals: [4.5, 6.75, 9],   unit: '%p', ings: [['참나무 심재', 1], ['강화된 레드스톤 이상', 1], ['뼛가루', 8]] },
  { name: '화덕',     lv: 1,  effect: '요리 시간 감소',     vals: [7.5, 11, 15],    unit: '%',  ings: [['자작나무 심재', 1], ['강화된 석탄 이상', 1], ['설탕', 8]] },
  { name: '흐름',     lv: 10, effect: '마나 회복 속도',     vals: [150, 225, 300],  unit: '%',  ings: [['정글나무 심재', 3], ['순수한 다이아몬드', 1], ['발광 열매', 8]] },
  { name: '파도',     lv: 10, effect: '트리톤의 축복 확률', vals: [7.5, 11, 15],    unit: '%p', ings: [['아카시아나무 심재', 3], ['순수한 청금석', 1], ['말린 켈프', 16]] },
  { name: '나이테',   lv: 10, effect: '희귀 심재 확률',     vals: [6, 9, 12],       unit: '%p', ings: [['짙은 참나무 심재', 3], ['순수한 구리', 1], ['뼛가루', 6]] },
  { name: '볼칸',     lv: 10, effect: '볼칸의 축복 확률',   vals: [9, 13.5, 18],    unit: '%p', ings: [['짙은 참나무 심재', 3], ['순수한 레드스톤', 1], ['발광 열매', 4]] },
  { name: '담금질',   lv: 10, effect: '순수한 광물 확률',   vals: [6, 9, 12],       unit: '%p', ings: [['아카시아나무 심재', 3], ['순수한 석탄', 1], ['코코아 콩', 12]] },
  { name: '미식',     lv: 10, effect: '요리 재료 손실 방지', vals: [5, 7.5, 10],    unit: '%p', ings: [['정글나무 심재', 3], ['순수한 석탄', 1], ['코코아 콩', 8]] },
  { name: '결실',     lv: 20, effect: '희귀 작물 확률',     vals: [6, 9, 12],       unit: '%p', ings: [['벚나무 심재', 3], ['순수한 구리', 1], ['뼛가루', 2]] },
  { name: '제련',     lv: 20, effect: '추가 채굴 확률',     vals: [12, 18, 24],     unit: '%p', ings: [['맹그로브나무 심재', 3], ['순수한 레드스톤', 1], ['발광 열매', 6]] },
  { name: '지혜',     lv: 20, effect: '숙련도 경험치',      vals: [5, 7.5, 10],     unit: '%',  ings: [['창백한 참나무 심재', 3], ['순수한 다이아몬드', 1], ['설탕', 16]] },
  { name: '토트',     lv: 20, effect: '희귀 비약 확률',     vals: [9, 13.5, 18],    unit: '%p', ings: [['맹그로브나무 심재', 3], ['순수한 석탄', 1], ['꿀이 든 병', 1]] },
];

export const ELIXIR_GRADES = ['일반', '고급', '희귀'];

export const WIKI = {
  cook: 'https://giraffemc.com/wiki/life/proficiency/cook',
  alchemist: 'https://giraffemc.com/wiki/life/proficiency/alchemist',
  elixir: 'https://giraffemc.com/wiki/life/proficiency/alchemist/elixir',
  shop: 'https://giraffemc.com/wiki/economy/shop',
};

/* ── 아이콘 이미지 (기린월드 위키) ──
   이름 → 파일명. 주소를 통째로 바꾸려면 ICON_BASE 만 고치면 됩니다.
   목록에 없거나 불러오지 못하면 첫 글자 배지로 대신 보여줍니다.
   다른 이미지를 쓰고 싶으면 파일명 대신 전체 URL(https://...)을 넣어도 됩니다. */
export const ICON_BASE = 'https://giraffemc.com/wiki-assets/.gitbook/assets/icons/';

export const ICONS = {
  /* 요리 */
  '감자 수프': 'gf_dish_potato_soup.png',     '호박죽': 'gf_dish_pumpkin_porridge.png',
  '송어 버터구이': 'gf_dish_trout.png',        '무조림': 'gf_dish_mackerel.png',
  '우렁 쌈밥': 'gf_dish_seasnail.png',         '옥수수전': 'gf_dish_northern_pike.png',
  '피라니아 튀김': 'gf_dish_piranha.png',      '비트 샐러드': 'gf_dish_moorish_idol.png',
  '해마 맑은국': 'gf_dish_seahorse.png',       '애호박볶음': 'gf_dish_squid.png',
  '오이냉국': 'gf_dish_flying_fish.png',       '양배추찜': 'gf_dish_cowfish.png',
  '레몬구이': 'gf_dish_ocean_sunfish.png',     '호박전': 'gf_dish_bass.png',
  '오이 샐러드': 'gf_dish_salmon.png',         '양배추전골': 'gf_dish_koi.png',
  '레몬 세비체': 'gf_dish_pterois.png',        '레몬에이드': 'gf_dish_lemonade.png',
  '쑤기미 매운탕': 'gf_dish_stonefish.png',    '토마토 파스타': 'gf_dish_king_crab.png',
  '고구마 조림': 'gf_dish_sea_cucumber.png',   '키위 소스 구이': 'gf_dish_sturgeon.png',
  '청새치 스테이크': 'gf_dish_swordfish.png',  '고추튀김': 'gf_dish_pufferfish.png',
  '키위 카르파초': 'gf_dish_coelacanth.png',   '바다거북 수프': 'gf_dish_sea_turtle.png',

  /* 비약 (비약 이름 키) */
  '이슬': 'gf_elixir_dew.png',        '산들바람': 'gf_elixir_breeze.png',   '활력': 'gf_elixir_vitality.png',
  '풍요': 'gf_elixir_abundance.png',  '물결': 'gf_elixir_ripple.png',       '숲': 'gf_elixir_forest.png',
  '화덕': 'gf_elixir_hearth.png',     '흐름': 'gf_elixir_flow.png',         '파도': 'gf_elixir_wave.png',
  '나이테': 'gf_elixir_growth_ring.png', '볼칸': 'gf_elixir_vulcan.png',    '담금질': 'gf_elixir_tempering.png',
  '미식': 'gf_elixir_gourmet.png',    '결실': 'gf_elixir_fruition.png',     '제련': 'gf_elixir_smelting.png',
  '지혜': 'gf_elixir_wisdom.png',     '토트': 'gf_elixir_thoth.png',

  /* 작물 · 바닐라 재료 */
  '호박': 'mc_pumpkin.png', '밀': 'mc_wheat.png', '사탕수수': 'mc_sugar_cane.png',
  '양파': 'crop_onion.png', '상추': 'crop_lettuce.png', '무': 'crop_radish.png', '옥수수': 'crop_corn.png',
  '애호박': 'crop_zucchini.png', '오이': 'crop_cucumber.png', '양배추': 'crop_cabbage.png', '레몬': 'crop_lemon.png',
  '고추': 'crop_pepper.png', '토마토': 'crop_tomato.png', '고구마': 'crop_sweet_potato.png', '키위': 'crop_kiwi.png',
  '수박 조각': 'mc_melon_slice.png', '설탕': 'mc_sugar.png', '말린 켈프': 'mc_dried_kelp.png', '뼛가루': 'mc_bone_meal.png',
  '발광 열매': 'mc_glow_berries.png', '코코아 콩': 'mc_cocoa_beans.png', '꿀병': 'mc_honey_bottle.png', '꿀이 든 병': 'mc_honey_bottle.png',

  /* 심재 */
  '참나무 심재': 'oak_heartwood.png', '참나무 심재(등급무관)': 'oak_heartwood.png', '자작나무 심재': 'birch_heartwood.png',
  '가문비나무 심재': 'spruce_heartwood.png', '정글나무 심재': 'jungle_heartwood.png', '아카시아나무 심재': 'acacia_heartwood.png',
  '짙은 참나무 심재': 'dark_oak_heartwood.png', '벚나무 심재': 'cherry_heartwood.png', '맹그로브나무 심재': 'mangrove_heartwood.png',
  '창백한 참나무 심재': 'pale_oak_heartwood.png',

  /* 광물 */
  '강화된 다이아몬드 이상': 'gf_mineral_hardened_diamond.png', '강화된 구리 이상': 'gf_mineral_hardened_copper.png',
  '강화된 청금석 이상': 'gf_mineral_hardened_lapis.png', '강화된 레드스톤 이상': 'gf_mineral_hardened_redstone.png',
  '강화된 석탄 이상': 'gf_mineral_hardened_coal.png', '순수한 다이아몬드': 'gf_mineral_pure_diamond.png',
  '순수한 청금석': 'gf_mineral_pure_lapis.png', '순수한 구리': 'gf_mineral_pure_copper.png',
  '순수한 레드스톤': 'gf_mineral_pure_redstone.png', '순수한 석탄': 'gf_mineral_pure_coal.png',
};
