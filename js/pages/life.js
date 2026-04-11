var _curJob    = 'mining';
var _curSubtab = 'skill';

var LIFE_JOBS = {
  mining:  { label:'채광', icon:'⛏', color:'var(--amber)', bouju:'태양의 보주' },
  fishing: { label:'낚시', icon:'🎣', color:'var(--blue)',  bouju:'바다의 보주' },
  farming: { label:'농사', icon:'🌾', color:'var(--green)', bouju:'별의 보주'   },
  cooking: { label:'요리', icon:'🍳', color:'var(--red)',   bouju:'대지의 보주' },
};

// ── 스킬 이미지 URL (루나위키) ───────────────────────────────
var SKILL_IMGS = {
  '손질 달인':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F3Gxzf5zFhoLGuWI7guzO%252FAdobe%2520Express%2520-%2520file%2520%2811%29.png%3Falt%3Dmedia%26token%3D6a0f15ff-6f10-46bb-b36f-29f03558fbfb&width=300&dpr=1&quality=100&sign=cd041f33&sv=2',
  '맛의 균형':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FbQRi4yTMFADeQyzQmpl8%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-29%2520144349-Photoroom.png%3Falt%3Dmedia%26token%3Da40c97e0-b2c2-4e2b-9a0b-a7cc03b9b97c&width=300&dpr=1&quality=100&sign=7f240076&sv=2',
  '미식가':      'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F6M6wULmPiCO9NOgG08OX%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-29%2520144355-Photoroom.png%3Falt%3Dmedia%26token%3D931a488f-4315-404e-92e8-810d7eccbf0a&width=300&dpr=1&quality=100&sign=1a5fd90d&sv=2',
  '즉시 완성':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FEGBqY9bfid2fNmAG69kK%252FAdobe%2520Express%2520-%2520file%2520%2812%29.png%3Falt%3Dmedia%26token%3Df61cfb79-ac31-48ec-b474-8c18b376c39a&width=300&dpr=1&quality=100&sign=73ad600&sv=2',
  '연회 준비':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FefH68wbApJ6gXrVEP9Kl%252FAdobe%2520Express%2520-%2520file%2520%2813%29.png%3Falt%3Dmedia%26token%3Df4035faf-74e2-410f-a95f-7836da9402d4&width=300&dpr=1&quality=100&sign=d8e778e4&sv=2',
  '개간의 서약': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252Fs8ihWcld5N4aJ0fWcbvU%252FAdobe%2520Express%2520-%2520file%2520%285%29.png%3Falt%3Dmedia%26token%3D648cb9f4-8fc4-49fb-a9b0-aaea6a09b905&width=300&dpr=1&quality=100&sign=693319e8&sv=2',
  '풍년의 축복': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FwiPCMzrWlUg2NJllKCT8%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-17%2520152543-Photoroom.png%3Falt%3Dmedia%26token%3D8119ca6d-2ac9-4a1c-b70c-665c461c02a1&width=300&dpr=1&quality=100&sign=263a86a2&sv=2',
  '비옥한 토양': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FSo1bexOGYzl8mkiwPRVY%252FAdobe%2520Express%2520-%2520file%2520%284%29.png%3Falt%3Dmedia%26token%3D41e754a2-8fb9-4e02-a52c-dea87292c4fc&width=300&dpr=1&quality=100&sign=65e5c116&sv=2',
  '수확의 손길': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FXuJd5mbtamu4BN7ZRoUM%252FAdobe%2520Express%2520-%2520file%2520%286%29.png%3Falt%3Dmedia%26token%3D9e34843c-91c3-47fb-ac32-0b4ed38e7c9c&width=300&dpr=1&quality=100&sign=209b0686&sv=2',
  '되뿌리기':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F48nHVCznBYrwVjJiXtU9%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-17%2520152620.png%3Falt%3Dmedia%26token%3D16447d2a-22af-4ef4-a529-35a5b86e09c6&width=300&dpr=1&quality=100&sign=cef5b3d&sv=2',
  '보물 감지':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FLPn3rWeiEzLR5QMZPUDI%252FAdobe%2520Express%2520-%2520file%2520%288%29.png%3Falt%3Dmedia%26token%3Dfb71313d-4022-40ee-908d-0d3bc23f08b4&width=300&dpr=1&quality=100&sign=b9415f33&sv=2',
  '소문난 미끼': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FXqtSwuFfUsh864BrjRBa%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-17%2520174156-Photoroom.png%3Falt%3Dmedia%26token%3Dea11031c-548e-480b-a4a4-e741a7e5aa7c&width=300&dpr=1&quality=100&sign=a173da5&sv=2',
  '낚싯줄 장력': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FVQJwszkrAFhlN78NE0YN%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-17%2520174207-Photoroom.png%3Falt%3Dmedia%26token%3Da74a7c4e-112b-444e-a034-15c002f69412&width=300&dpr=1&quality=100&sign=653994bb&sv=2',
  '쌍걸이':     'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252Fktzfm1a0EploNCOx5qhH%252FAdobe%2520Express%2520-%2520file%2520%2810%29.png%3Falt%3Dmedia%26token%3D3085cbeb-0b24-46a5-b6f3-f7ada8dc664d&width=300&dpr=1&quality=100&sign=35ffd290&sv=2',
  '떼낚시':     'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FnecPamHIX1ltbbYeAi3e%252FAdobe%2520Express%2520-%2520file%2520%289%29.png%3Falt%3Dmedia%26token%3Dd5caba75-6f2f-404a-aeb6-0715f45e5427&width=300&dpr=1&quality=100&sign=4fb4549d&sv=2',
};

