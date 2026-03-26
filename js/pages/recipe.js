/* ═══ 제작 레시피 ═══ */

const FAC_INFO = {
  bench:   { label:'🔧 편백나무 작업대', cap:'최대 3개 설치', cls:'tag-blue'   },
  brazier: { label:'🔥 허름한 화로',     cap:'최대 3개 설치', cls:'tag-red'    },
  counter: { label:'🥣 허름한 조리대',   cap:'최대 6개 설치', cls:'tag-purple' },
};

// 루나위키 이미지 URL (gitbook CDN)
const LC_IMGS = {
  '일반 별빛 스크롤': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FwL3rbhSjv7NYJb737NlO%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163657-Photoroom.png%3Falt%3Dmedia%26token%3D7fe08f92-b032-4be3-98bd-a5cb5ca9bd14&width=300&dpr=1&quality=100&sign=a977aa53&sv=2',
  '고급 별빛 스크롤': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FEYtKwsA1EvQijSwxLb42%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163708-Photoroom.png%3Falt%3Dmedia%26token%3D9d6e9c67-ac84-4d0e-8c27-09cae24f640f&width=300&dpr=1&quality=100&sign=3112074a&sv=2',
  '희귀 별빛 스크롤': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F53rzAM2dRepNSchVUqBy%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163704-Photoroom.png%3Falt%3Dmedia%26token%3D1f7eb272-83fd-435d-b9ae-7c3f8bc15417&width=300&dpr=1&quality=100&sign=72f81876&sv=2',
  '영웅 별의 보주':   'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FI4oNA4IXDEW9mD0MoV84%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142613.png%3Falt%3Dmedia%26token%3D4427390d-fc62-4b0c-93cf-482fa0d9c29b&width=300&dpr=1&quality=100&sign=6bda1c7c&sv=2',
  '영웅 바다의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FXnXsh48xtScJnBKaonRF%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142620.png%3Falt%3Dmedia%26token%3D72c26004-7b58-4205-83e4-cff8aad3312f&width=300&dpr=1&quality=100&sign=1ec592a3&sv=2',
  '영웅 태양의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FnSmOQGWI38IMrr1wS1T7%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142616.png%3Falt%3Dmedia%26token%3D2fa535b8-92a7-4a10-ab61-8b133dc8f233&width=300&dpr=1&quality=100&sign=7f26cf7&sv=2',
  '영웅 대지의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FdQ6dT835zYIOkjruZm7R%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142625.png%3Falt%3Dmedia%26token%3De5e14286-78fb-419c-bf22-ee8472b13e92&width=300&dpr=1&quality=100&sign=ea05d4c6&sv=2',
  '허름한 화로':      'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FfZMsMPIMMUv5ffeRisxZ%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163922-Photoroom.png%3Falt%3Dmedia%26token%3D231ade34-2274-49df-ae1c-31f7c92e94dd&width=300&dpr=1&quality=100&sign=2b1cf7ad&sv=2',
  '허름한 조리대':    'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FdlCpVwFbQieXKY7vOnq2%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163930-Photoroom.png%3Falt%3Dmedia%26token%3Dcde35a5c-0898-4347-aa7b-c52e15fc916c&width=300&dpr=1&quality=100&sign=170031cf&sv=2',
  '평범한 화분통':    'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FFm9pp5p8JrjkQv5QdPOh%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164025-Photoroom.png%3Falt%3Dmedia%26token%3D76202652-a4eb-443c-beb1-bac18ae1f8b7&width=300&dpr=1&quality=100&sign=80ecbd92&sv=2',
  '깔끔한 화분통':    'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FLrsm4cMB4V9KOLHodkLy%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164028-Photoroom.png%3Falt%3Dmedia%26token%3D408f1aec-cc5e-4398-9a1d-7c58e3ac0700&width=300&dpr=1&quality=100&sign=5b9cc1a3&sv=2',
  '허수아비':         'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FAEzI8aSixjvUOq8zNC2j%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164036-Photoroom.png%3Falt%3Dmedia%26token%3D3dacf5ee-d56a-4a81-aaa3-a7df532ac958&width=300&dpr=1&quality=100&sign=c157784f&sv=2',
  '비닐하우스':       'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FTeSP6wHDimww8ee8KCOL%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164031.png%3Falt%3Dmedia%26token%3Dd024cc6a-a803-4623-b129-9480f69e6fe1&width=300&dpr=1&quality=100&sign=94137ce7&sv=2',
  '구리 물뿌리개':    'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FbN2QNf55Td9yCFhUWPBt%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164049-Photoroom.png%3Falt%3Dmedia%26token%3Dfedf51e3-965c-4803-9eb3-cfdf8ee85f54&width=300&dpr=1&quality=100&sign=89d56adc&sv=2',
  '철 물뿌리개':      'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FCBkPythcHgOlyebC3Kbq%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164052-Photoroom.png%3Falt%3Dmedia%26token%3D5f677ff9-8cd3-43e9-bbc6-9933c44355e2&width=300&dpr=1&quality=100&sign=a24784f6&sv=2',
  '금 물뿌리개':      'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252Faxx3VCr0qNlaIkA861Oh%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164055-Photoroom.png%3Falt%3Dmedia%26token%3D07c60c4a-7204-4057-9eb1-9e8755d5a5b7&width=300&dpr=1&quality=100&sign=f4d2cec3&sv=2',
  '트라이어드 물뿌리개': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FGdKdCDDKxKlAV4kcP2Nm%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164058-Photoroom.png%3Falt%3Dmedia%26token%3D6f4fff9e-8087-48cb-877e-10e0bb35eda0&width=300&dpr=1&quality=100&sign=c83d2cf5&sv=2',
  '철제 스프링클러':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FvCf4UdvwWKByjdpybTW1%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164039-Photoroom.png%3Falt%3Dmedia%26token%3D4d672db1-a747-45d5-b097-9bbcd62fab0f&width=300&dpr=1&quality=100&sign=77892441&sv=2',
  '금 스프링클러':    'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FKLTJcCEKHOSAZsq3uyQb%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164042-Photoroom.png%3Falt%3Dmedia%26token%3Ddd9aae61-b30e-4334-8893-27f20a415526&width=300&dpr=1&quality=100&sign=7ee4cae&sv=2',
  '트라이어드 스프링클러': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F6h6h0pLEEUXXHqpPr4yH%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164046-Photoroom.png%3Falt%3Dmedia%26token%3Ddc49b444-0128-4933-bcab-c5e2bb8514fb&width=300&dpr=1&quality=100&sign=c9eced8e&sv=2',
  '지렁이 미끼':      'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FnlIEY9vwuQiJzDfLmWVu%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-03%2520153551-Picsart-BackgroundRemover.png%3Falt%3Dmedia%26token%3D596aafc7-1595-4494-8149-9b4291e3bfe5&width=300&dpr=1&quality=100&sign=a915a0da&sv=2',
  '어분 미끼':        'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FoDwjLES9tDobhdzsqu6I%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164827-Photoroom.png%3Falt%3Dmedia%26token%3Da5dc32a3-47ed-4ad7-8c19-6b0380906703&width=300&dpr=1&quality=100&sign=ceaf17e0&sv=2',
  '루어 미끼':        'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FctubIuodLB3H0zl3Rm8q%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164814-Photoroom.png%3Falt%3Dmedia%26token%3D56fcb767-7fd9-4b4c-8581-86c6c6858aa7&width=300&dpr=1&quality=100&sign=464fef75&sv=2',
};

