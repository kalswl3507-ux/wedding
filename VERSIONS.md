# 청첩장 A / B

- A: `index.html` — 기존 게임과 픽셀 디자인. 기존 공유 주소 유지.
- B: `B.html`, `B.css` — 게임, 픽셀 그림, 입장 대기 화면 없이 바로 열리는 일반 청첩장.
- B 주소: https://kalswl3507-ux.github.io/wedding/B.html
- B는 별도 HTML/CSS로 수정합니다. A의 디자인을 수정해도 B에 자동 반영되지 않습니다.
- 사진, 지도 아이콘과 계좌 복사/지도/방명록 스크립트 및 site-config.js는 함께 사용합니다.
- B 음악은 `B-music.js`와 `assets/audio/sakura-romance.mp3`이며 처음부터 재생합니다. 초기 상태는 꺼짐입니다. A의 음악과 독립적입니다.
- B 공유 썸네일은 `assets/share-gallery-12-close.jpg` (12번 확대), A는 기존 2번 사진입니다.
- 방명록은 같은 저장소이므로 A와 B 방문자가 같은 글을 봅니다. 예식 및 계좌 정보는 각 HTML에 있어 변경할 때 양쪽을 확인해야 합니다.