var SKILL_DATA = {
  mining: { skills: [
    { name:'단련된 곡괭이', type:'P', tier:30, prereq:'-', excl:'-',
      desc:'커스텀 광물 채광 시 데미지가 증가합니다.',
      note:'레벨 10마다 곡괭이 내구도 보호 확률 +10% (최대 30%)',
      cols:['레벨','데미지 증가 (%)','','레벨','데미지 증가 (%)'],
      rows:[['1','2.0','','16','35.0'],['2','4.0','','17','37.5'],['3','6.0','','18','40.0'],
            ['4','8.0','','19','42.5'],['5','10.0','','20','45.0'],['6','12.0','','21','50.5'],
            ['7','14.0','','22','56.0'],['8','16.0','','23','61.5'],['9','18.0','','24','67.0'],
            ['10','20.0','','25','72.5'],['11','22.5','','26','78.0'],['12','25.0','','27','83.5'],
            ['13','27.5','','28','89.0'],['14','30.0','','29','94.5'],['15','32.5','','30','100.0']] },
    { name:'광맥 감각', type:'P', tier:30, prereq:'단련된 곡괭이 Lv.10', excl:'-',
      desc:'채광 시 광물이 추가 드롭됩니다.',
      cols:['레벨','확률 (%)','최대 추가','','레벨','확률 (%)','최대 추가'],
      rows:[['1','0.6','1','','16','12.0','2'],['2','1.2','1','','17','13.0','2'],
            ['3','1.8','1','','18','14.0','2'],['4','2.4','1','','19','15.0','2'],
            ['5','3.0','1','','20','16.0','2'],['6','3.6','1','','21','18.4','2'],
            ['7','4.2','1','','22','20.8','3'],['8','4.8','1','','23','23.2','3'],
            ['9','5.4','1','','24','25.6','3'],['10','6.0','1','','25','28.0','3'],
            ['11','7.0','1','','26','30.4','3'],['12','8.0','2','','27','32.8','4'],
            ['13','9.0','2','','28','35.2','4'],['14','10.0','2','','29','37.6','4'],
            ['15','11.0','2','','30','40.0','4']] },
    { name:'광맥 흐름', type:'P', tier:30, prereq:'광맥 감각 Lv.10', excl:'-',
      desc:'채광 딜레이 및 갈증이 감소합니다.',
      cols:['레벨','딜레이 감소(ms)','갈증 감소(%)','','레벨','딜레이 감소(ms)','갈증 감소(%)'],
      rows:[['1','5','5','','16','52','22'],['2','8','6','','17','54','23'],
            ['3','11','7','','18','56','24'],['4','14','8','','19','58','25'],
            ['5','16','9','','20','60','26'],['6','18','10','','21','62','27'],
            ['7','20','11','','22','64','28'],['8','24','12','','23','66','29'],
            ['9','28','13','','24','68','30'],['10','32','14','','25','70','31'],
            ['11','36','15','','26','72','32'],['12','40','16','','27','74','33'],
            ['13','44','17','','28','76','34'],['14','48','18','','29','80','35'],
            ['15','50','20','','30','90','36']] },
    { name:'광맥 탐지', type:'A', tier:30, prereq:'광맥 흐름 Lv.10', excl:'폭발적인 채광',
      desc:'주변을 투시해 광물을 탐지합니다.',
      act:'우클릭 (보주 착용)',
      cols:['레벨','탐지 범위(블록)','쿨타임(초)','마나'],
      rows:[['1','3','320','32'],['5','3','312','33'],['10','4','296','35'],
            ['15','4','280','37'],['20','5','260','36'],['25','5','248','60'],['30','6','140','70']] },
    { name:'폭발적인 채광', type:'A', tier:30, prereq:'광맥 흐름 Lv.10', excl:'광맥 탐지',
      desc:'Haste와 야간 투시 효과를 획득하고 채광 효율이 증가합니다.',
      act:'좌클릭 (보주 착용)',
      cols:['레벨','Haste Lv','지속(초)','쿨타임(초)','마나'],
      rows:[['1','2','5','320','32'],['5','3','5','312','33'],['10','3','6','296','35'],
            ['15','4','7','280','37'],['20','4','8','260','36'],['25','5','9','248','60'],
            ['30','5','10','140','70']] },
  ]},
  fishing: { skills: [
    { name:'보물 감지', type:'P', tier:30, prereq:'-', excl:'-',
      desc:'낚시 시 보물 상자가 나올 확률이 증가합니다 (기본 확률 대비 상대치).',
      cols:['레벨','보물 확률 증가(%)','','레벨','보물 확률 증가(%)'],
      rows:[['1','1','','16','22'],['2','2','','17','24'],['3','3','','18','26'],
            ['4','4','','19','28'],['5','5','','20','30'],['6','6','','21','33'],
            ['7','7','','22','36'],['8','8','','23','39'],['9','9','','24','42'],
            ['10','10','','25','45'],['11','12','','26','48'],['12','14','','27','51'],
            ['13','16','','28','54'],['14','18','','29','57'],['15','20','','30','65']] },
    { name:'소문난 미끼', type:'P', tier:30, prereq:'-', excl:'-',
      desc:'낚시 성공 시 동일한 물고기를 1마리 더 낚을 확률이 증가합니다.',
      cols:['레벨','확률(%)','','레벨','확률(%)'],
      rows:[['1','0.7','','16','13.6'],['2','1.4','','17','14.7'],['3','2.1','','18','15.8'],
            ['4','2.8','','19','16.9'],['5','3.5','','20','18.0'],['6','4.2','','21','24.0'],
            ['7','4.9','','22','27.5'],['8','5.6','','23','31.0'],['9','6.3','','24','34.5'],
            ['10','7.0','','25','38.0'],['11','8.1','','26','41.5'],['12','9.2','','27','45.0'],
            ['13','10.3','','28','48.5'],['14','11.4','','29','52.0'],['15','12.5','','30','55.0']] },
    { name:'낚싯줄 장력', type:'P', tier:30, prereq:'소문난 미끼 Lv.10', excl:'-',
      desc:'낚시 성공 시 일반 등급 비율이 감소하여 고급·희귀 등급을 더 자주 낚습니다.',
      cols:['레벨','일반 감소(%)','고급 증가(%)','','레벨','일반 감소(%)','고급 증가(%)'],
      rows:[['1','11.3','3','','16','22.0','8'],['2','11.3','3','','17','23.0','8'],
            ['3','11.3','3','','18','24.0','8'],['4','12.0','3','','19','25.0','8'],
            ['5','12.7','4','','20','26.0','8'],['6','13.3','4','','21','27.2','9'],
            ['7','14.0','4','','22','28.4','9'],['8','14.7','5','','23','29.6','9'],
            ['9','15.3','5','','24','30.8','9'],['10','16.0','5','','25','32.0','9'],
            ['11','17.0','5','','26','33.2','9'],['12','18.0','6','','27','34.4','10'],
            ['13','19.0','6','','28','35.6','10'],['14','20.0','7','','29','36.8','10'],
            ['15','21.0','7','','30','38.0','10']] },
    { name:'쌍걸이', type:'A', tier:30, prereq:'낚싯줄 장력 Lv.10', excl:'떼낚시',
      desc:'스킬 발동 시 낚시 성공 확률과 추가 낚시 가능성이 증가합니다.',
      act:'우클릭 (보주 착용)',
      cols:['레벨','성공률 증가(%)','추가 낚시(%)','지속(초)','쿨타임(초)','마나'],
      rows:[['1','36','11.3','600','320','32'],['5','47','12.7','600','312','33'],
            ['10','50','16.0','600','296','35'],['15','50','21.0','600','280','37'],
            ['20','50','26.0','600','260','36'],['25','59','32.0','480','248','60'],
            ['30','72','38.0','480','140','70']] },
    { name:'떼낚시', type:'A', tier:30, prereq:'낚싯줄 장력 Lv.10', excl:'쌍걸이',
      desc:'스킬 발동 시 낚시 시간이 단축되고 일반 등급이 추가로 감소합니다.',
      act:'좌클릭 (보주 착용)',
      cols:['레벨','시간 단축(%)','일반 추가 감소(%)','지속(초)','쿨타임(초)','마나'],
      rows:[['1','13','3','600','320','32'],['5','14','4','600','312','33'],
            ['10','16','5','600','296','35'],['15','21','5','600','280','37'],
            ['20','26','5','600','260','36'],['25','32','7','480','248','60'],
            ['30','38','8','480','140','70']] },
  ]},
  farming: { skills: [
    { name:'개간의 서약', type:'P', tier:30, prereq:'-', excl:'-',
      desc:'마을 월드에서 경작지 수와 화분통 설치 수량이 증가합니다.',
      note:'스킬로는 최대 20레벨, 강화로 30레벨까지 달성 가능합니다.',
      cols:['레벨','경작지 배수','화분통 수','총 화분통'],
      rows:[['0','1','96','96'],['1','1','100','100'],['2','1','104','104'],
            ['3','1','108','108'],['4','1','112','112'],['5','1','116','116'],
            ['6','1','120','120'],['7','1','124','124'],['8','1','128','128'],
            ['9','1','132','132'],['10','2','132','264'],['11','2','136','272'],
            ['12','2','140','280'],['13','2','144','288'],['14','2','148','296'],
            ['15','2','152','304'],['16','2','156','312'],['17','3','156','468'],
            ['18','3','160','480'],['19','3','164','492'],['20','3','168','504'],
            ['21','3','172','516'],['22','3','176','528'],['23','3','180','540'],
            ['24','4','180','720'],['25','4','184','736'],['26','4','188','752'],
            ['27','4','192','768'],['28','4','196','784'],['29','4','200','800'],
            ['30','4','208','832']] },
    { name:'풍년의 축복', type:'P', tier:30, prereq:'-', excl:'-',
      desc:'작물 재배 시 일반 등급 비율이 감소하여 고급·희귀 등급이 더 자주 드롭됩니다.',
      cols:['레벨','확률(%)','','레벨','확률(%)'],
      rows:[['1','0.9','','16','17.0'],['2','1.8','','17','19.0'],['3','2.7','','18','21.0'],
            ['4','3.6','','19','23.0'],['5','4.5','','20','25.0'],['6','5.4','','21','27.2'],
            ['7','6.3','','22','29.4'],['8','7.2','','23','31.6'],['9','8.1','','24','33.8'],
            ['10','9.0','','25','36.0'],['11','10.0','','26','38.2'],['12','11.0','','27','40.4'],
            ['13','12.0','','28','42.6'],['14','13.0','','29','44.8'],['15','14.0','','30','47.0']] },
    { name:'비옥한 토양', type:'P', tier:30, prereq:'풍년의 축복 Lv.10', excl:'-',
      desc:'수확 시 일반 등급 비율이 감소하고 수확량이 증가합니다.',
      cols:['레벨','일반 감소(%)','수확량 추가','','레벨','일반 감소(%)','수확량 추가'],
      rows:[['1','1.0','1','','16','22.0','3'],['2','2.0','1','','17','23.0','4'],
            ['3','3.0','1','','18','24.0','4'],['4','4.0','1','','19','25.0','4'],
            ['5','5.0','1','','20','26.0','4'],['6','6.0','1','','21','27.2','4'],
            ['7','7.0','1','','22','28.4','4'],['8','8.0','2','','23','29.6','4'],
            ['9','9.0','2','','24','30.8','4'],['10','10.0','2','','25','32.0','5'],
            ['11','11.0','2','','26','33.2','5'],['12','12.0','2','','27','34.4','5'],
            ['13','13.0','2','','28','35.6','5'],['14','14.0','3','','29','36.8','5'],
            ['15','15.0','3','','30','38.0','5']] },
    { name:'수확의 손길', type:'A', tier:30, prereq:'비옥한 토양 Lv.10', excl:'되뿌리기',
      desc:'스킬 발동 시 넓은 범위의 작물을 한번에 수확합니다.',
      act:'우클릭 (보주 착용)',
      cols:['레벨','범위 X','범위 Z','지속(초)','쿨타임(초)','마나'],
      rows:[['1','5','3','168','320','32'],['5','5','3','168','312','33'],
            ['10','5','5','168','296','35'],['15','7','5','168','280','37'],
            ['20','7','7','168','260','36'],['25','9','7','180','248','60'],
            ['30','9','9','200','140','70']] },
    { name:'되뿌리기', type:'A', tier:30, prereq:'비옥한 토양 Lv.10', excl:'수확의 손길',
      desc:'스킬 발동 시 수확 후 인벤토리의 씨앗을 자동으로 재파종합니다.',
      act:'좌클릭 (보주 착용)',
      cols:['레벨','범위 X','범위 Z','지속(초)','쿨타임(초)','마나'],
      rows:[['1','5','3','168','320','32'],['5','5','3','168','312','33'],
            ['10','5','5','168','296','35'],['15','7','5','168','280','37'],
            ['20','7','7','168','260','36'],['25','9','7','180','248','60'],
            ['30','9','9','200','140','70']] },
  ]},
  cooking: { skills: [
    { name:'손질 달인', type:'P', tier:30, prereq:'-', excl:'-',
      desc:'요리 시간이 감소합니다.',
      cols:['레벨','조리 단축(%)','','레벨','조리 단축(%)'],
      rows:[['1','1','','16','19'],['2','2','','17','21'],['3','3','','18','22'],
            ['4','4','','19','24'],['5','5','','20','25'],['6','6','','21','25.0'],
            ['7','7','','22','26.7'],['8','8','','23','28.3'],['9','9','','24','30.0'],
            ['10','10','','25','31.7'],['11','12','','26','33.3'],['12','13','','27','35.0'],
            ['13','15','','28','36.7'],['14','16','','29','38.3'],['15','18','','30','40.0']] },
    { name:'맛의 균형', type:'P', tier:30, prereq:'손질 달인 Lv.10', excl:'-',
      desc:'조리된 음식 섭취 시 기본 유지시간이 증가합니다.',
      cols:['레벨','유지시간 증가(초)','','레벨','유지시간 증가(초)'],
      rows:[['1','1','','16','22'],['2','2','','17','24'],['3','3','','18','26'],
            ['4','4','','19','28'],['5','5','','20','30'],['6','6','','21','34'],
            ['7','7','','22','38'],['8','8','','23','42'],['9','9','','24','46'],
            ['10','10','','25','50'],['11','12','','26','54'],['12','14','','27','58'],
            ['13','16','','28','62'],['14','18','','29','66'],['15','20','','30','70']] },
    { name:'미식가', type:'P', tier:30, prereq:'맛의 균형 Lv.10', excl:'-',
      desc:'높은 등급의 음식이 나올 확률이 증가합니다.',
      cols:['레벨','확률(%)','','레벨','확률(%)'],
      rows:[['1','1','','16','20'],['2','2','','17','22'],['3','3','','18','24'],
            ['4','4','','19','26'],['5','5','','20','28'],['6','6','','21','29.3'],
            ['7','7','','22','30.7'],['8','8','','23','32.0'],['9','9','','24','33.3'],
            ['10','10','','25','34.7'],['11','12','','26','36.0'],['12','14','','27','37.3'],
            ['13','16','','28','38.7'],['14','18','','29','40.0'],['15','19','','30','42.0']] },
    { name:'즉시 완성', type:'A', tier:30, prereq:'미식가 Lv.10', excl:'연회 준비',
      desc:'스킬 발동 시 일정 확률로 요리가 즉시 완성되고 추가 요리 횟수가 증가합니다.',
      act:'우클릭 (보주 착용)',
      cols:['레벨','즉시 완성 확률(%)','추가 요리','지속(초)','쿨타임(초)','마나'],
      rows:[['1','8','1','40','480','30'],['5','16','1','72','480','32'],
            ['10','26','1','112','480','36'],['15','36','2','152','480','41'],
            ['20','46','3','192','480','47'],['25','57','4','250','480','60'],
            ['30','75','5','330','480','70']] },
    { name:'연회 준비', type:'A', tier:30, prereq:'미식가 Lv.10', excl:'즉시 완성',
      desc:'스킬 발동 시 일정 확률로 요리가 1회 추가 완성됩니다.',
      act:'좌클릭 (보주 착용)',
      cols:['레벨','즉시 완성 확률(%)','추가 요리','지속(초)','쿨타임(초)','마나'],
      rows:[['1','8','1','40','480','30'],['5','16','1','72','480','32'],
            ['10','26','1','112','480','36'],['15','36','2','152','480','41'],
            ['20','46','3','192','480','47'],['25','57','4','250','480','60'],
            ['30','75','5','330','480','70']] },
  ]},
};

