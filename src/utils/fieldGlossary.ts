// 결과 화면에 노출되는 기술 값들의 한 줄 설명.
// 파트너 시연에서 "이 값이 뭔지"를 화면에서 바로 읽을 수 있게 필드 라벨 기준으로 붙인다.
// (라벨이 어댑터 매핑(utils/adapterScenarioValues.ts)과 시나리오 데이터에서 공통으로 쓰이므로
//  여기 한 곳만 유지하면 모든 시나리오에 일관 적용된다)

const GLOSSARY: Record<string, string> = {
  "Tx Hash": "블록체인에 제출된 트랜잭션의 고유 식별자 — 온체인에서 이 거래를 찾는 영수증 번호입니다.",
  "Raw Signature": "MPC 서명의 원문(r·s 값) — 3개 노드 중 2개가 협력해 만든 서명으로, 트랜잭션에 담겨 체인에 제출됩니다.",
  "Sign ID": "wallet-api에 기록된 서명 요청의 식별자입니다.",
  "Wallet ID": "wallet-api에 등록된 지갑 리소스의 식별자입니다.",
  "Custody Wallet ID": "수탁 법인 지갑의 wallet-api 리소스 식별자입니다.",
  "Issuer Wallet ID": "발행사 지갑의 wallet-api 리소스 식별자입니다.",
  "Key ID": "MPC 분산 키(2-of-3)의 식별자 — 원본 개인키는 어디에도 존재하지 않습니다.",
  "지갑 주소": "MPC 공개키에서 파생된 온체인 주소 — 이 주소로 자산을 받고 보냅니다.",
  "발행사 주소": "발행사 지갑의 온체인 주소입니다.",
  "받는 주소": "자산을 받는 상대방의 온체인 주소입니다.",
  "목적지 주소": "자산이 전송되는 상대 온체인 주소입니다.",
  "Adapter Run ID": "데모 어댑터의 실행 추적 식별자입니다.",
};

export function getFieldHint(label: string): string | undefined {
  return GLOSSARY[label];
}
