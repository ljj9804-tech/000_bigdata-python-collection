// 이번 챕터는 설계 패턴을 직접 만들어보는 것이므로 별도 샘플은 아래 예제에서 생성합니다
use("modelingDB");

//임베디드 문서- 관련 데이터를 하나의 문서로 저장하는 패턴
// 주소를 users 문서 안에 중첩
db.users.insertOne({
  name: "lsy",
  age: 30,
  address: { city: "busan", zip: "12345", street: "중앙대로" }, // 주소를 중첩된 객체로 저장
});

// 주문 안에 상품 목록(items)을 배열로 임베디드
db.orders.insertOne({
  orderId: "A001",
  items: [
    { product: "Laptop", price: 1200, quantity: 1 },
    { product: "Mouse", price: 25, quantity: 2 },
  ],
});

// ======================================================================================
// 참조 관계- ObjectId를 사용하여 다른 문서와 연결하는 패턴
use("modelingDB");
// 1) 사용자 먼저 생성 → _id 확보
const userId = ObjectId();
db.users.insertOne({ _id: userId, name: "Alice", email: "alice@example.com" });

// 2) 주문은 userId로 사용자를 "참조"
use("modelingDB");
db.orders.insertOne({
  orderNumber: 1001,
  userId: userId, // 참조 — 중복 없이 연결
  total: 250,
  orderDate: new Date(),
});

// ======================================================================================
// 계층형 구조 — parentId로 트리 표현
use("modelingDB");
// 최상위 카테고리(parentId: null) → 하위 카테고리
const electronics = ObjectId();
db.categories.insertOne({ _id: electronics, name: "전자제품", parentId: null });
db.categories.insertOne({ name: "컴퓨터", parentId: electronics }); // 전자제품의 자식

// 댓글·대댓글도 동일 패턴
const c1 = ObjectId();
db.comments.insertOne({
  _id: c1,
  text: "첫 댓글",
  parentId: null,
  author: "Grace",
});
db.comments.insertOne({
  text: "첫 댓글의 답글",
  parentId: c1,
  author: "Heidi",
});

// ======================================================================================
// Validator — 스키마 유효성 검증

use("modelingDB");

// users 컬렉션 생성 시 규칙 지정: name·email 필수, age는 18 이상 정수
db.createCollection("members", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"], // name과 email은 필수
      properties: {
        name: { bsonType: "string", description: "필수 문자열" },
        age: { bsonType: "int", minimum: 18, description: "18세 이상" },
        email: {
          bsonType: "string",
          pattern: "^.*@.*\\..*$",
          description: "이메일 형식", // 간단한 이메일 패턴 (실제 검증은 더 복잡할 수 있음)
        },
      },
    },
  },
});

// 유효성 검증 테스트
use("modelingDB");
db.members.insertOne({ name: "Alice", email: "alice@example.com", age: 25 }); // ✅ 성공

use("modelingDB");
db.members.insertOne({ name: "Bob", email: "bobexample.com", age: 30 }); // ❌ @ 없음 → 거부

use("modelingDB");
db.members.insertOne({ email: "charlie@example.com", age: 22 }); // ❌ name 누락 → 거부

// 검증 규칙 확인 / 임시 해제
db.getCollectionInfos({ name: "members" });
db.runCommand({ collMod: "members", validator: {} }); // 검증 제거

// ======================================================================================
// 실습

// 1. **(임베디드)** `users`에 `name`, `age`, 그리고 `address`(city·zip 포함)를 가진 문서를 삽입하세요.
db.users.insertOne({
  name: "lsy",
  age: 30,
  address: { city: "busan", zip: "12345" },
});

// 2. **(참조)** `posts`와 `comments`를 참조 관계로 설계해, 게시글 1건과 그 게시글을 가리키는 댓글 1건을 삽입하세요.
const postId = ObjectId();
db.posts.insertOne({ _id: postId, title: "첫 게시글", author: "Bob" });
db.comments.insertOne({
  postId: postId,
  comment: "좋은 글입니다!",
  author: "Charlie",
});

// 3. **(계층)** `categories`를 parentId 구조로 만들고, 최상위 "가구"와 그 하위 "의자"를 삽입하세요.
const furniture = ObjectId();
db.categories.insertOne({ _id: furniture, name: "가구", parentId: null });
db.categories.insertOne({ name: "의자", parentId: furniture });

// 4. **(Validator)** `name`과 `email`이 필수인 `students` 컬렉션을 검증 규칙과 함께 생성하세요.
db.createCollection("students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.*@.*\\..*$" },
      },
    },
  },
});