var SMELT_DATA = [
  { name:'미스릴 주괴',      ore:'일반 미스릴 원석',      qty:3, fuel:4, time:'15초',
    prob:'커먼 80% / 언커먼 15% / 레어 5%' },
  { name:'아르젠타이트 주괴', ore:'일반 아르젠타이트 원석', qty:3, fuel:4, time:'15초',
    prob:'커먼 80% / 언커먼 15% / 레어 5%' },
  { name:'벨리움 주괴',      ore:'일반 벨리움 원석',      qty:3, fuel:4, time:'15초',
    prob:'커먼 80% / 언커먼 15% / 레어 5%' },
];

function initLife(job) {
  _curJob    = job || 'mining';
  _curSubtab = 'skill';
  requestAnimationFrame(function() {
    _setPillActive(_curJob);
    _renderSubtabs();
    _renderContent();
  });
}

function switchLifeJob(job, el) {
  _curJob = job;
  _curSubtab = 'skill';
  _setPillActive(job);
  _renderSubtabs();
  _renderContent();
}

function _setPillActive(job) {
  document.querySelectorAll('.life-job-pill').forEach(function(t) {
    t.classList.toggle('active', t.dataset.job === job);
  });
}

function _renderSubtabs() {
  var wrap = document.getElementById('life-sub-tabs');
  if (!wrap) return;
  var tabs = _curJob === 'mining'
    ? [['skill','⚡ 스킬'],['smelt','🔩 제련']]
    : [['skill','⚡ 스킬']];
  wrap.innerHTML = tabs.map(function(t) {
    return '<div class="life-sub-tab' + (_curSubtab === t[0] ? ' active' : '') + '" ' +
      'onclick="switchLifeSubtab(\'' + t[0] + '\',this)">' + t[1] + '</div>';
  }).join('');
}

