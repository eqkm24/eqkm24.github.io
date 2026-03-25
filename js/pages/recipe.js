/* ═══ 생활 제작 페이지 ═══ */

/* ── 루나위키에서 수집한 아이템 이미지 URL ── */
const LC_IMGS = {
  '일반 별빛 스크롤': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FwL3rbhSjv7NYJb737NlO%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163657-Photoroom.png%3Falt%3Dmedia%26token%3D7fe08f92-b032-4be3-98bd-a5cb5ca9bd14&width=300&dpr=1&quality=100&sign=a977aa53&sv=2',
  '고급 별빛 스크롤': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FEYtKwsA1EvQijSwxLb42%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163708-Photoroom.png%3Falt%3Dmedia%26token%3D9d6e9c67-ac84-4d0e-8c27-09cae24f640f&width=300&dpr=1&quality=100&sign=3112074a&sv=2',
  '희귀 별빛 스크롤': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F53rzAM2dRepNSchVUqBy%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163704-Photoroom.png%3Falt%3Dmedia%26token%3D1f7eb272-83fd-435d-b9ae-7c3f8bc15417&width=300&dpr=1&quality=100&sign=72f81876&sv=2',
  '영웅 별의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FI4oNA4IXDEW9mD0MoV84%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142613.png%3Falt%3Dmedia%26token%3D4427390d-fc62-4b0c-93cf-482fa0d9c29b&width=300&dpr=1&quality=100&sign=6bda1c7c&sv=2',
  '영웅 바다의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FXnXsh48xtScJnBKaonRF%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142620.png%3Falt%3Dmedia%26token%3D72c26004-7b58-4205-83e4-cff8aad3312f&width=300&dpr=1&quality=100&sign=1ec592a3&sv=2',
  '영웅 태양의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FnSmOQGWI38IMrr1wS1T7%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142616.png%3Falt%3Dmedia%26token%3D2fa535b8-92a7-4a10-ab61-8b133dc8f233&width=300&dpr=1&quality=100&sign=7f26cf7&sv=2',
  '영웅 대지의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FdQ6dT835zYIOkjruZm7R%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520142625.png%3Falt%3Dmedia%26token%3De5e14286-78fb-419c-bf22-ee8472b13e92&width=300&dpr=1&quality=100&sign=ea05d4c6&sv=2',
  '허름한 화로': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FfZMsMPIMMUv5ffeRisxZ%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163922-Photoroom.png%3Falt%3Dmedia%26token%3D231ade34-2274-49df-ae1c-31f7c92e94dd&width=300&dpr=1&quality=100&sign=2b1cf7ad&sv=2',
  '허름한 조리대': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FdlCpVwFbQieXKY7vOnq2%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520163930-Photoroom.png%3Falt%3Dmedia%26token%3Dcde35a5c-0898-4347-aa7b-c52e15fc916c&width=300&dpr=1&quality=100&sign=170031cf&sv=2',
  '평범한 화분통': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FFm9pp5p8JrjkQv5QdPOh%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164025-Photoroom.png%3Falt%3Dmedia%26token%3D76202652-a4eb-443c-beb1-bac18ae1f8b7&width=300&dpr=1&quality=100&sign=80ecbd92&sv=2',
  '깔끔한 화분통': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FLrsm4cMB4V9KOLHodkLy%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164028-Photoroom.png%3Falt%3Dmedia%26token%3D408f1aec-cc5e-4398-9a1d-7c58e3ac0700&width=300&dpr=1&quality=100&sign=5b9cc1a3&sv=2',
  '허수아비': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FAEzI8aSixjvUOq8zNC2j%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164036-Photoroom.png%3Falt%3Dmedia%26token%3D3dacf5ee-d56a-4a81-aaa3-a7df532ac958&width=300&dpr=1&quality=100&sign=c157784f&sv=2',
  '비닐하우스': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FTeSP6wHDimww8ee8KCOL%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164031.png%3Falt%3Dmedia%26token%3Dd024cc6a-a803-4623-b129-9480f69e6fe1&width=300&dpr=1&quality=100&sign=94137ce7&sv=2',
  '구리 물뿌리개': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FbN2QNf55Td9yCFhUWPBt%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164049-Photoroom.png%3Falt%3Dmedia%26token%3Dfedf51e3-965c-4803-9eb3-cfdf8ee85f54&width=300&dpr=1&quality=100&sign=89d56adc&sv=2',
  '철 물뿌리개': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FCBkPythcHgOlyebC3Kbq%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164052-Photoroom.png%3Falt%3Dmedia%26token%3D5f677ff9-8cd3-43e9-bbc6-9933c44355e2&width=300&dpr=1&quality=100&sign=a24784f6&sv=2',
  '금 물뿌리개': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252Faxx3VCr0qNlaIkA861Oh%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164055-Photoroom.png%3Falt%3Dmedia%26token%3D07c60c4a-7204-4057-9eb1-9e8755d5a5b7&width=300&dpr=1&quality=100&sign=f4d2cec3&sv=2',
  '트라이어드 물뿌리개': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FGdKdCDDKxKlAV4kcP2Nm%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164058-Photoroom.png%3Falt%3Dmedia%26token%3D6f4fff9e-8087-48cb-877e-10e0bb35eda0&width=300&dpr=1&quality=100&sign=c83d2cf5&sv=2',
  '철제 스프링클러': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FvCf4UdvwWKByjdpybTW1%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164039-Photoroom.png%3Falt%3Dmedia%26token%3D4d672db1-a747-45d5-b097-9bbcd62fab0f&width=300&dpr=1&quality=100&sign=77892441&sv=2',
  '금 스프링클러': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FKLTJcCEKHOSAZsq3uyQb%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164042-Photoroom.png%3Falt%3Dmedia%26token%3Ddd9aae61-b30e-4334-8893-27f20a415526&width=300&dpr=1&quality=100&sign=7ee4cae&sv=2',
  '트라이어드 스프링클러': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F6h6h0pLEEUXXHqpPr4yH%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-02-28%2520164046-Photoroom.png%3Falt%3Dmedia%26token%3Ddc49b444-0128-4933-bcab-c5e2bb8514fb&width=300&dpr=1&quality=100&sign=c9eced8e&sv=2',
  '손질 달인': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252F3Gxzf5zFhoLGuWI7guzO%252FAdobe%2520Express%2520-%2520file%2520%2811%29.png%3Falt%3Dmedia%26token%3D6a0f15ff-6f10-46bb-b36f-29f03558fbfb&width=300&dpr=1&quality=100&sign=cd041f33&sv=2',
  '대지의 보주': 'https://lunawiki.gitbook.io/hello/~gitbook/image?url=https%3A%2F%2F1365047812-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FJn8Ixf7wXQ4SG9sL8RMK%252Fuploads%252FbQRi4yTMFADeQyzQmpl8%252F%25EC%258A%25A4%25ED%2581%25AC%25EB%25A6%25B0%25EC%2583%25B7%25202026-01-29%2520144349-Photoroom.png%3Falt%3Dmedia%26token%3Da40c97e0-b2c2-4e2b-9a0b-a7cc03b9b97c&width=300&dpr=1&quality=100&sign=7f240076&sv=2',
};

