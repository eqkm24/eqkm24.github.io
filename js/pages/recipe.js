var _curCat = 'bench';

var RECIPE_DATA = {
  bench: {
    label: '🔧 편백나무 작업대',
    cap: '최대 3개 설치',
    sections: [
      {
        title: '강화 (스크롤·보주)',
        items: [
          { name:'일반 별빛 스크롤', grade:'n', time:'300초', prob:'100%', mats:[['별빛 스크롤 조각(일반)',8],['일반 달빛 촉매제',1]] },
          { name:'고급 별빛 스크롤', grade:'a', time:'300초', prob:'100%', mats:[['별빛 스크롤 조각(고급)',8],['고급 달빛 촉매제',1]] },
          { name:'희귀 별빛 스크롤', grade:'r', time:'300초', prob:'100%', mats:[['별빛 스크롤 조각(희귀)',8],['희귀 달빛 촉매제',1]] },
          { name:'영웅 별의 보주',   grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
          { name:'영웅 바다의 보주', grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
          { name:'영웅 태양의 보주', grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
          { name:'영웅 대지의 보주', grade:'h', time:'300초', prob:'60%',  mats:[['희귀 별의 조각',8],['희귀 별가루',1]] },
        ]
      },
      {
        title: '가구·설비',
        items: [
          { name:'허름한 화로',    grade:'n', time:'300초', prob:'100%', mats:[['심층암',15],['용광로',1],['모닥불',1],['마그마 블록',2]] },
          { name:'허름한 조리대', grade:'n', time:'300초', prob:'100%', mats:[['편백나무 원목',10],['철 창살',5],['가마솥',1],['모닥불',1]] },
          { name:'평범한 화분통', grade:'n', time:'60초',  prob:'100%', mats:[['편백나무 원목',2],['퇴비통',1],['흙',3]] },
          { name:'깔끔한 화분통', grade:'a', time:'60초',  prob:'100%', mats:[['편백나무 원목',5],['평범한 화분통',1],['회백토',3]] },
          { name:'허수아비',      grade:'n', time:'60초',  prob:'100%', mats:[['대나무 블록',10],['가죽 모자',1],['가죽 조끼',1],['가죽 바지',1],['가죽 장화',1],['갑옷 거치대',1]] },
          { name:'비닐하우스',    grade:'n', time:'60초',  prob:'100%', mats:[['유리',16],['차광 유리',1]] },
        ]
      },
      {
        title: '농사 도구',
        items: [
          { name:'구리 물뿌리개',         grade:'n', time:'180초', prob:'100%', mats:[['물 양동이',1],['구리 블록',5],['철 블록',3]] },
          { name:'철 물뿌리개',           grade:'a', time:'180초', prob:'90%',  mats:[['구리 물뿌리개',1],['미스릴 주괴',3],['철 블록',5]] },
          { name:'금 물뿌리개',           grade:'r', time:'180초', prob:'70%',  mats:[['철 물뿌리개',1],['아르젠타이트 주괴',3],['금 블록',5]] },
          { name:'트라이어드 물뿌리개',   grade:'h', time:'180초', prob:'30%',  mats:[['금 물뿌리개',1],['벨리움 주괴',4]] },
          { name:'철제 스프링클러',       grade:'a', time:'180초', prob:'100%', mats:[['물 양동이',1],['미스릴 주괴',3],['철 블록',5]] },
          { name:'금 스프링클러',         grade:'r', time:'180초', prob:'80%',  mats:[['철제 스프링클러',1],['아르젠타이트 주괴',3],['금 블록',5]] },
          { name:'트라이어드 스프링클러', grade:'h', time:'180초', prob:'60%',  mats:[['금 스프링클러',1],['벨리움 주괴',4]] },
        ]
      },
      {
        title: '낚시 도구',
        items: [
          { name:'지렁이 미끼',  grade:'n', time:'5초', prob:'100%', mats:[['일반↑ 말린 농작물',10],['일반↑ 말린 물고기',10]] },
          { name:'어분 미끼',    grade:'a', time:'5초', prob:'100%', mats:[['고급↑ 말린 농작물',10],['고급↑ 말린 물고기',10]] },
          { name:'루어 미끼',    grade:'r', time:'5초', prob:'100%', mats:[['희귀↑ 말린 농작물',20],['희귀↑ 말린 물고기',10]] },
          { name:'평범한 떡밥', grade:'n', time:'5초', prob:'100%', mats:[['지렁이 미끼',1],['일반↑ 말린 농작물',1],['일반↑ 말린 물고기',1]] },
          { name:'잘만든 떡밥', grade:'a', time:'5초', prob:'100%', mats:[['어분 미끼',1],['고급↑ 말린 농작물',1],['고급↑ 말린 물고기',1]] },
          { name:'무지개 떡밥', grade:'r', time:'5초', prob:'100%', mats:[['루어 미끼',1],['희귀↑ 말린 농작물',2],['희귀↑ 말린 물고기',1]] },
        ]
      },
      {
        title: '장비',
        items: [
          { name:'트라이어드 투구',  grade:'h', time:'300초', prob:'100%', mats:[['네더라이트 투구',1],['미스릴 주괴',2],['아르젠타이트 주괴',2],['벨리움 주괴',2]] },
          { name:'트라이어드 흉갑',  grade:'h', time:'300초', prob:'100%', mats:[['네더라이트 흉갑',1],['미스릴 주괴',2],['아르젠타이트 주괴',2],['벨리움 주괴',2]] },
          { name:'트라이어드 레깅스',grade:'h', time:'300초', prob:'100%', mats:[['네더라이트 레깅스',1],['미스릴 주괴',2],['아르젠타이트 주괴',2],['벨리움 주괴',2]] },
          { name:'트라이어드 부츠',  grade:'h', time:'300초', prob:'100%', mats:[['네더라이트 부츠',1],['미스릴 주괴',2],['아르젠타이트 주괴',2],['벨리움 주괴',2]] },
          { name:'겉날개',           grade:'h', time:'300초', prob:'50%',  mats:[['드래곤의 왼쪽 날개',1],['드래곤의 오른쪽 날개',1],['가스트의 눈물',2]] },
        ]
      },
    ]
  },
  brazier: {
    label: '🔥 허름한 화로',
    cap: '최대 3개 설치',
    sections: [
      {
        title: '제련 목록',
        items: [
          { name:'말린 농작물',       grade:'n', time:'5초',  prob:'100%', mats:[['농작물',10],['마그마 블록',5]] },
          { name:'말린 물고기',       grade:'n', time:'5초',  prob:'100%', mats:[['물고기',10],['마그마 블록',5]] },
          { name:'미스릴 주괴',       grade:'n', time:'15초', prob:'100%', mats:[['일반 미스릴 원석',3],['마그마 블록',4]] },
          { name:'아르젠타이트 주괴', grade:'a', time:'15초', prob:'100%', mats:[['일반 아르젠타이트 원석',3],['마그마 블록',4]] },
          { name:'벨리움 주괴',       grade:'r', time:'15초', prob:'100%', mats:[['일반 벨리움 원석',3],['마그마 블록',4]] },
        ]
      }
    ]
  },
  counter: {
    label: '🥣 허름한 조리대',
    cap: '최대 6개 설치',
    sections: [
      {
        title: '요리 목록',
        items: [
          { name:'쌈밥',           grade:'n', time:'30초', prob:'80%', mats:[['잡어',1],['상추',2],['옥수수',2]] },
          { name:'옥수수 전',      grade:'n', time:'30초', prob:'80%', mats:[['정어리',1],['상추',2],['옥수수',2]] },
          { name:'전골',           grade:'n', time:'30초', prob:'80%', mats:[['메기',1],['양배추',2],['무',2]] },
          { name:'무조림',         grade:'n', time:'30초', prob:'80%', mats:[['잉어',1],['양배추',2],['무',2]] },
          { name:'가스파초',       grade:'n', time:'30초', prob:'80%', mats:[['잡어',1],['무',2],['옥수수',2]] },
          { name:'옥수수 착즙 주스',grade:'n', time:'15초', prob:'90%', mats:[['옥수수',1],['상추',1]] },
          { name:'무 착즙 주스',   grade:'n', time:'15초', prob:'90%', mats:[['무',2],['양배추',2]] },
          { name:'부야베스',       grade:'a', time:'40초', prob:'80%', mats:[['적색통돔',1],['아귀',1],['토마토',3],['석류',3]] },
          { name:'치오피노',       grade:'a', time:'40초', prob:'80%', mats:[['다랑어',1],['랍스터',1],['토마토',3],['파인애플',3]] },
          { name:'파에야',         grade:'a', time:'40초', prob:'80%', mats:[['농어',1],['숭어',1],['옥수수',3],['토마토',3]] },
          { name:'세비체',         grade:'a', time:'40초', prob:'80%', mats:[['블루탱',1],['흰동가리',1],['레몬',3],['딸기',3]] },
          { name:'페페스',         grade:'a', time:'40초', prob:'80%', mats:[['개복치',1],['줄돔',1],['습지개구리',1],['바나나',3],['토마토',3]] },
          { name:'해산물 그릴 플래터', grade:'a', time:'40초', prob:'80%', mats:[['만타 가오리',1],['문어',1],['파인애플',3],['오렌지',3]] },
          { name:'데리야끼',       grade:'a', time:'40초', prob:'80%', mats:[['연어',1],['철갑상어',1],['오렌지',3],['파인애플',3]] },
          { name:'에스카베체',     grade:'a', time:'40초', prob:'80%', mats:[['강꼬치고기',1],['금붕어',1],['석류',3],['레몬',3]] },
          { name:'양장피',         grade:'a', time:'40초', prob:'80%', mats:[['푸른 해파리',1],['뱀장어',1],['양배추',3],['무',3]] },
        ]
      }
    ]
  }
};

var LC_IMGS = {
  // 편백나무 작업대
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
  '트라이어드 투구': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FYeOHQI7XFjEc6X0lPOBC%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-06%2520133159.png%3Falt%3Dmedia%26token%3D9be78867-518e-42ab-8f63-e8bb7aa84f3f&width=300&dpr=1&quality=100&sign=5b71f54b&sv=2',
  '트라이어드 흉갑': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FkAB84hRJyQUQIZizqGaJ%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-06%2520133204-Photoroom.png%3Falt%3Dmedia%26token%3D9de0993c-ce02-4240-b489-2fe575ff9c21&width=300&dpr=1&quality=100&sign=d0a3715b&sv=2',
  '트라이어드 레깅스': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FiqMHAb77jdfA90i49DcN%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-06%2520133213-Photoroom.png%3Falt%3Dmedia%26token%3D26ae411f-680a-43e0-90b9-bb93e3f273d6&width=300&dpr=1&quality=100&sign=6cbca84&sv=2',
  '트라이어드 부츠':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FFFGg4QYLFANHT8xKQwI9%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-06%2520133209-Photoroom.png%3Falt%3Dmedia%26token%3De7b4144e-9574-4e8c-aa19-697600c7628f&width=300&dpr=1&quality=100&sign=f94e8c38&sv=2',
  '겉날개':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FfsThiQBK3kncd11gpTbE%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-03-22%2520112549-Photoroom.png%3Falt%3Dmedia%26token%3Dd72256bb-59b7-40ad-b5ae-055c845ef37b&width=300&dpr=1&quality=100&sign=e56cb1a5&sv=2',
  // 허름한 화로
  '말린 농작물':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FWmr9KOuKZD6GJfgtETqy%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520160749-Photoroom.png%3Falt%3Dmedia%26token%3D8746d02e-231e-47ef-ab18-41dc9679903b&width=300&dpr=1&quality=100&sign=2e20e4ee&sv=2',
  '말린 물고기':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FCT2gw1RfJtfJcGg1yK1U%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520160754-Photoroom.png%3Falt%3Dmedia%26token%3D3719499b-9ffd-4b58-8b48-b381bff9cd5a&width=300&dpr=1&quality=100&sign=3e424bde&sv=2',
  '미스릴 주괴':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F7HZUgK04fGjNC6qZtpf6%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520160802-Photoroom.png%3Falt%3Dmedia%26token%3Da3897fb1-7bd1-4e16-832e-9388e4c71b26&width=300&dpr=1&quality=100&sign=6250bdd0&sv=2',
  '아르젠타이트 주괴':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FRhQNAMB8TA1cofCGvBSz%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520160759-Photoroom.png%3Falt%3Dmedia%26token%3Dc5837e66-d0c1-40ad-aad2-0fe5dec64ad5&width=300&dpr=1&quality=100&sign=e442875b&sv=2',
  '벨리움 주괴':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FXwxsKcld7Pc1hQrV2JlM%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520160805-Photoroom.png%3Falt%3Dmedia%26token%3D9e56f877-431e-4cca-a56f-040af76c5967&width=300&dpr=1&quality=100&sign=e2d223dd&sv=2',
  // 허름한 조리대
  '쌈밥':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FjDEsKOdsvxKZZ9OAKjfc%252F2026-01-28_142454-Photoroom.png%3Falt%3Dmedia%26token%3Db42c97a6-c2cc-4ac8-98eb-b578682d8620&width=300&dpr=1&quality=100&sign=a57fb6cd&sv=2',
  '옥수수 전':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FH2HaOgHFH4vSHX8h4HlI%252F2026-01-28_142459-Photoroom.png%3Falt%3Dmedia%26token%3D4a1a8918-03a7-4672-b094-d5ca16e3f966&width=300&dpr=1&quality=100&sign=b6598bc2&sv=2',
  '전골':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F3yLchigMHfSxkSKlDzd1%252F2026-01-28_142503-Photoroom.png%3Falt%3Dmedia%26token%3D76715517-51c6-42e8-b0fc-373994254e1b&width=300&dpr=1&quality=100&sign=de847d51&sv=2',
  '무조림':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FVxPpEFqIjv5rMp8LpDgz%252F2026-01-28_142507-Photoroom.png%3Falt%3Dmedia%26token%3D5ecbfc5a-8111-4453-9866-72f21e7baba2&width=300&dpr=1&quality=100&sign=99e469de&sv=2',
  '가스파초':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FErXuYWvp7DaUw5ixp4gb%252F2026-01-28_142514-Photoroom.png%3Falt%3Dmedia%26token%3D244a0fd7-ca47-45b0-b9f6-32d2daec5648&width=300&dpr=1&quality=100&sign=25df63fd&sv=2',
  '옥수수 착즙 주스':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FfZUYZpzVRPqZmpcVUg1w%252F2026-01-28_142518-Photoroom.png%3Falt%3Dmedia%26token%3Dfa835b06-be86-42f2-aa59-765171085c9f&width=300&dpr=1&quality=100&sign=96370c65&sv=2',
  '무 착즙 주스':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FL66D6NymOq9Vs6TNVMuT%252F2026-01-28_142522-Photoroom.png%3Falt%3Dmedia%26token%3Ddbf07792-38a8-4227-9df0-976a1d2eb779&width=300&dpr=1&quality=100&sign=fcf6c216&sv=2',
  '부야베스':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FeayMl2fdRbxrvCCqjKgE%252F2026-01-28_142527-Photoroom.png%3Falt%3Dmedia%26token%3D2f2848e4-694f-4da3-abc8-c02e0edafb04&width=300&dpr=1&quality=100&sign=db88edf2&sv=2',
  '치오피노':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FsqxOskduiRPRSVs5jlp1%252F2026-01-28_142533-Photoroom.png%3Falt%3Dmedia%26token%3Df4f3aa12-9d54-458f-85a5-bc027498043e&width=300&dpr=1&quality=100&sign=8b7dbe3f&sv=2',
  '파에야':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F2yLZ0dQt90pc2ANN7jde%252F2026-01-28_142542-Photoroom.png%3Falt%3Dmedia%26token%3D6df82eb2-8684-4177-812c-4353d4b10c41&width=300&dpr=1&quality=100&sign=2d1224f8&sv=2',
  '세비체':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F0ATU1S6Khf55SaotyXke%252F2026-01-28_142546-Photoroom.png%3Falt%3Dmedia%26token%3Da0c5779e-648c-4cd6-8089-dabfce9d3571&width=300&dpr=1&quality=100&sign=3a920968&sv=2',
  '페페스':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FG5P4Cbz4uurZatCCCFXp%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-29%2520143355-Photoroom.png%3Falt%3Dmedia%26token%3D40ae4cad-96dc-499e-adab-8657b39d94d6&width=300&dpr=1&quality=100&sign=671c10dd&sv=2',
  '해산물그릴플래터':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FcTWfoYqUbLjjadGhDyr8%252F2026-01-28_142556-Photoroom.png%3Falt%3Dmedia%26token%3D2e68abea-32fb-4cf3-ad94-daa9b1dd5b20&width=300&dpr=1&quality=100&sign=8321cb4f&sv=2',
  '데리야끼':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FWazrHJQ3aETvW4E7JWWV%252F2026-01-28_142601-Photoroom.png%3Falt%3Dmedia%26token%3D861802af-6d5c-45a9-903f-2fa3215f364b&width=300&dpr=1&quality=100&sign=e8caa11a&sv=2',
  '에스카베체':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FwtZ7JYb7e795QNsLvh4n%252F2026-01-28_142605-Photoroom.png%3Falt%3Dmedia%26token%3Daaaa26b2-94a9-41ff-91cf-12d5e002dd57&width=300&dpr=1&quality=100&sign=630ca7b1&sv=2',
  '양장피':  'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FHndUKQUDEpkMo5sK1f1W%252F2026-01-28_142612-Photoroom.png%3Falt%3Dmedia%26token%3D33baa53d-2f81-46f2-9a0a-58ce1cf061f7&width=300&dpr=1&quality=100&sign=e1ee472c&sv=2',
  
};

function initRecipe() {
  requestAnimationFrame(function() {
    var firstBtn = document.querySelector('[data-cat="bench"]');
    switchRecipeCat('bench', firstBtn);
  });
}

function switchRecipeCat(cat, el) {
  _curCat = cat;
  document.querySelectorAll('.recipe-tab').forEach(function(t) { t.classList.remove('active'); });
  if (el) el.classList.add('active');

  var data = RECIPE_DATA[cat];
  if (!data) return;

  var cap = document.getElementById('recipe-cap');
  if (cap) cap.textContent = data.label + ' — ' + data.cap;

  var search = document.getElementById('recipe-search');
  if (search) search.value = '';

  renderRecipe();
}

function renderRecipe() {
  var grid = document.getElementById('recipe-grid');
  if (!grid) return;

  var q    = (document.getElementById('recipe-search')?.value || '').toLowerCase().trim();
  var data = RECIPE_DATA[_curCat];
  if (!data) return;

  var html = '';

  data.sections.forEach(function(sec) {
    var items = sec.items;
    if (q) {
      items = items.filter(function(it) {
        return it.name.toLowerCase().includes(q) ||
               it.mats.some(function(m) { return String(m[0]).toLowerCase().includes(q); });
      });
    }
    if (!items.length) return;

    html += '<div style="grid-column:1/-1;margin-top:8px;margin-bottom:2px;">' +
            '<span style="font-size:11px;font-weight:700;letter-spacing:1.2px;' +
            'color:var(--muted);text-transform:uppercase;">' + sec.title + '</span></div>';

    items.forEach(function(it) {
      var imgUrl  = LC_IMGS[it.name] || '';
      var imgHtml = imgUrl
        ? '<img src="' + imgUrl + '" alt="' + it.name + '" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;" loading="lazy">'
        : '<span style="font-size:20px;">📦</span>';

      var gradeLbl = { n:'일반', a:'고급', r:'희귀', h:'영웅' }[it.grade] || '';
      var gradeTag = { n:'tag-blue', a:'tag-teal', r:'tag-purple', h:'tag-amber' }[it.grade] || 'tag-blue';
      var probBadge = (it.prob !== '100%')
        ? '<span class="tag tag-amber">' + it.prob + '</span>' : '';

      var matsHtml = it.mats.map(function(m) {
        return '<span class="mat-tag">' + m[0] + ' <span class="mat-qty">×' + m[1] + '</span></span>';
      }).join('');

      html +=
        '<div class="recipe-card">' +
          '<div class="recipe-card-hd">' +
            '<div class="recipe-img">' + imgHtml + '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div class="recipe-name">' + it.name + '</div>' +
              '<div class="recipe-meta">' +
                '<span class="tag ' + gradeTag + '">' + gradeLbl + '</span>' +
                '<span class="tag" style="color:var(--muted);background:var(--bg-3);">⏱ ' + it.time + '</span>' +
                probBadge +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="recipe-mats">' + matsHtml + '</div>' +
        '</div>';
    });
  });

  if (!html) {
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">' +
      '<div class="empty-icon">🔍</div>검색 결과가 없어요.</div>';
  } else {
    grid.innerHTML = html;
  }
}
