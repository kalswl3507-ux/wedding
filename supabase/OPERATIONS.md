# 방명록 유지 관리

A와 B는 같은 Supabase 방명록을 사용합니다.

## 현재 서버 복구

프로젝트 주소: https://supabase.com/dashboard/project/qjxdmgriqoeebypqvbib

Paused 상태라면 관리자 화면에서 Resume project를 실행합니다. 공개 클라이언트 키로는 프로젝트를 재개할 수 없습니다. 다시 활성화된 뒤 GitHub Actions의 Guestbook health check를 수동 실행해서 연결을 확인하고, A/B의 다시 연결하기 버튼으로 목록을 확인합니다.

## 정기 상태 확인

`.github/workflows/guestbook-health.yml`은 하루 네 번 ID 한 개만 조회합니다. 방명록 글을 작성하거나 내용을 로그에 남기지 않습니다. 연결 실패 시 최대 세 번 확인한 뒤 워크플로가 실패합니다. GitHub 계정의 Actions 알림 설정에서 실패 알림 수신을 확인하세요.

이 작업은 데이터베이스 활동을 발생시키지만 무료 Supabase의 중지 방지를 보장하지 않으며, 이미 멈춘 프로젝트를 자동 복구하지도 않습니다. GitHub 예약 작업은 지연될 수 있고 공개 저장소에서 60일간 활동이 없으면 비활성화될 수 있습니다. GitHub Actions 화면에서 정기적으로 실행 여부를 확인하고 필요하면 다시 활성화하세요.

Supabase 정책: https://supabase.com/docs/guides/platform/free-project-pausing

GitHub 예약 작업: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## 방문자 오류 처리

- 읽기 요청만 한 번 자동 재시도합니다. 쓰기 요청은 중복 등록 방지를 위해 자동 재전송하지 않습니다.
- 서버에 연결되지 않으면 등록 버튼을 잠그고 다시 연결하기 버튼을 표시합니다.
- 작성 중인 이름과 메시지는 해당 탭의 sessionStorage에 임시 보관합니다. 서버에 저장된 것은 아니며 탭 종료 시 사라질 수 있습니다. 브라우저가 저장소를 차단하면 입력란 내용만 유지합니다.
- 저장 응답이 불확실하면 목록 확인을 먼저 안내합니다. 등록 성공 응답을 받은 후에만 입력과 임시 내용을 지웁니다.
- 새로고침이나 재연결로 보이는 글이 서버에 실제 저장된 글입니다. 로컬 임시 글을 전체 방명록으로 표시하지 않습니다.