// ── 시설 라벨 ──
const FAC_LABEL = {
  bench:   '🔧 허름한 작업대',
  brazier: '🔥 허름한 화로',
  counter: '🥣 허름한 조리대',
};
const FAC_CLASS = { bench:'lc-fac-bench', brazier:'lc-fac-brazier', counter:'lc-fac-counter' };

// ── 레시피 데이터 ──
const LC_DATA = {
  mining: [
    {
      name: '미스릴 주괴', emoji: '🪨', grade: 'n',
      fac: 'brazier', time: '30초',
      mats: [['일반 미스릴 원석', 3], ['마그마 블록', 4]],
      prob: '100%',
    },
    {
      name: '아르젠타이트 주괴', emoji: '🪨', grade: 'a',
      fac: 'brazier', time: '30초',
      mats: [['일반 아르젠타이트 원석', 3], ['마그마 블록', 4]],
      prob: '100%',
    },
    {
      name: '벨리움 주괴', emoji: '🪨', grade: 'r',
      fac: 'brazier', time: '30초',
      mats: [['일반 벨리움 원석', 3], ['마그마 블록', 4]],
      prob: '100%',
    },
  ],

  fishing: [
    {
      name: '말린 농작물', emoji: '🌿', grade: 'n',
      fac: 'brazier', time: '30초',
      mats: [['농작물', 10], ['마그마 블록', 5]],
      prob: '100%',
    },
    {
      name: '말린 물고기', emoji: '🐟', grade: 'n',
      fac: 'brazier', time: '30초',
      mats: [['물고기', 10], ['마그마 블록', 5]],
      prob: '100%',
    },
    {
      name: '지렁이 미끼', emoji: '🪱', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['일반↑ 말린 농작물', 10], ['일반↑ 말린 물고기', 10]],
      prob: '100%',
    },
    {
      name: '어분 미끼', emoji: '🪱', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['고급↑ 말린 농작물', 10], ['고급↑ 말린 물고기', 10]],
      prob: '100%',
    },
    {
      name: '루어 미끼', emoji: '🪝', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['희귀↑ 말린 농작물', 20], ['희귀↑ 말린 물고기', 10]],
      prob: '100%',
    },
    {
      name: '평범한 떡밥', emoji: '🎣', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['지렁이 미끼', 1], ['일반↑ 말린 농작물', 1]],
      prob: '100%',
    },
    {
      name: '잘만든 떡밥', emoji: '🎣', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['어분 미끼', 1], ['고급↑ 말린 농작물', 1]],
      prob: '100%',
    },
    {
      name: '무지개 떡밥', emoji: '🎣', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['루어 미끼', 1], ['희귀↑ 말린 농작물', 2]],
      prob: '100%',
    },
  ],

  farming: [
    {
      name: '허수아비', emoji: '🪆', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['대나무 블록', 10], ['가죽 풀세트', 1]],
      prob: '100%',
    },
    {
      name: '비닐하우스', emoji: '🏠', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['유리', 16], ['차광 유리', 1]],
      prob: '100%',
    },
    {
      name: '평범한 화분통', emoji: '🪴', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['편백나무 원목', 2], ['퇴비통', 1]],
      prob: '100%',
    },
    {
      name: '깔끔한 화분통', emoji: '🪴', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['평범한 화분통', 1], ['편백나무 원목', 5]],
      prob: '100%',
    },
    {
      name: '구리 물뿌리개', emoji: '🚿', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['구리 주괴', 4], ['편백나무 원목', 2]],
      prob: '100%',
    },
    {
      name: '철 물뿌리개', emoji: '🚿', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['철 주괴', 6], ['편백나무 원목', 2]],
      prob: '100%',
    },
    {
      name: '금 물뿌리개', emoji: '🚿', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['금 주괴', 8], ['편백나무 원목', 2]],
      prob: '100%',
    },
    {
      name: '트라이어드 물뿌리개', emoji: '🚿', grade: 'h',
      fac: 'bench', time: '120초',
      mats: [['금 물뿌리개', 1], ['트라이어드 주괴', 4]],
      prob: '100%',
    },
    {
      name: '철제 스프링클러', emoji: '💦', grade: 'a',
      fac: 'bench', time: '60초',
      mats: [['철 주괴', 4], ['유리', 4]],
      prob: '100%',
    },
    {
      name: '금 스프링클러', emoji: '💦', grade: 'r',
      fac: 'bench', time: '60초',
      mats: [['금 주괴', 6], ['유리', 4]],
      prob: '100%',
    },
    {
      name: '트라이어드 스프링클러', emoji: '💦', grade: 'h',
      fac: 'bench', time: '120초',
      mats: [['금 스프링클러', 1], ['트라이어드 주괴', 4]],
      prob: '100%',
    },
  ],

  cooking: [
    {
      name: '구운 감자', emoji: '🥔', grade: 'n',
      fac: 'counter', time: '15초',
      mats: [['감자', 1]],
      prob: '100%',
    },
    {
      name: '호박 수프', emoji: '🎃', grade: 'n',
      fac: 'counter', time: '30초',
      mats: [['호박', 2], ['물병', 1]],
      prob: '100%',
    },
    {
      name: '버섯 스튜', emoji: '🍲', grade: 'a',
      fac: 'counter', time: '45초',
      mats: [['갈색 버섯', 2], ['빨간 버섯', 2], ['그릇', 1]],
      prob: '100%',
    },
    {
      name: '토끼 스튜', emoji: '🍲', grade: 'a',
      fac: 'counter', time: '60초',
      mats: [['구운 토끼고기', 1], ['당근', 1], ['감자', 1], ['버섯', 1], ['그릇', 1]],
      prob: '100%',
    },
    {
      name: '케이크', emoji: '🎂', grade: 'r',
      fac: 'counter', time: '90초',
      mats: [['우유통', 3], ['설탕', 2], ['달걀', 1], ['밀', 3]],
      prob: '100%',
    },
    {
      name: '황금 당근 수프', emoji: '🥕', grade: 'h',
      fac: 'counter', time: '120초',
      mats: [['황금 당근', 2], ['물병', 1], ['설탕', 1]],
      prob: '60%',
    },
  ],

  enhance: [
    {
      name: '허름한 화로', emoji: '🔥', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['심층암', 15], ['용광로', 1]],
      prob: '100%',
    },
    {
      name: '허름한 조리대', emoji: '🥣', grade: 'n',
      fac: 'bench', time: '60초',
      mats: [['편백나무 원목', 10], ['철 창살', 5]],
      prob: '100%',
    },
    {
      name: '일반 별빛 스크롤', emoji: '📜', grade: 'n',
      fac: 'bench', time: '300초',
      mats: [['별빛 스크롤 조각(일반)', 8], ['일반 달빛 촉매제', 1]],
      prob: '100%',
    },
    {
      name: '고급 별빛 스크롤', emoji: '📜', grade: 'a',
      fac: 'bench', time: '300초',
      mats: [['별빛 스크롤 조각(고급)', 8], ['고급 달빛 촉매제', 1]],
      prob: '100%',
    },
    {
      name: '희귀 별빛 스크롤', emoji: '📜', grade: 'r',
      fac: 'bench', time: '300초',
      mats: [['별빛 스크롤 조각(희귀)', 8], ['희귀 달빛 촉매제', 1]],
      prob: '100%',
    },
    {
      name: '영웅 별의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
    {
      name: '영웅 바다의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
    {
      name: '영웅 태양의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
    {
      name: '영웅 대지의 보주', emoji: '🔮', grade: 'h',
      fac: 'bench', time: '300초',
      mats: [['희귀 별의 조각', 8], ['희귀 별가루', 1]],
      prob: '60%',
    },
  ],
};

const GRADE_MAP = { n:'일반', a:'고급', r:'희귀', h:'영웅' };
const GRADE_CLASS = { n:'lc-grade-n', a:'lc-grade-a', r:'lc-grade-r', h:'lc-grade-h' };
const PROB_CLASS = { '100%':'lc-prob-100', '60%':'lc-prob-60' };

let _curLifecat = 'mining';

function switchLifecat(cat) {
  _curLifecat = cat;
  document.querySelectorAll('.lc-tab').forEach(b => b.classList.toggle('lc-on', b.dataset.lc === cat));
  const search = document.getElementById('lc-search');
  if (search) search.value = '';
  renderLifecat();
}

function renderLifecat() {
  const grid = document.getElementById('lc-grid');
  if (!grid) return;

  const q = (document.getElementById('lc-search')?.value || '').trim().toLowerCase();
  const items = LC_DATA[_curLifecat] || [];
  const filtered = q
    ? items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.mats.some(([m]) => m.toLowerCase().includes(q))
      )
    : items;

  if (!filtered.length) {
    grid.innerHTML = '<div class="lc-empty">검색 결과가 없어요.</div>';
    return;
  }

  grid.innerHTML = filtered.map(it => {
    const gradeLabel = GRADE_MAP[it.grade] || '';
    const gradeCls   = GRADE_CLASS[it.grade] || 'lc-grade-n';
    const fac        = FAC_LABEL[it.fac] || { label: it.fac, icon: '🏭' };
    const facLabel   = typeof fac === 'string' ? fac : `${fac.icon || ''} ${fac.label || fac}`.trim();
    const facCls     = FAC_CLASS[it.fac] || '';
    const hasProb    = it.prob && it.prob !== '100%';

    const matsHtml = it.mats.map(([name, qty]) =>
      `<span class="lc-mat-tag">${name} <span class="lc-mat-qty">×${qty}</span></span>`
    ).join('');

    return `
    <div class="lc-card">
      <div class="lc-card-hd">
        <div class="lc-card-img">${it.emoji || '📦'}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;flex-wrap:wrap;">
            <span class="lc-type-pill">${it.type || (FAC_LABEL[it.fac] ? (it.fac === 'counter' ? '요리' : '제작') : '제작')}</span>
            <span class="lc-card-time">⏱ ${it.time}</span>
          </div>
          <div class="lc-card-name">${it.name}</div>
        </div>
      </div>
      <div class="lc-mats-hd">
        <span class="lc-mats-label">필요 재료</span>
        <span class="lc-facility ${facCls}">${facLabel}</span>
      </div>
      <div class="lc-mats-list">${matsHtml}</div>
      ${hasProb ? `<div class="lc-prob-row"><span class="lc-grade ${gradeCls}">${gradeLabel}</span><span class="lc-prob-tag">${it.prob}</span></div>` : `<div style="margin-top:8px;"><span class="lc-grade ${gradeCls}">${gradeLabel}</span></div>`}
    </div>`;
  }).join('');
}