const RECIPE_DATA = {
  bench: [
    { name:'일반 별빛 스크롤', grade:'n', time:'300초', prob:'100%', mats:[['별빛 스크롤 조각(일반)',8],['일반 달빛 촉매제',1]] },
    { name:'고급 별빛 스크롤', grade:'a', time:'300초', prob:'100%', mats:[['별빛 스크롤 조각(고급)',8],['고급 달빛 촉매제',1]] },
    { name:'희귀 별빛 스크롤', grade:'r', time:'300초', prob:'100%', mats:[['별빛 스크롤 조각(희귀)',8],['희귀 달빛 촉매제',1]] },
    { name:'영웅 별의 보주',   grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'영웅 바다의 보주', grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'영웅 태양의 보주', grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'영웅 대지의 보주', grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
    { name:'허름한 화로',      grade:'n', time:'300초', prob:'100%', mats:[['심층암',15],['용광로',1],['모닥불',1],['마그마 블록',2]] },
    { name:'허름한 조리대',    grade:'n', time:'300초', prob:'100%', mats:[['편백나무 원목',10],['철 창살',5],['가마솥',1],['모닥불',1]] },
    { name:'평범한 화분통',    grade:'n', time:'60초',  prob:'100%', mats:[['편백나무 원목',2],['퇴비통',1],['흙',3]] },
    { name:'깔끔한 화분통',    grade:'a', time:'60초',  prob:'100%', mats:[['편백나무 원목',5],['평범한 화분통',1],['회백토',3]] },
    { name:'허수아비',         grade:'n', time:'60초',  prob:'100%', mats:[['대나무 블록',10],['가죽 모자',1],['가죽 조끼',1],['가죽 바지',1],['가죽 장화',1],['갑옷 거치대',1]] },
    { name:'비닐하우스',       grade:'n', time:'60초',  prob:'100%', mats:[['유리',16],['차광 유리',1]] },
    { name:'구리 물뿌리개',    grade:'n', time:'180초', prob:'100%', mats:[['물 양동이',1],['구리 블록',5],['철 블록',3]] },
    { name:'철 물뿌리개',      grade:'a', time:'180초', prob:'90%',  mats:[['구리 물뿌리개',1],['미스릴 주괴',3],['철 블록',5]] },
    { name:'금 물뿌리개',      grade:'r', time:'180초', prob:'70%',  mats:[['철 물뿌리개',1],['아르젠타이트 주괴',3],['금 블록',5]] },
    { name:'트라이어드 물뿌리개', grade:'h', time:'180초', prob:'30%', mats:[['금 물뿌리개',1],['벨리움 주괴',4]] },
    { name:'철제 스프링클러',  grade:'a', time:'180초', prob:'100%', mats:[['물 양동이',1],['미스릴 주괴',3],['철 블록',5]] },
    { name:'금 스프링클러',    grade:'r', time:'180초', prob:'80%',  mats:[['철제 스프링클러',1],['아르젠타이트 주괴',3],['금 블록',5]] },
    { name:'트라이어드 스프링클러', grade:'h', time:'180초', prob:'60%', mats:[['금 스프링클러',1],['벨리움 주괴',4]] },
    { name:'지렁이 미끼',      grade:'n', time:'5초',   prob:'100%', mats:[['일반↑ 말린 농작물',10],['일반↑ 말린 물고기',10]] },
    { name:'어분 미끼',        grade:'a', time:'5초',   prob:'100%', mats:[['고급↑ 말린 농작물',10],['고급↑ 말린 물고기',10]] },
    { name:'루어 미끼',        grade:'r', time:'5초',   prob:'100%', mats:[['희귀↑ 말린 농작물',20],['희귀↑ 말린 물고기',10]] },
  ],
  brazier: [
    { name:'말린 농작물',       grade:'n', time:'30초', prob:'100%', mats:[['농작물',10],['마그마 블록',5]] },
    { name:'말린 물고기',       grade:'n', time:'30초', prob:'100%', mats:[['물고기',10],['마그마 블록',5]] },
    { name:'미스릴 주괴',       grade:'n', time:'30초', prob:'100%', mats:[['일반 미스릴 원석',3],['마그마 블록',4]] },
    { name:'아르젠타이트 주괴', grade:'a', time:'30초', prob:'100%', mats:[['일반 아르젠타이트 원석',3],['마그마 블록',4]] },
    { name:'벨리움 주괴',       grade:'r', time:'30초', prob:'100%', mats:[['일반 벨리움 원석',3],['마그마 블록',4]] },
  ],
  counter: [
    { name:'요리 (커먼)',  grade:'n', time:'가변', prob:'가변', mats:[['레시피 재료','적량']] },
    { name:'요리 (언커먼)',grade:'a', time:'가변', prob:'가변', mats:[['레시피 재료','적량']] },
    { name:'요리 (레어)', grade:'r', time:'가변', prob:'가변', mats:[['레시피 재료','적량']] },
  ],
};

const GRADE_LABEL = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
const GRADE_TAG   = { n:'tag-blue', a:'tag-teal', r:'tag-purple', h:'tag-amber' };

let _curCat = 'bench';

function initRecipe() {
  // DOM이 완전히 로드된 후 실행
  requestAnimationFrame(() => {
    const firstTab = document.querySelector('[data-cat="bench"]');
    switchRecipeCat('bench', firstTab);
  });
}

function switchRecipeCat(cat, el) {
  _curCat = cat;
  document.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  else document.querySelector(`[data-cat="${cat}"]`)?.classList.add('active');

  const fac = FAC_INFO[cat] || {};
  const cap = document.getElementById('recipe-cap');
  if (cap) cap.textContent = `${fac.label} — ${fac.cap}`;

  const search = document.getElementById('recipe-search');
  if (search) search.value = '';
  renderRecipe();
}

function renderRecipe() {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;

  const q     = (document.getElementById('recipe-search')?.value || '').toLowerCase().trim();
  const items = RECIPE_DATA[_curCat] || [];
  const fac   = FAC_INFO[_curCat] || {};

  const filtered = q
    ? items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.mats.some(([m]) => String(m).toLowerCase().includes(q)))
    : items;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="empty-icon">🔍</div>검색 결과가 없어요.</div>`;
    return;
  }

  const facTag = `<span class="tag ${fac.cls}">${fac.label}</span>`;

  grid.innerHTML = filtered.map(it => {
    // 이름에서 이미지 찾기 (부분 매칭)
    const imgKey = Object.keys(LC_IMGS).find(k =>
      it.name.includes(k) || k.includes(it.name.replace(/^(일반|고급|희귀|영웅)\s*/,''))
    );
    const imgSrc = LC_IMGS[imgKey] || LC_IMGS[it.name] || '';
    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${it.name}" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;" loading="lazy">`
      : `<span style="font-size:22px;">📦</span>`;

    const probBadge = it.prob !== '100%' && it.prob !== '가변'
      ? `<span class="tag tag-amber">${it.prob}</span>` : '';

    const matsHtml = it.mats.map(([name, qty]) =>
      `<span class="mat-tag">${name} <span class="mat-qty">×${qty}</span></span>`
    ).join('');

    return `
    <div class="recipe-card">
      <div class="recipe-card-hd">
        <div class="recipe-img">${imgHtml}</div>
        <div style="flex:1;min-width:0;">
          <div class="recipe-name">${it.name}</div>
          <div class="recipe-meta">
            <span class="tag ${GRADE_TAG[it.grade]}">${GRADE_LABEL[it.grade]}</span>
            <span class="tag" style="color:var(--muted);background:var(--bg-3);">⏱ ${it.time}</span>
            ${probBadge}
            ${facTag}
          </div>
        </div>
      </div>
      <div class="recipe-mats">${matsHtml}</div>
    </div>`;
  }).join('');
}