function switchLifeSubtab(tab, el) {
  _curSubtab = tab;
  document.querySelectorAll('.life-sub-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');
  _renderContent();
}

function _renderContent() {
  var root = document.getElementById('life-content');
  if (!root) return;
  var job = LIFE_JOBS[_curJob];
  if (!job) return;

  var title = document.getElementById('life-title');
  var sub   = document.getElementById('life-sub');
  if (title) title.textContent = job.label + ' 스킬';
  if (sub)   sub.textContent   = '사용 보주: ' + job.bouju + ' · 기본 Lv.20 / 강화 최대 Lv.30';

  if (_curSubtab === 'smelt') {
    root.innerHTML = _buildSmeltPanel();
  } else {
    root.innerHTML = _buildSkillPanel(_curJob);
  }
}

function _buildSkillPanel(jobKey) {
  var data = SKILL_DATA[jobKey];
  if (!data) return '<div class="empty">데이터가 없습니다.</div>';
  var job  = LIFE_JOBS[jobKey];

  var header =
    '<div class="sk-header">' +
      '<span class="sk-header-icon">🔮</span>' +
      '<div>' +
        '<div class="sk-header-title">' + job.icon + ' ' + job.label + ' 스킬</div>' +
        '<div class="sk-header-sub">사용 보주: <strong style="color:' + job.color + '">' + job.bouju + '</strong> &nbsp;·&nbsp; 기본 최대 Lv.20 / 강화 최대 Lv.30</div>' +
      '</div>' +
    '</div>';

  var cards = data.skills.map(function(sk, idx) {
    var isActive   = sk.type === 'A';
    var typeLabel  = isActive ? 'ACTIVE' : 'PASSIVE';
    var typeColor  = isActive ? 'var(--purple)' : 'var(--teal)';
    var typeClass  = isActive ? 'skill-type-a' : 'skill-type-p';
    var maxLv      = sk.maxLv || sk.tier || 30;
    var imgUrl     = SKILL_IMGS[sk.name] || '';
    var imgHtml    = imgUrl
      ? '<img class="sk-card-img" src="' + imgUrl + '" alt="' + sk.name + '" loading="lazy">'
      : '<div class="sk-card-img sk-card-img-empty"><span style="font-size:28px;">' + job.icon + '</span></div>';

    var tierBadge   = '<span class="tag" style="background:var(--bg-3);color:var(--muted);">최대 Lv.' + maxLv + '</span>';
    var prereqBadge = sk.prereq && sk.prereq !== '-'
      ? '<span class="tag" style="background:var(--bg-3);color:var(--muted);">선행: ' + sk.prereq + '</span>' : '';
    var exclBadge   = sk.excl && sk.excl !== '-'
      ? '<span class="tag tag-red">⚔ 택1: ' + sk.excl + '</span>' : '';

    var actBox = sk.act
      ? '<div class="sk-act-box"><span class="sk-act-key">발동</span><span class="sk-act-val">' + sk.act + '</span></div>'
      : '';
    var noteHtml = sk.note
      ? '<div class="sk-note">💡 ' + sk.note + '</div>' : '';

    // 빈 컬럼('')은 시각적 구분선으로 처리
    var visibleCols = sk.cols.filter(function(c) { return c !== ''; });
    var thHtml = sk.cols.map(function(c) {
      return c === '' ? '<th class="sk-col-sep"></th>' : '<th>' + c + '</th>';
    }).join('');
    var rows = sk.rows.map(function(r) {
      var tds = r.map(function(v) {
        return v === '' ? '<td class="sk-col-sep"></td>' : '<td>' + v + '</td>';
      }).join('');
      return '<tr>' + tds + '</tr>';
    }).join('');

    return (
      '<div class="skill-card" id="sk-' + jobKey + '-' + idx + '" style="--sk-color:' + typeColor + ';">' +
        '<div class="skill-card-hd" onclick="toggleSkill(\'' + jobKey + '\',' + idx + ')">' +
          '<div class="sk-img-wrap">' + imgHtml + '</div>' +
          '<div class="sk-card-main">' +
            '<div class="sk-card-top">' +
              '<span class="skill-name">' + sk.name + '</span>' +
              '<span class="skill-type ' + typeClass + '">' + typeLabel + '</span>' +
            '</div>' +
            '<div class="skill-desc">' + sk.desc + '</div>' +
            '<div class="sk-badges">' + tierBadge + prereqBadge + exclBadge + '</div>' +
          '</div>' +
          '<span class="skill-arrow">▾</span>' +
        '</div>' +
        '<div class="skill-table-wrap">' +
          actBox + noteHtml +
          '<table class="skill-table">' +
            '<thead><tr>' + thHtml + '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  return header + '<div class="skill-list">' + cards + '</div>';
}

function toggleSkill(job, idx) {
  var card = document.getElementById('sk-' + job + '-' + idx);
  if (card) card.classList.toggle('open');
}

function _buildSmeltPanel() {
  var dex  = parseInt(window._charStats && window._charStats['손재주'] ? window._charStats['손재주'] : 0) || 0;
  var prob = _calcSmeltProb(dex);

  var probCard = '<div class="smelt-prob">' +
    '<div class="smelt-prob-hd">' +
      '<span class="smelt-prob-title">✨ 별 등급 출현 확률</span>' +
      '<span class="smelt-dex-badge">손재주 ' + dex + '</span>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--muted);margin-bottom:12px;">커먼 80% / 언커먼 15% / 레어 5% (기본) · 손재주로 은별·금별 확률 증가</div>' +
    '<div class="smelt-bars">' +
      '<div class="smelt-bar-row">' +
        '<span class="smelt-star" style="color:var(--muted)">커먼</span>' +
        '<div class="smelt-bar-bg smelt-bar-plain"><div class="smelt-bar-fill" style="width:' + prob.plain + '%"></div></div>' +
        '<span class="smelt-pct">' + prob.plain + '%</span>' +
      '</div>' +
      '<div class="smelt-bar-row">' +
        '<span class="smelt-star" style="color:#c0c0c0">언커먼</span>' +
        '<div class="smelt-bar-bg smelt-bar-silver"><div class="smelt-bar-fill" style="width:' + Math.min(prob.silver,100) + '%"></div></div>' +
        '<span class="smelt-pct">' + prob.silver + '%</span>' +
      '</div>' +
      '<div class="smelt-bar-row">' +
        '<span class="smelt-star" style="color:#ffd700">레어</span>' +
        '<div class="smelt-bar-bg smelt-bar-gold"><div class="smelt-bar-fill" style="width:' + Math.min(prob.gold,100) + '%"></div></div>' +
        '<span class="smelt-pct">' + prob.gold + '%</span>' +
      '</div>' +
    '</div>' +
    (dex === 0 ? '<div class="smelt-hint">💡 메인 페이지에서 /생활 정보를 붙여넣으면 손재주 수치가 자동 반영됩니다.</div>' : '') +
    '</div>';

  var cards = SMELT_DATA.map(function(d) {
    return '<div class="recipe-card">' +
      '<div class="recipe-card-hd">' +
        '<div class="recipe-img">🪨</div>' +
        '<div>' +
          '<div class="recipe-name">' + d.name + '</div>' +
          '<div class="recipe-meta">' +
            '<span class="tag tag-teal">⏱ ' + d.time + '</span>' +
            '<span class="tag" style="color:var(--muted);background:var(--bg-3);font-size:10px;">' + d.prob + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="recipe-mats">' +
        '<span class="mat-tag">' + d.ore + ' <span class="mat-qty">×' + d.qty + '</span></span>' +
        '<span class="mat-tag">마그마 블록 <span class="mat-qty">×' + d.fuel + '</span></span>' +
        '<span class="mat-tag" style="color:var(--red);font-size:10px;">🔥 허름한 화로</span>' +
      '</div>' +
    '</div>';
  }).join('');

  return probCard + '<div class="recipe-grid" style="margin-top:16px;">' + cards + '</div>';
}

function _calcSmeltProb(dex) {
  var plain  = 80;
  var silver = 15 + dex * 0.5;
  var gold   = 5  + dex * 0.3;
  var total  = plain + silver + gold;
  return {
    plain:  (plain  / total * 100).toFixed(1),
    silver: (silver / total * 100).toFixed(1),
    gold:   (gold   / total * 100).toFixed(1),
  };
}