/* ══ 통합 검색 (전 카테고리 동시) ══ */
const CAT_LABEL = { mining:'채광', fishing:'낚시', farming:'농사', enhance:'강화재료', cooking:'요리' };

function renderLifecatSearch() {
  const q = (document.getElementById('lc-search')?.value || '').trim().toLowerCase();
  const tabs = document.getElementById('lc-tabs-row');
  const cnt  = document.getElementById('lc-search-count');
  const grid = document.getElementById('lc-grid');
  if (!grid) return;

  if (!q) {
    // 검색어 없으면 탭 표시 + 현재 카테고리 렌더
    if (tabs) tabs.style.display = '';
    if (cnt)  cnt.textContent = '';
    renderLifecat();
    return;
  }

  // 검색 중: 탭 숨김
  if (tabs) tabs.style.display = 'none';

  // 전 카테고리 검색
  const allCats = ['mining','fishing','farming','enhance','cooking'];
  const hits = [];
  allCats.forEach(cat => {
    const items = LC_DATA[cat] || [];
    items.forEach(it => {
      if (it.name.toLowerCase().includes(q) || it.mats.some(([m]) => m.toLowerCase().includes(q))) {
        hits.push({ ...it, _cat: cat });
      }
    });
  });

  if (cnt) cnt.textContent = hits.length ? `${hits.length}개 결과 — 전체 카테고리 검색 중` : '';

  if (!hits.length) {
    grid.innerHTML = '<div class="lc-empty">검색 결과가 없어요.</div>';
    return;
  }

  grid.innerHTML = hits.map(it => {
    const gl  = GRADE_MAP[it.grade] || '';
    const gc  = GRADE_CLASS[it.grade] || 'lc-grade-n';
    const fac = FAC_LABEL[it.fac] || { label: it.fac, icon:'🏭' };
    const facLabel  = typeof fac === 'string' ? fac : `${fac.icon||''} ${fac.label||fac}`.trim();
    const facCls    = FAC_CLASS[it.fac] || '';
    const hasProb   = it.prob && it.prob !== '100%';
    const catBadge  = `<span style="font-size:9.5px;color:var(--muted);background:var(--s3);border:1px solid var(--b2);padding:1px 7px;border-radius:20px;">${CAT_LABEL[it._cat]||it._cat}</span>`;

    const matsHtml = it.mats.map(([name, qty]) => {
      // 검색어 하이라이트
      const hl = name.toLowerCase().includes(q)
        ? name.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'), '<mark style="background:rgba(160,144,240,.25);border-radius:2px;padding:0 1px;">$1</mark>')
        : name;
      return `<span class="lc-mat-tag">${hl} <span class="lc-mat-qty">×${qty}</span></span>`;
    }).join('');

    // 아이템명 하이라이트
    const hlName = it.name.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),
      '<mark style="background:rgba(160,144,240,.25);border-radius:2px;padding:0 1px;">$1</mark>');

    // 이미지 URL 조회 (부분 일치)
    const imgKey = Object.keys(LC_IMGS).find(k => it.name.includes(k) || k.includes(it.name));
    const imgUrl2 = imgKey ? LC_IMGS[imgKey] : '';
    const imgHtml2 = imgUrl2
      ? `<img src="${imgUrl2}" alt="${it.name}" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;">`
      : (it.emoji||'📦');

    return `
    <div class="lc-card">
      <div class="lc-card-hd">
        <div class="lc-card-img">${imgHtml2}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;flex-wrap:wrap;">
            ${catBadge}
            <span class="lc-fac-badge ${facCls}">${facLabel}</span>
            <span class="lc-card-time">⏱ ${it.time}</span>
          </div>
          <div class="lc-card-name">${hlName}</div>
        </div>
      </div>
      <div class="lc-mats-hd2">필요 재료</div>
      <div class="lc-mats-list">${matsHtml}</div>
      <div style="margin-top:8px;">
        <span class="lc-grade ${gc}">${gl}</span>
        ${hasProb ? `<span class="lc-prob-tag">${it.prob}</span>` : ''}
      </div>
    </div>`;
  }).join('');
}
